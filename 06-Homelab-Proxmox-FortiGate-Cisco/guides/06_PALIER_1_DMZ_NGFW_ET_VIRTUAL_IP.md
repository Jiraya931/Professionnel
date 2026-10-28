# ️ GUIDE 06 : PALIER 1 - SÉCURITÉ NGFW AVANCÉE, ZONE DMZ & VIRTUAL IP (VIP)

Ce guide documente l'implémentation complète du **Palier 1 d'Ingénierie Réseau & Cybersécurité** : la création d'une zone démilitarisée (DMZ) étanche, le déploiement d'un serveur Web Linux QEMU durci, le filtrage granulaire inter-zones sur FortiGate 7.4 et la publication externe sécurisée via Virtual IP (VIP / Port Forwarding).

---

## 1. Topologie Globale Étendue (Zone DMZ Incluse)

```text
┌────────────────────────────────────────────────────────┐
│  WAN : Box Internet / Réseau Physique (192.168.1.0/24) │
└───────────────────────────┬────────────────────────────┘
                            │ Port port1 (IP : 192.168.1.4 - DHCP)
┌───────────────────────────┴────────────────────────────┐
│                  FortiGate 7.4.13 NGFW                 │
│         Politiques Multi-Zones & Virtual IP            │
└─────────────┬────────────────────────────┬─────────────┘
              │ Port port2 (172.16.1.1/30) │ Port port3 (172.16.50.254/24)
              │ Interconnexion Routeur R1  │ Passerelle Zone DMZ
┌─────────────┴──────────┐       ┌─────────┴─────────────┐
│    Routeur Cisco R1    │       │  Serveur Web DMZ      │
│  (10.10.10.1 / VLAN10) │       │  (Alpine Linux 3.20)  │
└─────────────┬──────────┘       │  IP : 172.16.50.10    │
              │ Trunk 802.1Q     │  Port HTTP : 80       │
┌─────────────┴──────────┐       └───────────────────────┘
│    Switch Cisco SW1    │
└─────────────┬──────────┘
              │ Port Access VLAN 10
┌─────────────┴──────────┐
│       Client LAN       │
│  IP : 10.10.10.50/24   │
└────────────────────────┘
```

---

## 2. Tableau Récapitulatif d'Adressage Multi-Zones

| Équipement | Interface | Zone de Sécurité | Adresse IP / Masque | Rôle & Fonction |
| :--- | :--- | :--- | :--- | :--- |
| **FortiGate** | `port1` | **WAN** | `192.168.1.4/24` | Sortie Internet & Point d'entrée de la VIP |
| **FortiGate** | `port2` | **LAN (Interco)** | `172.16.1.1/30` | Passerelle vers le Routeur Cisco R1 |
| **FortiGate** | `port3` | **DMZ** | `172.16.50.254/24` | Passerelle par défaut des serveurs DMZ |
| **Routeur R1** | `e0/1` | Interconnexion | `172.16.1.2/30` | Lien d'interconnexion vers FortiGate |
| **Routeur R1** | `e0/0.10` | LAN | `10.10.10.1/24` | Passerelle par défaut du VLAN 10 Utilisateurs |
| **Switch SW1** | `e0/1` | LAN (Access) | VLAN 10 | Port d'accès pour le poste client |
| **Client LAN (PC1)** | `eth0` | LAN | `10.10.10.50/24` | Poste utilisateur de test (VPCS) |
| **Serveur Web (SRV-WEB)** | `eth0` | **DMZ** | `172.16.50.10/24` | Serveur Web Alpine Linux avec landing page |

---

## 3. Déploiement du Serveur Web DMZ (Alpine Linux QEMU)

Pour garantir une empreinte mémoire ultra-faible (inférieure à 80 Mo de RAM) et une sécurité maximale, une machine virtuelle **Alpine Linux 3.20 QEMU** a été déployée sur l'interface `port3` du FortiGate.

### 3.1. Configuration Réseau sur le Serveur Web (`SRV-WEB-DMZ`)
```bash
# Attribution de l'adresse IP statique dans le sous-réseau DMZ
ip addr add 172.16.50.10/24 dev eth0
ip link set eth0 up

# Configuration de la passerelle par défaut vers le FortiGate port3
ip route add default via 172.16.50.254

# Démarrage du service HTTP (port 80)
python3 -m http.server 80 &
```

> Note de validation : [Déploiement Serveur Web DMZ] — Capture certifiee integree dans le rapport d'audit officiel (docs/Rapport_Homelab_Proxmox_FortiGate.pdf)

---

## 4. Configuration de la Zone DMZ sur FortiGate 7.4

