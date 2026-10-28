# GUIDE 05 : SUPERVISION, ANALYSE DES LOGS ET MÉMO DES COMMANDES UTILES

Ce guide constitue la référence opérationnelle pour surveiller le trafic, diagnostiquer les incidents réseau en temps réel, activer les journaux d'événements et maîtriser les commandes d'administration clés de chaque composant du Homelab (**FortiGate 7.4**, **Cisco IOL L2/L3**, **EVE-NG** et **Proxmox VE**).

---

## 1. Activation des Logs en Mémoire sur FortiGate 7.4

Sur les machines virtuelles FortiGate (notamment en licence d'évaluation sans disque de log dédié), l'enregistrement des journaux sur disque est souvent inactif par défaut. Il est indispensable d'activer l'enregistrement en **mémoire vive (RAM)** pour visualiser le trafic en direct dans l'interface graphique.

### A. Configuration via la CLI FortiGate

Connecte-toi en SSH ou via la console EVE-NG sur le FortiGate :

```text
! 1. Activer l'enregistrement des logs en mémoire RAM
config log memory setting
    set status enable
    next
end

! 2. Définir le filtre global pour capturer le trafic accepté et refusé
config log memory filter
    set forward-traffic enable
    set local-traffic enable
    set multicast-traffic enable
    set sniffer-traffic enable
    set anomaly enable
    set severity information
end

! 3. Vérifier que la règle de sécurité enregistre bien les sessions
config firewall policy
    edit 1
        set logtraffic all
    next
end
```

> ** [VERIFICATION] :**  
> *Emplacement :* Console CLI FortiGate  
> *Affichage :* Sortie de la commande `get log memory setting` montrant `status: enable`.

---

## 2. Analyse du Trafic dans l'Interface Graphique FortiOS

Une fois les logs mémoire activés et le trafic généré (ex: depuis le PC1 vers `8.8.8.8`) :

1. Ouvre l'interface web : `https://192.168.1.4`
2. Rendez-vous dans **`Log & Report`**  **`Forward Traffic`** :
   * Chaque ligne représente une session traversant le pare-feu.
   * Vérifie les colonnes : **Source** (`10.10.10.50`), **Destination** (`8.8.8.8`), **Service** (`PING / ICMP`), **Action** (`Accept`), **Sent/Received Bytes**, et **NAT IP** (`192.168.1.4`).
3. Menu **`FortiView Sources`** ou **`FortiView Sessions`** :
   * Visualisation en temps réel de la bande passante consommée par adresse IP source.

> ** [VERIFICATION] :**  
> *Emplacement :* Menu Web FortiGate `Log & Report` > `Forward Traffic`  
> *Affichage :* Tableau montrant les flux ICMP du client `10.10.10.50` sortant via le port WAN avec le statut `Accept`.

---

## 3. Débogage et Analyse de Paquets en Direct (CLI FortiGate)

### A. Sniffer de paquets (Équivalent tcpdump / Wireshark)

Pour vérifier si un paquet arrive bien sur une interface et ressort sur l'autre :

```text
# Syntaxe : diagnose sniffer packet <interface> '<filtre>' <niveau_detail> <nombre_paquets> <horodatage>

# Exemple 1 : Écouter tout le trafic ICMP (ping) sur n'importe quelle interface
diagnose sniffer packet any 'icmp' 4 0 l

# Exemple 2 : Écouter les paquets venant du PC client 10.10.10.50
diagnose sniffer packet any 'host 10.10.10.50' 4 0 l

# Exemple 3 : Détail complet avec en-têtes Ethernet et IP sur port2
diagnose sniffer packet port2 'icmp' 6 10 l
```

*Pour interrompre la capture : appuyer sur **`Ctrl + C`**.*

### B. Moteur de suivi de flux (Flow Trace)

Pour comprendre précisément pourquoi un paquet est accepté, rejeté ou routé :

```text
# 1. Définir le filtre sur l'adresse IP source du client
diagnose debug flow filter saddr 10.10.10.50

# 2. Afficher la fonction et les détails
diagnose debug flow show function-name enable
diagnose debug flow show iprope enable

# 3. Démarrer le traçage pour 20 lignes
diagnose debug flow trace start 20

# 4. Activer la console de débogage
diagnose debug enable

# (Envoyer un ping depuis le PC1 pour voir le diagnostic s'afficher)

# 5. Désactiver le débogage après analyse
diagnose debug disable
diagnose debug flow trace stop
```

---

## 4. Boîte à Outils & Commandes Clés Cisco (IOL L2 / L3)

### A. Commutateur L2 (SW1)

```text
! Vérifier l'état et l'assignation de tous les VLANs
show vlan brief

! Vérifier les ports en Trunk (802.1Q) et les VLANs autorisés
show interfaces trunk

! Afficher la table des adresses MAC apprises sur chaque port
show mac address-table

! Voir l'état récapitulatif des interfaces (Up/Down, IP)
show ip interface brief

! Vérifier le protocole Spanning-Tree
show spanning-tree brief
```

> ** [VERIFICATION] :**  
> *Emplacement :* Console Cisco SW1  
> *Affichage :* Sortie de `show interfaces trunk` montrant `Et0/0` en mode `trunk` avec encapsulation `802.1q`.

### B. Routeur L3 (R1)

```text
! Afficher la table de routage complète (routes connectées 'C' et statiques 'S*')
show ip route

! Vérifier les sous-interfaces 802.1Q et leurs adresses IP
show ip interface brief

! Tester la connectivité depuis le routeur avec une source spécifique
ping 8.8.8.8 source ethernet 0/0.10

! Afficher la table ARP (correspondance IP <-> MAC)
show arp
```

---

## 5. Commandes Système & Maintenance EVE-NG

Depuis le shell EVE-NG (`root@192.168.1.11`) :

```bash
# 1. Corriger les permissions de tous les nœuds (indispensable après tout ajout d'image)
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions

# 2. Vérifier les processus QEMU / KVM en cours d'exécution
ps aux | grep qemu

# 3. Vérifier l'utilisation CPU et Mémoire globale
htop
# ou
free -m

# 4. Nettoyer les fichiers de swap ou logs temporaires si le disque est plein
df -h
du -sh /opt/unetlab/tmp/*

# 5. Redémarrer proprement le serveur EVE-NG
shutdown -r now
```

---

## 6. Commandes d'Exploitation Proxmox VE 8

Depuis le shell physique Proxmox (`root@192.168.1.200`) :

```bash
# 1. Lister l'état de toutes les machines virtuelles (VMs)
qm list

# 2. Démarrer / Arrêter / Redémarrer la VM EVE-NG (VMID 200)
qm start 200
qm shutdown 200
qm reset 200

# 3. Vérifier la configuration matérielle de la VM EVE-NG
qm config 200

# 4. Surveiller l'utilisation des disques locaux LVM
lvs
vgs
pvesm status

# 5. Contrôler l'état des bridges réseau physiques (vmbr0)
ip -br addr show vmbr0
```

---

## 7. Synthèse du Parcours de Diagnostic d'un Flux

En cas de coupure réseau, suivre systématiquement cette chaîne de contrôle :

```text
[PC Client] 
    └─> 1. `ping 10.10.10.1` (Passerelle Cisco locale)
            ├─ Échec : Vérifier le port Access VLAN 10 (SW1) et le Trunk (SW1 <-> R1).
            └─ Succès : Passer à l'étape 2.
[Routeur R1]
    └─> 2. `ping 172.16.1.1` (Patte LAN du FortiGate)
            ├─ Échec : Vérifier l'interco /30 et la route par défaut 0.0.0.0/0 sur R1.
            └─ Succès : Passer à l'étape 3.
[FortiGate]
    └─> 3. `diagnose sniffer packet any 'icmp' 4 0 l`
            ├─ Les paquets arrivent sur port2 mais ne sortent pas sur port1 : 
            │    Vérifier la Firewall Policy (NAT enable, Action Accept).
            └─ Les paquets sortent mais pas de retour : 
                 Vérifier la route de retour FortiGate vers 10.10.10.0/24 via 172.16.1.2.
[Internet]
    └─> 4. `ping 8.8.8.8` depuis le client : Succès intégral !
```

