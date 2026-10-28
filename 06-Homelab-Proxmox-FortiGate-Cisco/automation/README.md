# SUITE NETDEVOPS : AUTOMATISATION, SAUVEGARDE & AUDIT DE CONFORMITE

Ce module regroupe l'outillage logiciel de gestion automatisée, de sauvegarde à chaud et d'audit de conformité de l'infrastructure réseau hybride Proxmox VE 8, EVE-NG, Cisco IOL et Fortinet FortiGate 7.4.13.

---

## 1. Objectifs d'Ingénierie NetDevOps

1. **Sauvegarde Automatisée à Chaud (Backup Engine) :**
   - Extraction programmée des configurations actives (`running-config` Cisco IOS et `show` FortiOS) sans saisie interactive.
   - Archivage horodaté avec structure arborescente par date et gestion d'une référence `_latest.cfg`.
   - Détection de dérive de configuration (*Configuration Drift*) par calcul différentiel unifié (`difflib`).

2. **Audit de Santé et Contrôle de Conformité (Audit Engine) :**
   - Interrogation automatique de 22 points de contrôle sur les commutateurs, routeurs et pare-feu.
   - Validation de l'état opérationnel des interfaces critiques (UP/UP).
   - Contrôle d'intégrité de la table de routage (présence de la passerelle par défaut et des sous-réseaux Campus/DMZ).
   - Vérification de la posture de sécurité FortiOS : politiques actives, VIP, capteurs IPS (DPI) et protection anti-DDoS.
   - Génération simultanée d'un rapport structuré exploitable par machine (`JSON`) et d'un rapport exécutif synthétique (`Markdown`).

---

## 2. Architecture Logicielle du Module

```text
automation/
├── __init__.py           # Package Python modulaire
├── config.py             # Inventaire du parc, passerelles et critères de conformité attendus
├── connectors.py         # Abstraction des canaux de communication (TCP Socket Telnet & SSH/Plink)
├── backup_engine.py      # Moteur d'extraction, d'archivage horodaté et de calcul de dérive
├── audit_engine.py       # Moteur d'audit d'intégrité, calcul de score et génération des rapports
├── netdevops.py          # Point d'entrée en ligne de commande (CLI avec argparse)
├── backups/              # Répertoire de stockage des configurations archivées
│   ├── YYYY-MM-DD/       # Archives horodatées par équipement
│   └── *_latest.cfg      # Dernières versions de référence
└── reports/              # Répertoire de publication des rapports d'audit
    ├── audit_report_*.json
    └── audit_report_*.md
```

---

## 3. Utilisation de la Ligne de Commande (CLI)

Depuis la racine du projet, exécutez la commande avec Python 3 :

```bash
# Exécution complète : Sauvegarde du parc + Audit de conformité
python -m automation.netdevops --all

# Exécution ciblée : Sauvegardes uniquement
python -m automation.netdevops --backup

# Exécution ciblée : Audit et rapports uniquement
python -m automation.netdevops --audit
```

---

## 4. Exemple de Sortie Console et Score de Conformité

```text
================================================================================
  SUITE NETDEVOPS HOMELAB : AUTOMATISATION, SAUVEGARDES & AUDIT DE CONFORMITE
  Infrastructure Hybride : Proxmox VE 8 • EVE-NG • Cisco IOL • FortiGate 7.4
  Ingénieur Réseau & Sécurité : Ababacar Ousmane Niang (Master 2 RESI)
================================================================================

[+] Demarrage du Moteur de Sauvegarde Automatisée...
================================================================================
EQUIPEMENT       | STATUT     | LIGNES   | VARIATION / DRIFT             
================================================================================
R1_HQ            | SUCCESS    | 125      | Conforme
SW1_HQ           | SUCCESS    | 85       | Conforme
R2_BRANCH        | SUCCESS    | 2740     | Conforme
FORTIGATE_HQ     | SUCCESS    | 11126    | Conforme
================================================================================

[+] Demarrage du Moteur d'Audit et de Conformite...
================================================================================
RAPPORT GLOBAL : SCORE DE CONFORMITE = 100.0 % (22/22 tests valides)
================================================================================
EQUIPEMENT       | CONSTRUCTEUR   | SCORE    | CONTROLES    | STATUT    
--------------------------------------------------------------------------------
R1_HQ            | Cisco          | 100.0  % | 5/5          | CONFORME  
SW1_HQ           | Cisco          | 100.0  % | 4/4          | CONFORME  
R2_BRANCH        | Cisco          | 100.0  % | 3/3          | CONFORME  
FORTIGATE_HQ     | Fortinet       | 100.0  % | 10/10        | CONFORME  
================================================================================
```
