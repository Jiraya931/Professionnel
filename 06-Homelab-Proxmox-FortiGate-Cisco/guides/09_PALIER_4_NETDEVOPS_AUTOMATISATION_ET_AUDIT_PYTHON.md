# GUIDE 09 : PALIER 4 - NETDEVOPS, AUTOMATISATION RESEAU ET AUDIT DE CONFORMITE (PYTHON)

Ce guide documente l'implementation complete du Palier 4 d'Ingenierie Reseau et Securite : la conception et le deploiement d'une suite logicielle NetDevOps en Python pour l'automatisation des sauvegardes de configurations et l'audit de conformite continue sur un parc hybride Cisco IOS et Fortinet FortiGate 7.4.13.

---

## 1. Contexte et Enjeux Industriels du NetDevOps

Dans une infrastructure d'entreprise moderne, l'administration artisanale via console interactive (CLI manuelle) presente plusieurs limites critiques :
1. **Risque d'erreur humaine :** Oubli d'enregistrement (`write memory`), mauvaise attribution de VLAN ou suppression accidentelle d'une route.
2. **Derive de configuration (*Configuration Drift*) :** Divergence non documentee entre l'etat voulu du reseau et son etat reel en production.
3. **Absence de tracabilite :** Impossibilite de savoir quand et par qui une regle de pare-feu ou une interface a ete modifiee.
4. **Temps de reprise sur sinistre (*Disaster Recovery*) :** En cas de defaillance d'un equipement, la restauration necessite de disposer de copies exactes, horodatees et exploitables sans delai.

Le **Palier 4** repond a ces defis en introduisant l'approche **Infrastructure as Code (IaC)** et l'automatisation logicielle appliquee aux equipements du Homelab.

---

## 2. Architecture de la Solution NetDevOps

```text
+-----------------------------------------------------------------------------------------+
|                               POSTE D'ADMINISTRATION / INGENIEUR                        |
|                               Suite Logicielle Python 3.14                              |
|                                                                                         |
|  - CLI d'Orchestration       : netdevops.py (--backup, --audit, --all)                  |
|  - Moteur de Sauvegarde      : backup_engine.py (Archivage date & calcul difflib)        |
|  - Moteur d'Audit            : audit_engine.py (22 points de controle operationnels)   |
|  - Connecteurs Reseau        : connectors.py (CiscoTelnetClient & FortiSSHClient)       |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             | Flux de Gestion Automatisee
                                             v
+-----------------------------------------------------------------------------------------+
|                               PASSERELLE DE LAB / EVE-NG (192.168.1.3)                 |
+---------------------+----------------------+---------------------+----------------------+
                      |                      |                     |                      |
                      | Port 32770           | Port 32771          | Port 32774           | SSH port 22
+---------------------v---+  +---------------v---+  +--------------v---+  +---------------v------+
|       SW1_HQ (L2)       |  |    R1_HQ (L3)     |  |   R2_BRANCH      |  |     FORTIGATE_HQ     |
|   Commutateur Campus    |  |  Routeur Campus   |  | Routeur Succursale|  |   NGFW FortiOS 7.4   |
| - VLANs 1 & 10          |  | - e0/1 & e0/0.10  |  | - WAN & LAN      |  | - VIP, UTM, DoS      |
| - Sauvegarde .cfg       |  | - Route 0.0.0.0/0 |  | - Route WAN      |  | - Sauvegarde .cfg    |
+-------------------------+  +-------------------+  +------------------+  +----------------------+
```

---

## 3. Conception des Modules Logiciels

### 3.1. Gestionnaire d'Inventaire et de Criteres (`config.py`)
Ce fichier centralise la topologie logique du reseau, les adresses des passerelles et les parametres attendus pour l'audit :
- Interfaces critiques devant etre a l'etat `UP/UP`.
- Routes obligatoires dans la table de routage (RIB).
- Politiques de securite pare-feu, Virtual IPs (VIP) et profils d'inspection UTM (IPS / Application Control).

### 3.2. Abstraction des Canaux de Communication (`connectors.py`)
Le module utilise une approche multi-protocoles sans dependance externe lourde :
- **`CiscoTelnetClient` :** Communication via socket TCP natif vers les consoles IOL. Le client envoie les sequences d'initialisation (`terminal length 0`), purge les tampons memoire et nettoie les caracteres d'echappement proprietaires IOL via des expressions regulieres.
- **`FortiSSHClient` :** Execution par flux batch SSH securise via PuTTY Plink vers la passerelle, puis rebond authentifie vers FortiGate (`192.168.1.4`). Les sorties de commandes FortiOS sont nettoyees et normalisees.

