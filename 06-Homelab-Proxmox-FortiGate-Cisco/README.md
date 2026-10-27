# Projet 06 — Homelab Proxmox VE 8, FortiGate 7.4 & Cisco IOL

<div align="center">

![Proxmox VE](https://img.shields.io/badge/Hyperviseur-Proxmox_VE_8.x-E57000?style=for-the-badge&logo=proxmox&logoColor=white)
![Fortinet](https://img.shields.io/badge/NGFW-FortiGate_7.4.13-EE3124?style=for-the-badge&logo=fortinet&logoColor=white)
![Cisco](https://img.shields.io/badge/Commutation_&_Routage-Cisco_IOL_L2/L3-1BA0D7?style=for-the-badge&logo=cisco&logoColor=white)
![EVE-NG](https://img.shields.io/badge/Emulation-EVE--NG_Community-00599C?style=for-the-badge)
![Nested KVM](https://img.shields.io/badge/Virtualisation-Nested_KVM_Active-10b981?style=for-the-badge)

<br/>

[![Consulter le Rapport d'Audit PDF](https://img.shields.io/badge/Dossier_Technique-Rapport_d'Audit_PDF_(1.45_Mo)-2563eb?style=flat-square)](../docs/Rapport_Homelab_Proxmox_FortiGate.pdf)
[![Consulter le Portfolio](https://img.shields.io/badge/Démonstrateur-Portfolio_Interactif-00f0ff?style=flat-square)](https://jiraya931.github.io/Professionnel/)

</div>

---

## 🎯 Contexte & Objectifs de l'Infrastructure

Ce projet d'infrastructure concrétise la conception, le déploiement et l'exploitation d'un **datacenter virtuel d'émulation réseau et de cybersécurité périmétrique** déployé sur matériel physique (*Bare-Metal*) sous **Proxmox Virtual Environment 8.x**.

L'objectif principal consiste à interconnecter un environnement d'émulation réseau haute fidélité (**EVE-NG Community**) propulsé par des commutateurs et routeurs virtuels **Cisco IOL (IOS on Linux L2 & L3)** avec un pare-feu de nouvelle génération (**Fortinet FortiGate 7.4.13**), assurant :
1. La segmentation étanche par VLANs 802.1Q et routage inter-VLANs (*Router-on-a-stick*).
2. L'inspection des flux sortants et le masquage d'adresses réseau (*NAT dynamique WAN*).
3. La validation opérationnelle de la connectivité WAN de bout en bout avec métrologie et journalisation des flux en temps réel.

---

## 📐 Topologie & Plan d'Adressage Réseau

```text
       [ BOX INTERNET / WAN FAI ]
                    │  (DHCP: 192.168.1.0/24)
  ┌─────────────────┴───────────────────────────────┐
  │  PROXMOX VE 8.x (Hôte Bare-Metal : 192.168.1.200)│
  │  Pont Linux vmbr0 (Intel VMX Nested KVM activé) │
  └────────┬─────────────────────────┬──────────────┘
           │                         │
  ┌────────┴────────┐       ┌────────┴────────┐
  │ VM 100          │       │ VM 200          │
  │ FortiGate 7.4   │       │ EVE-NG Lab      │
  │ (port1: WAN)    │       │ (IP: 192.168.1.3│
  └────────┬────────┘       └────────┬────────┘
           │ (192.168.10.254/24)     │
           └────────────┬────────────┘
                        │
           ┌────────────┴────────────┐
           │ Cisco R1 (IOL L3)       │  e0/1 : 192.168.10.1/24
           │ Router-on-a-stick       │  e0/0.10 : 10.10.10.1/24 (Gateway VLAN 10)
           └────────────┬────────────┘
                        │  Trunk 802.1Q (VLAN 1, 10)
           ┌────────────┴────────────┐
           │ Cisco SW1 (IOL L2)      │  e0/0 : Trunk
           │ Commutateur d'accès     │  e0/1 : Access VLAN 10
           └────────────┬────────────┘
                        │
           ┌────────────┴────────────┐
           │ Client VPCS             │  IP : 10.10.10.50/24
           │ Poste utilisateur       │  Gateway : 10.10.10.1
           └─────────────────────────┘
```

### Table de Correspondance des Équipements

| Nœud | Modèle / Image | Interface | Rôle & Adressage | Passerelle |
| :--- | :--- | :--- | :--- | :--- |
| **Proxmox VE** | PVE 8.x Bare-Metal | `vmbr0` | Hyperviseur hôte (`192.168.1.200/24`) | `192.168.1.1` |
| **EVE-NG** | Community 5.0.1 | `pnet0` | Plateforme d'émulation réseau (`192.168.1.3/24`) | `192.168.1.1` |
| **FortiGate** | FortiOS 7.4.13 | `port1` | WAN Uplink FAI (DHCP `192.168.1.4/24`) | `192.168.1.1` |
| **FortiGate** | FortiOS 7.4.13 | `port2` | LAN Interconnexion Cisco (`192.168.10.254/24`) | - |
| **Cisco R1** | Cisco IOL L3 (15.7M) | `e0/1` | Uplink vers FortiGate (`192.168.10.1/24`) | `192.168.10.254` |
| **Cisco R1** | Cisco IOL L3 (15.7M) | `e0/0.10` | Passerelle de sous-réseau VLAN 10 (`10.10.10.1/24`) | - |
| **Cisco SW1** | Cisco IOL L2 (15.2d) | `e0/0` | Trunk dot1q vers R1 | - |
| **Cisco SW1** | Cisco IOL L2 (15.2d) | `e0/1` | Port d'accès VLAN 10 vers client | - |
| **VPCS Client** | Virtual PC Simulator | `eth0` | Poste utilisateur VLAN 10 (`10.10.10.50/24`) | `10.10.10.1` |

---

## 🛠️ Guides Techniques Détaillés

Le projet est documenté par 5 guides pas-à-pas disponibles dans le dossier [`guides/`](./guides/) :

1. [**Guide 01 : Migration EVE-NG de VMware Workstation vers Proxmox VE**](./guides/01_MIGRATION_EVENG_PROXMOX.md)  
   Exportation des disques VMDK, transfert SSH/SCP, importation `qm disk import` sous Proxmox VE et activation du flag processeur `host` (*Nested KVM*).
2. [**Guide 02 : Déploiement et Enregistrement Fortinet FortiGate 7.4**](./guides/02_INSTALLATION_FORTIGATE_7.4.md)  
   Importation de l'image KVM QCOW2 (`fortios-7.4`), initialisation CLI, politique de mot de passe forte et activation de la licence d'évaluation permanente via FortiCloud.
3. [**Guide 03 : Activation et Intégration des Images Cisco IOL (L2 & L3)**](./guides/03_ACTIVATION_CISCO_IOL_L2_L3.md)  
   Mise en place des binaires Cisco IOL, génération et validation de la licence Cisco `iourc` sous licence Linux, correction des droits d'exécution `eveng_fixpermissions`.
4. [**Guide 04 : Le Grand TP d'Entreprise Réseau & Sécurité de A à Z**](./guides/04_TP_ENTREPRISE_DE_A_A_Z.md)  
   Configuration de la commutation Cisco L2 (Trunk 802.1Q), sous-interfaces de routage L3 *Router-on-a-stick*, routes statiques bidirectionnelles et politique de filtrage/NAT sur FortiOS.
5. [**Guide 05 : Supervision, Analyse des Logs & Commandes Utiles**](./guides/05_SUPERVISION_LOGS_ET_COMMANDES_UTILES.md)  
   Outils de métrologie, analyse de traces ICMP/TCP, consultation des tables de sessions NAT et inspection des journaux de trafic en mémoire vive sur le pare-feu.

---

## 🔬 Résultats & Preuves de Validation Opérationnelle

### 1. Connectivité de bout en bout (Client VPCS ➔ Internet 8.8.8.8)
```text
VPCS> ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
84 bytes from 8.8.8.8 icmp_seq=2 ttl=115 time=64.218 ms
84 bytes from 8.8.8.8 icmp_seq=3 ttl=115 time=62.845 ms
84 bytes from 8.8.8.8 icmp_seq=4 ttl=115 time=61.802 ms
84 bytes from 8.8.8.8 icmp_seq=5 ttl=115 time=63.114 ms

Résultats des tests de performance :
- Latence interne LAN (Client vers R1) : < 1 ms
- Latence interconnexion (R1 vers FortiGate) : < 1 ms
- RTT moyen vers WAN (Google DNS 8.8.8.8) : 62.9 ms
- Taux de livraison des paquets : 100% de réussite
```

### 2. Inspection des flux et NAT sur FortiGate
```text
FortiGate-VM64-KVM # diagnose sys session filter proto 1
FortiGate-VM64-KVM # diagnose sys session list

session info: id=14 proto=1 type=00000000 flags=00000000 duration=2 expire=58
org: 10.10.10.50:1 -> 8.8.8.8:1
reply: 8.8.8.8:1 -> 192.168.1.4:1 [NAT dynamique port1]
state: dirty may_dirty
statistic(bytes/packets): org: 420/5 reply: 420/5
```

---

## 📁 Configurations Sources Disponibles

Les scripts d'injection CLI complets sont mis à disposition dans le répertoire [`configs/`](./configs/) :
* [`cisco-sw1-iol-l2.cfg`](./configs/cisco-sw1-iol-l2.cfg) : Commutateur Cisco IOL L2.
* [`cisco-r1-iol-l3.cfg`](./configs/cisco-r1-iol-l3.cfg) : Routeur Cisco IOL L3.
* [`fortigate-7.4-firewall.cfg`](./configs/fortigate-7.4-firewall.cfg) : Pare-feu Fortinet FortiGate 7.4.13.

Consultez également le [**Rapport d'Audit Technique Complet (1.45 Mo)**](../docs/Rapport_Homelab_Proxmox_FortiGate.pdf) pour la version imprimable avec toutes les captures d'écran certifiées.
