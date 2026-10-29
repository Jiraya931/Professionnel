# Projet 06 — Homelab Proxmox VE 8, FortiGate 7.4 & Cisco IOL

[![Consulter le Rapport d'Audit PDF](https://img.shields.io/badge/Dossier_Technique-Rapport_d'Audit_PDF-2563eb?style=flat-square)](../docs/Rapport_Homelab_Proxmox_FortiGate.pdf)
[![Consulter le Portfolio](https://img.shields.io/badge/Demonstrateur-Portfolio_Interactif-00f0ff?style=flat-square)](https://jiraya931.github.io/Professionnel/)

---

## 1. Contexte et Objectifs de l'Infrastructure

Ce projet d'infrastructure concrétise la conception, le déploiement et l'exploitation d'un laboratoire d'émulation réseau et de sécurité périmétrique déployé sur matériel physique (Bare-Metal) sous Proxmox Virtual Environment 8.x.

L'objectif principal consiste à interconnecter un environnement d'émulation réseau haute fidélité (EVE-NG Community) propulsé par des commutateurs et routeurs virtuels Cisco IOL (IOS on Linux L2 & L3) avec un pare-feu de nouvelle génération (Fortinet FortiGate 7.4.13), assurant :
1. La segmentation étanche par VLANs 802.1Q et routage inter-VLANs (Router-on-a-stick).
2. L'inspection des flux sortants et le masquage d'adresses réseau (NAT dynamique WAN).
3. L'isolation d'une zone DMZ et la publication de services via Virtual IP (DNAT / Port Forwarding).
4. L'interconnexion sécurisée de sites distants par tunnel VPN IPsec Site-à-Site IKEv2 multi-constructeurs (Fortinet HQ vers Cisco Branch).
5. L'élévation de posture de sécurité NGFW (Palier 3) : inspection applicative L7 (Application Control), prévention d'intrusion sur mesure (Deep Packet Inspection / Custom IPS Sensor contre SQLi et Path Traversal) et atténuation d'attaques par déni de service (DoS Policy).
6. L'automatisation logicielle NetDevOps (Palier 4) : suite Python autonome pour la sauvegarde des configurations à chaud, la détection différentielle de dérive (*drift*) et l'audit continu d'intégrité opérationnelle.
7. La validation opérationnelle de la connectivité WAN de bout en bout avec métrologie et journalisation des flux en temps réel.

---

## 2. Topologie et Plan d'Adressage Réseau

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
           │ (172.16.1.1/30)         │
           └────────────┬────────────┘
                        │
           ┌────────────┴────────────┐
           │ Cisco R1 (IOL L3)       │  e0/1 : 172.16.1.2/30 (Interco)
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
| **FortiGate HQ** | FortiOS 7.4.13 | `port1` | WAN Uplink FAI (DHCP `192.168.1.4/24`) | `192.168.1.1` |
| **FortiGate HQ** | FortiOS 7.4.13 | `port2` | Interco LAN HQ (`172.16.1.1/30`) | - |
| **FortiGate HQ** | FortiOS 7.4.13 | `port3` | Zone DMZ Serveur Web (`172.16.50.254/24`) | - |
| **Cisco R1** | Cisco IOL L3 (15.7M) | `e0/1` | Uplink vers FortiGate (`172.16.1.2/30`) | `172.16.1.1` |
| **Cisco R1** | Cisco IOL L3 (15.7M) | `e0/0.10` | Passerelle de sous-réseau VLAN 10 (`10.10.10.1/24`) | - |
| **Cisco SW1** | Cisco IOL L2 (15.2d) | `e0/0` | Trunk dot1q vers R1 | - |
| **Cisco SW1** | Cisco IOL L2 (15.2d) | `e0/1` | Port d'accès VLAN 10 vers client | - |
| **VPCS Client (PC1)** | Virtual PC Simulator | `eth0` | Poste utilisateur VLAN 10 (`10.10.10.50/24`) | `10.10.10.1` |
| **SRV-WEB-DMZ** | Alpine Linux 3.20 | `eth0` | Serveur Web DMZ (`172.16.50.10/24`) | `172.16.50.254` |
| **Cisco R2-BRANCH** | Cisco IOL L3 (15.5) | `e0/0` & `e0/1` | WAN (`192.168.1.250/24`) & LAN (`192.168.20.1/24`) | `192.168.1.1` |
| **PC2-BRANCH** | Virtual PC Simulator | `eth0` | Poste Succursale (`192.168.20.50/24`) | `192.168.20.1` |

---

## 3. Guides Techniques Détaillés

Le projet est documenté par 11 guides pas-à-pas disponibles dans le dossier [`guides/`](./guides/) :

1. [**Guide 01 : Migration EVE-NG de VMware Workstation vers Proxmox VE**](./guides/01_MIGRATION_EVENG_PROXMOX.md)  
   Exportation des disques VMDK, transfert SSH/SCP, importation `qm disk import` sous Proxmox VE et activation du flag processeur `host` (Nested KVM).
2. [**Guide 02 : Déploiement et Enregistrement Fortinet FortiGate 7.4**](./guides/02_INSTALLATION_FORTIGATE_7.4.md)  
   Importation de l'image KVM QCOW2 (`fortios-7.4`), initialisation CLI, politique de mot de passe forte et activation de la licence d'évaluation permanente via FortiCloud.
3. [**Guide 03 : Activation et Intégration des Images Cisco IOL (L2 & L3)**](./guides/03_ACTIVATION_CISCO_IOL_L2_L3.md)  
   Mise en place des binaires Cisco IOL, génération et validation de la licence Cisco `iourc` sous licence Linux, correction des droits d'exécution `eveng_fixpermissions`.
4. [**Guide 04 : Le Grand TP d'Entreprise Réseau & Sécurité de A à Z**](./guides/04_TP_ENTREPRISE_DE_A_A_Z.md)  
   Configuration de la commutation Cisco L2 (Trunk 802.1Q), sous-interfaces de routage L3 Router-on-a-stick, routes statiques bidirectionnelles et politique de filtrage/NAT sur FortiOS.
5. [**Guide 05 : Supervision, Analyse des Logs & Commandes Utiles**](./guides/05_SUPERVISION_LOGS_ET_COMMANDES_UTILES.md)  
   Outils de métrologie, analyse de traces ICMP/TCP, consultation des tables de sessions NAT et inspection des journaux de trafic en mémoire vive sur le pare-feu.
6. [**Guide 06 : Palier 1 - Sécurité NGFW Avancée, Zone DMZ & Publication Externe VIP**](./guides/06_PALIER_1_DMZ_NGFW_ET_VIRTUAL_IP.md)  
   Création de la zone DMZ étanche sur `port3` (172.16.50.254/24), déploiement du serveur Web Linux QEMU durci, politiques inter-zones LAN vers DMZ et publication WAN par Virtual IP (VIP Port Forwarding 8080 vers 80).
7. [**Guide 07 : Palier 2 - VPN IPsec Site-à-Site IKEv2 Multi-Constructeurs (Fortinet & Cisco)**](./guides/07_PALIER_2_VPN_IPSEC_SITE_A_SITE_MULTI_CONSTRUCTEURS.md)  
   Interconnexion chiffrée entre Siège FortiGate et Succursale Cisco IOL L3, négociation IKEv2 / IPsec ESP, PFS DH14, gestion des contraintes cryptographiques d'évaluation, consolidation multi-interfaces pare-feu et routage inter-sites avec 100% de succès.
8. [**Guide 08 : Palier 3 - Cybersécurité NGFW Avancée, Inspection UTM & Prévention d'Intrusion (IPS)**](./guides/08_PALIER_3_CYBERSECURITE_NGFW_INSPECTION_UTM_ET_IPS.md)  
   Inspection DPI L7, compilation de signatures IPS F-SBID (blocage SQLi et Path Traversal), capteur IPS DMZ, filtrage applicatif (blocage P2P / Proxy) et atténuation d'attaques DoS/Flood sur l'interface WAN.
9. [**Guide 09 : Palier 4 - NetDevOps, Automatisation Reseau & Audit de Conformite (Python)**](./guides/09_PALIER_4_NETDEVOPS_AUTOMATISATION_ET_AUDIT_PYTHON.md)  
   Suite logicielle Python modulaire (`automation/`), extraction a chaud des running-configs (GitOps), detection differentielle de derive (*drift*), moteur d'audit de 22 points de controle et generation de rapports structures JSON/Markdown (score 100%).
10. [**Guide 10 : Palier 5 - Routage Dynamique OSPFv2 Multi-Constructeurs (Cisco & Fortinet)**](./guides/10_PALIER_5_ROUTAGE_DYNAMIQUE_OSPFV2_CISCO_FORTINET.md)  
    Mise en place d'un domaine OSPFv2 multi-constructeurs (Cisco IOL L3 R1 et FortiGate 7.4), elimination du routage statique, injection de route par defaut externe O*E2, annonce LAN LSA Type 1, securisation par passive-interface, contournement MTU IOL et audit automatise 25/25 points.
11. [**Guide 11 : Palier 6 - Cybersecurite Reseau L2 (Port-Security, DHCP Snooping & BPDU Guard)**](./guides/11_PALIER_6_SECURITE_L2_PORT_SECURITY_DHCP_SNOOPING_BPDUGUARD.md)  
    Durcissement avance du commutateur d'acces Cisco IOL L2 SW1 : controle d'acces physique par adresse MAC Sticky, observation des modes restrict et shutdown (err-disabled), filtrage anti-serveur DHCP pirate (DHCP Snooping, ports Trusted/Untrusted, Option 82), et protection STP contre les boucles et commutateurs clandestins (PortFast & BPDU Guard).

---

## 4. Résultats & Preuves de Validation Opérationnelle

### 1. Connectivité de bout en bout (Client VPCS vers Internet 8.8.8.8)
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

### 3. Palier 1 : Publication Web DMZ via Virtual IP (VIP Port Forwarding)
```text
Accès externe validé sur http://192.168.1.4:8080 (VIP 8080 -> 172.16.50.10:80)
Service HTTP actif sous Alpine Linux 3.20
Trafic inspecté et consigné dans les logs FortiGate
```

### 4. Palier 2 : VPN IPsec IKEv2 Multi-Constructeurs (Fortinet HQ <-> Cisco R2 Branch)
```text
Cisco R2-BRANCH# show crypto ikev2 sa
Tunnel-id Local                 Remote                Status 
1         192.168.1.250/500     192.168.1.4/500       READY  
      Encr: DES, PRF: SHA256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK

FortiGate # diagnose vpn tunnel list
name=VPN_BRANCH ver=2 serial=1 192.168.1.4:0->192.168.1.250:0 status=up

VPCS PC2-BRANCH> ping 172.16.50.10 (DMZ) -> 5/5 packets received (2.2 ms)
VPCS PC2-BRANCH> ping 10.10.10.50 (Campus LAN) -> 5/5 packets received (2.8 ms)
```

### 5. Palier 3 : Cybersécurité NGFW Avancée (Inspection UTM & Filtrage Applicatif)
```text
Requête normale VIP (HTTP 200 OK) : curl http://192.168.1.4:8080/ -> Succès nominal
Attaque SQLi interceptée (DPI) : curl "...?id=1%20UNION%20SELECT%20null" -> Dropped (0 bytes received)
Attaque Path Traversal bloquée : curl "...?file=/etc/passwd" -> Dropped (0 bytes received)
Attaque ICMP Flood atténuée : 80 paquets émis -> coupure stricte au seuil 50 pps (37.5% packet loss)
Journaux d'audit IPS (attackid 3900 & 2906) et DoS Anomaly (attackid 16777316) générés avec sévérité critique
```

### 6. Palier 4 : NetDevOps & Audit de Conformité Continue (Python)
```text
Suite logicielle : python -m automation.netdevops --all
Sauvegarde à chaud : R1_HQ (125 lignes), SW1_HQ (85 lignes), R2_BRANCH (2740 lignes), FORTIGATE_HQ (11126 lignes)
Audit opérationnel : 22/22 points de contrôle validés (Score de conformité : 100.0 %)
Rapports structurés : automation/reports/audit_report_latest.json et audit_report_latest.md
```

---

## 5. Dossier Technique & Rapport d'Audit Complet

L'ensemble des captures d'écran certifiées, configurations d'ingénierie et traces de diagnostic est compilé dans le document d'audit officiel :
- **[Rapport d'Audit Technique Homelab (Format PDF)](../docs/Rapport_Homelab_Proxmox_FortiGate.pdf)**
