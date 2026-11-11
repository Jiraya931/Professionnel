# SUITE NETDEVOPS : AUTOMATISATION, SAUVEGARDE & AUDIT DE CONFORMITE

Ce module regroupe l'outillage logiciel de gestion automatisee, de sauvegarde a chaud, de correlation SIEM et d'audit de conformite de l'infrastructure reseau hybride Proxmox VE 8, EVE-NG (`192.168.1.202`), Wazuh SIEM (`192.168.1.201`), Cisco IOL et Fortinet FortiGate 7.4.13 (`192.168.1.203`).

---

## 1. Objectifs d'Ingenierie NetDevOps

1. **Sauvegarde Automatisee a Chaud (Backup Engine) :**
   - Extraction programmee des configurations actives (`running-config` Cisco IOS et `show` FortiOS) sur l'ensemble des 5 equipements sans saisie interactive.
   - Archivage horodate avec structure arborescente par date et gestion d'une reference `_latest.cfg`.
   - Detection de derive de configuration (*Configuration Drift*) par calcul differentiel unifie (`difflib`).

2. **Audit de Sante et Controle de Conformite (Audit Engine) :**
   - Interrogation automatique de 40 points de controle repartis sur le pare-feu, le commutateur d'acces et les 3 routeurs (`R1_HQ`, `R_STANDBY_HQ`, `SW1_HQ`, `R2_BRANCH`, `FORTIGATE_HQ`).
   - Validation de l'etat operationnel des interfaces critiques (`UP/UP`), du routage dynamique OSPFv2, du cluster haute disponibilite FHRP/HSRP (`Groupe 1`, `VIP 10.10.10.254`) et du durcissement L2 (Port-Security, DHCP Snooping, BPDU Guard).
   - Controle de l'export centralise des journaux Syslog UDP/514 vers le collecteur SIEM Wazuh (`192.168.1.201`) sur 100 % du parc.
   - Verification de la posture de securite FortiOS : politiques actives, VIP, capteurs IPS (DPI) et protection anti-DDoS.
   - Generation simultanee d'un rapport structure exploitable par machine (`JSON`) et d'un rapport executif synthetique (`Markdown`).

3. **Referentiel SOC as Code (`wazuh/local_rules.xml`) :**
   - Centralisation versionnee des 10 regles de correlation Wazuh (`100101` a `100110`) dediees aux incidents Cisco IOS (HSRP, OSPF, Port-Security, err-disable, DHCP Snooping, Spanning-Tree, VPN IPsec) et Fortinet FortiGate (DoS Anomaly et IPS Custom DMZ), mappees MITRE ATT&CK (`T1200`, `T1557`, `T1498`, `T1190`).

---

## 2. Architecture Logicielle du Module

```text
automation/
├── __init__.py           # Package Python modulaire
├── config.py             # Inventaire du parc (5 noeuds), IPs fixes et 40 criteres d'audit
├── connectors.py         # Abstraction des canaux de communication (TCP Socket Telnet & SSH/Plink)
├── backup_engine.py      # Moteur d'extraction, d'archivage horodate et de calcul de derive
├── audit_engine.py       # Moteur d'audit d'integrite, calcul de score et generation des rapports
├── netdevops.py          # Point d'entree en ligne de commande (CLI avec argparse)
├── wazuh/
│   └── local_rules.xml   # Regles SOC XML personnalisees (IDs 100101-100110) deployees sur Wazuh
├── backups/              # Repertoire de stockage des configurations archivees
│   ├── YYYY-MM-DD/       # Archives horodatees par equipement
│   └── *_latest.cfg      # Dernieres versions de reference
└── reports/              # Repertoire de publication des rapports d'audit
    ├── audit_report_*.json
    └── audit_report_*.md
```

---

## 3. Utilisation de la Ligne de Commande (CLI)

Depuis la racine du projet, executez la commande avec Python 3 (`py` sous Windows ou `python3` sous Linux) :

```bash
# Execution complete : Sauvegarde du parc + Audit de conformite (40 points)
py -m automation.netdevops --all

# Execution ciblee : Sauvegardes uniquement
py -m automation.netdevops --backup

# Execution ciblee : Audit et rapports uniquement
py -m automation.netdevops --audit
```

---

## 4. Exemple de Sortie Console et Score de Conformite

```text
================================================================================
  SUITE NETDEVOPS HOMELAB : AUTOMATISATION, SAUVEGARDES & AUDIT DE CONFORMITE
  Infrastructure Hybride : Proxmox VE 8 • EVE-NG • Cisco IOL • FortiGate 7.4
  Ingenieur Reseau & Securite : Ababacar Ousmane Niang (Master 2 RESI)
================================================================================

[+] Demarrage du Moteur de Sauvegarde Automatisee...
================================================================================
EQUIPEMENT       | STATUT     | LIGNES   | VARIATION / DRIFT             
================================================================================
R1_HQ            | SUCCESS    | 147      | Conforme
R_STANDBY_HQ     | SUCCESS    | 134      | Conforme
SW1_HQ           | SUCCESS    | 111      | Conforme
R2_BRANCH        | SUCCESS    | 3378     | Conforme
FORTIGATE_HQ     | SUCCESS    | 11143    | Conforme
================================================================================

[+] Demarrage du Moteur d'Audit et de Conformite...
================================================================================
RAPPORT GLOBAL : SCORE DE CONFORMITE = 100.0 % (40/40 tests valides)
================================================================================
EQUIPEMENT       | CONSTRUCTEUR   | SCORE    | CONTROLES    | STATUT    
--------------------------------------------------------------------------------
R1_HQ            | Cisco          | 100.0  % | 9/9          | CONFORME  
R_STANDBY_HQ     | Cisco          | 100.0  % | 5/5          | CONFORME  
SW1_HQ           | Cisco          | 100.0  % | 9/9          | CONFORME  
R2_BRANCH        | Cisco          | 100.0  % | 4/4          | CONFORME  
FORTIGATE_HQ     | Fortinet       | 100.0  % | 13/13        | CONFORME  
================================================================================
```

