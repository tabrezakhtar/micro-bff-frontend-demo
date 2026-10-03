# Starts restaurant-api, web-bff, menu-mfe and host for the micro-bff-frontend-demo.
# menu-mfe and host are built then served via `vite preview` because
# @originjs/vite-plugin-federation only emits remoteEntry.js on `vite build`, not `vite dev`.

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot

function Stop-Port($port) {
    $procIds = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $procIds) {
        Write-Host "Killing process $processId on port $port"
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Freeing ports 3000, 4000, 5173, 5174..."
3000, 4000, 5173, 5174 | ForEach-Object { Stop-Port $_ }

Write-Host "Building menu-mfe..."
Push-Location "$root\menu-mfe"
npm run build
Pop-Location

Write-Host "Building host..."
Push-Location "$root\host"
npm run build
Pop-Location

Write-Host "Starting restaurant-api (4000)..."
Start-Process pwsh -ArgumentList '-NoExit', '-Command', "cd '$root\restaurant-api'; npm start"

Write-Host "Starting web-bff (3000)..."
Start-Process pwsh -ArgumentList '-NoExit', '-Command', "cd '$root\web-bff'; npm start"

Write-Host "Starting menu-mfe preview (5174)..."
Start-Process pwsh -ArgumentList '-NoExit', '-Command', "cd '$root\menu-mfe'; npm run preview"

Write-Host "Starting host preview (5173)..."
Start-Process pwsh -ArgumentList '-NoExit', '-Command', "cd '$root\host'; npm run preview"

Write-Host "All services starting in separate windows. Open http://localhost:5173 once they're up."
