param(
  [string]$SourceDirectory = "shopify-theme",
  [string]$DestinationFile
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repository = Split-Path -Parent $PSScriptRoot
$source = (Resolve-Path -LiteralPath (Join-Path $repository $SourceDirectory)).Path
& (Join-Path $PSScriptRoot "validate-shopify-theme.ps1") `
  -SourceDirectory $SourceDirectory

$schema = Get-Content -Raw -LiteralPath (Join-Path $source "config\settings_schema.json") |
  ConvertFrom-Json
$themeInfo = $schema | Where-Object name -eq "theme_info" | Select-Object -First 1

if (-not $themeInfo.theme_name -or -not $themeInfo.theme_version) {
  throw "Theme name and version are required in config/settings_schema.json."
}

$generatedName = "$($themeInfo.theme_name)-$($themeInfo.theme_version).zip"
$generated = Join-Path $source $generatedName

if (-not $DestinationFile) {
  $slug = ($themeInfo.theme_name.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-")
  $DestinationFile = "$slug-$($themeInfo.theme_version).zip"
}

$destination = Join-Path $repository $DestinationFile
if (Test-Path -LiteralPath $generated) {
  Remove-Item -LiteralPath $generated -Force
}

$shopify = Get-Command shopify -ErrorAction SilentlyContinue
$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
$npx = Get-Command npx -ErrorAction SilentlyContinue

if ($shopify) {
  & $shopify.Source theme package --path $source
} elseif ($pnpm) {
  & $pnpm.Source dlx @shopify/cli@latest theme package --path $source
} elseif ($npx) {
  & $npx.Source --yes @shopify/cli@latest theme package --path $source
} else {
  throw "Shopify CLI is required. Install it or make pnpm/npx available."
}

if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $generated)) {
  throw "Shopify CLI did not create $generatedName."
}

if (Test-Path -LiteralPath $destination) {
  Remove-Item -LiteralPath $destination -Force
}
Move-Item -LiteralPath $generated -Destination $destination

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
  $requiredEntries = @(
    "layout/theme.liquid",
    "config/settings_schema.json",
    "config/settings_data.json",
    "sections/main-404.liquid",
    "sections/product-grid.liquid",
    "templates/index.json",
    "templates/404.json"
  )

  foreach ($entryName in $requiredEntries) {
    if (-not $archive.GetEntry($entryName)) {
      throw "Invalid Shopify package: missing $entryName"
    }
  }

  $requiredContracts = @(
    @{ Name = "header"; Entries = @("sections/header-group.json", "sections/header.liquid") },
    @{ Name = "footer"; Entries = @("sections/footer-group.json", "sections/footer.liquid") },
    @{ Name = "product"; Entries = @("sections/product.liquid", "sections/main-product.liquid") }
  )

  foreach ($contract in $requiredContracts) {
    $contractFound = $false
    foreach ($entryName in $contract.Entries) {
      if ($archive.GetEntry($entryName)) {
        $contractFound = $true
        break
      }
    }
    if (-not $contractFound) {
      throw "Invalid Shopify package: missing $($contract.Name) contract ($($contract.Entries -join ' or '))"
    }
  }

  $entryCount = $archive.Entries.Count
} finally {
  $archive.Dispose()
}

$file = Get-Item -LiteralPath $destination
$hash = Get-FileHash -LiteralPath $destination -Algorithm SHA256
Write-Output "Created $($file.FullName)"
Write-Output "Theme: $($themeInfo.theme_name) $($themeInfo.theme_version)"
Write-Output "Entries: $entryCount"
Write-Output "Size: $($file.Length) bytes"
Write-Output "SHA256: $($hash.Hash)"
