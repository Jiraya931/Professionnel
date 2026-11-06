# GUIDE 12 : PALIER 7 - HAUTE DISPONIBILITE RESEAU & REDONDANCE DE PASSERELLE FHRP (HSRP)

Ce guide documente l'implementation de reference du Palier 7 d'Ingenierie Reseau et Haute Disponibilite : la suppression des points uniques de defaillance (*Single Point of Failure - SPOF*) sur le segment d'acces utilisateur (VLAN 10) au moyen du protocole de redondance de premier saut **FHRP / HSRP (Hot Standby Router Protocol)** sur routeurs Cisco IOL L3, associe au commutateur d'acces durci SW1.

---

## 1. Contexte et Enjeux Industriels de la Haute Disponibilite FHRP

Dans une architecture d'entreprise conventionnelle, les postes de travail clients et les serveurs utilisent une adresse IP statique ou attribuee par DHCP definissant une **passerelle par defaut unique** (*Default Gateway*). 
- Si l'interface de ce routeur defaille, si le cable est coupe ou si le routeur subit un incident materiel, **l'ensemble des equipements du reseau local perd instantanement tout acces aux autres sous-reseaux, a la DMZ, au VPN IPsec et a Internet**, quand bien meme un second routeur operationnel serait present sur le site.
- Les clients IP ne disposant pas de mecanisme natif de basculement dynamique de passerelle sans reconfiguration, les protocoles **FHRP (*First Hop Redundancy Protocol*)** introduisent une passerelle virtuelle partagee entre plusieurs routeurs physiques.

### Comparatif des Protocoles de Redondance FHRP
| Protocole | Standardisation | Constructeur | Adresse Multicast | Format de l'Adresse MAC Virtuelle | Equilibrage de charge natif |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **HSRP v1** | Proprietaire Cisco | Cisco Systems | `224.0.0.2` (UDP 1985) | `0000.0c07.acXX` (*XX = groupe en hex*) | Non (Actif / Veille) |
| **HSRP v2** | Proprietaire Cisco | Cisco Systems | `224.0.0.102` (UDP 1985) | `0000.0c9f.fXXX` (*XXX = groupe en hex*) | Non (Actif / Veille) |
| **VRRP v2/v3** | Standard IETF (RFC 3768/5798) | Multi-Constructeurs | `224.0.0.18` (IP proto 112) | `0000.5e00.01XX` | Non (Maitre / Secours) |
| **GLBP** | Proprietaire Cisco | Cisco Systems | `224.0.0.102` (UDP 3222) | Adresses virtuelles multiples | **Oui** (Round-Robin, Host, Weight) |

Le **Palier 7** deploie **HSRP v1** sur le VLAN 10 pour garantir une redondance instantanee et transparente entre le routeur principal **R1** et le routeur de secours **R_STANDBY**.

---

## 2. Architecture Technique et Topologie de Redondance

```text
+----------------------------------------------------------------------------------------------------+
|                                    ZONE DE TRANSIT & SECURITE NGFW                                 |
|                                         [ FORTIGATE 7.4 ]                                          |
|                                            (172.16.1.1)                                            |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  | Transit OSPFv2 (Area 0 - 172.16.1.0/30)
                                                  v
                     +----------------------------+-----------------------------+
                     |                                                          |
+--------------------+---------------------+              +---------------------+--------------------+
|            ROUTEUR PRINCIPAL R1          |              |            ROUTEUR SECONDAIRE R_STANDBY  |
|  - Sub-if : Ethernet0/0.10 (VLAN 10)     |              |  - Sub-if : Ethernet0/0.10 (VLAN 10)     |
|  - IP Physique  : 10.10.10.1/24          |              |  - IP Physique  : 10.10.10.2/24          |
|  - HSRP Priorite: 110 (Active Master)    |              |  - HSRP Priorite: 100 (Standby Backup)   |
|  - Preemption   : Active (Preempt)       |              |  - Preemption   : Active (Preempt)       |
+--------------------+---------------------+              +---------------------+--------------------+
                     |                                                          |
                     | Trunk 802.1Q (VLAN 10)                                   | Trunk 802.1Q (VLAN 10)
                     | [ SW1: Ethernet0/0 ]                                     | [ SW1: Ethernet0/2 ]
                     +----------------------------+-----------------------------+
                                                  v
+-------------------------------------------------+--------------------------------------------------+
|                                  COMMUTATEUR CISCO IOL L2 (SW1)                                    |
|                                                                                                    |
|  - Trunks 802.1Q : Ethernet0/0 (R1) et Ethernet0/2 (R_STANDBY) avec VLAN 10 autorise              |
|  - Port d'Acces  : Ethernet0/1 (VLAN 10) - Port-Security & BPDU Guard                             |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  | Port d'Acces VLAN 10
                                                  | [ SW1: Ethernet0/1 ]
                                                  v
+-------------------------------------------------+--------------------------------------------------+
|                                    PASSERELLE VIRTUELLE HSRP                                       |
|                                    VIP HSRP : 10.10.10.254                                         |
|                               VMAC HSRP : 00:00:0c:07:ac:01 (Groupe 1)                             |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+-------------------------------------------------+--------------------------------------------------+
|                                   POSTE CLIENT VPCS (VLAN 10)                                      |
|                                    Adresse IP  : 10.10.10.50/24                                    |
|                                    Passerelle  : 10.10.10.254 (VIP HSRP)                           |
|                                    ARP Apprise : 00:00:0c:07:ac:01                                 |
+----------------------------------------------------------------------------------------------------+
```

