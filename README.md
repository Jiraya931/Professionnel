<div align="center">

# Ababacar Ousmane Niang
### Stagiaire en Administration Systèmes, Réseaux & Sécurité — SIMEN
**Système Intégré de Management de l'Éducation Nationale**  
*Élève Ingénieur en Master 2 Réseaux & Systèmes Informatiques (RESI) — Groupe ISI Dakar*

[![Portfolio](https://img.shields.io/badge/Portfolio-En_Ligne-2563eb?style=flat-square)](https://jiraya931.github.io/Professionnel/)
[![Curriculum Vitae](https://img.shields.io/badge/Curriculum_Vitae-Consulter_PDF-10b981?style=flat-square)](./docs/CV_updated.pdf)
[![GitHub](https://img.shields.io/badge/GitHub-Jiraya931-181717?style=flat-square&logo=github)](https://github.com/Jiraya931)

<br/>

[![Statut](https://img.shields.io/badge/Statut-Stagiaire_au_SIMEN-7c3aed?style=flat-square)]()
[![Cursus](https://img.shields.io/badge/Formation-Master_2_RESI-0284c7?style=flat-square)]()
[![Localisation](https://img.shields.io/badge/Localisation-Dakar_/_Diamniadio,_Sénégal-16a34a?style=flat-square)]()
[![Contact](https://img.shields.io/badge/Email-ababacarniang98%40gmail.com-ea4335?style=flat-square&logo=gmail)](mailto:ababacarniang98@gmail.com)

</div>

---

## Présentation

Ce référentiel technique rassemble les travaux d'ingénierie, projets d'infrastructure, topologies de simulation réseau, déploiements DevOps et développements applicatifs réalisés par Ababacar Ousmane Niang.

Actuellement en **stage au SIMEN** (Système Intégré de Management de l'Éducation Nationale) et en dernière année de **Master 2 Réseaux et Systèmes Informatiques (RESI)** au Groupe ISI de Dakar, mes travaux sont orientés vers la conception d'infrastructures résilientes, la souveraineté numérique, l'automatisation des déploiements et la sécurisation des architectures d'entreprise.

Ce dépôt héberge également le code source du [Portfolio Web](https://jiraya931.github.io/Professionnel/), déployé automatiquement via GitHub Actions.

---

## Domaines d'Expertise & Technologies

<div align="center">

| Domaine | Technologies et Protocoles |
| :--- | :--- |
| **Réseaux & Protocoles** | Cisco IOS, Huawei VRP, OSPFv2/v3, BGP, MPLS LDP, VRF, VLAN 802.1Q, EtherChannel (LACP), HSRP/VRRP, QoS, IPv4/IPv6 |
| **Sécurité & IAM** | Keycloak IAM, OpenID Connect (OIDC), SAML 2.0, OAuth 2.0, LDAP / Active Directory, IPsec VPN, Port-Security, DHCP Snooping, DAI, DMZ |
| **DevOps & Cloud** | Docker, Docker Compose, Kubernetes, GitHub Actions (CI/CD), AWS (EC2, VPC, IAM), NGINX Reverse Proxy |
| **Systèmes & Virtualisation** | Linux (Ubuntu, Debian, Alpine), Windows Server (AD DS, DNS, DHCP, IIS), VMware vSphere / ESXi, Proxmox VE |
| **Développement & Scripting** | Python, Bash / Shell, PowerShell, Flutter / Dart, JavaScript / HTML5 / CSS3 |

</div>

---

## Organisation du Référentiel

```text
.
├── 01-SSO-Federation-Keycloak/      # Projet de Fin d'Études M2 : Solution SSO souveraine & IAM (SIMEN)
├── 02-Reseaux-Cisco-Huawei/        # Topologies de routage dynamique, commutation L2/L3 et ToIP
├── 03-Securite-Systemes-Reseaux/   # Durcissement L2, interconnexion VPN IPsec et filtrage DMZ
├── 04-DevOps-Conteneurisation/     # Multi-stage builds, isolation réseau multi-tiers et CI/CD
├── 05-Developpement-Mobile-Flutter/# Application mobile multiplateforme avec gestion d'état réactive
├── assets/                         # Schémas d'architecture et ressources graphiques
├── docs/                           # Justificatifs officiels (CV, diplômes, certifications Cisco)
├── index.html                      # Interface du portfolio statique (GitHub Pages)
├── styles.css                      # Système de styles CSS moderne
├── script.js                       # Moteur d'interactions et de consultation des documents
└── .github/workflows/deploy.yml    # Workflow de déploiement continu
```

---

## Synthèse des Projets d'Ingénierie

### 1. [Solution SSO & Fédération d'Identités (Projet M2 RESI / SIMEN)](./01-SSO-Federation-Keycloak/)
- **Contexte** : Étude et implémentation d'une infrastructure d'authentification centralisée et souveraine au sein du Système Intégré de Management de l'Éducation Nationale (SIMEN).
- **Architecture** : Déploiement d'un cluster **Keycloak 24+** interconnecté à une base de données **PostgreSQL** et un annuaire d'entreprise **OpenLDAP**.
- **Standards** : SAML 2.0, OpenID Connect, OAuth 2.0 avec chiffrement JWT RS256, authentification multifacteur (MFA) et contrôle d'accès RBAC/ABAC.
- **Ressources** : Stack `docker-compose.yml` reproductible et supports de présentation d'architecture inclus.

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
- **Automatisation CI/CD** : Pipeline GitHub Actions assurant le contrôle de conformité et la publication des livrables.

### 5. [Développement Mobile Flutter / Dart](./05-Developpement-Mobile-Flutter/)
- **Architecture Applicative** : Gestion d'état réactive via le patron de conception `provider`.
- **Interface & Expérience** : Prise en charge des modes clair et sombre (`themeProvider.dart`), écran d'onboarding et structure de code modulaire.

---

## Formations & Certifications

| Intitulé | Organisme / Établissement | Période | Justificatif |
| :--- | :--- | :---: | :---: |
| **Master 2 Réseaux & Systèmes Informatiques (RESI)** | Groupe ISI Dakar | 2025 - 2026 | *En cours* |
| **Master 1 Réseaux & Systèmes Informatiques (RESI)** | Groupe ISI Dakar | 2024 - 2025 | [Attestation](./docs/) |
| **Cisco Certified Network Associate (CCNA 3 - ENSA)** | Cisco Networking Academy | 2025 | [CCNA 3 PDF](./docs/CCNA3.pdf) |
| **Cisco Certified Network Associate (CCNA 2 - SRWE)** | Cisco Networking Academy | 2025 | [CCNA 2 PDF](./docs/CCNA2.pdf) |
| **Cisco Certified Network Associate (CCNA 1 - ITN)** | Cisco Networking Academy | 2025 | [CCNA 1 PDF](./docs/CCNA1.pdf) |
| **Licence Professionnelle Informatique et Gestion** | Ensup'Afrique Dakar | 2023 | [Diplôme PDF](./docs/Diplome%20Licence.pdf) |

---

## Contact Professionnel

- **Nom** : Ababacar Ousmane Niang
- **Rôle** : Stagiaire en Administration Systèmes, Réseaux & Sécurité (SIMEN)
- **Email** : [ababacarniang98@gmail.com](mailto:ababacarniang98@gmail.com)
- **Téléphone / WhatsApp** : `+221 78 148 12 91`
- **Profil GitHub** : [@Jiraya931](https://github.com/Jiraya931)
- **Localisation** : Diamniadio / Dakar, Sénégal

---

<div align="center">
  <sub>Ababacar Ousmane Niang — Documentation technique et référentiel d'ingénierie.</sub>
</div>
