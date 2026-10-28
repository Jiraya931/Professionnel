"""
Moteur de Sauvegarde Automatisée et Gestion des Dérives (GitOps / Backups)
Projet Homelab Proxmox VE 8, FortiGate 7.4 & Cisco IOL
Auteur : Ababacar Ousmane Niang - Master 2 RESI
"""

import os
import difflib
from datetime import datetime
from pathlib import Path
from .config import BACKUP_DIR, INVENTORY
from .connectors import CiscoTelnetClient, FortiSSHClient

class BackupEngine:
    def __init__(self, output_dir: Path = BACKUP_DIR):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def backup_device(self, name: str, info: dict) -> dict:
        """Extrait et sauvegarde la configuration d'un équipement."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        date_folder = self.output_dir / datetime.now().strftime("%Y-%m-%d")
        date_folder.mkdir(parents=True, exist_ok=True)
        
        vendor = info.get("vendor")
        config_text = ""
        
        if vendor == "cisco":
            client = CiscoTelnetClient(info["host"], info["port"])
            config_text = client.execute("show running-config")
        elif vendor == "fortinet":
            client = FortiSSHClient(info["ip"], info["user"], info["password"])
            config_text = client.execute("show")
            
        if not config_text or config_text.startswith("ERREUR"):
            return {
                "name": name,
                "status": "FAIL",
                "error": config_text or "Configuration vide",
                "lines": 0
            }
            
        # Fichiers cibles
        filename = f"{name}_{timestamp}.cfg"
        latest_filename = f"{name}_latest.cfg"
        filepath = date_folder / filename
        latest_path = self.output_dir / latest_filename
        
        # Calcul du diff avec la version precedente
        diff_summary = "Premier enregistrement"
        if latest_path.exists():
            old_config = latest_path.read_text(encoding="utf-8", errors="ignore").splitlines()
            new_config = config_text.splitlines()
            diff = list(difflib.unified_diff(old_config, new_config, lineterm=""))
            if diff:
                diff_summary = f"{len(diff)} lignes modifiees"
            else:
                diff_summary = "Aucune modification (conforme)"
                
        # Ecriture des fichiers
        filepath.write_text(config_text, encoding="utf-8")
        latest_path.write_text(config_text, encoding="utf-8")
        
        return {
            "name": name,
            "status": "SUCCESS",
            "file": str(filepath),
            "latest": str(latest_path),
            "lines": len(config_text.splitlines()),
            "diff": diff_summary
        }

    def backup_all(self) -> list[dict]:
        """Lance la sauvegarde sur l'ensemble du parc."""
        results = []
        for name, info in INVENTORY.items():
            res = self.backup_device(name, info)
            results.append(res)
        return results

