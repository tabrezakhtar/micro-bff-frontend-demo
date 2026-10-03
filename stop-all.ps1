# Stops all micro-bff-frontend-demo services by killing processes on their ports.

function Stop-Port($port) {
    $procIds = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $procIds) {
        Write-Host "Killing process $processId on port $port"
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

3000, 4000, 5173, 5174 | ForEach-Object { Stop-Port $_ }
Write-Host "All services stopped."
