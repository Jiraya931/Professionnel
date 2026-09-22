# Ingénierie Réseaux Cisco & Huawei Datacenter

> **Projets & Travaux d'Ingénierie Réseau — Master 1 & Master 2 RESI**  
> **Auteur** : Ababacar Ousmane Niang  
> **Certifications associées** : Cisco CCNA (ENSA, SRWE, ITN), préparation CCNP ENCOR et Huawei HCIP Datacenter (DCN)

---

## Périmètre Technique & Compétences

Ce dossier regroupe les topologies d'architecture, les maquettes de simulation et les configurations réseau destinées à des environnements d'entreprise à haute résilience :

- **Routage Dynamique & WAN** : OSPFv2/OSPFv3 multi-zones, BGP (eBGP/iBGP), MPLS LDP, VRF (Virtual Routing and Forwarding), redistribution et filtrage par Route-Maps.
- **Commutation Haute Disponibilité (L2/L3)** : Segmentation VLAN (802.1Q), Trunking, EtherChannel (LACP/PAgP), Spanning-Tree Protocol (RSTP / MSTP) et routage Inter-VLAN (SVI).
- **Redondance de Passerelle (FHRP)** : HSRP (Hot Standby Router Protocol) et VRRP (Virtual Router Redundancy Protocol) avec suivi d'interfaces (tracking).
- **Services IP & Qualité de Service** : DHCP Snooping, Dynamic ARP Inspection (DAI), NAT/PAT, QoS pour la Téléphonie sur IP (ToIP/VoIP avec marquage DSCP/CoS).

---

## Architecture de Référence (Core / Distribution / Access)

```mermaid
graph TD
    ISP((Opérateur WAN / Internet)) --- |Liaison WAN| R_EDGE[Routeur de Bordure / NAT & Firewall]
    
    subgraph "Cœur de Réseau & Distribution (Redondance L3)"
        R_EDGE --- SW_D1[Switch Distribution 01 - HSRP Actif]
        R_EDGE --- SW_D2[Switch Distribution 02 - HSRP Veille]
        SW_D1 <==>|LACP EtherChannel 2 Gbps| SW_D2
    end

    subgraph "Niveau Accès (L2) & Postes Utilisateurs"
        SW_D1 --- SW_ACC1[Switch Accès Bâtiment A]
        SW_D2 --- SW_ACC1
        SW_D1 --- SW_ACC2[Switch Accès Bâtiment B]
        SW_D2 --- SW_ACC2
        
        SW_ACC1 --- PC_ADMIN[VLAN 10: Administration]
        SW_ACC1 --- PC_USERS[VLAN 20: Collaborateurs]
        SW_ACC2 --- IP_PHONE[VLAN 30: Téléphonie IP / QoS]
        IP_PHONE --- PC_WORKSTATION[PC Collaborateur]
    end
```

---

## Contenu du Répertoire & Travaux Pratiques

### 1. Fichiers de Simulation Packet Tracer (`labs/`)
- [`Topologie_Routage_Entreprise_M1.pkt`](./labs/Topologie_Routage_Entreprise_M1.pkt) : Maquette multi-sites avec découpage VLSM et routage inter-sites OSPF.
- [`Partie_Routage.docx`](./labs/Partie_Routage.docx) : Document de spécifications et plan d'adressage détaillé.
- [`DHCP_Infrastructure_M2.pkt`](./labs/DHCP_Infrastructure_M2.pkt) : Infrastructure avec relais DHCP (`ip helper-address`), pools dédiés et exclusion de plages d'administration.
- [`ToIP_VoIP_QoS_M1.pkt`](./labs/ToIP_VoIP_QoS_M1.pkt) : Déploiement VoIP avec serveurs d'appels Cisco CME, routage de flux vocaux et priorisation QoS.

### 2. Configurations Matérielles (`configs/`)
- [`cisco-core-routing.cfg`](./configs/cisco-core-routing.cfg) : Script complet prêt pour injection console (commutateur de distribution L3, routeur de bordure et translation NAT/PAT).

---

## Matrice d'Adressage & Plan de VLANs

| VLAN ID | Nom du Réseau | Sous-réseau (CIDR) | Passerelle Virtuelle (HSRP/VRRP) | Rôle |
| :---: | :--- | :--- | :--- | :--- |
| **10** | `ADMINISTRATION_MGMT` | `192.168.10.0/24` | `192.168.10.1` | Postes d'administration, serveurs d'infrastructure, bastion SSH |
| **20** | `DATA_SERVICES` | `192.168.20.0/24` | `192.168.20.1` | Postes de travail des collaborateurs |
| **30** | `VOIP_TELEPHONIE` | `192.168.30.0/24` | `192.168.30.1` | Téléphonie IP Cisco, serveurs CallManager CME |
| **99** | `NATIVE_MGMT` | `192.168.99.0/24` | `192.168.99.1` | VLAN natif et interfaces d'administration des commutateurs |

---

## Commandes de Diagnostic & Vérification Cisco IOS

```bash
# Vérification du voisinage et des adjacences OSPF
SW-DISTRIB-01# show ip ospf neighbor

# Contrôle de la table de routage globale
SW-DISTRIB-01# show ip route

# État des liens agrégés EtherChannel
SW-DISTRIB-01# show etherchannel summary

# Contrôle de la redondance de passerelle HSRP
SW-DISTRIB-01# show standby brief

# Vérification des translations NAT dynamiques
R-EDGE-WAN-01# show ip nat translations
```
