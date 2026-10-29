# GUIDE 11 : PALIER 6 - CYBERSECURITE RESEAU DE COUCHE 2 (L2) : PORT-SECURITY, DHCP SNOOPING & BPDU GUARD

Ce guide documente l'implementation de reference du Palier 6 d'Ingenierie Reseau et Securite : le durcissement complet de la couche d'acces (Commutateur Cisco IOL L2 SW1), articulant le controle d'acces physique par adresse MAC (Port-Security), la protection contre les serveurs DHCP pirates (DHCP Snooping) et la preservation de l'integrite de la topologie Spanning-Tree (PortFast & BPDU Guard).

---

## 1. Contexte et Enjeux Industriels de la Securite Couche 2

La majorite des cyberattaques internes et des incidents d'exploitation surviennent au niveau de la couche liaison de donnees (Couche 2 du modele OSI) :
1. **Saturation de la table CAM (*MAC Flooding*) & Usurpation (*MAC Spoofing*) :** Un attaquant inonde le commutateur de fausses adresses MAC pour saturer sa memoire et transformer le commutateur en concentrateur (*hub*), rendant possible l'ecoute passive de l'ensemble des trames du VLAN.
2. **Serveurs DHCP pirates (*Rogue DHCP*) & Attaques Man-in-the-Middle :** Tout equipement non autorise peut emettre des offres DHCP frauduleuses attribuant aux utilisateurs une fausse passerelle par defaut pour intercepter leurs flux ou un faux DNS pour le phishing.
3. **Boucles et compromissions Spanning-Tree :** Le raccordement accidentel ou hostile d'un commutateur pirate sur une prise murale peut provoquer une tempete de diffusion (*Broadcast Storm*) ou usurper le role de pont racine (*Root Bridge*), destabilisant l'infrastructure.

Le **Palier 6** neutralise integralement ces vecteurs d'attaque sur le segment d'acces utilisateur (VLAN 10).

---

## 2. Architecture de Securite L2 et Topologie d'Acces

```text
+--------------------------------------------------------------------------------------------------+
|                                    ZONE DE DISTRIBUTION & ROUTAGE                                |
|                                                                                                  |
|                                       [ ROUTEUR CISCO RL3 ]                                      |
|                                          Serveur DHCP Officiel                                   |
|                                        Pool : 10.10.10.0/24 (VLAN 10)                            |
|                                     Passerelle : 10.10.10.1 (Sub-if e0/0.10)                     |
+--------------------------------------------------+-----------------------------------------------+
                                                   |
                                                   | Trunk 802.1Q (VLAN 10)
                                                   | Port de Confiance DHCP & ARP
                                                   | [ Ethernet0/0 ]
                                                   v
+--------------------------------------------------+-----------------------------------------------+
|                                  COMMUTATEUR CISCO IOL L2 (SW1)                                  |
|                                                                                                  |
|  - Inspection DHCP Snooping : Filtre actif sur VLAN 10 (Option 82 desactivee)                   |
|  - Table de liaison dynamique : Enregistre {MAC, IP, Bail, Port, VLAN}                           |
|  - Protection Spanning-Tree : PortFast (Zero latence) & BPDU Guard (Anti-Boucle/Commutateur)     |
|  - Port-Security            : Verrouillage d'adresse MAC Sticky, limitation a 1 hote             |
+--------------------------------------------------+-----------------------------------------------+
                                                   |
                                                   | Port d'Acces VLAN 10 Durci (Untrusted)
                                                   | [ Ethernet0/1 ]
                                                   v
+--------------------------------------------------+-----------------------------------------------+
|                                   POSTE CLIENT VPCS (VLAN 10)                                    |
|                                       MAC : 0050.7966.6804                                       |
|                                      IP Dynamique : 10.10.10.11                                  |
|                                        Passerelle : 10.10.10.1                                   |
+--------------------------------------------------------------------------------------------------+
```

### Matrice de Securite des Ports du Commutateur SW1

