# 🛡️ GUIDE 02 : DÉPLOIEMENT ET LICENCE DU PARE-FEU FORTINET FORTIGATE 7.4

Ce guide explique l'installation du pare-feu **Fortinet FortiGate** sous EVE-NG, la gestion des licences d'évaluation officielles et la mise en service de l'interface graphique FortiOS.

---

## 1. Comprendre la différence : FFW vs FGT

Lors du premier déploiement, une image `FFW` (FortiFirewall) avait été installée :
* **`FFW` (FortiFirewall) :** Déclinaison opérateur télécoms/CGNAT. Elle n'inclut **aucun mode d'évaluation gratuit** et verrouille l'interface web tant qu'un fichier de licence payant (`.lic`) n'est pas fourni.
* **`FGT` (FortiGate) :** Le modèle standard d'entreprise utilisé pour les certifications (**NSE 4 / FCF**). Il intègre la **licence d'évaluation gratuite permanente** de Fortinet.

---

## 2. Téléchargement officiel de l'image KVM

1. Rendez-vous sur le portail officiel : [https://support.fortinet.com](https://support.fortinet.com) (inscription gratuite).
2. Menu : **`Support` ➔ `VM Images`**.
3. Sélectionner :
   * **Product :** `FortiGate`
   * **Platform :** `KVM`
   * **Version :** `7.4` (onglet *Earlier Versions*)
4. Télécharger le package de déploiement x86_64 :
   `FGT_VM64_KVM-v7.4.13.M-build2933-FORTINET.out.kvm.zip`
5. Extraire le fichier zip pour obtenir **`fortios.qcow2`**.

---

## 3. Installation dans EVE-NG

Depuis PowerShell sur le PC portable :
```powershell
scp "fortios.qcow2" root@192.168.1.11:/tmp/virtioa.qcow2
```

Dans le terminal EVE-NG (`root@192.168.1.11`) :
```bash
# 1. Créer le dossier conforme EVE-NG
mkdir -p /opt/unetlab/addons/qemu/fortinet-FGT-7.4.13

# 2. Déplacer l'image
mv /tmp/virtioa.qcow2 /opt/unetlab/addons/qemu/fortinet-FGT-7.4.13/

# 3. Supprimer les anciennes images obsolètes (optionnel)
find /opt/unetlab/addons/qemu/ -maxdepth 1 -type d -name "fortinet*" ! -name "fortinet-FGT-7.4.13" -exec rm -rf {} +

# 4. Réparer les permissions EVE-NG
/opt/unetlab/wrappers/unl_wrapper -a fixpermissions
```

---

## 4. Paramètres du Nœud dans EVE-NG

Lors de l'ajout du nœud **Fortinet FortiGate** sur le lab :
* **CPU :** **`1`** *(Impératif : la licence gratuite limite à 1 vCPU, 2 vCPUs bloqueraient la licence !)*
* **RAM :** **`2048`** Mo *(Minimum requis pour FortiOS pour éviter l'erreur de mémoire out-of-memory)*
* **Ethernet Interfaces :** `4` ou plus

---

## 5. Premier démarrage et Activation de la Licence Gratuite

1. Relier le **`port1`** au nuage **`Management (Cloud0)`** et démarrer le FortiGate.
2. Ouvrir la console CLI :
   * **Login :** `admin`
   * **Password :** (Appuyer sur Entrée car vide)
   * **Nouveau mot de passe :** Respecter la politique de 12 caractères min avec majuscule, minuscule, chiffre et symbole (ex: `••••••••••••` / mot de passe robuste personnalisé).
3. Activer le DHCP et l'accès web sur `port1` :
   ```text
   config system interface
       edit port1
           set mode dhcp
           set allowaccess ping https ssh http
       next
   end
   config system dns
       set primary 8.8.8.8
       set secondary 1.1.1.1
   end
   ```
4. Obtenir l'IP : `diagnose ip address list` (ex: `192.168.1.4`).
5. Ouvrir dans le navigateur : `https://192.168.1.4`.
6. Sur la page d'activation de licence :
   * Cliquer sur le bouton **`Evaluation license`**.
   * Renseigner ses identifiants FortiCloud (`email` et `mot de passe`).
   * Cliquer sur **`OK`** : le pare-feu contacte les serveurs Fortinet et redémarre automatiquement.

> **📸 [CAPTURE RECOMMANDÉE 01] :**  
> *Emplacement :* Interface Web FortiGate (`https://192.168.1.4`)  
> *Affichage :* Portail d'authentification et tableau de bord FortiOS 7.4.

> **📸 [CAPTURE RECOMMANDÉE 02] :**  
> *Emplacement :* Console CLI FortiGate (`get system status`)  
> *Affichage :* Confirmation de la licence valide (`License Status: Valid`), 1 vCPU et 2048 Mo de RAM.

Au redémarrage, l'interface graphique **FortiOS 7.4 complète est active et utilisable sans limite de temps** !
