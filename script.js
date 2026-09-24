/* ==========================================================================
   PORTFOLIO INTERACTIVE LOGIC & ANIMATIONS (script.js)
   Ababacar Ousmane Niang - Portfolio d'Ingénierie
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Theme Toggle (Dark / Light) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    
    // Check saved theme or default to dark
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('portfolio-theme', newTheme);
            updateThemeIcon(newTheme);
            showToast(`Mode ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === 'light') {
            themeIcon.className = 'fas fa-moon';
        } else {
            themeIcon.className = 'fas fa-sun';
        }
    }

    // --- 2. Navbar Scroll & Scrollspy ---
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }

        // Scrollspy
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 140;
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

    // --- 3. Particle Canvas Background ---
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 120 };

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.7;
                this.speedY = (Math.random() - 0.5) * 0.7;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

                // Mouse interaction
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= Math.cos(angle) * force * 2;
                    this.y -= Math.sin(angle) * force * 2;
                }
            }

            draw() {
                ctx.fillStyle = 'rgba(99, 102, 241, 0.55)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const particleCount = Math.min(Math.floor(window.innerWidth / 16), 75);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function connectParticles() {
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 115) {
                        const opacity = 1 - (distance / 115);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.18})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            connectParticles();
            requestAnimationFrame(animateCanvas);
        }

        initParticles();
        animateCanvas();
    }

    // --- 4. Typing Effect for Hero Title ---
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        const phrases = [
            'Stagiaire en Administration Systèmes, Réseaux & Sécurité (SIMEN)',
            'Master 2 Réseaux & Systèmes Informatiques — ISI Dakar',
            'Spécialiste Réseaux Cisco CCNA & Huawei Datacenter',
            'Architecte IAM & Fédération SSO (Keycloak)',
            'Praticien DevOps, Conteneurisation & Cybersécurité'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 40 : 85;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2200; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 450; // Pause before typing next phrase
            }

            setTimeout(type, typeSpeed);
        }

        type();
    }

    // --- 5. Skills Tab Switcher ---
    const tabBtns = document.querySelectorAll('.skill-tab-btn');
    const tabContents = document.querySelectorAll('.skill-category-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.add('active');
                animateSkillBars(targetContent);
            }
        });
    });

    function animateSkillBars(container = document) {
        const progressBars = container.querySelectorAll('.skill-progress');
        progressBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-progress') || '85%';
            bar.style.width = targetWidth;
        });
    }

    // Trigger initial progress bar animation on scroll
    const skillsSection = document.getElementById('skills');
    if (skillsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeCategory = document.querySelector('.skill-category-content.active');
                    if (activeCategory) animateSkillBars(activeCategory);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        observer.observe(skillsSection);
    }

    // --- 6. Number Counter Animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let counted = false;

    const statsSection = document.querySelector('.stats-bar');
    if (statsSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !counted) {
                    counted = true;
                    statNumbers.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-count') || '0', 10);
                        const suffix = stat.getAttribute('data-suffix') || '';
                        let current = 0;
                        const increment = Math.max(1, Math.ceil(target / 30));
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            stat.textContent = current + (suffix.startsWith(' ') ? suffix : ' ' + suffix);
                        }, 40);
                    });
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(statsSection);
    }

    // --- 7. Portfolio Projects Filter & Search ---
    const filterBtns = document.querySelectorAll('.portfolio-filter-bar .filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('project-search');

    function filterProjects() {
        const activeCategory = document.querySelector('.portfolio-filter-bar .filter-btn.active')?.getAttribute('data-filter') || 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';
            const techTags = Array.from(card.querySelectorAll('.tech-tag')).map(t => t.textContent.toLowerCase()).join(' ');

            const matchesCategory = (activeCategory === 'all' || category === activeCategory);
            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm) || techTags.includes(searchTerm);

            if (matchesCategory && matchesSearch) {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px) scale(0.95)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 250);
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterProjects();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', filterProjects);
    }

    // --- 8. Project Details Modal ---
    const projectModal = document.getElementById('project-modal');
    const modalCloseBtn = projectModal ? projectModal.querySelector('.modal-close-btn') : null;
    const modalCloseBottomBtn = projectModal ? projectModal.querySelector('.modal-close-btn-bottom') : null;
    const modalGithubBtn = document.getElementById('modal-github-btn');

    const projectData = {
        'sso-project': {
            title: `Solution SSO & Fédération d'Identités Souveraine`,
            category: `IAM & Sécurité (Mémoire M2 / SIMEN)`,
            image: `assets/project_cyber_security.png`,
            description: `Projet de fin d'études Master 2 RESI réalisé dans le cadre du SIMEN (Système Intégré de Management de l'Éducation Nationale) : Conception et implémentation d'une infrastructure d'authentification centralisée souveraine. Déploiement d'un cluster Keycloak 24+ interconnecté à une base PostgreSQL et un annuaire OpenLDAP, avec jetons d'accès JWT RS256, authentification multifacteur (MFA) et contrôle d'accès RBAC/ABAC.`,
            technologies: [`Keycloak 24+`, `OpenLDAP`, `PostgreSQL`, `Docker Compose`, `OpenID Connect (OIDC / PKCE)`, `SAML 2.0`, `JWT RS256`, `MFA / WebAuthn`],
            features: [
                `Authentification unique (SSO) multi-applications sans rupture de session`,
                `Fédération d'identités souveraine via OpenLDAP et annuaires d'entreprise`,
                `Génération et validation de jetons JWT asymétriques signés en RS256`,
                `Authentification multifacteur (MFA / OTP) obligatoire et politiques RBAC/ABAC`,
                `Stack reproductible prête à l'emploi (docker compose) et document d'architecture technique`
            ],
            githubUrl: `https://github.com/Jiraya931/Professionnel/tree/main/01-SSO-Federation-Keycloak`
        },
        'cisco-network-project': {
            title: `Ingénierie Réseaux Résilients Cisco & Huawei`,
            category: `Réseaux & Télécoms (CCNA / CCNP / HCIP)`,
            image: `assets/project_network_cisco.png`,
            description: `Conception, dimensionnement et déploiement d'une architecture réseau multi-tiers (Cœur, Distribution, Accès) pour environnements de campus et datacenters. Implémentation du routage dynamique OSPFv2 VLSM multi-zones, redondance de passerelle FHRP (HSRP/VRRP), agrégation de liens EtherChannel LACP à 2 Gbps, segmentation par VLANs 802.1Q avec relais DHCP et priorisation des flux vocaux ToIP/VoIP (Cisco CME) via QoS.`,
            technologies: [`Cisco IOS`, `Huawei VRP`, `OSPFv2 Multi-Zones`, `HSRP / VRRP`, `EtherChannel LACP`, `VLANs 802.1Q`, `Relais DHCP`, `VoIP CME`, `QoS (DSCP/CoS)`],
            features: [
                `Architecture 3-tiers à haute résilience sans point unique de rupture (SPOF)`,
                `Routage dynamique OSPFv2 inter-sites avec découpage VLSM optimisé`,
                `Haute disponibilité de passerelle par HSRP/VRRP avec tracking d'interfaces WAN`,
                `Agrégation de bande passante EtherChannel LACP (2 Gbps) entre commutateurs de distribution`,
                `Déploiement VoIP sous Cisco CME et priorisation de la qualité de service (DSCP/CoS)`,
                `Script d'injection CLI complet (cisco-core-routing.cfg) et maquettes Packet Tracer incluses`
            ],
            githubUrl: `https://github.com/Jiraya931/Professionnel/tree/main/02-Reseaux-Cisco-Huawei`
        },
        'security-hardening-project': {
            title: `Cybersécurité, Filtrage Avancé & Durcissement L2/L3`,
            category: `Cybersécurité & Systèmes (Master 1 RESI)`,
            image: `assets/project_cyber_security.png`,
            description: `Mise en œuvre du principe de défense en profondeur sur les couches d'accès, d'interconnexion et de périmètre : neutralisation proactive des attaques de niveau 2 sur commutateurs, interconnexion chiffrée de sites distants par tunnel VPN IPsec Site-à-Site en CLI Cisco, et isolation étanche des flux au moyen d'une architecture DMZ (Zone Démilitarisée).`,
            technologies: [`Port-Security`, `DHCP Snooping`, `Dynamic ARP Inspection (DAI)`, `VPN IPsec (IKEv1/v2)`, `Chiffrement AES-256`, `SHA-256`, `DH Group 14`, `DMZ Stateful Firewall`, `Cisco ASA`],
            features: [
                `Protection L2 contre les attaques Man-in-the-Middle (ARP Spoofing, Rogue DHCP, MAC Flooding)`,
                `Tunnel IPsec Site-à-Site chiffré en AES-256 avec négociation ISAKMP et Transform-Set ESP`,
                `Isolation DMZ interdisant tout flux initié de la zone publique vers l'intranet privé`,
                `Ateliers Packet Tracer complets vérifiés (.pka) avec contrôle de conformité CLI`
            ],
            githubUrl: `https://github.com/Jiraya931/Professionnel/tree/main/03-Securite-Systemes-Reseaux`
        },
        'devops-container-project': {
            title: `DevOps & Architecture Conteneurisée Multi-Tiers`,
            category: `DevOps & Cloud (Master 2 RESI)`,
            image: `assets/project_web_app.png`,
            description: `Industrialisation et sécurisation d'environnements applicatifs modernes sous Docker et Kubernetes. Démarche de durcissement (Container Hardening) via des multi-stage builds réduisant drastiquement l'empreinte mémoire et garantissant l'exécution sous utilisateur non-root. Segmentation réseau bi-tiers sous Docker Compose et automatisation continue par pipeline GitHub Actions.`,
            technologies: [`Docker`, `Docker Compose`, `Multi-Stage Build`, `Container Hardening (non-root)`, `NGINX Reverse Proxy`, `Node.js`, `PostgreSQL 16`, `Redis`, `GitHub Actions (CI/CD)`, `AWS IAM & VPC`],
            features: [
                `Dockerfile multi-stage durci exécuté sous compte de service non-privilégié`,
                `Isolation réseau bi-zone (front-network exposé pour Nginx et back-network isolé pour PostgreSQL/Redis)`,
                `Pipeline GitHub Actions assurant la conformité, la validation des builds et le déploiement`,
                `Bonnes pratiques AWS IAM : politique de moindre privilège, rôles EC2 et obligation MFA`
            ],
            githubUrl: `https://github.com/Jiraya931/Professionnel/tree/main/04-DevOps-Conteneurisation`
        },
        'flutter-mobile-project': {
            title: `Application Mobile Multiplateforme (Flutter & Dart)`,
            category: `Développement Mobile (Flutter & Dart)`,
            image: `05-Developpement-Mobile-Flutter/src/lib/assets/bienvenue.png`,
            description: `Architecture logicielle et développement d'une application mobile multiplateforme respectant les spécifications Material Design 3 de Google. Découpage modulaire strict séparant la logique métier des composants visuels grâce au patron de conception Provider, avec gestion de thème dynamique jour/nuit persistante et parcours d'onboarding fluide.`,
            technologies: [`Flutter SDK (3.7+)`, `Dart`, `Provider (State Management)`, `Material Design 3`, `SharedPreferences`, `Mobile UX/UI`],
            features: [
                `Gestion d'état réactive découplant la couche de données de l'arbre de widgets via Provider`,
                `Thématisation dynamique (ThemeProvider) avec bascule instantanée clair/sombre`,
                `Écrans d'intégration (OnboardingScreen) et d'accueil ergonomiques avec transitions fluides`,
                `Structure de code modulaire et compatible Android, iOS et exécution Web`
            ],
            githubUrl: `https://github.com/Jiraya931/Professionnel/tree/main/05-Developpement-Mobile-Flutter`
        },
        'vmware-project': {
            title: `Infrastructure Virtualisée VMware vSphere HA`,
            category: `Systèmes & Virtualisation`,
            image: `assets/project_web_app.png`,
            description: `Conception et déploiement d'une architecture de virtualisation de datacenter en haute disponibilité sous VMware vSphere. Mise en grappe d'hyperviseurs ESXi supervisés par un serveur vCenter centralisé, interconnexion à un stockage partagé SAN/iSCSI et segmentation réseau par VLANs pour la tolérance aux pannes.`,
            technologies: [`VMware vSphere`, `ESXi / vCenter Server`, `SAN / iSCSI`, `High Availability (HA/DRS)`, `VLANs 802.1Q`, `vMotion`],
            features: [
                `Grappe d'hyperviseurs ESXi managée de manière centralisée sous VMware vCenter`,
                `Stockage partagé en réseau avec basculement automatique en cas d'incident (vSphere HA)`,
                `Migration à chaud des machines virtuelles (vMotion) sans interruption de service`,
                `Segmentation réseau étanche entre flux d'administration, de stockage et de production`
            ],
            githubUrl: `https://github.com/Jiraya931/Professionnel`
        }
    };

    document.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.getAttribute('data-project');
            const data = projectData[projectId];

            if (data && projectModal) {
                document.getElementById('modal-title').textContent = data.title;
                document.getElementById('modal-category').textContent = data.category;
                
                const modalImg = document.getElementById('modal-image');
                modalImg.src = data.image;
                modalImg.onerror = function() {
                    this.onerror = null;
                    this.src = 'assets/project_web_app.png';
                };

                document.getElementById('modal-desc').textContent = data.description;

                const techContainer = document.getElementById('modal-techs');
                techContainer.innerHTML = data.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('');

                const featuresContainer = document.getElementById('modal-features');
                featuresContainer.innerHTML = data.features.map(f => `<li><i class="fas fa-check-circle" style="color: var(--accent-emerald);"></i> ${f}</li>`).join('');

                if (modalGithubBtn) {
                    modalGithubBtn.href = data.githubUrl || 'https://github.com/Jiraya931/Professionnel';
                }

                projectModal.classList.add('active');
            }
        });
    });

    function closeProjectModal() {
        if (projectModal) {
            projectModal.classList.remove('active');
        }
    }

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeProjectModal);
    }
    if (modalCloseBottomBtn) {
        modalCloseBottomBtn.addEventListener('click', closeProjectModal);
    }
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                closeProjectModal();
            }
        });
    }

    // --- 9. Document PDF Preview Modal & Filter ---
    const pdfModal = document.getElementById('pdf-modal');
    const pdfFrame = document.getElementById('pdf-frame');
    const pdfTitle = document.getElementById('pdf-modal-title');

    document.querySelectorAll('.btn-doc-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const pdfPath = btn.getAttribute('data-pdf');
            const title = btn.getAttribute('data-title') || 'Visualisation du Document';
            if (pdfPath) {
                if (pdfFrame) pdfFrame.src = pdfPath;
                if (pdfTitle) pdfTitle.textContent = title;
                if (pdfModal) pdfModal.classList.add('active');
            }
        });
    });

    function closePdfModal() {
        if (pdfModal) {
            pdfModal.classList.remove('active');
            if (pdfFrame) pdfFrame.src = '';
        }
    }

    if (pdfModal) {
        const closePdfBtn = pdfModal.querySelector('.modal-close-btn');
        if (closePdfBtn) {
            closePdfBtn.addEventListener('click', closePdfModal);
        }
        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) {
                closePdfModal();
            }
        });
    }

    // Global Escape Key Listener for Modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProjectModal();
            closePdfModal();
        }
    });

    // Document Filter Buttons
    const docFilterBtns = document.querySelectorAll('.doc-filter-btn');
    const docCards = document.querySelectorAll('.doc-card');

    docFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            docFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-doc-filter');

            docCards.forEach(card => {
                const docCategory = card.getAttribute('data-doc-category');
                if (filter === 'all' || docCategory === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // --- 10. Contact Form & Clipboard Copy ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('form-name').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();

            if (!name || !email || !message) {
                showToast('Veuillez remplir tous les champs obligatoires.', 'error');
                return;
            }

            // Simulate form submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

            setTimeout(() => {
                showToast('Merci ! Votre message a été enregistré avec succès.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer le message';
            }, 1000);
        });
    }

    // Copy to clipboard helper
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const textToCopy = btn.getAttribute('data-copy');
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    showToast(`Copié dans le presse-papier : ${textToCopy}`);
                }).catch(() => {
                    showToast('Erreur lors de la copie', 'error');
                });
            }
        });
    });

    // --- 11. Toast Notification System ---
    function showToast(message, type = 'success') {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        if (type === 'error') {
            toast.style.borderLeftColor = 'var(--accent-pink)';
        }

        toast.innerHTML = `
            <i class="${type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle'}" style="color: ${type === 'error' ? 'var(--accent-pink)' : 'var(--accent-emerald)'}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
});
