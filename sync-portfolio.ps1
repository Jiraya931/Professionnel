<#
.SYNOPSIS
    Surveillance et déploiement automatique PorteFolio -> GitHub Pages
    Auteur : Ababacar Ousmane Niang
#>

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try { $Host.UI.RawUI.WindowTitle = "Synchronisation Automatique PorteFolio -> GitHub Pages" } catch {}

$SourceDir = "C:\Users\DELL\Desktop\DOC\PorteFolio"
$TargetDir = "C:\Users\DELL\Desktop\DOC\GIT-GHPAGES"

function Show-Notification {
    param([string]$Title, [string]$Message)
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
        $notification = New-Object System.Windows.Forms.NotifyIcon
        $notification.Icon = [System.Drawing.SystemIcons]::Information
        $notification.BalloonTipTitle = $Title
        $notification.BalloonTipText = $Message
        $notification.Visible = $true
        $notification.ShowBalloonTip(4000)
        Start-Sleep -Milliseconds 300
        $notification.Dispose()
    } catch {
        # Fallback console si Windows Forms indisponible
    }
}

function Sync-And-Deploy {
    param([string]$Reason)
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Synchronisation en cours ($Reason)..." -ForegroundColor Cyan

    # 1. Copier les fichiers web principaux
    $files = @("index.html", "styles.css", "script.js")
    foreach ($f in $files) {
        $src = Join-Path $SourceDir $f
        $dst = Join-Path $TargetDir $f
        if (Test-Path $src) {
            Copy-Item -Path $src -Destination $dst -Force
        }
    }

    # 2. Synchroniser les dossiers assets et docs
    $folders = @("assets", "docs")
    foreach ($folder in $folders) {
        $srcFolder = Join-Path $SourceDir $folder
        $dstFolder = Join-Path $TargetDir $folder
        if (Test-Path $srcFolder) {
            if (-not (Test-Path $dstFolder)) {
                New-Item -ItemType Directory -Path $dstFolder -Force | Out-Null
            }
            robocopy $srcFolder $dstFolder /E /XO /XF "*.tmp" "*.swp" /NFL /NDL /NJH /NJS /NC /NS | Out-Null
        }
    }

    # 3. Vérifier les changements git dans GIT-GHPAGES
    $status = git -C $TargetDir status --porcelain
    if ($status) {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Changements detectes dans les fichiers :" -ForegroundColor Yellow
        Write-Host $status -ForegroundColor DarkGray
        
        git -C $TargetDir add -A
        $dateStr = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $commitMsg = "auto: mise a jour portfolio ($dateStr)"
        
        git -C $TargetDir commit -m $commitMsg | Out-Null
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Deploiement vers GitHub Pages (git push origin gh-pages)..." -ForegroundColor Cyan
        
        $pushOutput = git -C $TargetDir push origin gh-pages 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] SUCCES : Deploiement envoye a GitHub Pages !" -ForegroundColor Green
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] En ligne sous ~40s sur https://jiraya931.github.io/Professionnel/" -ForegroundColor Green
            Show-Notification "PorteFolio Deploye" "Vos modifications ont ete synchronisees et poussees vers GitHub Pages !"
        } else {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERREUR lors du git push :" -ForegroundColor Red
            Write-Host $pushOutput -ForegroundColor Red
        }
    } else {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Aucun changement detecte dans Git (deja synchronise)." -ForegroundColor Gray
    }
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   SURVEILLANCE & SYNCHRONISATION AUTOMATIQUE DU PORTFOLIO  " -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Dossier source surveille : $SourceDir" -ForegroundColor Gray
Write-Host "Dossier Git cible        : $TargetDir" -ForegroundColor Gray
Write-Host "Branche de deploiement   : gh-pages" -ForegroundColor Gray
Write-Host "Site en ligne            : https://jiraya931.github.io/Professionnel/" -ForegroundColor Green
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "En ecoute des modifications en temps reel..." -ForegroundColor Green
Write-Host "(Laissez cette fenetre ouverte en arriere-plan pendant vos modifications)" -ForegroundColor Gray
Write-Host "------------------------------------------------------------" -ForegroundColor DarkGray

# Nettoyage des événements résiduels antérieurs
Get-EventSubscriber | Where-Object { $_.SourceIdentifier -like "PorteFolioWatch_*" } | Unregister-Event
Get-Event | Where-Object { $_.SourceIdentifier -like "PorteFolioWatch_*" } | Remove-Event

# Synchronisation initiale
Sync-And-Deploy "Verification initiale"

# Configuration du FileSystemWatcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $SourceDir
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, LastWrite, Size, DirectoryName'

Register-ObjectEvent $watcher 'Changed' -SourceIdentifier 'PorteFolioWatch_Changed' | Out-Null
Register-ObjectEvent $watcher 'Created' -SourceIdentifier 'PorteFolioWatch_Created' | Out-Null
Register-ObjectEvent $watcher 'Deleted' -SourceIdentifier 'PorteFolioWatch_Deleted' | Out-Null
Register-ObjectEvent $watcher 'Renamed' -SourceIdentifier 'PorteFolioWatch_Renamed' | Out-Null

$pendingChange = $false
$lastEventTime = [DateTime]::MinValue

try {
    while ($true) {
        $events = Get-Event | Where-Object { $_.SourceIdentifier -like "PorteFolioWatch_*" }
        if ($events) {
            $events | Remove-Event
            $pendingChange = $true
            $lastEventTime = [DateTime]::Now
        }

        if ($pendingChange -and ([DateTime]::Now - $lastEventTime).TotalSeconds -ge 3) {
            $pendingChange = $false
            Sync-And-Deploy "Modification detectee dans PorteFolio"
        }

        Start-Sleep -Milliseconds 400
    }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Get-EventSubscriber | Where-Object { $_.SourceIdentifier -like "PorteFolioWatch_*" } | Unregister-Event
    Get-Event | Where-Object { $_.SourceIdentifier -like "PorteFolioWatch_*" } | Remove-Event
    Write-Host "Surveillance arretee." -ForegroundColor Yellow
}
