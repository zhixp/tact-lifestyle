param(
  [string]$SourceDirectory = "shopify-theme",
  [string]$DestinationFile = "tact-shopify-theme.zip"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$repository = Split-Path -Parent $PSScriptRoot
$source = (Resolve-Path -LiteralPath (Join-Path $repository $SourceDirectory)).Path
$destination = Join-Path $repository $DestinationFile

$stream = [System.IO.File]::Open(
  $destination,
  [System.IO.FileMode]::Create,
  [System.IO.FileAccess]::ReadWrite,
  [System.IO.FileShare]::None
)

try {
  $archive = New-Object System.IO.Compression.ZipArchive(
    $stream,
    [System.IO.Compression.ZipArchiveMode]::Create,
    $false
  )
  try {
    Get-ChildItem -LiteralPath $source -Recurse -File | ForEach-Object {
      $entryName = $_.FullName.Substring($source.Length + 1).Replace("\", "/")
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $archive,
        $_.FullName,
        $entryName,
        [System.IO.Compression.CompressionLevel]::Optimal
      ) | Out-Null
    }
  } finally {
    $archive.Dispose()
  }
} finally {
  $stream.Dispose()
}

$archive = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
  $requiredEntries = @(
    "layout/theme.liquid",
    "config/settings_schema.json",
    "config/settings_data.json",
    "templates/index.json"
  )
  foreach ($entryName in $requiredEntries) {
    if (-not $archive.GetEntry($entryName)) {
      throw "Invalid Shopify package: missing $entryName"
    }
  }
  if ($archive.Entries.FullName -match "\\") {
    throw "Invalid Shopify package: ZIP entries contain Windows path separators"
  }
  $entryCount = $archive.Entries.Count
} finally {
  $archive.Dispose()
}

$file = Get-Item -LiteralPath $destination
$hash = Get-FileHash -LiteralPath $destination -Algorithm SHA256
Write-Output "Created $($file.FullName)"
Write-Output "Entries: $entryCount"
Write-Output "Size: $($file.Length) bytes"
Write-Output "SHA256: $($hash.Hash)"