| Interface | Raccordement | Mode Switchport | Role Securite DHCP | Mecanismes L2 Actifs | Action en cas d'attaque |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`Ethernet0/0`** | Routeur RL3 | Trunk 802.1Q | **`Trusted` (Oui)** | Liaison montante certifiee | N/A (Trafic d'infrastructure autorise) |
| **`Ethernet0/1`** | Client VPCS | Access VLAN 10 | **`Untrusted` (Non)** | Port-Security, PortFast, BPDU Guard | Blocage de trames non autorisees / err-disabled |

---

## 3. Implementation de Port-Security

### A. Conception Technique et Modes de Violation
Port-Security analyse l'adresse MAC source des trames entrantes sur l'interface :
- **`mac-address sticky` :** Le commutateur convertit dynamiquement la premiere adresse MAC apprise en adresse securisee persistante inscrite dans la configuration active (`running-config`).
- **`maximum 1` :** Interdit le raccordement de plusieurs equipements sur la meme prise physique (antidote aux commutateurs sauvages).
- **Modes de violation :**
  - **`restrict` :** L'adresse non autorisee est silencieusement jetee, le compteur de violation `Security Violation Count` s'incremente et une alerte Syslog est envoyee au SIEM. Le port reste operationnel (`Secure-up`).
  - **`shutdown` :** Des la premiere trame frauduleuse, le commutateur desactive physiquement l'interface et la bascule dans l'etat critique **`err-disabled`** (`Secure-shutdown`).

### B. Configuration Cisco IOS sur SW1
```cisco
interface Ethernet0/1
 switchport access vlan 10
 switchport mode access
 switchport port-security
 switchport port-security maximum 1
 switchport port-security mac-address sticky
 switchport port-security violation restrict
 exit
```

---

## 4. Implementation du DHCP Snooping

### A. Mecanisme de Defense
1. **Ports `Trusted` (De Confiance) :** L'interface `Ethernet0/0` reliant le routeur RL3 est explicitee en `ip dhcp snooping trust`. Seul ce port est autorise a acheminer des reponses serveur `DHCP Offer` et `DHCP Ack`.
2. **Ports `Untrusted` (Non Fiables) :** Le port `Ethernet0/1` est non fiable par defaut. Si un serveur pirate repond a une requete client, ses paquets sont detruits immediatement.
3. **Desactivation de l'Option 82 :** Dans les reseaux locaux commutateur-routeur Cisco, l'insertion automatique du champ Relay Agent Information (Option 82) avec `giaddr 0.0.0.0` provoque le rejet des paquets par le routeur. La directive `no ip dhcp snooping information option` garantit l'interoperabilite.

### B. Configuration Cisco IOS

#### Sur le Routeur RL3 (Serveur DHCP Officiel) :
```cisco
ip dhcp excluded-address 10.10.10.1 10.10.10.10
ip dhcp pool POOL_VLAN10
 network 10.10.10.0 255.255.255.0
 default-router 10.10.10.1
 dns-server 8.8.8.8
 exit
```

#### Sur le Commutateur SW1 :
```cisco
ip dhcp snooping
ip dhcp snooping vlan 10
no ip dhcp snooping information option

interface Ethernet0/0
 ip dhcp snooping trust
 exit
```

---

## 5. Durcissement Spanning-Tree : PortFast & BPDU Guard

### A. Enjeux et Synergie
- **`spanning-tree portfast` :** Neutralise les 30 secondes d'attente (Listening/Learning) de STP lors du raccordement d'un poste, permettant au client d'obtenir instantanement son bail DHCP.
- **`spanning-tree bpduguard enable` :** Si un commutateur pirate emet une trame BPDU sur ce port d'acces, le port est immediatement coupe en `err-disabled`.

### B. Configuration Cisco IOS sur SW1
```cisco
interface Ethernet0/1
 spanning-tree portfast
 spanning-tree bpduguard enable
 exit
```

---

## 6. Preuves de Validation et Resultats Experimentaux en Production