### 4.1. Configuration de l'Interface `port3`
```fortios
config system interface
    edit port3
        set alias "DMZ_SERVERS"
        set mode static
        set ip 172.16.50.254 255.255.255.0
        set allowaccess ping https ssh
        set role dmz
    next
end
```

### 4.2. Diagnostic et Vérification des Adresses IP
```fortios
diagnose ip address list
```

> Note de validation : [Inspection des adresses IP FortiGate] — Capture certifiee integree dans le rapport d'audit officiel (docs/Rapport_Homelab_Proxmox_FortiGate.pdf)

---

## 5. Définition des Objets Réseau & Politiques de Sécurité

### 5.1. Déclaration des Objets d'Adressage
Conformément aux meilleures pratiques Fortinet, toutes les règles de sécurité exploitent des objets formels :
```fortios
config firewall address
    edit "SRV_WEB_DMZ"
        set subnet 172.16.50.10 255.255.255.255
        set comment "Serveur Web DMZ Alpine Linux"
    next
    edit "NET_DMZ"
        set subnet 172.16.50.0 255.255.255.0
        set comment "Sous-réseau de la zone DMZ"
    next
    edit "NET_LAN_VLAN10"
        set subnet 10.10.10.0 255.255.255.0
        set comment "VLAN 10 Utilisateurs Campus"
    next
end
```

### 5.2. Politique de Sécurité LAN  DMZ (Règle 10)
Autorise les postes clients du réseau interne à joindre le serveur Web en HTTP et ICMP :
```fortios
config firewall policy
    edit 10
        set name "LAN_TO_DMZ_WEB"
        set srcintf "port2"
        set dstintf "port3"
        set action accept
        set srcaddr "all"
        set dstaddr "SRV_WEB_DMZ"
        set schedule "always"
        set service "HTTP" "PING"
        set logtraffic all
    next
end
```

---

## 6. Publication Externe via Virtual IP (VIP / Port Forwarding)

Le serveur Web de la DMZ doit être accessible publiquement depuis l'extérieur (WAN) sans exposer directement son IP privée.

### 6.1. Création de l'Objet Virtual IP
Translation de l'adresse externe WAN du FortiGate (`192.168.1.4:8080`) vers l'adresse interne (`172.16.50.10:80`) :
```fortios
config firewall vip
    edit "VIP_WEB_DMZ"
        set extip 192.168.1.4
        set mappedip "172.16.50.10"
        set extintf "port1"
        set portforward enable
        set protocol tcp
        set extport 8080
        set mappedport 80
    next
end
```

### 6.2. Résolution de la Contrainte de Quota Licence Fortinet (`vdom-max = 3`)
Lors de la création de la politique WAN  DMZ, le message d'erreur suivant est apparu :
`Too many entries in all tables of 'firewall.policy' in vdom root: 3 / vdom-max = 3`

**Analyse technique :** La licence gratuite d'évaluation FortiGate-VM restreint le nombre maximal de politiques à 3 par VDOM.
**Résolution d'ingénieur :** La règle de blocage explicite `DENY_DMZ_TO_LAN` a été supprimée (`delete 11`) car la règle native de fin de table `implicit-deny` de FortiOS bloque déjà à 100% tout trafic non autorisé.

```fortios
config firewall policy
    delete 11
    edit 20
        set name "WAN_TO_DMZ_VIP"
        set srcintf "port1"
        set dstintf "port3"
        set action accept
        set srcaddr "all"
        set dstaddr "VIP_WEB_DMZ"
        set schedule "always"
        set service "ALL"
        set logtraffic all
    next
end
```

> Note de validation : [Configuration VIP et Quota Licence] — Capture certifiee integree dans le rapport d'audit officiel (docs/Rapport_Homelab_Proxmox_FortiGate.pdf)

---

## 7. Validation & Preuve de Fonctionnement en Production

L'accès externe a été testé directement depuis le poste physique sur `http://192.168.1.4:8080`. Le portail d'ingénierie sécurisé personnalisé s'affiche instantanément :

> Note de validation : [Portail Web DMZ en Production] — Capture certifiee integree dans le rapport d'audit officiel (docs/Rapport_Homelab_Proxmox_FortiGate.pdf)

---

## 8. Synthèse des Compétences Validées (Palier 1)

1. **Isolation Multi-Zones NGFW :** Cloisonnement strict entre LAN, WAN et DMZ.
2. **Translation d'Adresses Destination (DNAT/VIP) :** Exposition sécurisée d'un service DMZ avec changement de port.
3. **Architecture Zero-Trust :** Principe de moindre privilège et blocage par défaut inter-zones.
4. **Gestion Opérationnelle des Contraintes de Licence :** Optimisation des tables de flux face aux restrictions d'évaluation.
