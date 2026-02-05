<#
.SYNOPSIS
    Setu Voice-to-ONDC Gateway - Complete Setup Script
    
.DESCRIPTION
    This idempotent script automatically configures and runs the Setu application.
    It handles all dependencies, configurations, and provides verbose output.
    Safe to run multiple times - will skip already-completed steps.

.NOTES
    Project: Setu Voice-to-ONDC Gateway
    Repository: https://github.com/divyamohan1993/setu-voice-ondc-gateway
    Contributors: divyamohan1993, kumkum-thakur
    Hackathon: AI for Bharat - Republic Day 2026
    
.EXAMPLE
    .\setup.ps1
    .\setup.ps1 -Mode docker
    .\setup.ps1 -Mode local
    .\setup.ps1 -Verbose
#>

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "Deployment mode: 'docker' (recommended) or 'local'")]
    [ValidateSet("docker", "local", "auto")]
    [string]$Mode = "auto",
    
    [Parameter(HelpMessage = "Skip dependency checks")]
    [switch]$SkipDependencyCheck,
    
    [Parameter(HelpMessage = "Force reinstall even if already configured")]
    [switch]$Force,
    
    [Parameter(HelpMessage = "Only verify installation without running")]
    [switch]$VerifyOnly
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"
Clear-Host
$RootDir = $PSScriptRoot
if (Split-Path -Leaf $PSScriptRoot -eq "scripts") {
    $RootDir = Split-Path -Parent $PSScriptRoot
}
$Script:CONFIG = @{
    AppName          = "Setu Voice-to-ONDC Gateway"
    Version          = "1.0.0"
    Repository       = "https://github.com/divyamohan1993/setu-voice-ondc-gateway"
    AppPort          = 3001
    DbPort           = 5432
    NodeMinVersion   = "18.0.0"
    DockerMinVersion = "20.0.0"
}

$Script:COLORS = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
    Header  = "Magenta"
    Step    = "White"
}

$Script:STEP_COUNT = 0
$Script:ERRORS = @()
$Script:WARNINGS = @()

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

function Write-Banner {
    $banner = @"


                                                                              
                                              
                                              
                 Voice-to-ONDC Gateway                
                 Bridging the Digital Divide          
            for Indian Farmers                   
                                                   
                                                                              
   [India] AI for Bharat Hackathon - Republic Day 2026                       
   Contributors: @divyamohan1993 @kumkum-thakur                              
                                                                              


"@
    Write-Host $banner -ForegroundColor $Script:COLORS.Header
}

function Write-Step {
    param([string]$Message)
    $Script:STEP_COUNT++
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host ""
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
    Write-Host "STEP $Script:STEP_COUNT: " -NoNewline -ForegroundColor $Script:COLORS.Info
    Write-Host $Message -ForegroundColor $Script:COLORS.Step
    Write-Host ("-" * 70) -ForegroundColor DarkGray
}

function Write-Success {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
    Write-Host "[OK] SUCCESS: " -NoNewline -ForegroundColor $Script:COLORS.Success
    Write-Host $Message -ForegroundColor $Script:COLORS.Success
}

function Write-Failure {
    param([string]$Message, [string]$Details = "")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
    Write-Host "[X] FAILED: " -NoNewline -ForegroundColor $Script:COLORS.Error
    Write-Host $Message -ForegroundColor $Script:COLORS.Error
    if ($Details) {
        Write-Host "  Details: $Details" -ForegroundColor $Script:COLORS.Error
    }
    $Script:ERRORS += @{
        Step    = $Script:STEP_COUNT
        Message = $Message
        Details = $Details
        Time    = Get-Date
    }
}

function Write-Warning {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
    Write-Host "[!] WARNING: " -NoNewline -ForegroundColor $Script:COLORS.Warning
    Write-Host $Message -ForegroundColor $Script:COLORS.Warning
    $Script:WARNINGS += $Message
}

function Write-Info {
    param([string]$Message)
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor DarkGray
    Write-Host "[i] INFO: " -NoNewline -ForegroundColor $Script:COLORS.Info
    Write-Host $Message
}

function Write-Verbose-Detail {
    param([string]$Message)
    if ($VerbosePreference -eq "Continue" -or $PSCmdlet.MyInvocation.BoundParameters["Verbose"]) {
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp]   -> $Message" -ForegroundColor DarkGray
    }
}

