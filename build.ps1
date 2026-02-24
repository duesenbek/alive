# Build Script for Alive Life Simulator
Write-Host "Starting Build Process..." -ForegroundColor Cyan

$distDir = "dist"
$zipFile = "alive_release.zip"

# 1. Clean previous build
if (Test-Path $distDir) {
    Remove-Item -Recurse -Force $distDir
}
if (Test-Path $zipFile) {
    Remove-Item -Force $zipFile
}

New-Item -ItemType Directory -Force -Path $distDir | Out-Null

# 2. Copy Files
Write-Host "Copying files..."
Copy-Item "index.html" -Destination $distDir
Copy-Item "manifest.json" -Destination $distDir
Copy-Item -Recurse "js" -Destination $distDir
Copy-Item -Recurse "css" -Destination $distDir
Copy-Item -Recurse "assets" -Destination $distDir

# 3. Optimization (Placeholder/Simple)
# In a real CI, we would run npm run build / webpack / terser here.
# For now, we assume the JS files are ready.

# 4. Create Archive
Write-Host "Creating Zip Archive..."
Compress-Archive -Path "$distDir\*" -DestinationPath $zipFile

Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "Output: $zipFile"
