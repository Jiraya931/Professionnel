# RAPPORT D AUDIT OPERATIONNEL ET CONFORMITE RESEAU & SECURITE

- **Date de l'Audit :** 28/10/2026 22:24:33
- **Auditeur :** Ababacar Ousmane Niang - Master 2 RESI
- **Score de Conformite Globale :** **100.0 %** (25 / 25 tests valides)

---

## Synthese par Equipement

| Equipement | Constructeur | Role Infrastructure | Score | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **R1_HQ** | Cisco | Routeur de Campus HQ / Passerelle VLAN 10 | 100.0 % | **CONFORME** |
| **SW1_HQ** | Cisco | Commutateur d Acces Campus HQ | 100.0 % | **CONFORME** |
| **R2_BRANCH** | Cisco | Routeur Succursale Distante (Branch) | 100.0 % | **CONFORME** |
| **FORTIGATE_HQ** | Fortinet | Next-Generation Firewall & Passerelle Perimetrique HQ | 100.0 % | **CONFORME** |

---

## Detail des Points de Controle d'Ingenierie

### R1_HQ (Routeur de Campus HQ / Passerelle VLAN 10)
| Point de Controle | Resultat | Detail Technique |
| :--- | :--- | :--- |
| Interface Ethernet0/1 active (UP/UP) | **OK** | Interface operationnelle |
| Interface Ethernet0/0.10 active (UP/UP) | **OK** | Interface operationnelle |
| Presence route 0.0.0.0/0 | **OK** | Route detectee dans la RIB |
| Presence route 10.10.10.0/24 | **OK** | Route detectee dans la RIB |
| Presence route 172.16.1.0/30 | **OK** | Route detectee dans la RIB |
| Voisin OSPF 172.16.1.1 en etat FULL | **OK** | Adjacence OSPF etablie et synchronisee (FULL) |

### SW1_HQ (Commutateur d Acces Campus HQ)
| Point de Controle | Resultat | Detail Technique |
| :--- | :--- | :--- |
| Interface Ethernet0/0 active (UP/UP) | **OK** | Interface operationnelle |
| Interface Ethernet0/1 active (UP/UP) | **OK** | Interface operationnelle |
| Presence VLAN 1 | **OK** | VLAN 1 provisionne |
| Presence VLAN 10 | **OK** | VLAN 10 provisionne |

### R2_BRANCH (Routeur Succursale Distante (Branch))
| Point de Controle | Resultat | Detail Technique |
| :--- | :--- | :--- |
| Interface Ethernet0/0 active (UP/UP) | **OK** | Interface operationnelle |
| Interface Ethernet0/1 active (UP/UP) | **OK** | Interface operationnelle |
| Presence route 192.168.1.0/24 | **OK** | Route detectee dans la RIB |

### FORTIGATE_HQ (Next-Generation Firewall & Passerelle Perimetrique HQ)
| Point de Controle | Resultat | Detail Technique |
| :--- | :--- | :--- |
| Interface pare-feu port1 connectee | **OK** | Interface physique active |
| Interface pare-feu port2 connectee | **OK** | Interface physique active |
| Interface pare-feu port3 connectee | **OK** | Interface physique active |
| Virtual IP VIP_WEB_DMZ declaree | **OK** | VIP fonctionnelle et mappee |
| Politique de securite LAN_TO_INTERNET active | **OK** | Regle firewall presente et chargee |
| Politique de securite CORP_INTERNAL_INTERZONE active | **OK** | Regle firewall presente et chargee |
| Politique de securite WAN_TO_DMZ_VIP active | **OK** | Regle firewall presente et chargee |
| Signatures IPS personnalisees chargees | **OK** | Signatures L7 SQLi et Path Traversal actives |
| Profil Application Control APP_CTRL_ENTERPRISE provisionne | **OK** | Controle applicatif L7 actif |
| Politique de protection Anti-DDoS active | **OK** | Seuils SYN & ICMP flood configures |
| Voisin OSPF 1.1.1.1 en etat Full | **OK** | Adjacence OSPF operationnelle sur port2 |
| Route dynamique OSPF 10.10.10.0/24 apprise | **OK** | Route injectee par Cisco R1 presente dans la RIB OSPF |
