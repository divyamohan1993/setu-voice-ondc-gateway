# Verification script to find files with non-ASCII characters
$ErrorActionPreference = "SilentlyContinue"

$rootDir = "R:\ai-for-bharat-26-jan"

$excludeDirs = @("node_modules", ".git", ".next", "dist", "build")
$includeExtensions = @(".md", ".ts", ".tsx", ".js", ".jsx", ".json", ".yaml", ".yml", ".ps1", ".sh", ".bat", ".css", ".html", ".sql", ".prisma")

$filesWithNonAscii = @()

$allFiles = Get-ChildItem -Path $rootDir -Recurse -File

foreach ($file in $allFiles) {
    # Skip excluded directories
    $skip = $false
    foreach ($dir in $excludeDirs) {
        if ($file.FullName -match [regex]::Escape("\$dir\")) {
            $skip = $true
            break
        }
    }
    if ($skip) { continue }
    
    # Skip package-lock.json
    if ($file.Name -eq "package-lock.json") { continue }
    
    # Only check included extensions
    $ext = [System.IO.Path]::GetExtension($file.Name).ToLower()
    if ($includeExtensions -notcontains $ext) { continue }
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        
        # Skip empty or binary files
        if ($bytes.Length -eq 0) { continue }
        $checkLen = [Math]::Min(1024, $bytes.Length)
        $isBinary = $false
        for ($i = 0; $i -lt $checkLen; $i++) {
            if ($bytes[$i] -eq 0) { $isBinary = $true; break }
        }
        if ($isBinary) { continue }
        
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
        
        # Find any character outside ASCII range
        $hasNonAscii = $false
        $nonAsciiSamples = @()
        $chars = $content.ToCharArray()
        
        for ($i = 0; $i -lt $chars.Length; $i++) {
            $c = $chars[$i]
            $cp = [int]$c
            
            if ($cp -gt 127) {
                $hasNonAscii = $true
                if ($nonAsciiSamples.Count -lt 5) {
                    $nonAsciiSamples += "U+$($cp.ToString('X4'))"
                }
            }
        }
        
        if ($hasNonAscii) {
            $relativePath = $file.FullName.Replace($rootDir, "").TrimStart("\")
            $filesWithNonAscii += [PSCustomObject]@{
                File    = $relativePath
                Samples = $nonAsciiSamples -join ", "
            }
        }
    }
    catch {
        # Skip files that can't be read
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Non-ASCII Character Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($filesWithNonAscii.Count -eq 0) {
    Write-Host "SUCCESS! No files with non-ASCII characters found." -ForegroundColor Green
}
else {
    Write-Host "WARNING: Found $($filesWithNonAscii.Count) files with non-ASCII characters:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($item in $filesWithNonAscii) {
        Write-Host "  $($item.File)" -ForegroundColor Red
        Write-Host "    Samples: $($item.Samples)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
