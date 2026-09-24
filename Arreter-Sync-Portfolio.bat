@echo off
chcp 65001 > nul
title Arret Synchronisation PorteFolio
echo Arret des processus de synchronisation PorteFolio en cours...
powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*sync-portfolio.ps1*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('Processus ' + $_.ProcessId + ' arrete.') }"
echo Termine.
timeout /t 3
