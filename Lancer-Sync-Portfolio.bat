@echo off
chcp 65001 > nul
title Synchronisation PorteFolio - GitHub Pages
echo ============================================================
echo   Lancement de la synchronisation automatique PorteFolio
echo ============================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync-portfolio.ps1"
pause