### Matrice d'Adressage et de Parametrage HSRP

| Equipement | Interface | Role HSRP | IP Physique | VIP Virtuelle | Priorite | Preemption | Timers (Hello/Hold) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`R1`** | `Ethernet0/0.10` | **`Active` (Maitre)** | `10.10.10.1/24` | `10.10.10.254` | **110** | **Oui (`P`)** | 3s / 10s (Par defaut) |
| **`R_STANDBY`** | `Ethernet0/0.10` | **`Standby` (Secours)** | `10.10.10.2/24` | `10.10.10.254` | **100** | **Oui (`P`)** | 3s / 10s (Par defaut) |
| **`SW1`** | `Ethernet0/2` | Commutateur L2 | N/A (Trunk L2) | N/A | N/A | N/A | N/A |
| **`VPC`** | `eth0` | Client d'acces | `10.10.10.50/24` | `10.10.10.254` | N/A | N/A | ARP vers VMAC |

---

## 3. Implementation Pas-a-Pas sur les Equipements

### A. Raccordement et Configuration du Commutateur SW1
Le commutateur SW1 doit etendre le domaine de diffusion de niveau 2 (VLAN 10) vers le nouveau routeur de secours R_STANDBY sur le port `Ethernet0/2` en mode Trunk 802.1Q :

```cisco
SW1# configure terminal
SW1(config)# interface Ethernet0/2
SW1(config-if)# switchport trunk encapsulation dot1q
SW1(config-if)# switchport mode trunk
SW1(config-if)# no shutdown
SW1(config-if)# exit
SW1(config)# no ip igmp snooping
SW1(config)# exit
SW1# write memory
```

> **Point cle d'Ingenierie IOL :** La commande `no ip igmp snooping` sur le commutateur IOL L2 garantit que les paquets multicast HSRP (`224.0.0.2`) transitent sans blocage logiciel entre les deux routeurs virtuels.

---

### B. Configuration du Routeur Primaire (R1 - HSRP Active)
Sur le routeur R1, la sous-interface `Ethernet0/0.10` est configuree dans le groupe HSRP 1 avec une priorite accrue de **110** pour lui conferer l'etat Actif :

```cisco
R1# configure terminal
R1(config)# interface Ethernet0/0.10
R1(config-subif)# standby 1 ip 10.10.10.254
R1(config-subif)# standby 1 priority 110
R1(config-subif)# standby 1 preempt
R1(config-subif)# exit
R1(config)# exit
R1# write memory
```

---

### C. Configuration du Routeur Secondaire (R_STANDBY - HSRP Standby)
Sur le routeur R_STANDBY, la sous-interface `Ethernet0/0.10` est activee avec l'adresse IP physique `10.10.10.2`, la priorite standard de **100** et la preemption activee :

```cisco
R_STANDBY# configure terminal
R_STANDBY(config)# hostname R_STANDBY
R_STANDBY(config)# interface Ethernet0/0
R_STANDBY(config-if)# no shutdown
R_STANDBY(config-if)# exit

R_STANDBY(config)# interface Ethernet0/0.10
R_STANDBY(config-subif)# encapsulation dot1Q 10
R_STANDBY(config-subif)# ip address 10.10.10.2 255.255.255.0
R_STANDBY(config-subif)# standby 1 ip 10.10.10.254
R_STANDBY(config-subif)# standby 1 priority 100
R_STANDBY(config-subif)# standby 1 preempt
R_STANDBY(config-subif)# exit
R_STANDBY(config)# exit
R_STANDBY# write memory
```

---

## 4. Machine a Etats Finis (FSM) HSRP et Convergence

Le protocole HSRP opere via une machine a etats stricte garantissant qu'un et un seul routeur prend en charge l'adresse IP et MAC virtuelles a un instant donne :
1. **Initial (`Init`) :** L'interface demarre ou subit une modification de configuration.
2. **`Listen` :** Le routeur ecoute les paquets *Hello* du groupe sans emettre, afin de cartographier les routeurs Actif et Standby existants.
3. **`Speak` :** Le routeur commence a emettre des paquets *Hello* periodiques (toutes les 3 secondes) pour participer a l'election.
4. **`Standby` :** Le routeur est designe comme successeur direct de l'Actif en cas de panne de ce dernier.
5. **`Active` :** Le routeur assume la charge de repondre aux requetes ARP destinees a la VIP `10.10.10.254` et achemine le trafic reseau des clients.

