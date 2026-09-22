/* ==========================================================================
   PORTFOLIO INTERACTIVE LOGIC & ANIMATIONS (script.js)
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
            const sectionTop = section.offsetTop - 120;
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
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 0.5) * 0.8;
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
                ctx.fillStyle = 'rgba(99, 102, 241, 0.6)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);
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

                    if (distance < 120) {
                        const opacity = 1 - (distance / 120);
                        ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.2})`;
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
            'Stagiaire au SIMEN (Systèmes & Réseaux)',
            'Master 2 RESI — ISI Dakar',
            'Spécialiste Réseaux & CCNP ENCOR',
            'Sécurité & Fédération d\'Identités SSO',
            'Cloud HCIP Huawei & DevOps'
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

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500; // Pause before typing new word
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
                        const increment = Math.ceil(target / 40);
                        const timer = setInterval(() => {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            stat.textContent = current + suffix;
                        }, 40);
                    });
                }
            });
        }, { threshold: 0.5 });

        counterObserver.observe(statsSection);
    }

    // --- 7. Portfolio Projects Filter & Search ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('project-search');

    function filterProjects() {
        const activeCategory = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('.project-title')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';

            const matchesCategory = (activeCategory === 'all' || category === activeCategory);
            const matchesSearch = title.includes(searchTerm) || desc.includes(searchTerm);

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
                }, 300);
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

    const projectData = {
        'sso-project': {
            title: `Solution SSO & Fédération d'Identités`,
            category: `Sécurité & Systèmes (Mémoire M2)`,
            image: `assets/project_cyber_security.png`,
            description: `Projet de mémoire Master 2 RESI (ISI Dakar) : Étude, conception et mise en œuvre d'un système d'authentification unique (SSO) centralisé avec fédération d'identités pour sécuriser les accès aux applications d'entreprise.`,
            technologies: [`Keycloak`, `OAuth2 / OpenID Connect`, `SAML 2.0`, `LDAP / Active Directory`, `Docker & Nginx`],
            features: [
                `Authentification unique (Single Sign-On) multi-applications`,
                `Fédération d'identités sécurisée via SAML 2.0 / OpenID Connect`,
                `Annuaire d'entreprise centralisé avec OpenLDAP / Active Directory`,
                `Journalisation et audit de sécurité des accès utilisateur`
            ]
        },
        'vmware-project': {
            title: `Infrastructure Virtualisée VMware vSphere HA`,
            category: `Systèmes & Virtualisation`,
            image: `assets/project_web_app.png`,
            description: `Conception et déploiement d'une architecture vSphere en haute disponibilité avec hôtes ESXi, serveur vCenter, stockage partagé SAN/iSCSI et segmentation réseau par VLANs.`,
            technologies: [`VMware vSphere`, `ESXi / vCenter`, `SAN / iSCSI`, `VLANs`, `High Availability`],
            features: [
                `Virtualisation et clusters ESXi supervisés par vCenter`,
                `Stockage centralisé partagé et tolérance aux pannes (vSphere HA/DRS)`,
                `Segmentation réseau sécurisée et règles d'isolation`,
                `Gestion des sauvegardes et snapshots automatisés`
            ]
        },
        'aws-terraform': {
            title: `Automatisation Cloud AWS & Terraform (IaC)`,
            category: `Cloud & DevOps`,
            image: `assets/project_cyber_security.png`,
            description: `Déploiement et sécurisation d'infrastructures cloud sur Amazon Web Services (AWS). Provisioning automatisé par code (Infrastructure as Code) via Terraform et gestion stricte des droits IAM.`,
            technologies: [`AWS (EC2, VPC, IAM)`, `Terraform (IaC)`, `Linux Admin`, `Bash Scripting`, `Git / GitHub`],
            features: [
                `Provisioning automatisé d'instances EC2 Linux/Windows via Terraform`,
                `Configuration de réseaux virtuels VPC, sous-réseaux et tables de routage`,
                `Gestion des identités et politiques de sécurité avec AWS IAM`,
                `Déploiement reproductible et sécurisé par code`
            ]
        },
        'firewall-vpn': {
            title: `Sécurisation d'Infrastructure - Pare-feu ASA & VPN`,
            category: `Sécurité & Réseaux`,
            image: `assets/project_network_cisco.png`,
            description: `Configuration et déploiement d'un pare-feu Cisco ASA et mise en place de tunnels VPN IPsec site-à-site pour l'interconnexion sécurisée d'agences distantes.`,
            technologies: [`Cisco ASA`, `VPN IPsec`, `GNS3 / EVE-NG`, `ACLs & NAT`, `L2 Security`],
            features: [
                `Filtrage dynamique des flux réseau avec pare-feu Cisco ASA`,
                `Tunnels de chiffrement VPN IPsec site-à-site pour interconnexions distantes`,
                `Protection de niveau 2 (Port Security, DHCP Snooping, DAI)`,
                `Validation et simulations poussées sous GNS3 / EVE-NG`
            ]
        },
        'edge-iot': {
            title: `Sécurité & Architecture Edge Computing`,
            category: `Systèmes & Edge (Chef d'équipe)`,
            image: `assets/project_cyber_security.png`,
            description: `Conception d'une architecture Edge Computing segmentée avec des listes de contrôle d'accès (ACL) pour sécuriser les flux et héberger une plateforme IoT industrielle. Pilotage d'une équipe de 6 personnes.`,
            technologies: [`Edge Computing`, `IoT Platform`, `ACL Security`, `Management (6 pers.)`, `Linux Server`],
            features: [
                `Calcul et traitement de données au plus près de la source (Edge)`,
                `Segmentation stricte des flux et sécurité réseau via ACLs`,
                `Hébergement et déploiement d'une plateforme d'analytique IoT`,
                `Gestion de projet et leadership d'une équipe technique de 6 personnes`
            ]
        },
        'huawei-datacom': {
            title: `Système Campus d'Entreprise - Huawei HCIA`,
            category: `Réseaux & Datacom`,
            image: `assets/project_network_cisco.png`,
            description: `Projet complet en équipe : étude des besoins, ingénierie et déploiement d'un réseau campus d'entreprise multi-étages sur équipements Huawei selon le référentiel HCIA-Datacom.`,
            technologies: [`Huawei Datacom`, `Routage OSPF`, `VLANs / Trunking`, `DHCP & NAT`, `ACLs`],
            features: [
                `Architecture de commutation multi-niveaux (Cœur, Distribution, Accès)`,
                `Configuration des VLANs, Spanning Tree et inter-VLAN routing`,
                `Attribution dynamique IP via DHCP et routage dynamique OSPF`,
                `Traduction d'adresses NAT et filtrage de sécurité par ACL`
            ]
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
                document.getElementById('modal-image').src = data.image;
                document.getElementById('modal-desc').textContent = data.description;

                const techContainer = document.getElementById('modal-techs');
                techContainer.innerHTML = data.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('');

                const featuresContainer = document.getElementById('modal-features');
                featuresContainer.innerHTML = data.features.map(f => `<li><i class="fas fa-check-circle" style="color: var(--accent-emerald);"></i> ${f}</li>`).join('');

                projectModal.classList.add('active');
            }
        });
    });

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            projectModal.classList.remove('active');
        });
    }

    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                projectModal.classList.remove('active');
            }
        });
    }

    // --- Document PDF Preview Modal ---
    const pdfModal = document.getElementById('pdf-modal');
    const pdfFrame = document.getElementById('pdf-frame');
    const pdfTitle = document.getElementById('pdf-modal-title');

    document.querySelectorAll('.btn-doc-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const pdfPath = btn.getAttribute('data-pdf');
            const title = btn.getAttribute('data-title') || 'Document';
            if (pdfPath) {
                if (pdfFrame) pdfFrame.src = pdfPath;
                if (pdfTitle) pdfTitle.textContent = title;
                if (pdfModal) pdfModal.classList.add('active');
            }
        });
    });

    if (pdfModal) {
        const closePdfBtn = pdfModal.querySelector('.modal-close-btn');
        if (closePdfBtn) {
            closePdfBtn.addEventListener('click', () => {
                pdfModal.classList.remove('active');
                if (pdfFrame) pdfFrame.src = '';
            });
        }
        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) {
                pdfModal.classList.remove('active');
                if (pdfFrame) pdfFrame.src = '';
            }
        });
    }

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


    // --- 9. Contact Form & Clipboard Copy ---
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
                showToast('Merci ! Votre message a été envoyé avec succès.');
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Envoyer le message';
            }, 1200);
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

    // --- 10. Toast Notification System ---
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
        }, 3500);
    }
});
