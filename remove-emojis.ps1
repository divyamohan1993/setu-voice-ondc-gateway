# Script to remove emojis and non-standard characters from all files
$ErrorActionPreference = "SilentlyContinue"

# Define the root directory
$rootDir = "R:\ai-for-bharat-26-jan"

# Define directories to exclude
$excludeDirs = @(
    "node_modules",
    ".git",
    ".next"
)

# Define file extensions to process
$includeExtensions = @(
    ".md", ".txt", ".ts", ".tsx", ".js", ".jsx", ".json", ".yaml", ".yml",
    ".ps1", ".sh", ".bat", ".css", ".html", ".sql", ".prisma", ".mjs"
)

# Get all files recursively
$files = Get-ChildItem -Path $rootDir -Recurse -File | Where-Object {
    $exclude = $false
    foreach ($dir in $excludeDirs) {
        if ($_.FullName -match [regex]::Escape("\$dir\")) {
            $exclude = $true
            break
        }
    }
    
    # Also exclude package-lock.json
    if ($_.Name -eq "package-lock.json") {
        $exclude = $true
    }
    
    -not $exclude -and ($includeExtensions -contains $_.Extension -or 
        $_.Name -match '^\.(env|gitignore|dockerignore|mailmap)' -or 
        $_.Extension -match '\.(example|local)$')
}

$modifiedCount = 0

# Define emoji characters to remove as a list
$emojiChars = @(
    [char]::ConvertFromUtf32(0x2705),  # Check mark
    [char]::ConvertFromUtf32(0x274C),  # Cross mark
    [char]::ConvertFromUtf32(0x26A0),  # Warning
    [char]::ConvertFromUtf32(0x2139),  # Info
    [char]::ConvertFromUtf32(0x2757),  # Exclamation
    [char]::ConvertFromUtf32(0x2728),  # Sparkles
    [char]::ConvertFromUtf32(0x2764),  # Heart
    [char]::ConvertFromUtf32(0x2B50),  # Star
    [char]::ConvertFromUtf32(0x23F3),  # Hourglass
    [char]::ConvertFromUtf32(0x2714),  # Check
    [char]::ConvertFromUtf32(0x2717),  # Cross
    [char]0xFE0F                        # Variation selector
)

# Build regex pattern for common emojis
$emojiPattern = '[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]|[\x{2139}]|[\x{2705}]|[\x{274C}]|[\x{26A0}]|[\x{2728}]|[\x{2764}]|[\x{2B50}]|[\x{23F3}]|[\x{2714}]|[\x{2717}]|[\x{FE0F}]|[\x{200D}]'

foreach ($file in $files) {
    try {
        # Read file content as bytes to handle encoding
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
        
        if ($null -eq $content -or $content.Length -eq 0) { continue }
        
        $originalContent = $content
        
        # Remove specific emoji characters one by one
        foreach ($emoji in $emojiChars) {
            $content = $content.Replace($emoji, '')
        }
        
        # Also remove high Unicode characters (emoji range) using byte processing
        $charArray = $content.ToCharArray()
        $cleanChars = @()
        $i = 0
        while ($i -lt $charArray.Length) {
            $c = $charArray[$i]
            $codePoint = [int]$c
            
            # Check for surrogate pair (emoji like flags, etc.)
            if ($codePoint -ge 0xD800 -and $codePoint -le 0xDBFF -and $i + 1 -lt $charArray.Length) {
                $nextC = $charArray[$i + 1]
                $nextCodePoint = [int]$nextC
                if ($nextCodePoint -ge 0xDC00 -and $nextCodePoint -le 0xDFFF) {
                    # This is a surrogate pair (emoji), skip it
                    $i += 2
                    continue
                }
            }
            
            # Skip certain known emoji code points
            if (($codePoint -ge 0x2600 -and $codePoint -le 0x27BF) -or
                ($codePoint -eq 0x2705) -or 
                ($codePoint -eq 0x274C) -or
                ($codePoint -eq 0x26A0) -or
                ($codePoint -eq 0x2139) -or
                ($codePoint -eq 0x2728) -or
                ($codePoint -eq 0x2764) -or
                ($codePoint -eq 0x2B50) -or
                ($codePoint -eq 0x23F3) -or
                ($codePoint -eq 0x2714) -or
                ($codePoint -eq 0x2717) -or
                ($codePoint -eq 0xFE0F) -or
                ($codePoint -eq 0x200D)) {
                $i++
                continue
            }
            
            $cleanChars += $c
            $i++
        }
        
        $content = -join $cleanChars
        
        # If content changed, write it back
        if ($content -ne $originalContent) {
            $utf8NoBom = New-Object System.Text.UTF8Encoding $false
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Modified: $($file.FullName)"
            $modifiedCount++
        }
    }
    catch {
        Write-Host "Error processing: $($file.FullName) - $($_.Exception.Message)"
    }
}

Write-Host "`nTotal files modified: $modifiedCount"