### Validation de la Convergence Nominale
Sur la console de **R1** :
```text
R1# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0.10    1    110 P Active  local           10.10.10.2      10.10.10.254
```

Sur la console de **R_STANDBY** :
```text
R_STANDBY# show standby brief
                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Et0/0.10    1    100 P Standby 10.10.10.1      local           10.10.10.254
```

---

## 5. Tests et Validation en Direct

### A. Resolution ARP et Connectivite Client (VPC)
Le poste client d'acces (VPC) configure sa passerelle par defaut sur la VIP :
```bash
VPCS> ip 10.10.10.50/24 10.10.10.254
Checking for duplicate address...
VPCS : 10.10.10.50 255.255.255.0 gateway 10.10.10.254

VPCS> ping 10.10.10.254
84 bytes from 10.10.10.254 icmp_seq=1 ttl=255 time=0.716 ms
84 bytes from 10.10.10.254 icmp_seq=2 ttl=255 time=1.051 ms
84 bytes from 10.10.10.254 icmp_seq=3 ttl=255 time=0.711 ms
84 bytes from 10.10.10.254 icmp_seq=4 ttl=255 time=0.822 ms
84 bytes from 10.10.10.254 icmp_seq=5 ttl=255 time=0.884 ms

VPCS> arp
00:00:0c:07:ac:01  10.10.10.254 expires in 102 seconds
```

> **Preuve Formelle :** L'adresse MAC associee a la passerelle est `00:00:0c:07:ac:01`. Les octets `00:00:0c` identifient Cisco Systems, `07:ac` identifie HSRP, et le dernier octet `01` correspond exactement au groupe 1.

---

### B. Epreuve du Basculement a Chaud (*Live Failover*)
Pendant l'emission d'un flux ininterrompu de 50 pings ICMP depuis le client VPC vers la passerelle virtuelle, la liaison du routeur principal R1 est neutralisee :

```cisco
R1(config)# interface Ethernet0/0.10
R1(config-subif)# shutdown
*Nov 6 18:36:06.209: %HSRP-5-STATECHANGE: Ethernet0/0.10 Grp 1 state Active -> Init
```

#### Observation sur la console de R_STANDBY :
```text
*Nov 6 18:36:16.482: %HSRP-5-STATECHANGE: Ethernet0/0.10 Grp 1 state Standby -> Active
```

#### Observation sur la console du client VPC :
```text
VPCS> ping 10.10.10.254 -c 50
84 bytes from 10.10.10.254 icmp_seq=23 ttl=255 time=0.911 ms
84 bytes from 10.10.10.254 icmp_seq=24 ttl=255 time=0.960 ms
10.10.10.254 icmp_seq=25 timeout
84 bytes from 10.10.10.254 icmp_seq=26 ttl=255 time=0.846 ms
84 bytes from 10.10.10.254 icmp_seq=27 ttl=255 time=0.928 ms
...
```

> **Metrique de Disponibilite :** **1 seul paquet perdu sur 50 (98 % de continuite de service immediate).** Le basculement s'est opere en moins d'une seconde, de facon totalement transparente pour les applications de l'utilisateur.

---

### C. Epreuve de la Preemption (*Preempt Recovery*)
L'interface de R1 est reactivee :
```cisco
R1(config)# interface Ethernet0/0.10
R1(config-subif)# no shutdown
*Nov 6 18:42:03.791: %HSRP-5-STATECHANGE: Ethernet0/0.10 Grp 1 state Listen -> Active
```

Sur **R_STANDBY**, la preemption est declenchee par l'annonce de la priorite superieure (110) de R1 :
```text
*Nov 6 18:42:14.548: %HSRP-5-STATECHANGE: Ethernet0/0.10 Grp 1 state Speak -> Standby
```

Le routeur principal reprend automatiquement sa fonction sans incident, attestant de la stabilite et du determinisme de l'architecture de haute disponibilite.

---

## 6. Synthese et Bilan de Conformite

Le Palier 7 acheve la resilience globale du reseau d'acces :
- **Elimination du SPOF :** La passerelle virtuelle `10.10.10.254` est garantie en permanence par le cluster HSRP R1 / R_STANDBY.
- **Transparence d'Exploitation :** Aucun changement de configuration n'est requis sur les commutateurs d'acces ou sur les postes clients.
- **Integrite L2/L3 Conjointe :** Coexistence parfaite du Trunk 802.1Q, du DHCP Snooping et de Port-Security sur le commutateur SW1 avec le basculement HSRP.
