# GUIDE 10 : PALIER 5 - ROUTAGE DYNAMIQUE OSPFv2 D'ENTREPRISE MULTI-CONSTRUCTEURS (CISCO IOS - FORTINET FORTIGATE)

Ce guide documente l'implementation de reference du Palier 5 d'Ingenierie Reseau et Securite : la mise en oeuvre d'un domaine de routage dynamique d'entreprise OSPFv2 (Open Shortest Path First Version 2) multi-constructeurs, assurant l'interconnexion resiliente et la convergence automatique des tables de routage entre un routeur de coeur/distribution de campus Cisco IOL L3 (R1_HQ) et un pare-feu de perimetre Fortinet FortiGate 7.4.13 (FORTIGATE_HQ).

---

## 1. Contexte et Enjeux Industriels du Routage Dynamique

Dans une infrastructure d'entreprise distribuée, l'utilisation de routes statiques presente des vulnerabilites operationnelles majeures :
1. **Absence d'adaptabilite aux pannes :** Une route statique demeure active dans la table de routage tant que l'interface de sortie reste electriquement active, meme si la connectivite effective en aval est rompue (trou noir de routage).
2. **Complexite d'exploitation exponentielle :** Tout ajout de sous-reseau utilisateur ou de DMZ necessite la mise a jour manuelle de l'ensemble des passerelles du reseau, induisant un risque d'erreur humaine eleve.
3. **Impossibilite de convergence multi-chemins :** Le routage statique ne gere pas nativement l'equilibrage de charge dynamique (ECMP) ni le reroutage automatique sans mecanismes additionnels de sondage (IP SLA / BFD).

Le **Palier 5** elimine integralement le routage statique entre le campus utilisateur et le perimetre de securite en deployant le protocole a etat de liens standardise **OSPFv2 (RFC 2328)** dans un environnement multi-constructeurs reel.

---

## 2. Architecture de Routage et Matrice d'Adressage

```text
+--------------------------------------------------------------------------------------------------+
|                                    ZONE PERIMETRIQUE & ACCES WAN                                 |
|                                                                                                  |
|                                [ INTERNET / WAN EXTERNE ]                                        |
|                                            ^                                                     |
|                                            | port1 (192.168.1.4/24 - NAT Overload)               |
|                           +----------------v------------------+                                  |
|                           |      FORTINET FORTIGATE 7.4       |                                  |
|                           |        Router-ID: 172.16.1.1      |                                  |
|                           |  Injecte : O*E2 0.0.0.0/0 (LSA 5) |                                  |
|                           +--------+-----------------+--------+                                  |
|                                    | port3           | port2                                     |
|                                    | 172.16.50.1/24  | 172.16.1.1/30                             |
+------------------------------------+-----------------+-------------------------------------------+
                                     |                 |
                   Liaison DMZ Isolee|                 | Liaison Point-a-Point OSPF Area 0
                                     |                 | Reseau 172.16.1.0/30 (Hello 10s / Dead 40s)
                                     v                 v
                        +------------+----+       +----+-------------------------------------------+
                        | SRV-WEB-DMZ     |       |               CISCO IOL L3 (R1)                |
                        | 172.16.50.10/24 |       |             Router-ID: 1.1.1.1                 |
                        | NGINX + App HTTP|       |  Annonce : 10.10.10.0/24 (VLAN 10 Clients)     |
                        +-----------------+       +----+-------------------------------------------+
                                                       | Ethernet0/0.10 (802.1Q - Passive Interface)
                                                       | 10.10.10.1/24
                                                       v
                                          +------------+-------------------------------------------+
                                          |          CISCO IOL L2 (SW1) - Access Switch            |
                                          +------------+-------------------------------------------+
                                                       | Port Access VLAN 10 (Ethernet0/1)
                                                       v
                                          +------------+-------------------------------------------+
                                          |          CLIENT VPCS (VLAN 10 UTILISATEURS)            |
                                          |          IP : 10.10.10.50/24                           |
                                          |          Gateway : 10.10.10.1 (Cisco R1)               |
                                          +--------------------------------------------------------+
```