### 1. Enregistrement de l'Adresse MAC Legitime (Port-Security)
Apres emission du premier ping depuis VPCS (`0050.7966.6804`), SW1 a automatiquement enrichi sa configuration :
```cisco
SW1#show running-config interface Ethernet0/1
interface Ethernet0/1
 switchport access vlan 10
 switchport mode access
 switchport port-security
 switchport port-security violation restrict
 switchport port-security mac-address sticky
 switchport port-security mac-address sticky 0050.7966.6804
 duplex auto
 spanning-tree portfast
 spanning-tree bpduguard enable
end
```

### 2. Test d'Attaque et Observation de la Violation en Mode Restrict
Apres avoir defini une adresse autorisee factice (`0000.1111.2222`), VPCS tente d'emettre vers `10.10.10.1` :
```text
VPCS> ping 10.10.10.1
host (10.10.10.1) not reachable
```
Observation sur SW1 :
```text
SW1#show port-security interface Ethernet0/1
Port Security              : Enabled
Port Status                : Secure-up
Violation Mode             : Restrict
Maximum MAC Addresses      : 1
Total MAC Addresses        : 1
Sticky MAC Addresses       : 1
Last Source Address:Vlan    : 0050.7966.6804:10
Security Violation Count   : 3
```
> **Validation :** Le pirate est bloque, l'adresse de l'attaquant est formellement consignee, et le compteur s'incremente a chaque tentative.

### 3. Test de Violation en Mode Shutdown et Isolation `err-disabled`
Configuration du mode `shutdown` sur `Ethernet0/1` :
```text
*Oct 29 12:00:29.754: %PM-4-ERR_DISABLE: psecure-violation error detected on Et0/1, putting Et0/1 in err-disable state
*Oct 29 12:00:29.754: %PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0050.7966.6804 on port Ethernet0/1.
*Oct 29 12:00:30.754: %LINEPROTO-5-UPDOWN: Line protocol on Interface Ethernet0/1, changed state to down
*Oct 29 12:00:31.754: %LINK-3-UPDOWN: Interface Ethernet0/1, changed state to down
```
Verification du diagnostic :
```text
SW1#show interfaces status err-disabled
Port      Name      Status       Reason             Err-disabled Vlans
Et0/1               err-disabled psecure-violation
```
> **Validation :** L'interface a ete coupe physiquement. La procedure de rehabilitation (`shutdown` suivi de `no shutdown` avec la MAC legitime) a retabli le port en etat `Up/Up`.

### 4. Attribution DHCP et Table de Liaison (DHCP Snooping Binding)
Sur VPCS :
```text
VPCS> ip dhcp
DDORA IP 10.10.10.11/24 GW 10.10.10.1
```
Sur SW1, la base de donnees de securite est generee en direct :
```text
SW1#show ip dhcp snooping binding
MacAddress         IpAddress      Lease(sec)  Type            VLAN  Interface
------------------ -------------- ----------- --------------- ----- -----------
00:50:79:66:68:04  10.10.10.11    86365       dhcp-snooping   10    Ethernet0/1
Total number of bindings: 1
```

### 5. Verification de PortFast et BPDU Guard
```text
SW1#show spanning-tree interface Ethernet0/1 detail
Port 2 (Ethernet0/1) of VLAN0010 is designated forwarding
  The port is in the portfast mode
  Bpdu guard is enabled
  BPDU: sent 88, received 0
```

---

## 7. Bilan d'Ingenierie et Competences Acquises

Ce Palier 6 valide les standards industriels de securisation d'acces local :
1. **Controle d'acces granulaire (L2 NAC) :** Neutralisation du spoofing et de l'adjonction de materiels non inventories.
2. **Protection des flux fondamentaux d'infrastructure :** Immunisation contre les serveurs DHCP frauduleux et les attaques MitM.
3. **Resilience et stabilite Spanning-Tree :** Suppression des delais d'attribution d'adresse IP tout en garantissant l'immunite contre les boucles pirates.
4. **Maitrise du cycle de vie operationnel :** Diagnostic des pannes d'isolation en etat `err-disabled` et protocoles de remediation d'incident.
