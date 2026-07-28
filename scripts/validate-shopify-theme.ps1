param(
  [string]$SourceDirectory = "shopify-theme"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repository = Split-Path -Parent $PSScriptRoot
$source = (Resolve-Path -LiteralPath (Join-Path $repository $SourceDirectory)).Path
$issues = [System.Collections.Generic.List[string]]::new()
$schemas = @{}

function Add-Issue([string]$Message) {
  $script:issues.Add($Message)
}

function Test-SettingValues(
  [string]$Context,
  [object]$Values,
  [object[]]$Definitions
) {
  if (-not $Values) {
    return
  }

  $definitionsById = @{}
  @($Definitions) | Where-Object { $_.PSObject.Properties["id"] } | ForEach-Object {
    $definitionsById[$_.id] = $_
  }

  foreach ($setting in $Values.PSObject.Properties) {
    if (-not $definitionsById.ContainsKey($setting.Name)) {
      Add-Issue "$Context references unknown setting '$($setting.Name)'."
      continue
    }

    $definition = $definitionsById[$setting.Name]
    $value = $setting.Value

    if ($definition.type -eq "range") {
      $minimum = [double]$definition.min
      $maximum = [double]$definition.max
      $step = [double]$definition.step
      $numericValue = [double]$value
      $increment = ($numericValue - $minimum) / $step

      if ($numericValue -lt $minimum -or $numericValue -gt $maximum) {
        Add-Issue "$Context setting '$($setting.Name)' is outside its range."
      }
      if ([math]::Abs($increment - [math]::Round($increment)) -gt 0.000001) {
        Add-Issue "$Context setting '$($setting.Name)' does not match step $step."
      }
    }

    if ($definition.type -in @("select", "radio")) {
      $allowed = @($definition.options | ForEach-Object { $_.value })
      if ($allowed -notcontains $value) {
        Add-Issue "$Context setting '$($setting.Name)' has invalid option '$value'."
      }
    }
  }
}

Get-ChildItem -LiteralPath (Join-Path $source "sections") -Filter "*.liquid" -File |
  ForEach-Object {
    $liquid = Get-Content -Raw -LiteralPath $_.FullName
    $match = [regex]::Match(
      $liquid,
      "(?s){%\s*schema\s*%}(.*?){%\s*endschema\s*%}"
    )

    if (-not $match.Success) {
      Add-Issue "$($_.Name) has no section schema."
      return
    }

    try {
      $schemas[$_.BaseName] = $match.Groups[1].Value | ConvertFrom-Json
    } catch {
      Add-Issue "$($_.Name) has invalid section schema JSON."
    }
  }

$jsonFiles = @(
  Get-ChildItem -LiteralPath (Join-Path $source "templates") -Filter "*.json" -File -Recurse
  Get-ChildItem -LiteralPath (Join-Path $source "sections") -Filter "*-group.json" -File
)

foreach ($file in $jsonFiles) {
  try {
    $document = Get-Content -Raw -LiteralPath $file.FullName | ConvertFrom-Json
  } catch {
    Add-Issue "$($file.Name) is not valid JSON."
    continue
  }

  if (-not $document.sections -or -not $document.order) {
    Add-Issue "$($file.Name) must contain non-empty sections and order."
    continue
  }

  $sectionIds = @($document.sections.PSObject.Properties.Name)
  if ($sectionIds.Count -gt 25) {
    Add-Issue "$($file.Name) exceeds Shopify's 25-section limit."
  }

  foreach ($sectionId in $sectionIds) {
    if ($sectionId -notmatch "^[A-Za-z0-9]+$") {
      Add-Issue "$($file.Name) section ID '$sectionId' is not alphanumeric."
    }
  }

  foreach ($orderedId in @($document.order)) {
    if ($sectionIds -notcontains $orderedId) {
      Add-Issue "$($file.Name) order references missing section '$orderedId'."
    }
  }

  foreach ($section in $document.sections.PSObject.Properties) {
    $sectionType = $section.Value.type
    if ($sectionType -like "shopify://apps/*") {
      continue
    }
    if (-not $schemas.ContainsKey($sectionType)) {
      Add-Issue "$($file.Name) references missing section '$sectionType'."
      continue
    }

    $schema = $schemas[$sectionType]
    $sectionSettings = $section.Value.PSObject.Properties["settings"]
    if ($sectionSettings) {
      Test-SettingValues `
        "$($file.Name)/$($section.Name)" `
        $sectionSettings.Value `
        $schema.settings
    }

    $sectionBlocks = $section.Value.PSObject.Properties["blocks"]
    if (-not $sectionBlocks) {
      continue
    }

    $blocks = @($sectionBlocks.Value.PSObject.Properties)
    if ($blocks.Count -gt 50) {
      Add-Issue "$($file.Name)/$($section.Name) exceeds Shopify's 50-block limit."
    }

    foreach ($block in $blocks) {
      if ($block.Name -notmatch "^[A-Za-z0-9]+$") {
        Add-Issue "$($file.Name) block ID '$($block.Name)' is not alphanumeric."
      }

      $blockSchema = @($schema.blocks | Where-Object {
        $_.type -eq $block.Value.type
      }) | Select-Object -First 1

      if (-not $blockSchema) {
        Add-Issue "$($file.Name) references unknown block type '$($block.Value.type)'."
        continue
      }

      Test-SettingValues `
        "$($file.Name)/$($section.Name)/$($block.Name)" `
        $block.Value.settings `
        $blockSchema.settings
    }

    $blockIds = @($blocks | ForEach-Object { $_.Name })
    $blockOrder = $section.Value.PSObject.Properties["block_order"]
    if ($blockOrder) {
      foreach ($orderedBlockId in @($blockOrder.Value)) {
        if ($blockIds -notcontains $orderedBlockId) {
          Add-Issue "$($file.Name) block order references missing block '$orderedBlockId'."
        }
      }
    }
  }
}

$themeLayout = Get-Content -Raw -LiteralPath (Join-Path $source "layout\theme.liquid")
foreach ($requiredOutput in @("content_for_header", "content_for_layout")) {
  if (-not $themeLayout.Contains($requiredOutput)) {
    Add-Issue "layout/theme.liquid is missing $requiredOutput."
  }
}

if ($issues.Count) {
  throw "Shopify semantic validation failed:`n- $($issues -join "`n- ")"
}

Write-Output "Shopify semantic validation passed for $($jsonFiles.Count) JSON templates/groups."
