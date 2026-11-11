# Présentation Exécutive — Homelab Cybersécurité & Infrastructure Réseau
*Support structuré prêt pour import Canva Docs-to-Deck ou Kimi Slides (12 Diapositives)*

---

## Slide 1 — Couverture
- **Titre :** Architecture Réseau d'Entreprise, Sécurité NGFW, SIEM Wazuh & NetDevOps Python
- **Sous-titre :** Déploiement Multi-Constructeurs sur Proxmox VE 8, EVE-NG, Fortinet FortiGate 7.4 & Cisco IOL
- **Auteur :** Ababacar Ousmane Niang — Master 2 Réseaux & Systèmes Informatiques (RESI) | Groupe ISI
- **Indicateurs clés :** 8 Paliers Techniques | 5 Équipements Actifs | 10 Règles SOC MITRE ATT&CK | Audit 40/40 (100 %)

---

## Slide 2 — Contexte & Enjeux du Projet
- Concevoir un laboratoire d'ingénierie reproductible sans point unique de défaillance (SPOF).
- Combiner routage dynamique, segmentation périmétrique NGFW, durcissement couche 2 et détection active SOC.
- Prouver chaque contrôle en conditions réelles par captures d'attaques et audit automatisé Python.

---

## Slide 3 — Architecture Physique & Adressage Figé (.200 – .250)
- **Proxmox VE 8.x (Bare-Metal) :** `192.168.1.200` (Pont `vmbr0`, virtualisation imbriquée Intel VMX).
- **VM 101 Wazuh SIEM v4.14.10 :** `192.168.1.201` (Collecteur Syslog UDP/514 & Dashboard HTTPS/443).
- **VM 200 EVE-NG Community :** `192.168.1.202` (4 vCPU, 8 Go RAM — Émulation Cisco IOL & FortiGate).
- **FortiGate 7.4.13 HQ :** `192.168.1.203` (WAN), `172.16.1.1/30` (LAN), `172.16.50.254/24` (DMZ).
- **Succursale Cisco R2-BRANCH :** `192.168.1.250` (WAN) & `192.168.20.1/24` (LAN Succursale).

---

## Slide 4 — Palier 1 : Segmentation Campus & Zone DMZ VIP
- Trunk 802.1Q et sous-interface `e0/0.10` (VLAN 10 Utilisateurs `10.10.10.0/24`).
- Serveur Web DMZ sous Alpine Linux 3.20 (`172.16.50.10:80`) totalement isolé du LAN.
- Publication sécurisée par Virtual IP FortiGate : `192.168.1.203:8080 -> 172.16.50.10:80`.
- Optimisation du quota d'évaluation Fortinet (`vdom-max = 3`) via implicit-deny natif.

---

## Slide 5 — Palier 2 : VPN IPsec Site-à-Site IKEv2 Multi-Constructeurs
- Tunnel chiffré entre **FortiGate HQ** (`.203`) et **Cisco R2-BRANCH** (`.250`).
- Paramètres : **IKEv2**, `des-sha256`, **DH Group 14 (MODP 2048)** et **PFS activé**.
- Consolidation politique multi-interfaces (`CORP_INTERNAL_INTERZONE`) donnant accès au LAN et à la DMZ.
- Validation bout-en-bout depuis `PC2-BRANCH` (`192.168.20.50`) : 100 % de succès, latence de 2,2 à 2,8 ms.

---

## Slide 6 — Palier 3 : Défense NGFW L7, Signatures IPS & Anti-DDoS
- **Signatures IPS F-SBID personnalisées :** blocage actif en DPI de SQL Injection (ID `3900`) et Path Traversal (ID `2906`).
- **Application Control L7 :** `APP_CTRL_ENTERPRISE` filtrant P2P et proxys de contournement.
- **Protection Anti-DDoS (`DOS_WAN_PROTECT`) :** coupure immédiate ICMP Flood au seuil strict de **50 pps** (50/80 paquets reçus, 37,5 % bloqués dès le paquet 51).

