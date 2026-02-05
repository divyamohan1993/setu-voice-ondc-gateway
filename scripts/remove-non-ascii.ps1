# Comprehensive script to remove ALL non-standard ASCII characters from all files
# This includes emojis, em dashes, special Unicode characters, etc.
# Only preserves characters in the range 0x00-0x7F (standard ASCII)

param(
    [string]$RootDir = "R:\ai-for-bharat-26-jan",
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

# Define directories to exclude
$excludeDirs = @(
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".gemini"
)

# Define file extensions to process (text-based files only)
$includeExtensions = @(
    ".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".json", ".yaml", ".yml",
    ".ps1", ".sh", ".bat", ".cmd", ".css", ".html", ".htm", ".sql", ".prisma", 
    ".mjs", ".cjs", ".env", ".example", ".local", ".config", ".xml", ".svg",
    ".gitignore", ".dockerignore", ".eslintrc", ".prettierrc", ".editorconfig"
)

# Files to exclude (binary or auto-generated)
$excludeFiles = @(
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "*.ico",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.gif",
    "*.webp",
    "*.woff",
    "*.woff2",
    "*.ttf",
    "*.eot",
    "*.pdf"
)

# Character replacements for common non-ASCII characters
$replacements = @{
    # Em dash and en dash
    [char]0x2014 = "--"   # Em dash
    [char]0x2013 = "-"    # En dash
    [char]0x2012 = "-"    # Figure dash
    [char]0x2015 = "--"   # Horizontal bar
    
    # Quotation marks
    [char]0x201C = '"'    # Left double quotation mark
    [char]0x201D = '"'    # Right double quotation mark
    [char]0x2018 = "'"    # Left single quotation mark
    [char]0x2019 = "'"    # Right single quotation mark
    [char]0x201A = "'"    # Single low-9 quotation mark
    [char]0x201E = '"'    # Double low-9 quotation mark
    [char]0x2039 = "<"    # Single left-pointing angle quotation
    [char]0x203A = ">"    # Single right-pointing angle quotation
    [char]0x00AB = "<<"   # Left-pointing double angle quotation
    [char]0x00BB = ">>"   # Right-pointing double angle quotation
    
    # Ellipsis and dots
    [char]0x2026 = "..."  # Horizontal ellipsis
    
    # Spaces
    [char]0x00A0 = " "    # Non-breaking space
    [char]0x2002 = " "    # En space
    [char]0x2003 = " "    # Em space
    [char]0x2009 = " "    # Thin space
    [char]0x200A = " "    # Hair space
    [char]0x200B = ""     # Zero-width space
    [char]0x200C = ""     # Zero-width non-joiner
    [char]0x200D = ""     # Zero-width joiner
    [char]0xFEFF = ""     # BOM / Zero-width no-break space
    
    # Bullets and symbols
    [char]0x2022 = "*"    # Bullet
    [char]0x2023 = ">"    # Triangular bullet
    [char]0x2043 = "-"    # Hyphen bullet
    [char]0x25AA = "*"    # Black small square
    [char]0x25AB = "*"    # White small square
    [char]0x25CF = "*"    # Black circle
    [char]0x25CB = "o"    # White circle
    
    # Arrows
    [char]0x2190 = "<-"   # Leftwards arrow
    [char]0x2192 = "->"   # Rightwards arrow
    [char]0x2191 = "^"    # Upwards arrow
    [char]0x2193 = "v"    # Downwards arrow
    [char]0x21D2 = "=>"   # Rightwards double arrow
    [char]0x21D0 = "<="   # Leftwards double arrow
    
    # Check marks and crosses
    [char]0x2713 = "[OK]"    # Check mark
    [char]0x2714 = "[OK]"    # Heavy check mark
    [char]0x2705 = "[OK]"    # White heavy check mark (emoji)
    [char]0x2717 = "[X]"     # Ballot X
    [char]0x2718 = "[X]"     # Heavy ballot X
    [char]0x274C = "[X]"     # Cross mark (emoji)
    [char]0x274E = "[X]"     # Cross mark with shadow
    
    # Stars
    [char]0x2605 = "*"    # Black star
    [char]0x2606 = "*"    # White star
    [char]0x2B50 = "[STAR]" # White medium star (emoji)
    
    # Hearts
    [char]0x2764 = "love"  # Heavy black heart
    [char]0x2665 = "love"  # Black heart suit
    
    # Warning and info
    [char]0x26A0 = "[!]"   # Warning sign
    [char]0x2139 = "[i]"   # Information source
    [char]0x2757 = "[!]"   # Heavy exclamation mark
    
    # Mathematical
    [char]0x00D7 = "x"     # Multiplication sign
    [char]0x00F7 = "/"     # Division sign
    [char]0x2212 = "-"     # Minus sign
    [char]0x00B1 = "+/-"   # Plus-minus sign
    [char]0x2260 = "!="    # Not equal to
    [char]0x2264 = "<="    # Less than or equal to
    [char]0x2265 = ">="    # Greater than or equal to
    [char]0x221E = "infinity" # Infinity
    
    # Currency
    [char]0x20AC = "EUR"   # Euro sign
    [char]0x00A3 = "GBP"   # Pound sign
    [char]0x00A5 = "JPY"   # Yen sign
    
    # Copyright and trademark
    [char]0x00A9 = "(c)"   # Copyright sign
    [char]0x00AE = "(R)"   # Registered sign
    [char]0x2122 = "(TM)"  # Trade mark sign
    
    # Misc symbols
    [char]0x00B0 = " degrees" # Degree sign
    [char]0x00B7 = "*"     # Middle dot
    [char]0x00A7 = "S"     # Section sign
    [char]0x00B6 = "P"     # Pilcrow sign
    [char]0x2020 = "+"     # Dagger
    [char]0x2021 = "++"    # Double dagger
    
    # Variation selectors (invisible)
    [char]0xFE0E = ""      # Variation Selector-15
    [char]0xFE0F = ""      # Variation Selector-16
}

function Test-ShouldExcludeFile {
    param([string]$FilePath)
    
    $fileName = Split-Path $FilePath -Leaf
    
    # Check excluded files
    foreach ($pattern in $excludeFiles) {
        if ($fileName -like $pattern) {
            return $true
        }
    }
    
    # Check excluded directories
    foreach ($dir in $excludeDirs) {
        if ($FilePath -match [regex]::Escape("\$dir\")) {
            return $true
        }
    }
    
    return $false
}

function Test-ShouldIncludeFile {
    param([string]$FilePath)
    
    $extension = [System.IO.Path]::GetExtension($FilePath).ToLower()
    $fileName = Split-Path $FilePath -Leaf
    
    # Include by extension
    if ($includeExtensions -contains $extension) {
        return $true
    }
    
    # Include dot files
    if ($fileName -match '^\.(env|gitignore|dockerignore|mailmap|editorconfig|eslintrc|prettierrc)') {
        return $true
    }
    
    # Include files with .example or .local suffix
    if ($fileName -match '\.(example|local|sample)$') {
        return $true
    }
    
    return $false
}

function Remove-NonAsciiCharacters {
    param([string]$Content)
    
    $result = New-Object System.Text.StringBuilder($Content.Length)
    $modified = $false
    
    $chars = $Content.ToCharArray()
    $i = 0
    
    while ($i -lt $chars.Length) {
        $char = $chars[$i]
        $codePoint = [int]$char
        
        # Check for surrogate pairs (emojis and other high Unicode)
        if ($codePoint -ge 0xD800 -and $codePoint -le 0xDBFF) {
            # High surrogate - check for low surrogate
            if ($i + 1 -lt $chars.Length) {
                $nextChar = $chars[$i + 1]
                $nextCodePoint = [int]$nextChar
                if ($nextCodePoint -ge 0xDC00 -and $nextCodePoint -le 0xDFFF) {
                    # This is a surrogate pair (emoji or other high Unicode) - skip it
                    $i += 2
                    $modified = $true
                    continue
                }
            }
        }
        
        # Check if this character has a specific replacement
        if ($replacements.ContainsKey($char)) {
            [void]$result.Append($replacements[$char])
            $modified = $true
            $i++
            continue
        }
        
        # Standard ASCII range (0x00 - 0x7F)
        if ($codePoint -le 0x7F) {
            [void]$result.Append($char)
        }
        # Extended ASCII that we might want to keep (some accented characters in names)
        # For now, we'll remove ALL non-ASCII as requested
        else {
            # Non-ASCII character - remove it
            $modified = $true
            
            # Log the removed character if verbose
            if ($Verbose) {
                Write-Host "  Removing U+$($codePoint.ToString('X4')): $char" -ForegroundColor Yellow
            }
        }
        
        $i++
    }
    
    return @{
        Content  = $result.ToString()
        Modified = $modified
    }
}

function Process-File {
    param([string]$FilePath)
    
    try {
        # Read file as bytes to detect encoding
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        
        # Skip empty files
        if ($bytes.Length -eq 0) {
            return $false
        }
        
        # Skip binary files (simple heuristic: check for null bytes in first 8KB)
        $checkLength = [Math]::Min(8192, $bytes.Length)
        for ($i = 0; $i -lt $checkLength; $i++) {
            if ($bytes[$i] -eq 0) {
                if ($Verbose) {
                    Write-Host "  Skipping binary file: $FilePath" -ForegroundColor Gray
                }
                return $false
            }
        }
        
        # Try to read as UTF-8
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
        
        # Remove BOM if present
        if ($content.Length -gt 0 -and $content[0] -eq [char]0xFEFF) {
            $content = $content.Substring(1)
        }
        
        $originalContent = $content
        
        # Process the content
        $result = Remove-NonAsciiCharacters -Content $content
        
        if ($result.Modified) {
            if (-not $DryRun) {
                # Write back without BOM
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($FilePath, $result.Content, $utf8NoBom)
            }
            return $true
        }
        
        return $false
    }
    catch {
        Write-Host "  Error processing $FilePath : $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Main execution
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Non-ASCII Character Removal Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Root Directory: $RootDir" -ForegroundColor White
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN (no changes will be made)' } else { 'LIVE (files will be modified)' })" -ForegroundColor $(if ($DryRun) { 'Yellow' } else { 'Green' })
Write-Host ""

# Get all files
Write-Host "Scanning for files..." -ForegroundColor White
$allFiles = Get-ChildItem -Path $RootDir -Recurse -File -ErrorAction SilentlyContinue

$filesToProcess = @()
foreach ($file in $allFiles) {
    if (-not (Test-ShouldExcludeFile -FilePath $file.FullName)) {
        if (Test-ShouldIncludeFile -FilePath $file.FullName) {
            $filesToProcess += $file
        }
    }
}

Write-Host "Found $($filesToProcess.Count) text files to process" -ForegroundColor White
Write-Host ""

$modifiedCount = 0
$processedCount = 0
$errorCount = 0

foreach ($file in $filesToProcess) {
    $processedCount++
    
    # Show progress
    if ($processedCount % 50 -eq 0) {
        Write-Host "Progress: $processedCount / $($filesToProcess.Count)" -ForegroundColor Gray
    }
    
    try {
        $wasModified = Process-File -FilePath $file.FullName
        
        if ($wasModified) {
            $modifiedCount++
            $relativePath = $file.FullName.Replace($RootDir, "").TrimStart("\")
            Write-Host "[MODIFIED] $relativePath" -ForegroundColor Green
        }
    }
    catch {
        $errorCount++
        Write-Host "[ERROR] $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Files scanned: $processedCount" -ForegroundColor White
Write-Host "Files modified: $modifiedCount" -ForegroundColor $(if ($modifiedCount -gt 0) { 'Green' } else { 'White' })
Write-Host "Errors: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { 'Red' } else { 'White' })

if ($DryRun) {
    Write-Host ""
    Write-Host "This was a DRY RUN. No files were modified." -ForegroundColor Yellow
    Write-Host "Run without -DryRun to apply changes." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
