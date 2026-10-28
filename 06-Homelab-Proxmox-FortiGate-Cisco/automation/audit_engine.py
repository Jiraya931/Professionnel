"""
Moteur d'Audit de Santé et de Conformité d'Infrastructure Réseau & Sécurité
Projet Homelab Proxmox VE 8, FortiGate 7.4 & Cisco IOL
Auteur : Ababacar Ousmane Niang - Master 2 RESI
"""

import json
from datetime import datetime
from pathlib import Path
from .config import REPORTS_DIR, INVENTORY
from .connectors import CiscoTelnetClient, FortiSSHClient

class AuditEngine:
    def __init__(self, output_dir: Path = REPORTS_DIR):
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def audit_cisco_device(self, name: str, info: dict) -> dict:
        """Réalise l'audit opérationnel d'un équipement Cisco IOS."""
        client = CiscoTelnetClient(info["host"], info["port"])
        checks = []
        
        # 1. Vérification des interfaces
        int_output = client.execute("show ip interface brief")
        for expected_int in info.get("expected_interfaces", []):
            is_up = False
            for line in int_output.splitlines():
                if line.startswith(expected_int) and "up" in line and "administratively down" not in line:
                    # verifie si state est up
                    parts = line.split()
                    if len(parts) >= 5 and parts[4] == "up":
                        is_up = True
            checks.append({
                "test": f"Interface {expected_int} active (UP/UP)",
                "passed": is_up,
                "detail": "Interface operationnelle" if is_up else "Interface DOWN ou absente"
            })
            
        # 2. Vérification des routes attendues
        if "expected_routes" in info:
            route_output = client.execute("show ip route")
            for expected_route in info["expected_routes"]:
                found = expected_route in route_output or (expected_route == "0.0.0.0/0" and "Gateway of last resort" in route_output)
                checks.append({
                    "test": f"Presence route {expected_route}",
                    "passed": found,
                    "detail": "Route detectee dans la RIB" if found else "Route manquante"
                })

        # 3. Vérification des VLANs (sur commutateur)
        if "expected_vlans" in info:
            vlan_output = client.execute("show vlan brief")
            for vlan_id in info["expected_vlans"]:
                found = f" {vlan_id} " in vlan_output or f"\n{vlan_id} " in vlan_output
                checks.append({
                    "test": f"Presence VLAN {vlan_id}",
                    "passed": found,
                    "detail": f"VLAN {vlan_id} provisionne" if found else f"VLAN {vlan_id} non declare"
                })

        passed_count = sum(1 for c in checks if c["passed"])
        score = (passed_count / len(checks) * 100) if checks else 100
        
        return {
            "device": name,
            "vendor": "cisco",
            "role": info.get("role", ""),
            "checks": checks,
            "passed": passed_count,
            "total": len(checks),
            "score": round(score, 1)
        }

    def audit_fortigate_device(self, name: str, info: dict) -> dict:
        """Réalise l'audit opérationnel du pare-feu Fortinet FortiGate."""
        client = FortiSSHClient(info["ip"], info["user"], info["password"])
        checks = []
        
        # 1. Vérification des interfaces physiques
        int_output = client.execute("get system interface physical")
        for intf in info.get("expected_interfaces", []):
            is_up = f"{intf}: Up" in int_output or f"{intf}: up" in int_output or f"{intf} is up" in int_output or intf in int_output
            checks.append({
                "test": f"Interface pare-feu {intf} connectee",
                "passed": is_up,
                "detail": "Interface physique active" if is_up else "Interface inactive"
            })

        # 2. Vérification des Virtual IPs (VIPs)
        vip_output = client.execute("show firewall vip")
        for vip in info.get("expected_vips", []):
            found = f'edit "{vip}"' in vip_output or vip in vip_output
            checks.append({
                "test": f"Virtual IP {vip} declaree",
                "passed": found,
                "detail": "VIP fonctionnelle et mappee" if found else "VIP introuvable"
            })

        # 3. Vérification des politiques de sécurité
        pol_output = client.execute("show firewall policy")
        for pol in info.get("expected_policies", []):
            found = f'set name "{pol}"' in pol_output or pol in pol_output
            checks.append({
                "test": f"Politique de securite {pol} active",
                "passed": found,
                "detail": "Regle firewall presente et chargee" if found else "Regle absente"
            })

        # 4. Vérification des profils UTM (IPS Sensor & Application Control)
        ips_output = client.execute("show ips sensor")
        for sensor in info.get("expected_ips_sensors", []):
            found = f'edit "{sensor}"' in ips_output or sensor in ips_output
            checks.append({
                "test": f"Capteur IPS {sensor} provisionne",
                "passed": found,
                "detail": "Profil d inspection DPI charge" if found else "Profil IPS manquant"
            })

        app_output = client.execute("show application list")
        for app in info.get("expected_app_ctrl", []):
            found = f'edit "{app}"' in app_output or app in app_output
            checks.append({
                "test": f"Profil Application Control {app} provisionne",
                "passed": found,
                "detail": "Controle applicatif L7 actif" if found else "Profil AppCtrl manquant"
            })

        # 5. Vérification politique DoS WAN
        dos_output = client.execute("show firewall DoS-policy")
        has_dos = "DOS_WAN_PROTECT" in dos_output or "tcp_syn_flood" in dos_output
        checks.append({
            "test": "Politique de protection Anti-DDoS active",
            "passed": has_dos,
            "detail": "Seuils SYN & ICMP flood configures" if has_dos else "Aucune DoS-policy active"
        })

        passed_count = sum(1 for c in checks if c["passed"])
        score = (passed_count / len(checks) * 100) if checks else 100

        return {
            "device": name,
            "vendor": "fortinet",
            "role": info.get("role", ""),
            "checks": checks,
            "passed": passed_count,
            "total": len(checks),
            "score": round(score, 1)
        }

    def audit_all(self) -> dict:
        """Lance l'audit complet du parc et génère les rapports."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        date_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        
        device_audits = []
        total_passed = 0
        total_checks = 0

        for name, info in INVENTORY.items():
            if info.get("vendor") == "cisco":
                res = self.audit_cisco_device(name, info)
            elif info.get("vendor") == "fortinet":
                res = self.audit_fortigate_device(name, info)
            else:
                continue
                
            device_audits.append(res)
            total_passed += res["passed"]
            total_checks += res["total"]

        global_score = (total_passed / total_checks * 100) if total_checks else 100

        report_data = {
            "audit_timestamp": timestamp,
            "audit_date": date_str,
            "auditor": "Ababacar Ousmane Niang - Master 2 RESI",
            "global_score": round(global_score, 1),
            "total_passed": total_passed,
            "total_checks": total_checks,
            "devices": device_audits
        }

        # Sauvegarde JSON
        json_path = self.output_dir / f"audit_report_{timestamp}.json"
        latest_json = self.output_dir / "audit_report_latest.json"
        json_path.write_text(json.dumps(report_data, indent=2), encoding="utf-8")
        latest_json.write_text(json.dumps(report_data, indent=2), encoding="utf-8")

        # Sauvegarde Markdown
        md_content = self.generate_markdown_summary(report_data)
        md_path = self.output_dir / f"audit_report_{timestamp}.md"
        latest_md = self.output_dir / "audit_report_latest.md"
        md_path.write_text(md_content, encoding="utf-8")
        latest_md.write_text(md_content, encoding="utf-8")

        return report_data

    def generate_markdown_summary(self, data: dict) -> str:
        """Convertit les résultats d'audit en un rapport Markdown professionnel."""
        lines = [
            f"# RAPPORT D AUDIT OPERATIONNEL ET CONFORMITE RESEAU & SECURITE",
            f"",
            f"- **Date de l'Audit :** {data['audit_date']}",
            f"- **Auditeur :** {data['auditor']}",
            f"- **Score de Conformite Globale :** **{data['global_score']} %** ({data['total_passed']} / {data['total_checks']} tests valides)",
            f"",
            f"---",
            f"",
            f"## Synthèse par Équipement",
            f"",
            f"| Equipement | Constructeur | Role Infrastructure | Score | Statut |",
            f"| :--- | :--- | :--- | :--- | :--- |"
        ]

        for d in data["devices"]:
            status_label = "CONFORME" if d["score"] == 100 else "DEGRADATION"
            lines.append(f"| **{d['device']}** | {d['vendor'].capitalize()} | {d['role']} | {d['score']} % | **{status_label}** |")

        lines.extend([
            "",
            "---",
            "",
            "## Détail des Points de Contrôle d'Ingénierie",
            ""
        ])

        for d in data["devices"]:
            lines.append(f"### {d['device']} ({d['role']})")
            lines.append(f"| Point de Controle | Resultat | Detail Technique |")
            lines.append(f"| :--- | :--- | :--- |")
            for c in d["checks"]:
                res = "OK" if c["passed"] else "ECHEC"
                lines.append(f"| {c['test']} | **{res}** | {c['detail']} |")
            lines.append("")

        return "\n".join(lines)
