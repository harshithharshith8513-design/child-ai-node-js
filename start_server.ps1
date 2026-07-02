$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

# Ensure node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies using npm..."
    & npm install
}

Write-Host "Starting ChildGuard AI Node.js/Express server at http://127.0.0.1:8000/"
& npm start