---

## Slide 7 — Palier 5 : Routage Dynamique OSPFv2 Multi-Constructeurs
- Suppression totale des routes statiques entre le cœur Cisco `R1` et le pare-feu FortiGate.
- Injection de route par défaut externe `O*E2 0.0.0.0/0` par le FortiGate (ASBR) et annonce `10.10.10.0/24` par LSA Type 1.
- Résolution d'interopérabilité IOL / KVM via `ip ospf mtu-ignore` (passage immédiat à `FULL`).
- Sécurisation de l'interface client `e0/0.10` via `passive-interface`.

---

## Slide 8 — Palier 6 : Durcissement Couche 2 (Access Layer Security)
- **Port-Security :** apprentissage dynamique *sticky* (`max 1`), violation `restrict` et mise en quarantaine `err-disabled` en mode `shutdown`.
- **DHCP Snooping VLAN 10 :** port `Ethernet0/0` en confiance (`trusted`), `Ethernet0/1` non fiable, désactivation de l'Option 82.
- **Spanning-Tree :** `PortFast` pour convergence DHCP immédiate + `BPDU Guard` anti-commutateurs pirates.

---

## Slide 9 — Palier 7 : Haute Disponibilité Passerelle FHRP / HSRP
- Suppression du SPOF par cluster HSRP Groupe 1 sur VLAN 10 :
  - `R1_HQ` : `10.10.10.1/24` | Priorité **110** | **Active** (Préemption activée)
  - `R_STANDBY_HQ` : `10.10.10.2/24` | Priorité **100** | **Standby** (Préemption activée)
- Passerelle virtuelle unique : **VIP `10.10.10.254`** | VMAC `00:00:0c:07:ac:01`.
- Preuve de basculement à chaud (*live failover*) : **1 seul paquet perdu sur 50**, reprise en **< 1 seconde**.

---

## Slide 10 — Palier 8 : SIEM Wazuh v4.14.10 & Règles SOC MITRE ATT&CK
- Centralisation Syslog UDP/514 de FortiGate et des 4 équipements Cisco (`logging origin-id hostname`).
- **10 règles de corrélation personnalisées (`100101`–`100110`)** dans `local_rules.xml`.
- Incidents réels capturés dans `alerts.json` :
  - `Rule 100101` (Niv. 7) : Bascule HSRP `R1 <-> R_STANDBY`
  - `Rule 100103` (Niv. 9, `T1200`) : Violation Port-Security sur `SW1`
  - `Rule 100110` (Niv. 10, `T1190`) : Blocage SQLi & Path Traversal en DMZ
  - `Rule 100109` (Niv. 8, `T1498`) : Atténuation Flood ICMP sur WAN

---

## Slide 11 — NetDevOps Python & Conformité Automatisée (40/40)
- Suite modulaire Python (`automation/netdevops.py`) pilotant les 5 nœuds via Telnet IOL et SSH Plink.
- Sauvegardes GitOps horodatées avec détection différentielle de dérive (`difflib`).
- **Score d'Audit Opérationnel : 40 / 40 contrôles conformes (100,0 %)** :
  - `R1_HQ` : 9/9 | `R_STANDBY_HQ` : 5/5 | `SW1_HQ` : 9/9 | `R2_BRANCH` : 4/4 | `FORTIGATE_HQ` : 13/13.

---

## Slide 12 — Conclusion & Perspectives d'Évolution
- Infrastructure complète démontrant la convergence **Réseaux + Cybersécurité + DevOps + SOC**.
- **Évolutions prochaines :** déploiement d'agents Wazuh natifs (TCP 1514), activation de Dynamic ARP Inspection (DAI) & IP Source Guard, déclenchement CI/CD automatisé des audits NetDevOps et multi-homing SD-WAN.
