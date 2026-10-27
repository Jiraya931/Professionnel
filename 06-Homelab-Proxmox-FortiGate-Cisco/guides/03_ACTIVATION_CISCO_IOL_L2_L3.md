# ⚡ GUIDE 03 : INTÉGRATION ET ACTIVATION DES COMMUTATEURS ET ROUTEURS CISCO IOL (L2 & L3)

Ce guide détaille la mise en place des images **Cisco IOL (IOS on Linux)** dans EVE-NG, la résolution des dépendances 32-bit sous Ubuntu 22.04 et la génération de la licence officielle `iourc`.

---

## 1. Pourquoi utiliser Cisco IOL ?

* **Consommation mémoire ultra-faible :** Seulement **128 Mo à 256 Mo de RAM** par commutateur/routeur (contre 1 à 2 Go pour une VM classique).
* **Démarrage instantané :** Démarrage complet en **3 secondes**.
* **Richesse fonctionnelle :** Tous les protocoles Cisco sont pris en charge (VLANs, Trunks 802.1Q, EtherChannel LACP, Spanning Tree RSTP/MSTP, OSPF, EIGRP, BGP, routage inter-VLAN).

---

## 2. Emplacement des fichiers dans EVE-NG

Les binaires Cisco IOL se placent obligatoirement dans :
📁 `/opt/unetlab/addons/iol/bin/`

Images installées :
1. **Switch L2 :** `i86bi-linux-l2-adventerprisek9-15.1a.bin`
2. **Switch/Routeur L3 :** `i86bi-linux-l3-adventerprisek9-15.5.2T.bin`

---

## 3. Résolution de la dépendance 32-bit (Ubuntu 22.04 Jammy)

Cisco IOL est un binaire 32-bit (`i386`) qui nécessite la librairie `libcrypto.so.4`. Sur Ubuntu 22.04, cette version a été retirée des dépôts par défaut.

Dans le terminal EVE-NG (`root@eve-ng:~#`) :

```bash
# 1. Télécharger le paquet officiel Ubuntu 32-bit
wget http://security.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2.24_i386.deb

# 2. Installer le paquet et ses dépendances
dpkg -i libssl1.1_1.1.1f-1ubuntu2.24_i386.deb
apt-get install -f -y

# 3. Créer les liens symboliques libcrypto.so.4
ln -sf /usr/lib/i386-linux-gnu/libcrypto.so.1.1 /usr/lib/libcrypto.so.4
ln -sf /usr/lib/i386-linux-gnu/libcrypto.so.1.1 /usr/lib/i386-linux-gnu/libcrypto.so.4
ldconfig

# 4. Nettoyer
rm -f libssl1.1_1.1.1f-1ubuntu2.24_i386.deb
```

---

## 4. Génération de la Licence Officielle Cisco IOU (`iourc`)

L'algorithme interne de validation Cisco utilise un calcul de hachage MD5 basé sur l'identifiant machine (`hostid = 7f0343`) et le nom d'hôte (`eve-ng`).

Dans le terminal EVE-NG :

```bash
python3 -c '
import struct, hashlib, socket

iouPad1 = b"\x4B\x58\x21\x81\x56\x7B\x0D\xF3\x21\x43\x9B\x7E\xAC\x1D\xE6\x8A"
iouPad2 = b"\x80" + 39 * b"\0"
hostname = socket.gethostname()
k = int("7f0343", 16)

# Formule officielle Cisco IOU
md5input = iouPad1 + iouPad2 + struct.pack("!L", k) + iouPad1
lic = hashlib.md5(md5input).hexdigest()[:16]

content = f"[license]\n{hostname} = {lic};\n"
for path in ["/opt/unetlab/addons/iol/bin/iourc", "/etc/iourc", "/root/.iourc"]:
    with open(path, "w") as f:
        f.write(content)

print(f"Licence Cisco validée pour {hostname} : {lic}")
'

# Appliquer les droits de lecture et fixer les permissions
chmod 644 /opt/unetlab/addons/iol/bin/iourc /etc/iourc /root/.iourc
export IOURC=/opt/unetlab/addons/iol/bin/iourc
echo "export IOURC=/opt/unetlab/addons/iol/bin/iourc" >> /etc/environment
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

> **Résultat de la licence générée pour notre serveur :**
> `[license]`
> `eve-ng = 972f30267ef51616;`

> **📸 [CAPTURE RECOMMANDÉE 01] :**  
> *Emplacement :* Console Cisco Switch L2 (`SW1# show interfaces trunk`)  
> *Affichage :* Activation du Trunk 802.1Q et validation du VLAN 10 Utilisateurs.

---

## 5. Astuce console Cisco sous EVE-NG

Lorsque tu ouvres la console HTML5 d'un switch ou routeur Cisco IOL pour la première fois, l'écran reste noir : **c'est normal !**  
Il faut cliquer avec la souris dans le carré noir pour donner le focus, puis **appuyer 2 fois sur la touche Entrée** de ton clavier pour faire apparaître l'invite `Switch>` ou `Router>`.

> **📸 [CAPTURE RECOMMANDÉE 02] :**  
> *Emplacement :* Portail Web EVE-NG (`http://192.168.1.3`)  
> *Affichage :* Vue d'ensemble du laboratoire avec les commutateurs et routeurs Cisco opérationnels.
