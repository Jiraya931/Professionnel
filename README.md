<div align="center">

# Projets d'Ingénierie — Systèmes, Réseaux & Sécurité
### Ababacar Ousmane Niang
**Stagiaire en Administration Systèmes, Réseaux & Sécurité — SIMEN**  
*Système Intégré de Management de l'Éducation Nationale*

[![Consulter le Portfolio](https://img.shields.io/badge/Portfolio_Interactif-Accéder_au_Site-2563eb?style=flat-square)](https://jiraya931.github.io/Professionnel/)
[![GitHub](https://img.shields.io/badge/GitHub-Jiraya931-181717?style=flat-square&logo=github)](https://github.com/Jiraya931)
[![Statut](https://img.shields.io/badge/Statut-Stagiaire_au_SIMEN-7c3aed?style=flat-square)]()

<br/>

> **Consultation du profil & parcours** : Ce référentiel Git est dédié exclusivement aux spécifications techniques, topologies de simulation, architectures et codes sources des projets.  
> Pour consulter mon **cursus académique détaillé**, mes **certifications professionnelles vérifiées (Cisco CCNA, etc.)**, mon **CV complet** ainsi que mes coordonnées de contact, veuillez vous référer à mon [**Portfolio Web Interactif**](https://jiraya931.github.io/Professionnel/).

</div>

---

## Présentation du Référentiel

Ce référentiel centralise les travaux d'ingénierie, architectures d'infrastructure, maquettes de simulation réseau, conteneurisations DevOps et développements logiciels réalisés par Ababacar Ousmane Niang.

Ce dépôt fournit un accès direct, vérifiable et documenté aux livrables techniques : configurations réseau réelles, scripts d'automatisation, architectures IAM souveraines et démonstrateurs conteneurisés.

---

## Domaines d'Expertise & Technologies

<div align="center">

| Domaine | Technologies et Protocoles |
| :--- | :--- |
| **Réseaux & Protocoles** | Cisco IOS, Huawei VRP, OSPFv2/v3, BGP, MPLS LDP, VRF, VLAN 802.1Q, EtherChannel (LACP), HSRP/VRRP, QoS, IPv4/IPv6 |
| **Sécurité & IAM** | Keycloak IAM, OpenID Connect (OIDC), SAML 2.0, OAuth 2.0, LDAP / Active Directory, IPsec VPN, Port-Security, DHCP Snooping, DAI, DMZ |
| **DevOps & Cloud** | Docker, Docker Compose, Kubernetes, GitHub Actions (CI/CD), AWS (EC2, VPC, IAM), NGINX Reverse Proxy |
| **Systèmes & Virtualisation** | Linux (Ubuntu, Debian, Alpine), Windows Server (AD DS, DNS, DHCP, IIS), VMware vSphere / ESXi, Proxmox VE |
| **Développement & Automatisation** | Python, Bash / Shell, PowerShell, Flutter / Dart, JavaScript / HTML5 / CSS3 |

</div>

---

## Organisation du Référentiel

```text
.
├── 01-SSO-Federation-Keycloak/      # Solution SSO souveraine & Fédération d'identités (Keycloak / SIMEN)
├── 02-Reseaux-Cisco-Huawei/        # Topologies de routage dynamique, commutation L2/L3 et ToIP
├── 03-Securite-Systemes-Reseaux/   # Durcissement L2, interconnexion VPN IPsec et filtrage DMZ
├── 04-DevOps-Conteneurisation/     # Multi-stage builds, isolation réseau multi-tiers et CI/CD
├── 05-Developpement-Mobile-Flutter/# Application mobile multiplateforme avec gestion d'état réactive
├── assets/                         # Schémas d'architecture et ressources graphiques
├── docs/                           # Justificatifs officiels et supports techniques
├── index.html                      # Interface du portfolio statique (GitHub Pages)
├── styles.css                      # Feuilles de styles du portfolio
├── script.js                       # Moteur d'interactions et visualiseur de documents
└── .github/workflows/deploy.yml    # Workflow de déploiement continu
```

---

## Synthèse des Projets d'Ingénierie

### 1. [Solution SSO & Fédération d'Identités (Projet M2 RESI / SIMEN)](./01-SSO-Federation-Keycloak/)
- **Contexte** : Conception et implémentation d'une infrastructure d'authentification centralisée souveraine au sein du Système Intégré de Management de l'Éducation Nationale (SIMEN).
- **Architecture** : Déploiement d'un cluster **Keycloak 24+** interconnecté à une base **PostgreSQL** et un annuaire **OpenLDAP**.
- **Standards** : SAML 2.0, OpenID Connect, OAuth 2.0 avec chiffrement JWT RS256, authentification multifacteur (MFA) et contrôle d'accès RBAC/ABAC.
- **Ressources** : Stack `docker-compose.yml` reproductible et documentation d'architecture cible.

### 2. [Ingénierie Réseaux Cisco & Huawei Datacenter](./02-Reseaux-Cisco-Huawei/)
- **Contexte** : Conception de cœurs de réseau résilients pour campus d'entreprise et centres de données.
- **Topologies incluses** :
  - `Topologie_Routage_Entreprise_M1.pkt` : Architecture multi-zones avec découpage VLSM et OSPFv2.
  - `DHCP_Infrastructure_M2.pkt` : Infrastructure multi-VLAN avec relais DHCP (`ip helper-address`).
  - `ToIP_VoIP_QoS_M1.pkt` : Déploiement VoIP sous Cisco CME et priorisation des flux avec QoS (DSCP/CoS).
- **Configuration** : Script d'injection CLI complet [`cisco-core-routing.cfg`](./02-Reseaux-Cisco-Huawei/configs/cisco-core-routing.cfg).

### 3. [Cybersécurité, Filtrage & Durcissement](./03-Securite-Systemes-Reseaux/)
- **Sécurité de Niveau 2** : Atténuation des attaques MAC Flooding, Rogue DHCP et ARP Spoofing via Port-Security, DHCP Snooping et Dynamic ARP Inspection ([`Ababacar_Ousmane_Niang_Layer2_Security.pka`](./03-Securite-Systemes-Reseaux/labs/Ababacar_Ousmane_Niang_Layer2_Security.pka)).
- **Interconnexion Sécurisée** : Tunnel chiffré IPsec Site-à-Site (IKE Phase 1/2, chiffrement AES-256, SHA-256, DH Group 14) configuré en CLI Cisco ([`Ababacar_Ousmane_Niang_Site_to_Site_IPsec_VPN.pka`](./03-Securite-Systemes-Reseaux/labs/Ababacar_Ousmane_Niang_Site_to_Site_IPsec_VPN.pka)).
- **Cloisonnement DMZ** : Délimitation étanche entre services exposés et intranet privé ([`DMZ_Architecture.pkt`](./03-Securite-Systemes-Reseaux/labs/DMZ_Architecture.pkt)).

### 4. [DevOps & Conteneurisation Multi-Tiers](./04-DevOps-Conteneurisation/)
- **Conteneurisation Durcie** : `Dockerfile` multi-stage minimisant la surface d'attaque et exécuté sous utilisateur non-root.
- **Orchestration Multi-Tiers** : `docker-compose.yml` avec séparation des réseaux applicatifs et d'infrastructure de données (Nginx, Node.js, PostgreSQL, Redis).
- **Automatisation CI/CD** : Pipeline GitHub Actions assurant le contrôle de conformité et le déploiement continu.

### 5. [Développement Mobile Flutter / Dart](./05-Developpement-Mobile-Flutter/)
- **Architecture Applicative** : Gestion d'état réactive via le patron de conception `provider`.
- **Interface & Expérience** : Prise en charge des modes clair et sombre (`themeProvider.dart`), écran d'onboarding et structure logicielle modulaire.

---

## Informations Complémentaires & Cursus

L'ensemble du cursus académique, les justificatifs de diplômes, les certifications officielles Cisco vérifiées et les informations de contact professionnel sont disponibles sur le site du portfolio :

**Consulter le Portfolio en ligne** : [https://jiraya931.github.io/Professionnel/](https://jiraya931.github.io/Professionnel/)
