# GUIDE 01 : MIGRATION D'EVE-NG DE VMWARE VERS PROXMOX VE

Ce guide décrit la procédure pas à pas ayant permis de migrer la machine virtuelle **EVE-NG** depuis VMware Workstation vers le serveur physique **Proxmox VE 8**.

---

## 1. Création de la machine virtuelle sur Proxmox

Dans le shell Proxmox (`>_ Shell`) ou via l'interface graphique :

```bash
# 1. Créer la VM sans disque avec CPU Host (virtualisation imbriquée KVM)
qm create 200 --name eve-ng-lab \
  --memory 8192 \
  --cores 4 \
  --cpu host \
  --net0 virtio,bridge=vmbr0 \
  --ostype l26 \
  --scsihw virtio-scsi-pci
```

> **Point clé :** Le paramètre `--cpu host` est capital. Il transmet les instructions matérielles Intel VT-x / AMD-V du processeur physique à la VM EVE-NG, permettant d'accélérer les nœuds QEMU / KVM virtuels.

---

## 2. Transfert du disque dur virtuel (VMDK)

Depuis le PC portable (PowerShell), transfert du disque monolithique de 10,8 Go vers l'espace de stockage temporaire de Proxmox :

```powershell
scp "C:\Users\DELL\Documents\Virtual Machines\EVE-NG\EVE-NG.vmdk" root@192.168.1.200:/var/lib/vz/dump/
```

---

## 3. Importation et rattachement du disque sous Proxmox

Dans le shell de Proxmox (`>_ Shell`) :

```bash
# 1. Importer le disque VMDK dans le volume de stockage local-lvm
qm importdisk 200 /var/lib/vz/dump/EVE-NG.vmdk local-lvm

# 2. Rattacher le disque importé en SCSI VirtIO rapide avec TRIM/Discard
qm set 200 --scsihw virtio-scsi-pci --scsi0 local-lvm:vm-200-disk-0,discard=on,ssd=1

# 3. Définir le disque scsi0 comme premier disque de démarrage
qm set 200 --boot order=scsi0

# 4. Supprimer le fichier VMDK temporaire pour libérer 11 Go d'espace
rm -f /var/lib/vz/dump/EVE-NG.vmdk

# 5. Démarrer la machine virtuelle EVE-NG
qm start 200
```

> ** [VERIFICATION] :**  
> *Emplacement :* Shell Proxmox VE (`>_ Shell`)  
> *Affichage :* Sortie de `qm list` confirmant la VM 200 en statut `running` avec 8192 Mo de RAM et son disque de 60 Go sur `local-lvm`.

---

## 4. Vérification et Connexion

1. Ouvre l'onglet **`Console`** de la VM 200 sur Proxmox.
2. Note l'adresse IP affichée en haut (dans notre cas : `http://192.168.1.3`).
3. Ouvre ton navigateur web sur ton PC portable et connecte-toi à :
   * **URL :** `http://192.168.1.3`
   * **Username :** `admin`
   * **Password :** `eve`
   * **Console mode :** `HTML5`

> ** [VERIFICATION] :**  
> *Emplacement :* Interface Web Proxmox VE (`https://192.168.1.200:8006`)  
> *Affichage :* Tableau de bord de gestion Proxmox VE avec la VM 200 opérationnelle.
