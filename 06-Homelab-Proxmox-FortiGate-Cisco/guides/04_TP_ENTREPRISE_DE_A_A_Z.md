# 🏢 GUIDE 04 : LE GRAND TP D'ENTREPRISE DE A À Z

Ce guide documente l'architecture réseau et sécurité complète réalisée en travaux pratiques : du poste client isolé dans son VLAN jusqu'à la sortie sur Internet à travers le pare-feu Fortinet.

---

## 1. Topologie du Laboratoire

```text
┌────────────────────┐
│    PC1 (VPCS)      │ IP : 10.10.10.50/24
└─────────┬──────────┘ Passerelle : 10.10.10.1
          │ Port Ethernet0
          │
          │ Port e0/1 (VLAN 10 Access)
┌─────────┴──────────┐
│  Switch L2 (SW1)   │ Cisco IOL L2
└─────────┬──────────┘
          │ Port e0/0 (Trunk 802.1Q)
          │
          │ Port e0/0 (Sous-interface e0/0.10)
┌─────────┴──────────┐
│  Routeur L3 (R1)   │ Cisco IOL L3 (Routage Inter-VLAN)
└─────────┬──────────┘
          │ Port e0/1 (IP : 172.16.1.2/30)
          │ Lien d'interconnexion
          │ Port port2 (IP : 172.16.1.1/30)
┌─────────┴──────────┐
│  FortiGate 7.4     │ Pare-feu d'entreprise (NAT & Filtrage)
└─────────┬──────────┘
          │ Port port1 (DHCP : 192.168.1.13)
          │
┌─────────┴──────────┐
│ Management(Cloud0) │ Réseau physique de la Box (vmbr0)
└─────────┬──────────┘
          ▼
   🌐 VRAI INTERNET (8.8.8.8)
```

---

## 2. Tableau Récapitulatif d'Adressage IP

| Équipement | Interface | Rôle | Adresse IP / Masque | Passerelle |
| :--- | :--- | :--- | :--- | :--- |
| **PC1 (VPCS)** | `eth0` | Client VLAN 10 | `10.10.10.50/24` | `10.10.10.1` |
| **SW1 (Switch)** | `e0/1` | Accès PC1 | VLAN 10 | - |
| **SW1 (Switch)** | `e0/0` | Trunk vers R1 | 802.1Q | - |
| **R1 (Routeur)** | `e0/0.10` | Passerelle VLAN 10 | `10.10.10.1/24` | - |
| **R1 (Routeur)** | `e0/1` | Interco Fortinet | `172.16.1.2/30` | `172.16.1.1` |
| **FortiGate** | `port2` | Interco Routeur R1 | `172.16.1.1/30` | - |
| **FortiGate** | `port1` | WAN (Box Internet) | `192.168.1.X/24` | `192.168.1.1` |

---

## 3. Configuration du Switch Cisco L2 (`SW1`)

Console Switch SW1 :

```text
enable
configure terminal
hostname SW1

! Création du VLAN 10
vlan 10
 name UTILISATEURS
exit

! Port vers le PC en mode Access
interface ethernet 0/1
 switchport mode access
 switchport access vlan 10
 no shutdown
exit

! Port vers le Routeur en mode Trunk 802.1Q
interface ethernet 0/0
 switchport trunk encapsulation dot1q
 switchport mode trunk
 no shutdown
exit

end
write memory
```

---

## 4. Configuration du Routeur Cisco L3 (`R1`)

Console Routeur R1 :

```text
enable
configure terminal
hostname R1

! Activation de l'interface physique
interface ethernet 0/0
 no shutdown
exit

! Sous-interface de passerelle (Router-on-a-stick)
interface ethernet 0/0.10
 encapsulation dot1Q 10
 ip address 10.10.10.1 255.255.255.0
 no shutdown
exit

! Interface d'interconnexion vers Fortinet
interface ethernet 0/1
 ip address 172.16.1.2 255.255.255.252
 no shutdown
exit

! Route par défaut vers le FortiGate
ip route 0.0.0.0 0.0.0.0 172.16.1.1

end
write memory
```

---

## 5. Configuration du Pare-feu FortiGate 7.4

Console FortiGate :

```text
! 1. Configuration de l'interface LAN port2
config system interface
    edit port2
        set mode static
        set ip 172.16.1.1 255.255.255.252
        set allowaccess ping
    next
end

! 2. Route statique de retour vers le réseau utilisateurs 10.10.10.0/24
config router static
    edit 1
        set dst 10.10.10.0 255.255.255.0
        set gateway 172.16.1.2
        set device port2
    next
end

! 3. Règle de Firewall autorisant le LAN vers Internet avec NAT
config firewall policy
    edit 1
        set name "LAN_TO_INTERNET"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set nat enable
    next
end
```

---

## 6. Configuration et Tests depuis le Client (`PC1`)

Dans la console du VPCS :

```text
# 1. Définir l'adresse IP et la passerelle
ip 10.10.10.50/24 10.10.10.1

# 2. Sauvegarder
save

# 3. Test de niveau 1 : Passerelle Cisco locale
ping 10.10.10.1
# Résultat : 84 bytes from 10.10.10.1 icmp_seq=1 ttl=255 time=1.2 ms (SUCCÈS)

# 4. Test de niveau 2 : Entrée du pare-feu Fortinet
ping 172.16.1.1
# Résultat : 84 bytes from 172.16.1.1 icmp_seq=1 ttl=254 time=2.1 ms (SUCCÈS)

# 5. Test de niveau 3 : Sortie sur le vrai Internet mondial
ping 8.8.8.8
# Résultat : 84 bytes from 8.8.8.8 icmp_seq=1 ttl=113 time=62.9 ms (SUCCÈS TOTAL)
```

> **📸 [CAPTURE RECOMMANDÉE 01] :**  
> *Emplacement :* Console Cisco Routeur L3 (`R1# show ip route`)  
> *Affichage :* Table de routage avec sous-interface 802.1Q `e0/0.10` et route par défaut vers FortiGate.

> **📸 [CAPTURE RECOMMANDÉE 02] :**  
> *Emplacement :* Console Client (`VPCS> ping 8.8.8.8`)  
> *Affichage :* Test de bout en bout réussi confirmant l'accès Internet depuis le client VLAN 10.