function Write-Command {
    param([string]$Command)
    Write-Host "  > " -NoNewline -ForegroundColor DarkGray
    Write-Host $Command -ForegroundColor DarkCyan
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function Install-WingetPackage {
    param([string]$Id, [string]$Name)
    Write-Info "Attempting to install $Name using winget..."
    if (Test-CommandExists "winget") {
        try {
            # Check if already installed to avoid reinstalling if just not in PATH (edge case)
            # But proceed with install
            $args = "install --id $Id -e --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity"
            Write-Verbose-Detail "Running: winget $args"
            
            $process = Start-Process -FilePath "winget" -ArgumentList $args -Wait -PassThru
            
            if ($process.ExitCode -eq 0) {
                Write-Success "$Name installed successfully."
                # Refresh environment variables
                foreach ($level in "Machine", "User") {
                    [Environment]::GetEnvironmentVariables($level).GetEnumerator() | % {
                        [Environment]::SetEnvironmentVariable($_.Name, $_.Value, "Process")
                    }
                }
                return $true
            }
            else {
                Write-Failure "Failed to install $Name via winget." "Exit code: $($process.ExitCode)"
            }
        }
        catch {
            Write-Failure "Error running winget." $_.Exception.Message
        }
    }
    else {
        Write-Warning "winget is not available. Cannot auto-install $Name."
    }
    return $false
}

function Test-IsAdmin {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-CommandExists {
    param([string]$Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Get-ProcessOnPort {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
        return $process
    }
    return $null
}

function Compare-Version {
    param([string]$Version1, [string]$Version2)
    $v1 = [Version]($Version1 -replace '[^\d.]', '')
    $v2 = [Version]($Version2 -replace '[^\d.]', '')
    return $v1.CompareTo($v2)
}

function Invoke-CommandWithOutput {
    param(
        [string]$Command,
        [string]$Arguments = "",
        [string]$WorkingDirectory = $PWD,
        [switch]$PassThru
    )
    
    Write-Command "$Command $Arguments"
    
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $Command
    $pinfo.Arguments = $Arguments
    $pinfo.RedirectStandardError = $true
    $pinfo.RedirectStandardOutput = $true
    $pinfo.UseShellExecute = $false
    $pinfo.WorkingDirectory = $WorkingDirectory
    $pinfo.CreateNoWindow = $true
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $pinfo
    
    try {
        $process.Start() | Out-Null
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        
        if ($PassThru) {
            return @{
                ExitCode = $process.ExitCode
                StdOut   = $stdout
                StdErr   = $stderr
            }
        }
        
        if ($process.ExitCode -ne 0) {
            Write-Verbose-Detail "Exit Code: $($process.ExitCode)"
            if ($stderr) {
                Write-Verbose-Detail "StdErr: $stderr"
            }
        }
        
        return $process.ExitCode -eq 0
    }
    catch {
        Write-Verbose-Detail "Exception: $_"
        return $false
    }
}

# ============================================================================
# DEPENDENCY CHECKS
# ============================================================================

function Test-NodeJS {
    Write-Info "Checking Node.js..."
    
    if (-not (Test-CommandExists "node")) {
        Write-Warning "Node.js is not installed"
        if (Install-WingetPackage "OpenJS.NodeJS.LTS" "Node.js") {
            if (Test-CommandExists "node") {
                Write-Success "Node.js was installed and detected."
            }
            else {
                Write-Warning "Node.js installed but not yet detected in current session. You may need to restart the script."
                return $false # Stop here as we probably can't proceed without a reload
            }
        }
        else {
            Write-Failure "Node.js is not installed" "Please install Node.js 18+ from https://nodejs.org/"
            return $false
        }
    }
    
    $nodeVersion = (node --version).TrimStart('v')
    Write-Verbose-Detail "Found Node.js version: $nodeVersion"
    
    if ((Compare-Version $nodeVersion $Script:CONFIG.NodeMinVersion) -lt 0) {
        Write-Failure "Node.js version too old" "Required: $($Script:CONFIG.NodeMinVersion)+, Found: $nodeVersion"
        return $false
    }
    
    Write-Success "Node.js $nodeVersion detected"
    return $true
}

function Test-Npm {
    Write-Info "Checking npm..."
    
    # On Windows, prefer npm.cmd to avoid ExecutionPolicy issues with npm.ps1
    $npmCmd = if ($IsWindows -or $env:OS -like "*Windows*") { "npm.cmd" } else { "npm" }

    if (-not (Test-CommandExists $npmCmd)) {
        Write-Failure "npm is not installed" "npm should come with Node.js installation"
        return $false
    }
    
    $npmVersion = (Invoke-Expression "$npmCmd --version")
    Write-Verbose-Detail "Found npm version: $npmVersion"
    Write-Success "npm $npmVersion detected"
    return $true
}

function Test-Docker {
    Write-Info "Checking Docker..."
    
    if (-not (Test-CommandExists "docker")) {
        Write-Warning "Docker is not installed"
        
        # Auto-install Docker Desktop in automated mode
        Write-Info "Attempting to auto-install Docker Desktop..."
        if (Install-WingetPackage "Docker.DockerDesktop" "Docker Desktop") {
            Write-Info "Docker Desktop installed. You MUST restart your computer/session to use it."
            Write-Info "Please restart and run this script again."
            exit 0
        }

        Write-Info "Docker is optional but recommended. Proceeding with local mode."
        return $false
    }
    
    # Check if Docker daemon is running
    $result = Invoke-CommandWithOutput -Command "docker" -Arguments "info" -PassThru
    if ($result.ExitCode -ne 0) {
        Write-Warning "Docker is installed but daemon is not running"
        Write-Info "Please start Docker Desktop and try again"
        return $false
    }
    
    $dockerVersion = (docker --version) -replace 'Docker version ', '' -replace ',.*', ''
    Write-Verbose-Detail "Found Docker version: $dockerVersion"
    Write-Success "Docker $dockerVersion detected and running"
    return $true
}

function Test-DockerCompose {
    Write-Info "Checking Docker Compose..."
    
    # Try docker compose (v2)
    $result = Invoke-CommandWithOutput -Command "docker" -Arguments "compose version" -PassThru
    if ($result.ExitCode -eq 0) {
        $version = $result.StdOut -replace '.*version\s*', '' -replace '\s.*', ''
        Write-Success "Docker Compose $version detected"
        return $true
    }
    
    # Try docker-compose (v1)
    if (Test-CommandExists "docker-compose") {
        $version = (docker-compose --version) -replace '.*version\s*', '' -replace ',.*', ''
        Write-Success "docker-compose $version detected"
        return $true
    }
    
    Write-Warning "Docker Compose is not available"
    return $false
}

function Test-Git {
    Write-Info "Checking Git..."
    
    if (-not (Test-CommandExists "git")) {
        Write-Warning "Git is not installed - some features may not work"
        return $false
    }
    
    $gitVersion = (git --version) -replace 'git version ', ''
    Write-Success "Git $gitVersion detected"
    return $true
}

# ============================================================================
# PORT MANAGEMENT
# ============================================================================

function Resolve-PortConflict {
    param([int]$Port, [string]$ServiceName)
    
    if (-not (Test-PortInUse $Port)) {
        Write-Verbose-Detail "Port $Port is available"
        return $true
    }
    
    $process = Get-ProcessOnPort $Port
    if ($process) {
        Write-Warning "Port $Port is in use by: $($process.ProcessName) (PID: $($process.Id))"
        
        # Auto-terminate process in automated mode
        Write-Info "Auto-terminating process to free port..."
        try {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            
            # Wait checking loop (up to 10 seconds)
            $checkLoop = 0
            while ($checkLoop -lt 10) {
                Start-Sleep -Seconds 1
                if (-not (Test-PortInUse $Port)) {
                    Write-Success "Port $Port is now available"
                    return $true
                }
                $checkLoop++
            }
        }
        catch {
            Write-Verbose-Detail "Stop-Process failed: $_"
        }
        
        # Fallback: Taskkill
        if (Test-PortInUse $Port) {
            Write-Info "Process still running. Attempting forceful taskkill..."
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $process.Id -NoNewWindow -Wait
            Start-Sleep -Seconds 2
        }
    }
    
    # Final check
    if (-not (Test-PortInUse $Port)) {
        Write-Success "Port $Port was successfully freed"
        return $true
    }
    
    Write-Warning "Port $Port is still in use by an unknown or stubborn process"
    return $false
}

# ============================================================================
# ENVIRONMENT SETUP
# ============================================================================

function Initialize-Environment {
    Write-Step "Initializing Environment"
    
    $envFile = Join-Path $RootDir ".env"
    $envExampleFile = Join-Path $RootDir ".env.example"
    
    if ((Test-Path $envFile) -and -not $Force) {
        Write-Info ".env file already exists"
        Write-Verbose-Detail "Use -Force to recreate"
        return $true
    }
    
    if (Test-Path $envExampleFile) {
        Write-Info "Creating .env from .env.example..."
        Copy-Item $envExampleFile $envFile -Force
        Write-Success ".env file created"
    }
    else {
        Write-Info "Creating default .env file..."
        $envContent = @"
# Database Configuration
POSTGRES_USER=setu
POSTGRES_PASSWORD=setu_password_$(Get-Random -Maximum 9999)
POSTGRES_DB=setu_db
DATABASE_URL=postgresql://setu:setu_password@localhost:5432/setu_db

# AI Configuration (Optional - system works without this)
OPENAI_API_KEY=

# Application Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
"@
        $envContent | Out-File -FilePath $envFile -Encoding utf8
        Write-Success ".env file created with default values"
    }
    
    return $true
}

function Install-Dependencies {
    Write-Step "Installing Node.js Dependencies"
    
    $nodeModules = Join-Path $RootDir "node_modules"
    $packageJson = Join-Path $RootDir "package.json"
    $packageLock = Join-Path $RootDir "package-lock.json"
    
    if ((Test-Path $nodeModules) -and -not $Force) {
        $moduleCount = (Get-ChildItem $nodeModules -Directory).Count
        if ($moduleCount -gt 10) {
            Write-Info "node_modules already exists with $moduleCount packages"
            Write-Verbose-Detail "Use -Force to reinstall"
            return $true
        }
    }
    
    if (-not (Test-Path $packageJson)) {
        Write-Failure "package.json not found" "Are you in the correct directory?"
        return $false
    }
    
    Write-Info "Running npm install..."
    $npmCmd = if ($IsWindows -or $env:OS -like "*Windows*") { "npm.cmd" } else { "npm" }
    $result = Invoke-CommandWithOutput -Command $npmCmd -Arguments "install" -WorkingDirectory $RootDir -PassThru
    
    if ($result.ExitCode -ne 0) {
        Write-Failure "npm install failed" $result.StdErr
        Write-Verbose-Detail "StdOut: $($result.StdOut)"
        return $false
    }
    
    Write-Success "Dependencies installed successfully"
    return $true
}

# ============================================================================
# DATABASE SETUP
# ============================================================================

function Initialize-Database-Docker {
    Write-Step "Initializing Database (Docker)"
    
    Write-Info "Starting database container..."
    $result = Invoke-CommandWithOutput -Command "docker" -Arguments "compose up -d db" -WorkingDirectory $RootDir -PassThru
    
    if ($result.ExitCode -ne 0) {
        Write-Failure "Failed to start database container" $result.StdErr
        return $false
    }
    
    Write-Info "Waiting for database to be ready..."
    $maxAttempts = 30
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        Write-Verbose-Detail "Attempt $attempt/$maxAttempts..."
        
        $healthCheck = Invoke-CommandWithOutput -Command "docker" -Arguments "compose exec -T db pg_isready -U setu -d setu_db" -WorkingDirectory $RootDir -PassThru
        
        if ($healthCheck.ExitCode -eq 0) {
            Write-Success "Database is ready"
            break
        }
        
        Start-Sleep -Seconds 2
    }
    
    if ($attempt -ge $maxAttempts) {
        Write-Failure "Database failed to start within timeout"
        return $false
    }
    
    # Run Prisma migrations
    Write-Info "Running database migrations..."
    $npxCmd = if ($IsWindows -or $env:OS -like "*Windows*") { "npx.cmd" } else { "npx" }
    $result = Invoke-CommandWithOutput -Command $npxCmd -Arguments "prisma db push" -WorkingDirectory $RootDir -PassThru
    
    if ($result.ExitCode -ne 0) {
        Write-Warning "Prisma db push had issues: $($result.StdErr)"
    }
    else {
        Write-Success "Database schema synchronized"
    }
    
    return $true
}

function Initialize-Database-Local {
    Write-Step "Initializing Database (SQLite - Local Mode)"
    
    Write-Info "Using SQLite for local development..."
    
    # Update prisma schema if needed for SQLite
    $prismaSchema = Join-Path $RootDir "prisma\schema.prisma"
    if (Test-Path $prismaSchema) {
        $schemaContent = Get-Content $prismaSchema -Raw
        $newContent = $schemaContent
        
        # 1. Change provider from postgresql to sqlite
        if ($newContent -match 'provider\s*=\s*"postgresql"') {
            Write-Info "Patching schema.prisma: changing provider to sqlite..."
            $newContent = $newContent -replace 'provider\s*=\s*"postgresql"', 'provider = "sqlite"'
        }
        
        # 2. Remove 'url' field from datasource (required for Prisma 7 with prisma.config.ts)
        # This regex matches 'url = ...' possibly with env() call, and replaces it with empty string
        # We assume it's in the datasource block and uses standard formatting
        if ($newContent -match 'url\s*=\s*env\("DATABASE_URL"\)') {
            Write-Info "Patching schema.prisma: removing url property (managed by prisma.config.ts)..."
            $newContent = $newContent -replace 'url\s*=\s*env\("DATABASE_URL"\)', ''
        }
        
        if ($newContent -ne $schemaContent) {
            $newContent | Set-Content $prismaSchema -Encoding UTF8
            Write-Success "Updated schema.prisma for local development"
        }
    }

    # Update .env for SQLite if needed
    $envFile = Join-Path $RootDir ".env"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile -Raw
        if ($envContent -match "DATABASE_URL=postgresql") {
            Write-Info "Patching .env: switching DATABASE_URL to SQLite..."
            $envContent = $envContent -replace "DATABASE_URL=postgresql://.*", 'DATABASE_URL="file:./dev.db"'
            $envContent | Set-Content $envFile -Encoding UTF8
            Write-Success "Updated .env for local development"
        }
    }
    
    # Generate Prisma client
    Write-Info "Generating Prisma client..."
    
    $prismaCmd = Join-Path $RootDir "node_modules\.bin\prisma.cmd"
    if (-not (Test-Path $prismaCmd)) {
        # Fallback to npx if local binary not found
        $prismaCmd = if ($IsWindows -or $env:OS -like "*Windows*") { "npx.cmd" } else { "npx" }
        $prismaArgs = "prisma"
    }
    else {
        $prismaArgs = ""
    }



    $genArgs = if ($prismaArgs) { "$prismaArgs generate" } else { "generate" }
    $result = Invoke-CommandWithOutput -Command $prismaCmd -Arguments $genArgs -WorkingDirectory $RootDir -PassThru
    
    if ($result.ExitCode -ne 0) {
        Write-Warning "Prisma generate had issues: $($result.StdErr)"
    }
    
    # Push schema
    Write-Info "Pushing database schema..."
    $pushArgs = if ($prismaArgs) { "$prismaArgs db push" } else { "db push" }
    $result = Invoke-CommandWithOutput -Command $prismaCmd -Arguments $pushArgs -WorkingDirectory $RootDir -PassThru
    
    if ($result.ExitCode -ne 0) {
        Write-Warning "Prisma db push had issues: $($result.StdErr)"
    }
    
    # Run Seed using tsx.cmd directly from node_modules\.bin (bypasses npm/npx issues)
    Write-Info "Seeding database..."
    
    $tsxCmd = Join-Path $RootDir "node_modules\.bin\tsx.cmd"
    
    if (Test-Path $tsxCmd) {
        # Use local tsx directly with PowerShell call operator
        Write-Command "$tsxCmd prisma/seed.ts"
        
        # Execute tsx using Start-Process to avoid path issues
        $pinfo = New-Object System.Diagnostics.ProcessStartInfo
        $pinfo.FileName = $tsxCmd
        $pinfo.Arguments = "prisma/seed.ts"
        $pinfo.RedirectStandardError = $true
        $pinfo.RedirectStandardOutput = $true
        $pinfo.UseShellExecute = $false
        $pinfo.WorkingDirectory = $RootDir
        $pinfo.CreateNoWindow = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $pinfo
        
        try {
            $process.Start() | Out-Null
            $stdout = $process.StandardOutput.ReadToEnd()
            $stderr = $process.StandardError.ReadToEnd()
            $process.WaitForExit()
            
            $result = @{
                ExitCode = $process.ExitCode
                StdOut   = $stdout
                StdErr   = $stderr
            }
        }
        catch {
            $result = @{
                ExitCode = 1
                StdOut   = ""
                StdErr   = $_.Exception.Message
            }
        }
    }
    else {
        # Fallback: Try using the global npm to run tsx
        Write-Info "tsx.cmd not found locally, trying global npm..."
        $result = Invoke-CommandWithOutput -Command "npm" -Arguments "exec tsx -- prisma/seed.ts" -WorkingDirectory $RootDir -PassThru
    }
    
    if ($result.ExitCode -ne 0) {
        Write-Warning "Database seeding had issues: $($result.StdErr)"
    }
    else {
        Write-Success "Database seeded successfully"
    }

    Write-Success "Local database initialized"
    return $true
}

# ============================================================================
# APPLICATION STARTUP
# ============================================================================

function Start-Application-Docker {
    Write-Step "Starting Application (Docker Mode)"
    
    Write-Info "Building and starting containers..."
    $result = Invoke-CommandWithOutput -Command "docker" -Arguments "compose up -d --build" -WorkingDirectory $RootDir -PassThru
    
    if ($result.ExitCode -ne 0) {
        Write-Failure "Failed to start Docker containers" $result.StdErr
        return $false
    }
    
    Write-Info "Waiting for application to be ready..."
    $maxAttempts = 60
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        Write-Verbose-Detail "Attempt $attempt/$maxAttempts..."
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($Script:CONFIG.AppPort)" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Application is running!"
                return $true
            }
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }
    
    Write-Warning "Application may still be starting..."
    return $true
}