### 3.3. Moteur de Sauvegarde Horodatee et Calcul de Derive (`backup_engine.py`)
- Extrait a chaud la totalite des configurations actives : `show running-config` pour Cisco et `show` pour FortiOS (plus de 11 000 lignes de configuration pare-feu).
- Stocke les fichiers dans une arborescence horodatee : `backups/YYYY-MM-DD/<EQUIPEMENT>_<TIMESTAMP>.cfg`.
- Maintient une version de reference `*_latest.cfg` a la racine du dossier de sauvegarde.
- Compare automatiquement la version extraite avec la reference precedente a l'aide de la bibliotheque standard `difflib` pour mesurer le niveau de derive (*Drift Detection*).

### 3.4. Moteur d'Audit de Sante et de Conformite Continue (`audit_engine.py`)
Execute 22 tests operationnels en temps reel sur l'infrastructure :
1. **Etat des Interfaces Reseau :** Verification que toutes les liaisons critiques (`Ethernet0/1`, `Ethernet0/0.10`, `port1`, `port2`, `port3`) sont operationnelles.
2. **Integrite du Routage :** Presence de la passerelle par defaut vers FortiGate (`0.0.0.0/0 via 172.16.1.1`) et des routes d'interconnexion.
3. **Provisioning des VLANs :** Validation de l'existence des VLANs Campus sur les commutateurs L2.
4. **Posture de Securite FortiGate :**
   - Etat de la Virtual IP `VIP_WEB_DMZ` (publication port 8080 vers 80).
   - Etat des regles de filtrage `LAN_TO_INTERNET`, `CORP_INTERNAL_INTERZONE` et `WAN_TO_DMZ_VIP`.
   - Etat du capteur d'inspection profonde `IPS_SENSOR_DMZ`.
   - Etat du profil de filtrage applicatif `APP_CTRL_ENTERPRISE`.
   - Activation de la politique de protection anti-DDoS sur l'interface WAN.

---

## 4. Resultats Operationnels et Preuves d'Execution

L'execution de la commande `python -m automation.netdevops --all` a produit les resultats suivants :

### 4.1. Sauvegarde a Chaud du Parc Reseau
```text
================================================================================
EQUIPEMENT       | STATUT     | LIGNES   | VARIATION / DRIFT             
================================================================================
R1_HQ            | SUCCESS    | 125      | Conforme
SW1_HQ           | SUCCESS    | 85       | Conforme
R2_BRANCH        | SUCCESS    | 2740     | Conforme
FORTIGATE_HQ     | SUCCESS    | 11126    | Conforme
================================================================================
```
*L'integralite des 4 equipements a ete sauvegardee en moins de 15 secondes sans interruption de service.*

### 4.2. Audit de Conformite Globale (22/22 Tests Valides)
```text
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

---

## 5. Formats des Rapports Generes

Le moteur d'audit publie automatiquement deux formats de restitution :

1. **Rapport Executif Markdown (`reports/audit_report_latest.md`) :**
   - Vue synthetique avec tableaux de score par equipement.
   - Detail exhaustif des 22 points de controle et de leur statut technique.

2. **Rapport Machine JSON (`reports/audit_report_latest.json`) :**
   - Format structure standardisable pour integration dans une chaine CI/CD (GitHub Actions / GitLab CI) ou un tableau de bord de supervision.

Extrait de structure JSON generee :
```json
{
  "audit_timestamp": "20261028_192730",
  "audit_date": "28/10/2026 19:27:30",
  "auditor": "Ababacar Ousmane Niang - Master 2 RESI",
  "global_score": 100.0,
  "total_passed": 22,
  "total_checks": 22,
  "devices": [
    {
      "device": "R1_HQ",
      "vendor": "cisco",
      "score": 100.0,
      "checks": [
        { "test": "Interface Ethernet0/1 active (UP/UP)", "passed": true },
        { "test": "Presence route 0.0.0.0/0", "passed": true }
      ]
    }
  ]
}
```

---

## 6. Memento des Commandes de la Suite NetDevOps

| Commande CLI | Action Realisee |
| :--- | :--- |
| `python -m automation.netdevops --all` | Sauvegarde complete du parc et audit exhaustif avec rapports |
| `python -m automation.netdevops --backup` | Extraction et archivage horodate des configurations |
| `python -m automation.netdevops --audit` | Verification des 22 points de controle sans re-sauvegarde |
| `python -m automation.netdevops -h` | Afficher l'aide en ligne et les options disponibles |
