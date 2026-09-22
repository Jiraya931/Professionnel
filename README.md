<div align="center">

# 🚀 Ababacar Ousmane Niang
### Ingénieur Réseaux, Systèmes, DevOps & Cybersécurité (En formation M2 RESI)
**Groupe ISI Dakar (Institut Supérieur d'Informatique) — Promotion 2025/2026**

[![Portfolio Web](https://img.shields.io/badge/🌐_Portfolio_En_Ligne-GitHub_Pages-2563eb?style=for-the-badge)](https://jiraya931.github.io/Professionnel/)
[![Télécharger CV](https://img.shields.io/badge/📄_Curriculum_Vitae-Consulter_PDF-10b981?style=for-the-badge)](./docs/C.V.pdf)
[![GitHub Profile](https://img.shields.io/badge/GitHub-Jiraya931-181717?style=for-the-badge&logo=github)](https://github.com/Jiraya931)

<br/>

[![Status](https://img.shields.io/badge/Statut-En_Recherche_de_Stage_de_Fin_d'Études-blueviolet?style=flat-square)]()
[![Diplôme](https://img.shields.io/badge/Cursus-Master_2_RESI-0284c7?style=flat-square)]()
[![Localisation](https://img.shields.io/badge/Localisation-Dakar_/_Diamniadio,_Sénégal-16a34a?style=flat-square)]()
[![Contact](https://img.shields.io/badge/Email-ababacarniang98%40gmail.com-ea4335?style=flat-square&logo=gmail)](mailto:ababacarniang98@gmail.com)

</div>

---

## 🌟 Présentation du Référentiel

Bienvenue sur le dépôt **Professionnel** d'Ababacar Ousmane Niang. Ce référentiel regroupe l'ensemble de mes **travaux d'ingénierie majeurs, projets de mémoire, topologies réseau, stacks DevOps et applications logicielles**, validés au cours de mon cursus de Master au sein du **Groupe ISI de Dakar**.

Il héberge également le code source complet de mon [**Portfolio Web Interactif**](https://jiraya931.github.io/Professionnel/), déployé en continu via GitHub Actions.

---

## 🛠️ Stack Technologique & Compétences Clés

<div align="center">

| Domaine | Technologies & Outils Maîtrisés |
| :--- | :--- |
| **Réseaux & Protocoles** | Cisco IOS, Huawei VRP, OSPFv2/v3, BGP, MPLS VPN, VRF, VLAN 802.1Q, EtherChannel (LACP), HSRP/VRRP, QoS, IPv4/IPv6 |
| **Sécurité & IAM** | Keycloak IAM, OpenID Connect (OIDC), SAML 2.0, OAuth 2.0, LDAP/Active Directory, IPsec VPN, Port-Security, DHCP Snooping, DAI, DMZ |
| **DevOps & Cloud** | Docker, Docker Compose, Kubernetes, GitHub Actions (CI/CD), AWS (EC2, VPC, IAM), NGINX Reverse Proxy |
| **Systèmes & Virtualisation** | Linux (Ubuntu, Debian, Alpine), Windows Server (AD DS, DNS, DHCP, IIS), VMware vSphere / ESXi, Proxmox |
| **Développement & Scripting** | Python, Bash / Shell, PowerShell, Flutter / Dart, HTML5 / CSS3 / Vanilla JavaScript |

</div>

---

## 📂 Organisation Modulaire des Projets

```text
├── 📁 01-SSO-Federation-Keycloak/      # Projet de Fin d'Études M2 : Solution SSO souveraine & Fédération d'identités
├── 📁 02-Reseaux-Cisco-Huawei/        # Topologies d'entreprise Packet Tracer (.pkt), Routage OSPF/BGP, VLANs, VoIP
├── 📁 03-Securite-Systemes-Reseaux/   # Sécurité L2, Tunnel VPN IPsec Site-à-Site (.pka), DMZ filtrée
├── 📁 04-DevOps-Conteneurisation/     # Dockerfiles multi-stage, Docker Compose multi-tiers, pipeline CI/CD
├── 📁 05-Developpement-Mobile-Flutter/# Application Flutter multi-thèmes (Dark/Light mode avec Provider)
├── 📁 assets/                         # Médias, captures d'écrans techniques et visuels du portfolio
├── 📁 docs/                           # Justificatifs officiels (CV, Diplôme de Licence, Certifications Cisco CCNA)
├── 📄 index.html                      # Page principale du Portfolio Web (GitHub Pages)
├── 📄 styles.css                      # Design moderne Cyberpunk/Glassmorphism en Vanilla CSS
├── 📄 script.js                       # Moteur d'animations, filtrage et visualiseur de documents
└── ⚙️ .github/workflows/deploy.yml     # Pipeline de déploiement automatique sur GitHub Pages
```

---

## 🚀 Synthèse des Projets Majeurs

### 1. [🔐 Solution SSO & Fédération d'Identités (Mémoire M2 RESI)](./01-SSO-Federation-Keycloak/)
- **Contexte** : Étude et implémentation d'une infrastructure d'authentification centralisée souveraine (SIMEN).
- **Architecture** : Déploiement d'un cluster **Keycloak 24+** couplé à une base de données **PostgreSQL** et un annuaire d'entreprise **OpenLDAP**.
- **Standards** : SAML 2.0, OpenID Connect, OAuth 2.0 avec chiffrement JWT RS256, MFA obligatoire et RBAC.
- **Démonstration** : Stack `docker-compose.yml` prête à l'emploi et présentations de soutenance incluses.

### 2. [🌐 Ingénierie Réseaux Cisco & Huawei Datacenter](./02-Reseaux-Cisco-Huawei/)
- **Contexte** : Conception de cœurs de réseau résilients pour campus et datacenters.
- **Topologies incluses** :
  - `Topologie_Routage_Entreprise_M1.pkt` : Architecture multi-zones avec découpage VLSM et OSPF.
  - `DHCP_Infrastructure_M2.pkt` : Services IP avancés avec relais DHCP multi-sous-réseaux.
  - `ToIP_VoIP_QoS_M1.pkt` : Priorisation des flux vocaux et signalisation ToIP.
- **Configuration type** : Fichier [`cisco-core-routing.cfg`](./02-Reseaux-Cisco-Huawei/configs/cisco-core-routing.cfg) prêt à injecter en console.

### 3. [🛡️ Cybersécurité, Filtrage & Durcissement](./03-Securite-Systemes-Reseaux/)
- **Sécurité Commutation (Layer 2)** : Neutralisation des attaques MAC Flooding, Rogue DHCP et ARP Spoofing via Port-Security, DHCP Snooping et DAI ([`Ababacar_Ousmane_Niang_Layer2_Security.pka`](./03-Securite-Systemes-Reseaux/labs/Ababacar_Ousmane_Niang_Layer2_Security.pka)).
- **Interconnexion Sécurisée** : Tunnel chiffré IPsec Site-à-Site (IKE Phase 1/2, AES-256, SHA-256, DH Group 14) en ligne de commande Cisco CLI ([`Ababacar_Ousmane_Niang_Site_to_Site_IPsec_VPN.pka`](./03-Securite-Systemes-Reseaux/labs/Ababacar_Ousmane_Niang_Site_to_Site_IPsec_VPN.pka)).
- **Cloisonnement DMZ** : Délimitation étanche entre réseau d'accès public et intranet privé ([`DMZ_Architecture.pkt`](./03-Securite-Systemes-Reseaux/labs/DMZ_Architecture.pkt)).

### 4. [⚙️ DevOps & Conteneurisation Multi-Tiers](./04-DevOps-Conteneurisation/)
- **Multi-Stage Build** : `Dockerfile` minimisant l'empreinte mémoire et garantissant l'exécution sous utilisateur non-root.
- **Orchestration Multi-Services** : `docker-compose.yml` isolant les réseaux frontal (Nginx) et applicatif/données (Node.js, PostgreSQL, Redis).
- **CI/CD** : Automatisation GitHub Actions pour tester et publier les artefacts.

### 5. [📱 Application Mobile Flutter / Dart](./05-Developpement-Mobile-Flutter/)
- **Gestion d'État** : Intégration de `provider` pour une synchronisation fluide entre modèles et vues.
- **Expérience Utilisateur** : Bascule dynamique Thème Sombre / Thème Clair (`themeProvider.dart`), écran d'intégration et navigation moderne.

---

## 📜 Certifications & Formations Officielles

| Intitulé de la Certification / Diplôme | Organisme / École | Année | Justificatif |
| :--- | :--- | :---: | :---: |
| **Master 2 Réseaux & Systèmes Informatiques (RESI)** | Groupe ISI Dakar | 2025 - 2026 | *En cours* |
| **Master 1 Réseaux & Systèmes Informatiques (RESI)** | Groupe ISI Dakar | 2024 - 2025 | [Attestation](./docs/) |
| **Cisco Certified Network Associate (CCNA 3 - ENSA)** | Cisco Networking Academy | 2025 | [CCNA 3 PDF](./docs/CCNA3.pdf) |
| **Cisco Certified Network Associate (CCNA 2 - SRWE)** | Cisco Networking Academy | 2025 | [CCNA 2 PDF](./docs/CCNA2.pdf) |
| **Cisco Certified Network Associate (CCNA 1 - ITN)** | Cisco Networking Academy | 2025 | [CCNA 1 PDF](./docs/CCNA1.pdf) |
| **Licence Professionnelle Informatique et Gestion** | Ensup'Afrique Dakar | 2023 | [Diplôme PDF](./docs/Diplome%20Licence.pdf) |

---

## 📬 Contact & Informations Personnelles

- **Nom complet** : Ababacar Ousmane Niang
- **Email professionnel** : [ababacarniang98@gmail.com](mailto:ababacarniang98@gmail.com)
- **Téléphone / WhatsApp** : `+221 78 148 12 91`
- **Profil GitHub** : [@Jiraya931](https://github.com/Jiraya931)
- **Localisation** : Diamniadio, Dakar, Sénégal

---

<div align="center">
  <sub>© 2026 Ababacar Ousmane Niang — Tous droits réservés. Conçu et propulsé avec passion pour l'ingénierie des infrastructures modernes.</sub>
</div>
