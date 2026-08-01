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

if (-not $DestinationFile) {
  $slug = ($themeInfo.theme_name.ToLowerInvariant() -replace "[^a-z0-9]+", "-").Trim("-")
  $DestinationFile = "$slug-$($themeInfo.theme_version).zip"
}

$destination = Join-Path $repository $DestinationFile
if (Test-Path -LiteralPath $destination) {
  Remove-Item -LiteralPath $destination -Force
}

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$allowedDirectories = @(
  "assets",
  "config",
  "layout",
  "locales",
  "sections",
  "snippets",
  "templates"
)
$output = [System.IO.File]::Open(
  $destination,
  [System.IO.FileMode]::CreateNew
)
$createdArchive = [System.IO.Compression.ZipArchive]::new(
  $output,
  [System.IO.Compression.ZipArchiveMode]::Create,
  $false
)

try {
  foreach ($directoryName in $allowedDirectories) {
    $directory = Join-Path $source $directoryName
    if (-not (Test-Path -LiteralPath $directory)) {
      continue
    }

    foreach ($themeFile in Get-ChildItem -LiteralPath $directory -File -Recurse) {
      $entryName = (
        $themeFile.FullName.Substring($source.Length + 1)
      ).Replace([System.IO.Path]::DirectorySeparatorChar, "/")
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $createdArchive,
        $themeFile.FullName,
        $entryName,
        [System.IO.Compression.CompressionLevel]::Optimal
      ) | Out-Null
    }
  }
} finally {
  $createdArchive.Dispose()
  $output.Dispose()
}

if (-not (Test-Path -LiteralPath $destination)) {
  throw "Theme package was not created."
}

$archive = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
  $requiredEntries = @(
    "layout/theme.liquid",
    "assets/editorial-system.css",
    "assets/theme.js",
    "config/settings_schema.json",
    "config/settings_data.json",
    "sections/main-404.liquid",
    "sections/main-track-order.liquid",
    "sections/product-grid.liquid",
    "templates/index.json",
    "templates/404.json",
    "templates/product.json",
    "templates/search.track-order.json"
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