function Start-Application-Local {
    Write-Step "Starting Application (Local Development Mode)"
    
    # Check port availability
    if (Test-PortInUse $Script:CONFIG.AppPort) {
        if (-not (Resolve-PortConflict $Script:CONFIG.AppPort "Application")) {
            Write-Failure "Port $($Script:CONFIG.AppPort) is not available"
            return $false
        }
    }
    
    Write-Info "Starting development server..."
    Write-Info "The server will start in a new window. Press Ctrl+C to stop."
    
    $npmCmd = if ($IsWindows -or $env:OS -like "*Windows*") { "npm.cmd" } else { "npm" }
    Start-Process -FilePath $npmCmd -ArgumentList "run", "dev" -WorkingDirectory $RootDir -NoNewWindow
    
    Write-Info "Waiting for application to be ready..."
    $maxAttempts = 30
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        Start-Sleep -Seconds 2
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($Script:CONFIG.AppPort)" -Method Head -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Application is running!"
                return $true
            }
        }
        catch {
            Write-Verbose-Detail "Waiting... (attempt $attempt)"
        }
    }
    
    Write-Warning "Application may still be starting. Check the console for details."
    return $true
}

# ============================================================================
# VERIFICATION
# ============================================================================

function Test-Installation {
    Write-Step "Verifying Installation"
    
    $checks = @(
        @{ Name = "node_modules exists"; Test = { Test-Path (Join-Path $RootDir "node_modules") } },
        @{ Name = ".env file exists"; Test = { Test-Path (Join-Path $RootDir ".env") } },
        @{ Name = "Prisma client generated"; Test = { Test-Path (Join-Path $RootDir "lib\generated-client") } }
    )
    
    $passed = 0
    $failed = 0
    
    foreach ($check in $checks) {
        if (& $check.Test) {
            Write-Success $check.Name
            $passed++
        }
        else {
            Write-Failure $check.Name
            $failed++
        }
    }
    
    # Check if app is accessible
    Write-Info "Checking application accessibility..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($Script:CONFIG.AppPort)" -Method Head -TimeoutSec 10 -ErrorAction Stop
        Write-Success "Application is accessible on port $($Script:CONFIG.AppPort)"
        $passed++
    }
    catch {
        Write-Warning "Application is not yet accessible (may still be starting)"
    }
    
    Write-Info "Verification complete: $passed passed, $failed failed"
    return $failed -eq 0
}