### Matrice d'Adressage et Parametres OSPF

| Equipement | Interface | Adresse IP / Masque | Zone OSPF (Area) | Type de Reseau OSPF | Role OSPF |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FORTIGATE_HQ** | `port2` | `172.16.1.1/30` | `0.0.0.0` (Backbone) | Broadcast / P2P | DR (Designated Router) |
| **FORTIGATE_HQ** | `port1` | `192.168.1.4/24` | Hors OSPF | WAN / Internet | ASBR (Autonomous System Boundary Router) |
| **FORTIGATE_HQ** | `port3` | `172.16.50.1/24` | Hors OSPF | DMZ Serveurs | Passerelle locale DMZ |
| **R1_HQ (Cisco)** | `Ethernet0/1` | `172.16.1.2/30` | `0` (Backbone) | Broadcast | BDR (Backup Designated Router) |
| **R1_HQ (Cisco)** | `Ethernet0/0.10` | `10.10.10.1/24` | `0` (Backbone) | Passive Interface | Passerelle VLAN 10 (LSA Type 1) |

---

## 3. Mecanismes Theoriques OSPFv2 en Contexte Heterogene

### Types de LSA (Link-State Advertisements) Deployes
1. **LSA Type 1 (Router LSA) :** Chaque routeur OSPF genere ce LSA pour decrire ses interfaces, ses etats de liens et ses couts intra-zone. Cisco R1 annonce le reseau d'interconnexion `172.16.1.0/30` et le prefixe utilisateur `10.10.10.0/24`.
2. **LSA Type 5 (AS-External LSA) :** Emis exclusivement par le pare-feu FortiGate (agissant en tant qu'ASBR). FortiGate genere une route externe par defaut `0.0.0.0/0` de métrique E2 (cout fixe = 10), injectee vers Cisco R1 pour couvrir l'ensemble du trafic sortant vers Internet.

### Passive-Interface sur le Segment Utilisateur
L'interface `Ethernet0/0.10` de Cisco R1 est declaree en `passive-interface`. Cela garantit que :
- Le sous-reseau `10.10.10.0/24` est injecte dans les annonces LSA Type 1 a destination du FortiGate.
- Aucun paquet Hello OSPF n'est emis sur le VLAN utilisateur, neutralisant tout risque d'attaque par injection de faux paquets OSPF ou d'etablissement d'adjacence illegitime depuis les postes de travail.

---

## 4. Defis d'Interoperabilite Multi-Constructeurs et Solutions Appliquees

L'interconnexion directe entre Cisco IOS et Fortinet FortiOS revele des particularites d'implementation qui necessitent un calibrage rigoureux :

### 1. Blocage en Etat ExStart / Exchange (MTU Mismatch)
- **Probleme constate :** Lors de l'initialisation du voisinage OSPF, l'adjacence restait bloquee dans l'etat `ExStart/Exchange`.
- **Analyse technique :** Le protocole OSPF verifie que la taille du MTU annoncee dans les paquets DBD (*Database Description*) est strictement identique entre voisins. Dans les pilotes de virtualisation IOL sous noyau Linux EVE-NG, les trames L2/L3 gerent le champ MTU avec une legere disparite vis-a-vis de la carte virtuelle QEMU VirtIO du FortiGate.
- **Solution appliquee :** Configuration de la directive `ip ospf mtu-ignore` sur l'interface `Ethernet0/1` de Cisco R1. Cette commande desactive le controle strict du champ MTU dans les paquets DBD, declenchant le basculement immediat de l'etat d'adjacence vers `FULL`.

### 2. Distance Administrative (AD) et Eviction des Routes Statiques
- **Probleme constate :** Apres l'etablissement de l'adjacence, la table de routage active (RIB) continuait a preferer les anciennes routes statiques.
- **Analyse technique :**
  - Sur Cisco IOS : Une route statique a une Distance Administrative de **1**, alors qu'une route externe OSPF (E2) a une AD de **110**.
  - Sur FortiOS : Une route statique a une Distance Administrative par defaut de **10**, alors qu'une route OSPF a une AD de **110**.
- **Solution appliquee :** Suppression explicite des routes statiques manuelles :
  - Sur Cisco R1 : `no ip route 0.0.0.0 0.0.0.0 172.16.1.1`
  - Sur FortiGate : Suppression de la static-route pointant `10.10.10.0/24` vers `172.16.1.2`.
  - **Resultat :** Les routes OSPF dynamiques sont immediatement elues et installees dans les tables de commutation CEF et kernel FortiOS.

---

## 5. Configurations Realisees Pas a Pas

### A. Configuration du Routeur Cisco IOL L3 (R1_HQ)

```cisco
! Activation du processus OSPF avec Router-ID fixe
router ospf 1
 router-id 1.1.1.1
 ! Annonce de la liaison point-a-point d'interconnexion
 network 172.16.1.0 0.0.0.3 area 0
 ! Annonce du sous-reseau utilisateurs VLAN 10
 network 10.10.10.0 0.0.0.255 area 0
 ! Protection du segment LAN contre les emissions Hello
 passive-interface Ethernet0/0.10
 exit

! Optimisation de l'interface d'interconnexion vers FortiGate
interface Ethernet0/1
 ip address 172.16.1.2 255.255.255.252
 ip ospf mtu-ignore
 exit

! Suppression de la route statique d'origine pour forcer l'usage d'OSPF
no ip route 0.0.0.0 0.0.0.0 172.16.1.1
end
write memory
```

### B. Configuration du Pare-Feu Fortinet (FORTIGATE_HQ)

```fortios
# Configuration du processus OSPF FortiOS 7.4
config router ospf
    set router-id 172.16.1.1
    config area
        edit 0.0.0.0
        next
    end
    config network
        edit 1
            set prefix 172.16.1.0 255.255.255.252
            set area 0.0.0.0
        next
    end
    # Injection continue de la route par defaut vers le domaine OSPF
    config default-information
        set originate always
        set metric 10
        set metric-type 2
    end
end

# Suppression de la route statique historique vers le LAN 10.10.10.0/24
config router static
    purge
end
```

---

## 6. Preuves de Validation et Resultats en Production

### 1. Verification de l'Adjacence Voisin sur Cisco R1
```text
R1#show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
172.16.1.1        1   FULL/DR         00:00:32    172.16.1.1      Ethernet0/1
```
> **Validation :** L'adjacence est dans l'etat `FULL`. Le pare-feu FortiGate a ete elu `DR` (Designated Router) sur le segment partagé.

### 2. Verification de l'Adjacence Voisin sur FortiGate 7.4
```text
FGVMEVKZWIWB8SDE # get router info ospf neighbor
OSPF process 0, VRF 0:
Neighbor ID     Pri   State           Dead Time   Address         Interface
1.1.1.1           1   Full/Backup     00:00:36    172.16.1.2      port2
```
> **Validation :** FortiGate reconnait le voisin Cisco `1.1.1.1` en etat `Full/Backup` sur son interface `port2`.

### 3. Verification de la Table de Routage Cisco R1 (Route par Defaut Dynamique)
```text
R1#show ip route ospf
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
Gateway of last resort is 172.16.1.1 to network 0.0.0.0

O*E2 0.0.0.0/0 [110/10] via 172.16.1.1, 00:23:45, Ethernet0/1
```
> **Validation :** La route par defaut `0.0.0.0/0` est recue en OSPF Externe de Type 2 (`O*E2`) avec une distance administrative de 110 et un cout fixe de 10.

### 4. Verification de la Table de Routage FortiGate (Route LAN Dynamique)
```text
FGVMEVKZWIWB8SDE # get router info routing-table ospf
Routing table for VRF=0
O       10.10.10.0/24 [110/11] via 172.16.1.2, port2, 00:24:12, [1/0]
```
> **Validation :** Le reseau `10.10.10.0/24` est appris dynamiquement via LSA Type 1 a travers le prochain saut `172.16.1.2` (port2).

### 5. Tests de Connectivite Utilisateur Reel (Client VPCS VLAN 10)
Depuis le poste client `10.10.10.50` :

1. **Ping vers la passerelle perimetrique FortiGate (172.16.1.1) :**
```text
VPCS> ping 172.16.1.1
84 bytes from 172.16.1.1 icmp_seq=1 ttl=254 time=1.399 ms
84 bytes from 172.16.1.1 icmp_seq=2 ttl=254 time=1.259 ms
84 bytes from 172.16.1.1 icmp_seq=3 ttl=254 time=1.440 ms
```

2. **Ping vers le serveur Web de la DMZ (172.16.50.10) a travers le filtrage NGFW :**
```text
VPCS> ping 172.16.50.10
84 bytes from 172.16.50.10 icmp_seq=1 ttl=62 time=7.646 ms
84 bytes from 172.16.50.10 icmp_seq=2 ttl=62 time=3.137 ms
84 bytes from 172.16.50.10 icmp_seq=3 ttl=62 time=2.377 ms
```
> **Analyse TTL :** TTL initial 64 -> Hop 1 (Cisco R1) -> Hop 2 (FortiGate) -> Arrivee DMZ avec TTL 62. Routage multi-sauts valide.

3. **Ping vers l'externe / Internet (8.8.8.8) avec NAT Overload applique :**
```text
VPCS> ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=113 time=95.912 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=113 time=71.419 ms
84 bytes from 8.8.8.8 icmp_seq=3 ttl=113 time=72.813 ms
```

---

## 7. Audit Automatise et Integration dans la Suite NetDevOps

Le moteur d'audit de conformite `automation/audit_engine.py` a ete enrichi pour integrer la validation programmatique du routage dynamique OSPF :
- Controle de l'etat d'adjacence `FULL` sur Cisco R1.
- Controle de l'etat d'adjacence `Full` sur FortiGate 7.4.
- Verification de la presence de la route injectee `10.10.10.0/24` dans la RIB FortiOS.

### Resultats de l'Execution NetDevOps (25/25 Tests Reussis)
```text
================================================================================
RAPPORT GLOBAL : SCORE DE CONFORMITE = 100.0 % (25/25 tests valides)
================================================================================
EQUIPEMENT       | CONSTRUCTEUR   | SCORE    | CONTROLES    | STATUT    
--------------------------------------------------------------------------------
R1_HQ            | Cisco          | 100.0    % | 6/6          | CONFORME  
SW1_HQ           | Cisco          | 100.0    % | 4/4          | CONFORME  
R2_BRANCH        | Cisco          | 100.0    % | 3/3          | CONFORME  
FORTIGATE_HQ     | Fortinet       | 100.0    % | 12/12        | CONFORME  
================================================================================
```

---

## 8. Bilan Technique et Competences Validees

Ce Palier 5 acheve la modernisation de l'infrastructure de campus en apportant les benefices suivants :
1. **Convergence dynamique sans point de rupture :** Suppression complete des dependances statiques entre le campus et le pare-feu.
2. **Cloisonnement securise des annonces :** Mise en oeuvre de `passive-interface` limitant les flux de controle OSPF a la seule liaison point-a-point dediee.
3. **Maitrise de l'interoperabilite heterogene :** Diagnostic et resolution du desaccord de MTU en environnement de virtualisation d'entreprise.
4. **Validation de bout en bout :** Maintien integral de la continuite de service pour les postes utilisateurs vers la DMZ et vers l'exterieur.
