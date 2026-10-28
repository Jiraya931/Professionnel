"""
CLI Principale pour la Suite NetDevOps Homelab Proxmox VE 8, FortiGate 7.4 & Cisco IOL
Auteur : Ababacar Ousmane Niang - Master 2 RESI
"""

import sys
import argparse
from pathlib import Path
from .backup_engine import BackupEngine
from .audit_engine import AuditEngine
from .config import BACKUP_DIR, REPORTS_DIR

BANNER = """
================================================================================
  SUITE NETDEVOPS HOMELAB : AUTOMATISATION, SAUVEGARDES & AUDIT DE CONFORMITE
  Infrastructure Hybride : Proxmox VE 8 • EVE-NG • Cisco IOL • FortiGate 7.4
  Ingénieur Réseau & Sécurité : Ababacar Ousmane Niang (Master 2 RESI)
================================================================================
"""

def run_backup():
    print("\n[+] Demarrage du Moteur de Sauvegarde Automatisée...")
    engine = BackupEngine(BACKUP_DIR)
    results = engine.backup_all()
    
    print("\n" + "=" * 80)
    print(f"{'EQUIPEMENT':<16} | {'STATUT':<10} | {'LIGNES':<8} | {'VARIATION / DRIFT':<30}")
    print("=" * 80)
    for r in results:
        print(f"{r['name']:<16} | {r['status']:<10} | {r.get('lines', 0):<8} | {r.get('diff', r.get('error', '')):<30}")
    print("=" * 80)
    print(f"[+] Sauvegardes terminees. Fichiers stockes dans : {BACKUP_DIR}\n")

def run_audit():
    print("\n[+] Demarrage du Moteur d'Audit et de Conformite...")
    engine = AuditEngine(REPORTS_DIR)
    report = engine.audit_all()
    
    print("\n" + "=" * 80)
    print(f"RAPPORT GLOBAL : SCORE DE CONFORMITE = {report['global_score']} % ({report['total_passed']}/{report['total_checks']} tests valides)")
    print("=" * 80)
    print(f"{'EQUIPEMENT':<16} | {'CONSTRUCTEUR':<14} | {'SCORE':<8} | {'CONTROLES':<12} | {'STATUT':<10}")
    print("-" * 80)
    for d in report["devices"]:
        status = "CONFORME" if d["score"] == 100 else "DEGRADATION"
        ctrls = f"{d['passed']}/{d['total']}"
        print(f"{d['device']:<16} | {d['vendor'].capitalize():<14} | {d['score']:<8} % | {ctrls:<12} | {status:<10}")
    print("=" * 80)
    print(f"[+] Rapports generes avec succes dans : {REPORTS_DIR}")
    print(f"    - Rapport JSON : {REPORTS_DIR / 'audit_report_latest.json'}")
    print(f"    - Rapport MD   : {REPORTS_DIR / 'audit_report_latest.md'}\n")

def main():
    parser = argparse.ArgumentParser(description="Suite NetDevOps pour le Homelab Proxmox FortiGate Cisco")
    parser.add_argument("--backup", action="store_true", help="Extraire et sauvegarder les configurations a chaud")
    parser.add_argument("--audit", action="store_true", help="Auditer la conformite et l etat operationnel du parc")
    parser.add_argument("--all", action="store_true", help="Executer la sauvegarde et l audit complet")
    
    args = parser.parse_args()
    
    print(BANNER)
    
    if not (args.backup or args.audit or args.all):
        # Par défaut, exécution complète si aucun argument n'est fourni
        run_backup()
        run_audit()
        return

    if args.backup or args.all:
        run_backup()
        
    if args.audit or args.all:
        run_audit()

if __name__ == "__main__":
    main()