# ============================================================================
# SUMMARY
# ============================================================================

function Write-Summary {
    Write-Host ""
    Write-Host "" * 70 -ForegroundColor $Script:COLORS.Header
    Write-Host ""
    
    if ($Script:ERRORS.Count -eq 0) {
        Write-Host "  [SUCCESS] SETUP COMPLETED SUCCESSFULLY!" -ForegroundColor $Script:COLORS.Success
        Write-Host ""
        Write-Host "  Access the application:" -ForegroundColor White
        Write-Host "   Main App:     " -NoNewline -ForegroundColor Gray
        Write-Host "http://localhost:$($Script:CONFIG.AppPort)" -ForegroundColor Cyan
        Write-Host "   Debug View:   " -NoNewline -ForegroundColor Gray
        Write-Host "http://localhost:$($Script:CONFIG.AppPort)/debug" -ForegroundColor Cyan
        Write-Host "   Repository:   " -NoNewline -ForegroundColor Gray
        Write-Host $Script:CONFIG.Repository -ForegroundColor Cyan
    }
    else {
        Write-Host "  [!] SETUP COMPLETED WITH ERRORS" -ForegroundColor $Script:COLORS.Warning
        Write-Host ""
        Write-Host "  The following errors occurred:" -ForegroundColor White
        foreach ($err in $Script:ERRORS) {
            Write-Host "  Step $($err.Step): $($err.Message)" -ForegroundColor $Script:COLORS.Error
            if ($err.Details) {
                Write-Host "    -> $($err.Details)" -ForegroundColor DarkGray
            }
        }
    }
    
    if ($Script:WARNINGS.Count -gt 0) {
        Write-Host ""
        Write-Host "  Warnings:" -ForegroundColor $Script:COLORS.Warning
        foreach ($warning in $Script:WARNINGS) {
            Write-Host "  * $warning" -ForegroundColor $Script:COLORS.Warning
        }
    }
    
    Write-Host ""
    Write-Host "" * 70 -ForegroundColor $Script:COLORS.Header
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    $startTime = Get-Date
    
    # Display banner
    Write-Banner
    
    Write-Host "Starting setup at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
    Write-Host "Mode: $Mode | Force: $Force | Verbose: $($VerbosePreference -eq 'Continue')" -ForegroundColor Gray
    Write-Host ""
    
    # Step 1: Check dependencies
    if (-not $SkipDependencyCheck) {
        Write-Step "Checking Dependencies"
        
        $nodeOk = Test-NodeJS
        $npmOk = Test-Npm
        $dockerOk = Test-Docker
        $dockerComposeOk = Test-DockerCompose
        $gitOk = Test-Git
        
        if (-not $nodeOk -or -not $npmOk) {
            Write-Failure "Required dependencies missing" "Node.js and npm are required"
            Write-Summary
            exit 1
        }
        
        # Auto-detect mode
        if ($Mode -eq "auto") {
            if ($dockerOk -and $dockerComposeOk) {
                $Mode = "docker"
                Write-Info "Auto-selected Docker mode"
            }
            else {
                $Mode = "local"
                Write-Info "Auto-selected Local mode (Docker not available)"
            }
        }
    }
    
    # Step 2: Initialize environment
    if (-not (Initialize-Environment)) {
        Write-Summary
        exit 1
    }
    
    # Step 3: Install dependencies
    if (-not (Install-Dependencies)) {
        Write-Summary
        exit 1
    }
    
    # Step 4: Setup database
    if ($Mode -eq "docker") {
        if (-not (Initialize-Database-Docker)) {
            Write-Warning "Docker database setup failed, trying local mode"
            $Mode = "local"
        }
    }
    
    if ($Mode -eq "local") {
        if (-not (Initialize-Database-Local)) {
            Write-Summary
            exit 1
        }
    }
    
    # Step 5: Start application (unless verify only)
    if (-not $VerifyOnly) {
        if ($Mode -eq "docker") {
            if (-not (Start-Application-Docker)) {
                Write-Summary
                exit 1
            }
        }
        else {
            if (-not (Start-Application-Local)) {
                Write-Summary
                exit 1
            }
        }
    }
    
    # Step 6: Verify installation
    Test-Installation | Out-Null
    
    # Calculate duration
    $duration = (Get-Date) - $startTime
    Write-Info "Total time: $($duration.Minutes)m $($duration.Seconds)s"
    
    # Display summary
    Write-Summary
    
    # Auto-open browser in automated mode
    if ($Script:ERRORS.Count -eq 0 -and -not $VerifyOnly) {
        Write-Info "Auto-opening application in browser..."
        Start-Process "http://localhost:$($Script:CONFIG.AppPort)"
    }
}

# Run main function
Main
