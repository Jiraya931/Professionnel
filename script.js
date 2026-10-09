/* ==========================================================================
   PORTFOLIO D'INGÉNIERIE SYSTÈMES, RÉSEAUX & CYBERSÉCURITÉ
   Auteur : Ababacar Ousmane Niang (DPTIC / SIMEN / Master 2 RESI - ISI Dakar)
   Logique Interactive, Terminal CLI, Blueprint & Command Palette
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Gestion du Thème (Dark / Light) Persistant ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('aon-portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('aon-portfolio-theme', newTheme);
        updateThemeIcon(newTheme);
        showToast(`Mode ${newTheme === 'dark' ? 'Cyber Obsidian (Sombre)' : 'High-Tech Lab (Clair)'} activé`);
    }

    function updateThemeIcon(theme) {
        if (!themeToggleBtn) return;
        const icon = themeToggleBtn.querySelector('i');
        if (!icon) return;
        if (theme === 'light') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    // --- 2. Navbar Scroll Effect & Scrollspy ---
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }

        // Scrollspy
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 160;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 3. Typing Effect pour le Hero ---
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const roles = [
            'Stagiaire à la DPTIC / SIMEN (Ministère Éducation Nationale)',
            'Étudiant Master 2 RESI (Groupe ISI Dakar)',
            'Certifié Cisco CCNA (ITN, SRWE, ENSA)',
            'Spécialiste Architecture IAM Keycloak SSO & OpenLDAP',
            'Ingénieur Routage Cisco IOS / OSPFv2 & Durcissement L2/L3',
            'Praticien DevOps Docker Multi-Stage & CI/CD GitHub Actions'
        ];
        let roleIdx = 0;
        let charIdx = 0;
        let isDeleting = false;

        function typeLoop() {
            const currentRole = roles[roleIdx];
            if (isDeleting) {
                typingElement.textContent = currentRole.substring(0, charIdx - 1);
                charIdx--;
            } else {
                typingElement.textContent = currentRole.substring(0, charIdx + 1);
                charIdx++;
            }

            let speed = isDeleting ? 35 : 75;

            if (!isDeleting && charIdx === currentRole.length) {
                speed = 2200;
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                speed = 400;
            }

            setTimeout(typeLoop, speed);
        }

        typeLoop();
    }

    // --- 4. Animation des Métriques Numériques au Scroll ---
    const metricNumbers = document.querySelectorAll('.metric-number');
    let metricsCounted = false;

    const metricsSection = document.querySelector('.infra-metrics-row');
    if (metricsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !metricsCounted) {
                    metricsCounted = true;
                    metricNumbers.forEach(metric => {
                        const target = parseInt(metric.getAttribute('data-count') || '0', 10);
                        const suffix = metric.querySelector('.metric-suffix');
                        const suffixHtml = suffix ? suffix.outerHTML : '';
                        let current = 0;
                        const increment = Math.max(1, Math.ceil(target / 25));
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            metric.innerHTML = current + suffixHtml;
                        }, 40);
                    });
                }
            });
        }, { threshold: 0.25 });

        observer.observe(metricsSection);
    }

    // --- 5. TERMINAL SYSADMIN & NETWORK CLI INTERACTIF ---
    const terminalOutput = document.getElementById('terminal-output');
    const terminalInput = document.getElementById('terminal-input');
    const triggerTerminalBtn = document.getElementById('trigger-terminal-btn');

    if (triggerTerminalBtn) {
        triggerTerminalBtn.addEventListener('click', () => {
            const termSec = document.getElementById('terminal-section');
            if (termSec) {
                termSec.scrollIntoView({ behavior: 'smooth' });
                terminalInput?.focus();
            }
        });
    }

    const terminalCommands = {
        'help': `Commandes disponibles :
  <span style="color:#00f0ff;">whoami</span>          : Identité, formation M2 RESI et mission actuelle à la DPTIC / SIMEN
  <span style="color:#00f0ff;">cat sso.spec</span>    : Spécifications techniques du cluster Keycloak SSO
  <span style="color:#00f0ff;">show ip route</span>   : Table de routage dynamique OSPFv2 (Cisco IOS)
  <span style="color:#00f0ff;">security-audit</span> : Rapport de durcissement L2, IPsec et DMZ
  <span style="color:#00f0ff;">projects</span>        : Liste exhaustive des 6 projets documentés
  <span style="color:#00f0ff;">certs</span>           : Validation officielle des certifications Cisco CCNA
  <span style="color:#00f0ff;">contact</span>         : Coordonnées téléphoniques, WhatsApp et email
  <span style="color:#00f0ff;">download cv</span>     : Ouvre directement le CV officiel au format PDF
  <span style="color:#00f0ff;">clear</span>           : Réinitialise l'écran du terminal`,

        'whoami': `<strong style="color:#38bdf8;">Ababacar Ousmane Niang</strong>
• Rôle actuel : Stagiaire en Administration Systèmes, Réseaux & Sécurité à la DPTIC / SIMEN (depuis Sept. 2026)
• Formation : Master 2 RESI (Réseaux & Systèmes Informatiques) au Groupe ISI Dakar
• Diplôme : Licence en Informatique et Gestion (Ensup'Afrique)
• Spécialisation : IAM Keycloak, Routage Cisco CCNA/CCNP, Cybersécurité L2/IPsec, Docker CI/CD`,

        'cat-sso': `<span style="color:#fbbf24;">[CLUSTER KEYCLOAK 24+ SOUVERAIN - MÉMOIRE M2 RESI (GROUPE ISI)]</span>
{
  "node_id": "keycloak-simen-core-01",
  "auth_protocols": ["OpenID Connect (OIDC / PKCE)", "SAML 2.0"],
  "token_algorithm": "JWT RS256 (Clé asymétrique RSA 2048-bit)",
  "mfa_enforced": true,
  "user_federation": "OpenLDAP + PostgreSQL 16 (Interconnexion active)",
  "session_management": "SSO Multi-Applications sans ressaisie de mot de passe",
  "deployment": "Docker Compose durci sous Alpine Linux",
  "security_tier": "Haute Sécurité Souveraine"
}`,

        'show-ip-route': `<span style="color:#10b981;">Cisco IOS Router# show ip route ospf</span>
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
Gateway of last resort is 192.168.100.1 to network 0.0.0.0

O IA  10.10.10.0/24 [110/2] via 192.168.1.2, 01:24:12, GigabitEthernet0/0/0 (CAMPUS_CORE)
O IA  10.20.20.0/24 [110/3] via 192.168.1.6, 01:24:12, GigabitEthernet0/0/1 (DATACENTER_VLAN)
O     172.16.1.0/28 [110/11] via 10.0.0.2, 00:45:09, GigabitEthernet0/1/0 (IPSEC_TUNNEL)
O IA  192.168.50.0/24 [110/2] via 192.168.1.10, 02:11:34, Port-channel1 (LACP 2Gbps Redondé)
[+] Statut FHRP : HSRP Active Gateway 192.168.10.254 (Priority 110, Preempt Active)`,

        'security-audit': `<span style="color:#f43f5e;">[RAPPORT DE DURCISSEMENT & AUDIT CYBERSÉCURITÉ L2/L3]</span>
[✓] Commutateur Accès L2 : Port-Security activé (Mode Violation Restrict, Max MAC = 2)
[✓] DHCP Snooping : Trusted Ports restreints aux liaisons montantes (Anti-Rogue DHCP)
[✓] Dynamic ARP Inspection (DAI) : Filtrage anti ARP Spoofing / Man-in-the-Middle actif
[✓] Spanning-Tree Guard : BPDU Guard & Root Guard déployés sur interfaces de bordure
[✓] Tunnel IPsec Site-à-Site : Phase 1 ISAKMP DH Group 14, Phase 2 ESP AES-256 / SHA-256
[✓] Cloisonnement DMZ : Règles d'état Stateful interdisant les flux initiés de DMZ vers LAN`,

        'projects': `1. <span style="color:#00f0ff;">01-SSO-Federation-Keycloak</span> (Mémoire M2 RESI / Groupe ISI) - IAM Souverain & SAML/OIDC
2. <span style="color:#00f0ff;">02-Reseaux-Cisco-Huawei</span> - Cœur OSPFv2, HSRP, LACP, VoIP CME, QoS
3. <span style="color:#00f0ff;">03-Securite-Systemes-Reseaux</span> - Durcissement L2, VPN IPsec Site-à-Site, DMZ
4. <span style="color:#00f0ff;">04-DevOps-Conteneurisation</span> - Docker Multi-Stage non-root, CI/CD Actions
5. <span style="color:#00f0ff;">05-Developpement-Mobile-Flutter</span> - App multiplateforme Material 3 & Provider
6. <span style="color:#00f0ff;">Infrastructure VMware vSphere HA</span> - ESXi, vCenter, SAN iSCSI, vMotion`,

        'certs': `<span style="color:#10b981;">[RÉFÉRENTIELS ET VALIDATIONS OFFICIELLES]</span>
• Cisco CCNA 1 : Introduction to Networks (ITN) -> <a href="docs/CCNA1.pdf" target="_blank" style="color:#38bdf8;">Voir PDF</a>
• Cisco CCNA 2 : Switching, Routing and Wireless (SRWE) -> <a href="docs/CCNA2.pdf" target="_blank" style="color:#38bdf8;">Voir PDF</a>
• Cisco CCNA 3 : Enterprise Networking, Security and Automation (ENSA) -> <a href="docs/CCNA3.pdf" target="_blank" style="color:#38bdf8;">Voir PDF</a>
• Diplôme Universitaire : Licence Informatique & Gestion -> <a href="docs/Diplome Licence.pdf" target="_blank" style="color:#38bdf8;">Voir PDF</a>`,

        'contact': `Coordonnées Directes :
• Email : <a href="mailto:ababacarousmane@outlook.com" style="color:#38bdf8;">ababacarousmane@outlook.com</a>
• Téléphone & WhatsApp : <a href="tel:+221781481291" style="color:#38bdf8;">+221 78 148 12 91</a>
• Profil LinkedIn : <a href="https://www.linkedin.com/in/ababacar-ousmane-niang-117419233/" target="_blank" style="color:#38bdf8;">linkedin.com/in/ababacar-ousmane-niang</a>
• Localisation : Axe Diamniadio - Dakar, Sénégal (Disponible)`,

        'download-cv': `Téléchargement du CV en cours... <br>Consultez directement le document : <a href="docs/CV_updated.pdf" target="_blank" style="color:#00f0ff; text-decoration:underline;">Ouvrir CV_updated.pdf</a>`
    };

    function executeCommand(rawCmd) {
        const cmd = rawCmd.trim().toLowerCase();
        if (!cmd) return;

        // Ajouter la commande tapée
        const cmdLine = document.createElement('div');
        cmdLine.className = 'terminal-line';
        cmdLine.innerHTML = `<span class="terminal-prompt">ababacar@simen-core:~$</span> ${escapeHtml(rawCmd)}`;
        terminalOutput?.appendChild(cmdLine);

        // Traiter
        if (cmd === 'clear' || cmd === 'cls') {
            if (terminalOutput) terminalOutput.innerHTML = '';
        } else if (cmd === 'cat sso.spec' || cmd === 'cat-sso' || cmd === 'sso') {
            printResponse(terminalCommands['cat-sso']);
        } else if (cmd === 'show ip route' || cmd === 'show-ip-route' || cmd === 'ip route' || cmd === 'route') {
            printResponse(terminalCommands['show-ip-route']);
        } else if (cmd === 'security-audit' || cmd === 'audit' || cmd === 'security') {
            printResponse(terminalCommands['security-audit']);
        } else if (cmd === 'download cv' || cmd === 'download-cv' || cmd === 'cv') {
            printResponse(terminalCommands['download-cv']);
            window.open('docs/CV_updated.pdf', '_blank');
        } else if (terminalCommands[cmd]) {
            printResponse(terminalCommands[cmd]);
        } else {
            printResponse(`<span style="color:#ef4444;">bash: commande inconnue: "${escapeHtml(rawCmd)}".</span> Tapez <span style="color:#00f0ff;">help</span> pour voir les commandes disponibles.`);
        }

        if (terminalOutput) {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }

    function printResponse(html) {
        const respLine = document.createElement('div');
        respLine.className = 'terminal-line';
        respLine.style.color = '#cbd5e1';
        respLine.innerHTML = html;
        terminalOutput?.appendChild(respLine);
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = terminalInput.value;
                terminalInput.value = '';
                executeCommand(val);
            }
        });
    }

    // Boutons de raccourcis rapides dans le terminal
    document.querySelectorAll('.quick-cmd-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            const cmd = btn.getAttribute('data-cmd');
            if (cmd) executeCommand(cmd);
        });
    });

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    }

    // --- 6. SCHÉMA D'ARCHITECTURE INTERACTIF (BLUEPRINT) ---
    const blueprintNodes = document.querySelectorAll('.blueprint-node');
    const inspectorTitle = document.getElementById('inspector-title');
    const inspectorDesc = document.getElementById('inspector-desc');
    const inspectorChips = document.getElementById('inspector-chips');
    const inspectorSpecs = document.getElementById('inspector-specs');
    const inspectorBtn = document.getElementById('inspector-btn');

    const blueprintData = {
        'sso': {
            title: `<i class="fas fa-key" style="color: var(--accent-cyan);"></i> Cluster IAM Keycloak 24+ & Fédération d'Identités`,
            desc: `Infrastructure d'authentification centralisée souveraine conçue dans le cadre du mémoire de fin d'études Master 2 RESI (Groupe ISI Dakar). Élimination des silos applicatifs, interconnexion aux annuaires OpenLDAP/Active Directory, émission de jetons JWT asymétriques signés par clé privée RS256 et imposition de l'authentification multifacteur (MFA / WebAuthn).`,
            chips: ['Keycloak 24+', 'OpenLDAP', 'PostgreSQL 16', 'Docker Compose', 'JWT RS256', 'MFA / OTP'],
            specs: [
                `Protocole d'échange : OpenID Connect (OIDC / PKCE) & SAML 2.0`,
                `Chiffrement des sessions : TLS 1.3 avec algorithmes courbes elliptiques`,
                `Souveraineté : Hébergement local sans dépendance externe Cloud GAFAM`
            ],
            link: `https://github.com/Jiraya931/Professionnel/tree/main/01-SSO-Federation-Keycloak`
        },
        'network': {
            title: `<i class="fas fa-server" style="color: var(--accent-blue);"></i> Cœur de Réseau Résilient Cisco & Huawei`,
            desc: `Topologie 3-tiers à haute tolérance aux pannes (Cœur, Distribution, Accès). Routage dynamique OSPFv2 multi-zones avec découpage VLSM, haute disponibilité de passerelle par HSRP/VRRP avec tracking d'interfaces WAN et agrégation LACP 2 Gbps.`,
            chips: ['Cisco IOS', 'Huawei VRP', 'OSPFv2 Multi-Zones', 'HSRP / VRRP', 'EtherChannel LACP', 'VoIP CME', 'QoS DSCP'],
            specs: [
                `Redondance de passerelle : FHRP (HSRP actif avec priorité 110 et préemption)`,
                `Bande passante d'interconnexion : Port-Channel LACP 2 Gbps redondé`,
                `Priorisation VoIP : Marquage DSCP EF (Expedited Forwarding) et CoS 5`
            ],
            link: `https://github.com/Jiraya931/Professionnel/tree/main/02-Reseaux-Cisco-Huawei`
        },
        'security': {
            title: `<i class="fas fa-shield-halved" style="color: var(--accent-rose);"></i> Cybersécurité Périmétrique, IPsec & Filtrage L2/L3`,
            desc: `Principe de défense en profondeur : neutralisation des attaques de commutation (ARP Spoofing, Rogue DHCP, MAC Flooding), tunnel chiffré VPN IPsec Site-à-Site en CLI Cisco IOS (IKEv1/v2, AES-256) et isolation DMZ par pare-feu d'état.`,
            chips: ['Port-Security', 'DHCP Snooping', 'Dynamic ARP Inspection', 'VPN IPsec AES-256', 'IKEv2', 'DMZ Firewall'],
            specs: [
                `Chiffrement VPN : Phase 1 ISAKMP DH Group 14 + Phase 2 ESP AES-256 / SHA-256`,
                `Protection L2 : Port-Security mode Restrict + DHCP Snooping sur ports d'accès`,
                `Cloisonnement DMZ : Zéro flux initié du sous-réseau public vers le LAN interne`
            ],
            link: `https://github.com/Jiraya931/Professionnel/tree/main/03-Securite-Systemes-Reseaux`
        },
        'virt': {
            title: `<i class="fas fa-cubes-stacked" style="color: var(--accent-indigo);"></i> Datacenter Virtualisé VMware vSphere HA & Proxmox`,
            desc: `Clustering d'hyperviseurs de production ESXi administrés sous vCenter Server avec stockage centralisé partagé SAN/iSCSI. Tolérance aux pannes matérielles (vSphere HA), migration à chaud sans interruption vMotion et grappes Proxmox VE.`,
            chips: ['VMware ESXi', 'vCenter Server', 'vSphere HA/DRS', 'vMotion', 'SAN / iSCSI', 'Proxmox VE', 'LXC'],
            specs: [
                `Haute Disponibilité : Redémarrage automatique des VM en cas de crash hôte (HA)`,
                `Stockage partagé : Baie SAN iSCSI multipathing pour tolérance de lien`,
                `Segmentation réseau : Port groups dédiés Management, vMotion et Production`
            ],
            link: `https://github.com/Jiraya931/Professionnel#6-travaux-ding%C3%A9nierie-syst%C3%A8mes-virtualisation--supervision-dossier-acad%C3%A9mique-isi`
        }
    };

    blueprintNodes.forEach(node => {
        node.addEventListener('click', () => {
            blueprintNodes.forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            const key = node.getAttribute('data-node');
            const data = blueprintData[key];
            if (data && inspectorTitle && inspectorDesc && inspectorChips && inspectorSpecs) {
                inspectorTitle.innerHTML = data.title;
                inspectorDesc.textContent = data.desc;
                inspectorChips.innerHTML = data.chips.map(c => `<span class="tech-chip">${c}</span>`).join('');
                inspectorSpecs.innerHTML = data.specs.map(s => `<li><i class="fas fa-arrow-right" style="color: var(--accent-cyan); font-size: 0.75rem;"></i> ${s}</li>`).join('');
                if (inspectorBtn) inspectorBtn.href = data.link;
            }
        });
    });

    // --- 7. FILTRES & RECHERCHE DE PROJETS ---
    const filterPills = document.querySelectorAll('.filter-pill-btn');
    const projectCards = document.querySelectorAll('.project-card-star, .project-card-bento');
    const searchInput = document.getElementById('project-search');

    function applyProjectFilter() {
        const activeFilter = document.querySelector('.filter-pill-btn.active')?.getAttribute('data-filter') || 'all';
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const textContent = card.textContent.toLowerCase();

            const matchCat = (activeFilter === 'all' || category === activeFilter);
            const matchSearch = query === '' || textContent.includes(query);

            if (matchCat && matchSearch) {
                card.style.display = card.classList.contains('project-card-star') ? 'grid' : 'flex';
                setTimeout(() => { card.style.opacity = '1'; }, 30);
            } else {
                card.style.opacity = '0';
                card.style.display = 'none';
            }
        });
    }

    filterPills.forEach(btn => {
        btn.addEventListener('click', () => {
            filterPills.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyProjectFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', applyProjectFilter);
    }

    // --- 8. MODAL DÉTAILS DE PROJET ---
    const projectModal = document.getElementById('project-modal');
    const modalCloseBtn = projectModal ? projectModal.querySelector('.modal-close-icon') : null;
    const modalCloseBottomBtn = projectModal ? projectModal.querySelector('.modal-close-btn-bottom') : null;
    const modalGithubBtn = document.getElementById('modal-github-btn');

    const projectCatalog = {
        'sso-project': {
            title: `Solution SSO & Fédération d'Identités Souveraine`,
            category: `IAM & SÉCURITÉ (MÉMOIRE M2 RESI — GROUPE ISI)`,
            image: `assets/project_cyber_security.png`,
            desc: `Projet de fin d'études Master 2 RESI (Groupe ISI Dakar) : Conception et implémentation d'une infrastructure d'authentification centralisée souveraine. Déploiement d'un cluster Keycloak 24+ interconnecté à une base PostgreSQL et un annuaire OpenLDAP, avec jetons d'accès JWT RS256, authentification multifacteur (MFA) et contrôle d'accès RBAC/ABAC.`,
            techs: [`Keycloak 24+`, `OpenLDAP`, `PostgreSQL 16`, `Docker Compose`, `OpenID Connect (OIDC / PKCE)`, `SAML 2.0`, `JWT RS256`, `MFA / WebAuthn`],
            features: [
                `Authentification unique (SSO) multi-applications sans rupture de session`,
                `Fédération d'identités souveraine via OpenLDAP et annuaires d'entreprise`,
                `Génération et validation de jetons JWT asymétriques signés en RS256`,
                `Authentification multifacteur (MFA / OTP) obligatoire et politiques RBAC/ABAC`,
                `Stack reproductible prête à l'emploi (docker compose) et document d'architecture technique`
            ],
            github: `https://github.com/Jiraya931/Professionnel/tree/main/01-SSO-Federation-Keycloak`
        },
        'cisco-network-project': {
            title: `Ingénierie Réseaux Résilients Cisco & Huawei`,
            category: `RÉSEAUX & TÉLÉCOMS (CCNA / CCNP / HCIP)`,
            image: `assets/project_network_cisco.png`,
            desc: `Conception, dimensionnement et déploiement d'une architecture réseau multi-tiers (Cœur, Distribution, Accès) pour environnements de campus et datacenters. Implémentation du routage dynamique OSPFv2 VLSM multi-zones, redondance de passerelle FHRP (HSRP/VRRP), agrégation de liens EtherChannel LACP à 2 Gbps, segmentation par VLANs 802.1Q avec relais DHCP et priorisation des flux vocaux ToIP/VoIP (Cisco CME) via QoS.`,
            techs: [`Cisco IOS`, `Huawei VRP`, `OSPFv2 Multi-Zones`, `HSRP / VRRP`, `EtherChannel LACP`, `VLANs 802.1Q`, `Relais DHCP`, `VoIP CME`, `QoS (DSCP/CoS)`],
            features: [
                `Architecture 3-tiers à haute résilience sans point unique de rupture (SPOF)`,
                `Routage dynamique OSPFv2 inter-sites avec découpage VLSM optimisé`,
                `Haute disponibilité de passerelle par HSRP/VRRP avec tracking d'interfaces WAN`,
                `Agrégation de bande passante EtherChannel LACP (2 Gbps) entre commutateurs de distribution`,
                `Déploiement VoIP sous Cisco CME et priorisation de la qualité de service (DSCP/CoS)`,
                `Script d'injection CLI complet (cisco-core-routing.cfg) et maquettes Packet Tracer incluses`
            ],
            github: `https://github.com/Jiraya931/Professionnel/tree/main/02-Reseaux-Cisco-Huawei`
        },
        'security-hardening-project': {
            title: `Cybersécurité, Filtrage Avancé & Durcissement L2/L3`,
            category: `CYBERSÉCURITÉ & DURCISSEMENT (MASTER 1 RESI)`,
            image: `assets/project_cyber_security.png`,
            desc: `Mise en œuvre du principe de défense en profondeur sur les couches d'accès, d'interconnexion et de périmètre : neutralisation proactive des attaques de niveau 2 sur commutateurs, interconnexion chiffrée de sites distants par tunnel VPN IPsec Site-à-Site en CLI Cisco, et isolation étanche des flux au moyen d'une architecture DMZ (Zone Démilitarisée).`,
            techs: [`Port-Security`, `DHCP Snooping`, `Dynamic ARP Inspection (DAI)`, `VPN IPsec (IKEv1/v2)`, `Chiffrement AES-256`, `SHA-256`, `DH Group 14`, `DMZ Stateful Firewall`, `Cisco ASA`],
            features: [
                `Protection L2 contre les attaques Man-in-the-Middle (ARP Spoofing, Rogue DHCP, MAC Flooding)`,
                `Tunnel IPsec Site-à-Site chiffré en AES-256 avec négociation ISAKMP et Transform-Set ESP`,
                `Isolation DMZ interdisant tout flux initié de la zone publique vers l'intranet privé`,
                `Ateliers Packet Tracer complets vérifiés (.pka) avec contrôle de conformité CLI`
            ],
            github: `https://github.com/Jiraya931/Professionnel/tree/main/03-Securite-Systemes-Reseaux`
        },
        'devops-container-project': {
            title: `DevOps & Architecture Conteneurisée Multi-Tiers`,
            category: `DEVOPS & CLOUD (MASTER 2 RESI)`,
            image: `assets/project_web_app.png`,
            desc: `Industrialisation et sécurisation d'environnements applicatifs modernes sous Docker et Kubernetes. Démarche de durcissement (Container Hardening) via des multi-stage builds réduisant drastiquement l'empreinte mémoire et garantissant l'exécution sous utilisateur non-root. Segmentation réseau bi-tiers sous Docker Compose et automatisation continue par pipeline GitHub Actions.`,
            techs: [`Docker`, `Docker Compose`, `Multi-Stage Build`, `Container Hardening (non-root)`, `NGINX Reverse Proxy`, `Node.js`, `PostgreSQL 16`, `Redis`, `GitHub Actions (CI/CD)`, `AWS IAM & VPC`],
            features: [
                `Dockerfile multi-stage durci exécuté sous compte de service non-privilégié`,
                `Isolation réseau bi-zone (front-network exposé pour Nginx et back-network isolé pour PostgreSQL/Redis)`,
                `Pipeline GitHub Actions assurant la conformité, la validation des builds et le déploiement`,
                `Bonnes pratiques AWS IAM : politique de moindre privilège, rôles EC2 et obligation MFA`
            ],
            github: `https://github.com/Jiraya931/Professionnel/tree/main/04-DevOps-Conteneurisation`
        },
        'flutter-mobile-project': {
            title: `Application Mobile Multiplateforme (Flutter & Dart)`,
            category: `DÉVELOPPEMENT MOBILE (FLUTTER & DART)`,
            image: `05-Developpement-Mobile-Flutter/src/lib/assets/bienvenue.png`,
            desc: `Architecture logicielle et développement d'une application mobile multiplateforme respectant les spécifications Material Design 3 de Google. Découpage modulaire strict séparant la logique métier des composants visuels grâce au patron de conception Provider, avec gestion de thème dynamique jour/nuit persistante et parcours d'onboarding fluide.`,
            techs: [`Flutter SDK (3.7+)`, `Dart`, `Provider (State Management)`, `Material Design 3`, `SharedPreferences`, `Mobile UX/UI`],
            features: [
                `Gestion d'état réactive découplant la couche de données de l'arbre de widgets via Provider`,
                `Thématisation dynamique (ThemeProvider) avec bascule instantanée clair/sombre`,
                `Écrans d'intégration (OnboardingScreen) et d'accueil ergonomiques avec transitions fluides`,
                `Structure de code modulaire et compatible Android, iOS et exécution Web`
            ],
            github: `https://github.com/Jiraya931/Professionnel/tree/main/05-Developpement-Mobile-Flutter`
        },
        'vmware-project': {
            title: `Infrastructure Virtualisée VMware vSphere HA`,
            category: `SYSTÈMES & VIRTUALISATION`,
            image: `assets/project_web_app.png`,
            desc: `Conception et déploiement d'une architecture de virtualisation de datacenter en haute disponibilité sous VMware vSphere. Mise en grappe d'hyperviseurs ESXi supervisés par un serveur vCenter centralisé, interconnexion à un stockage partagé SAN/iSCSI et segmentation réseau par VLANs pour la tolérance aux pannes.`,
            techs: [`VMware vSphere`, `ESXi / vCenter Server`, `SAN / iSCSI`, `High Availability (HA/DRS)`, `VLANs 802.1Q`, `vMotion`],
            features: [
                `Grappe d'hyperviseurs ESXi managée de manière centralisée sous VMware vCenter`,
                `Stockage partagé en réseau avec basculement automatique en cas d'incident (vSphere HA)`,
                `Migration à chaud des machines virtuelles (vMotion) sans interruption de service`,
                `Segmentation réseau étanche entre flux d'administration, de stockage et de production`
            ],
            github: `https://github.com/Jiraya931/Professionnel#6-travaux-ding%C3%A9nierie-syst%C3%A8mes-virtualisation--supervision-dossier-acad%C3%A9mique-isi`
        }
    };

    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pId = btn.getAttribute('data-project');
            const data = projectCatalog[pId];
            if (data && projectModal) {
                document.getElementById('modal-title').textContent = data.title;
                document.getElementById('modal-category').textContent = data.category;
                
                const mImg = document.getElementById('modal-image');
                mImg.src = data.image;
                mImg.onerror = function() {
                    this.onerror = null;
                    this.src = 'assets/project_web_app.png';
                };

                document.getElementById('modal-desc').textContent = data.desc;
                document.getElementById('modal-techs').innerHTML = data.techs.map(t => `<span class="comp-tag">${t}</span>`).join('');
                document.getElementById('modal-features').innerHTML = data.features.map(f => `<li><i class="fas fa-circle-check" style="color: var(--accent-emerald);"></i> ${f}</li>`).join('');

                if (modalGithubBtn) {
                    modalGithubBtn.href = data.github || 'https://github.com/Jiraya931/Professionnel';
                }

                projectModal.classList.add('active');
            }
        });
    });

    function closeModals() {
        projectModal?.classList.remove('active');
        const pdfModal = document.getElementById('pdf-modal');
        if (pdfModal) {
            pdfModal.classList.remove('active');
            const pdfFrame = document.getElementById('pdf-frame');
            if (pdfFrame) pdfFrame.src = '';
        }
    }

    modalCloseBtn?.addEventListener('click', closeModals);
    modalCloseBottomBtn?.addEventListener('click', closeModals);

    // --- 9. MODAL VISUALISEUR PDF OFFICIEL ---
    const pdfModal = document.getElementById('pdf-modal');
    const pdfFrame = document.getElementById('pdf-frame');
    const pdfTitle = document.getElementById('pdf-modal-title');

    document.querySelectorAll('.btn-doc-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pdfUrl = btn.getAttribute('data-pdf');
            const title = btn.getAttribute('data-title') || 'Visualisation du Document';
            if (pdfUrl && pdfModal && pdfFrame) {
                pdfFrame.src = pdfUrl;
                if (pdfTitle) pdfTitle.textContent = title;
                pdfModal.classList.add('active');
            }
        });
    });

    const pdfCloseBtn = pdfModal?.querySelector('.modal-close-icon');
    pdfCloseBtn?.addEventListener('click', closeModals);

    // Fermeture des modaux au clic extérieur ou touche Échap
    window.addEventListener('click', (e) => {
        if (e.target === projectModal || e.target === pdfModal) {
            closeModals();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModals();
            closeCmdPalette();
        }
    });

    // --- 10. PALETTE DE COMMANDES (Ctrl+K) ---
    const cmdPalette = document.getElementById('cmd-palette');
    const triggerCmdPaletteBtn = document.getElementById('trigger-cmd-palette');
    const cmdSearchInput = document.getElementById('cmd-search-input');
    const cmdItems = document.querySelectorAll('.cmd-item');

    function openCmdPalette() {
        cmdPalette?.classList.add('active');
        cmdSearchInput?.focus();
    }

    function closeCmdPalette() {
        cmdPalette?.classList.remove('active');
        if (cmdSearchInput) cmdSearchInput.value = '';
        filterCmdItems('');
    }

    triggerCmdPaletteBtn?.addEventListener('click', openCmdPalette);

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            if (cmdPalette?.classList.contains('active')) {
                closeCmdPalette();
            } else {
                openCmdPalette();
            }
        }
    });

    cmdPalette?.addEventListener('click', (e) => {
        if (e.target === cmdPalette) closeCmdPalette();
    });

    function filterCmdItems(query) {
        cmdItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (query === '' || text.includes(query.toLowerCase())) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    cmdSearchInput?.addEventListener('input', (e) => {
        filterCmdItems(e.target.value);
    });

    cmdItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            closeCmdPalette();
            handleCmdAction(action);
        });
    });

    function handleCmdAction(action) {
        switch (action) {
            case 'goto-hero':
                document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'goto-blueprint':
                document.getElementById('blueprint')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'goto-skills':
                document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'goto-projects':
                document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'goto-timeline':
                document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'goto-vault':
                document.getElementById('vault')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'goto-contact':
                document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'open-cv':
                window.open('docs/CV_updated.pdf', '_blank');
                break;
            case 'toggle-theme':
                toggleTheme();
                break;
            case 'open-terminal':
                document.getElementById('terminal-section')?.scrollIntoView({ behavior: 'smooth' });
                terminalInput?.focus();
                break;
        }
    }

    // --- 11. COPIE RAPIDE DANS LE PRESSE-PAPIER & FEEDBACK ---
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const str = btn.getAttribute('data-copy');
            if (str) {
                navigator.clipboard.writeText(str).then(() => {
                    const original = btn.innerHTML;
                    btn.innerHTML = `<i class="fas fa-check" style="color: #10b981;"></i> Copié !`;
                    showToast(`Copié dans le presse-papier : ${str}`);
                    setTimeout(() => { btn.innerHTML = original; }, 2200);
                }).catch(() => {
                    showToast('Erreur lors de la copie', 'error');
                });
            }
        });
    });

    // --- 12. SYSTÈME DE TOAST NOTIFICATIONS ---
    function showToast(msg, type = 'success') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-item';
        if (type === 'error') {
            toast.style.borderColor = '#ef4444';
        }

        toast.innerHTML = `
            <i class="${type === 'error' ? 'fas fa-triangle-exclamation' : 'fas fa-circle-check'}" style="color: ${type === 'error' ? '#ef4444' : '#10b981'}; font-size: 1.1rem;"></i>
            <span>${msg}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- 13. CANVAS DE RÉSEAU DE NŒUDS FLUIDE ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 140 };

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        class NodeParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.radius = Math.random() * 1.8 + 1;
                this.vx = (Math.random() - 0.5) * 0.55;
                this.vy = (Math.random() - 0.5) * 0.55;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                if (mouse.x !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const angle = Math.atan2(dy, dx);
                        const force = (mouse.radius - dist) / mouse.radius;
                        this.x -= Math.cos(angle) * force * 1.5;
                        this.y -= Math.sin(angle) * force * 1.5;
                    }
                }
            }

            draw() {
                ctx.fillStyle = 'rgba(0, 240, 255, 0.45)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initNodes() {
            particles = [];
            const count = Math.min(Math.floor(window.innerWidth / 22), 65);
            for (let i = 0; i < count; i++) {
                particles.push(new NodeParticle());
            }
        }

        function renderNetwork() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120) {
                        const alpha = (1 - dist / 120) * 0.16;
                        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(renderNetwork);
        }

        initNodes();
        renderNetwork();
    }

    // Menu Mobile Toggle
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            const isOpen = navMenu.style.display === 'flex';
            if (isOpen) {
                navMenu.style.display = 'none';
            } else {
                navMenu.style.display = 'flex';
                navMenu.style.flexDirection = 'column';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '70px';
                navMenu.style.left = '1.5rem';
                navMenu.style.right = '1.5rem';
                navMenu.style.background = '#0b1120';
                navMenu.style.padding = '1.25rem';
                navMenu.style.borderRadius = '16px';
                navMenu.style.border = '1px solid rgba(0,240,255,0.3)';
                navMenu.style.boxShadow = '0 15px 35px rgba(0,0,0,0.8)';
            }
        });
    }
});
