"""
Module de Connecteurs Réseau (Cisco Socket Telnet & Fortinet SSH)
Projet Homelab Proxmox VE 8, FortiGate 7.4 & Cisco IOL
Auteur : Ababacar Ousmane Niang - Master 2 RESI
"""

import socket
import subprocess
import time
import re
from .config import EVE_HOST, EVE_USER, EVE_PASS, PLINK_PATH, HOSTKEY

class CiscoTelnetClient:
    """Connecteur TCP Socket pour consoles Cisco IOL / Dynamips sous EVE-NG."""
    def __init__(self, host: str, port: int, timeout: int = 5):
        self.host = host
        self.port = port
        self.timeout = timeout

    def execute(self, command: str) -> str:
        """Exécute une commande en mode privilégié et récupère le flux retour."""
        try:
            s = socket.create_connection((self.host, self.port), timeout=self.timeout)
            s.settimeout(1.5)
            
            # Initialisation du terminal et desactivation de la pagination
            s.sendall(b"\r\n\r\n")
            time.sleep(0.3)
            s.sendall(b"enable\r\n")
            time.sleep(0.3)
            s.sendall(b"terminal length 0\r\n")
            time.sleep(0.3)
            
            # Vidage du buffer initial
            try:
                while True:
                    if not s.recv(2048): break
            except Exception:
                pass
                
            # Envoi de la commande demandée
            s.sendall(command.encode("latin-1") + b"\r\n")
            time.sleep(1.0)
            
            # Lecture complete de la reponse
            raw_output = b""
            try:
                while True:
                    chunk = s.recv(4096)
                    if not chunk: break
                    raw_output += chunk
            except Exception:
                pass
                
            s.close()
            output = raw_output.decode("latin-1", "ignore")
            # Nettoyage des sequences de controle d'echappement IOL
            clean_output = re.sub(r'(\xff[\xfb-\xfe].|\x1b\[[0-9;]*[a-zA-Z]|\x1b\]0;[^\x07]*\x07)', '', output)
            return clean_output.strip()
        except Exception as e:
            return f"ERREUR_CONNEXION: {e}"


class FortiSSHClient:
    """Connecteur SSH / Plink vers Fortinet FortiGate via la passerelle EVE-NG."""
    def __init__(self, ip: str, user: str, password: str, timeout: int = 15):
        self.ip = ip
        self.user = user
        self.password = password
        self.timeout = timeout

    def execute(self, commands: list[str] | str) -> str:
        """Exécute une ou plusieurs commandes CLI sur FortiOS et retourne la sortie."""
        if isinstance(commands, list):
            cmd_payload = "\n".join(commands)
        else:
            cmd_payload = commands
            
        remote_script = f"sshpass -p '{self.password}' ssh -o StrictHostKeyChecking=no {self.user}@{self.ip}"
        full_cmd = [
            PLINK_PATH, "-ssh", "-batch",
            "-hostkey", HOSTKEY,
            "-l", EVE_USER, "-pw", EVE_PASS,
            EVE_HOST,
            remote_script
        ]
        
        try:
            res = subprocess.run(
                full_cmd,
                input="config system console\nset output standard\nend\n" + cmd_payload + "\nexit\n",
                capture_output=True,
                text=True,
                timeout=self.timeout
            )
            output = res.stdout
            # Nettoyage du prompt et de la banniere initiale
            lines = [l for l in output.splitlines() if not l.startswith("Pseudo-terminal") and "login:" not in l]
            return "\n".join(lines).strip()
        except Exception as e:
            return f"ERREUR_FORTINET_SSH: {e}"

