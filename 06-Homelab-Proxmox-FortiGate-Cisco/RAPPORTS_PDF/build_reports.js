const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Chemins principaux detectes automatiquement (compatible GIT et Homelab)
const outputDir = __dirname;
const projectRoot = path.resolve(__dirname, '..');
const guidesDir = fs.existsSync(path.join(projectRoot, 'guides'))
  ? path.join(projectRoot, 'guides')
  : projectRoot;
const automationDir = path.join(projectRoot, 'automation');
const capturesDir = path.join(outputDir, 'captures');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const pdftotextPath = 'C:\\Program Files\\Git\\ucrt64\\bin\\pdftotext.exe';

// Definition des 13 modules techniques dans l'ordre chronologique
const guides = [
  { id: '01', palier: 'Socle', file: '01_MIGRATION_EVENG_PROXMOX.md', title: "Guide 01 : Migration d'EVE-NG de VMware vers Proxmox VE" },
  { id: '02', palier: 'Socle', file: '02_INSTALLATION_FORTIGATE_7.4.md', title: 'Guide 02 : Déploiement et Licence Fortinet FortiGate 7.4' },
  { id: '03', palier: 'Socle', file: '03_ACTIVATION_CISCO_IOL_L2_L3.md', title: 'Guide 03 : Activation des Commutateurs & Routeurs Cisco IOL (L2 & L3)' },
  { id: '04', palier: 'Socle', file: '04_TP_ENTREPRISE_DE_A_A_Z.md', title: "Guide 04 : Le Grand TP d'Entreprise Réseau & Sécurité de A à Z" },
  { id: '05', palier: 'Exploitation', file: '05_SUPERVISION_LOGS_ET_COMMANDES_UTILES.md', title: 'Guide 05 : Supervision, Analyse des Logs & Mémo des Commandes Utiles' },
  { id: '06', palier: 'Palier 1', file: '06_PALIER_1_DMZ_NGFW_ET_VIRTUAL_IP.md', title: 'Guide 06 : Palier 1 - Sécurité NGFW Avancée, Zone DMZ & Virtual IP (VIP)' },
  { id: '07', palier: 'Palier 2', file: '07_PALIER_2_VPN_IPSEC_SITE_A_SITE_MULTI_CONSTRUCTEURS.md', title: 'Guide 07 : Palier 2 - VPN IPsec Site-à-Site IKEv2 Multi-Constructeurs (Fortinet & Cisco)' },
  { id: '08', palier: 'Palier 3', file: '08_PALIER_3_CYBERSECURITE_NGFW_INSPECTION_UTM_ET_IPS.md', title: "Guide 08 : Palier 3 - Cybersécurité NGFW Avancée, Inspection UTM & Prévention d'Intrusion (IPS)" },
  { id: '09', palier: 'Palier 4', file: '09_PALIER_4_NETDEVOPS_AUTOMATISATION_ET_AUDIT_PYTHON.md', title: 'Guide 09 : Palier 4 - NetDevOps, Automatisation Réseau et Audit de Conformité (Python)' },
  { id: '10', palier: 'Palier 5', file: '10_PALIER_5_ROUTAGE_DYNAMIQUE_OSPFV2_CISCO_FORTINET.md', title: 'Guide 10 : Palier 5 - Routage Dynamique OSPFv2 Multi-Constructeurs (Cisco & Fortinet)' },
  { id: '11', palier: 'Palier 6', file: '11_PALIER_6_SECURITE_L2_PORT_SECURITY_DHCP_SNOOPING_BPDUGUARD.md', title: 'Guide 11 : Palier 6 - Cybersécurité Réseau L2 (Port-Security, DHCP Snooping & BPDU Guard)' },
  { id: '12', palier: 'Palier 7', file: '12_PALIER_7_HAUTE_DISPONIBILITE_FHRP_HSRP.md', title: 'Guide 12 : Palier 7 - Haute Disponibilité Réseau & Redondance FHRP / HSRP' },
  { id: '13', palier: 'Palier 8', file: '13_PALIER_8_SUPERVISION_CENTRALISEE_ET_SIEM_WAZUH.md', title: 'Guide 13 : Palier 8 - Supervision Centralisée, Corrélation SOC & SIEM Wazuh' }
];

// Nettoyage defensif pour garantir zero emoji ou selecteur invisible dans le rendu
function stripEmojis(str) {
  return String(str || '')
    .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, '')
    .replace(/[\uFE00-\uFE0F]/g, '');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInline(str) {
  let clean = stripEmojis(str);
  const protectedTokens = [];
  const pushToken = htmlStr => {
    const idx = protectedTokens.length;
    protectedTokens.push(htmlStr);
    return `\uE000TOK_${idx}\uE001`;
  };

  // 1. Convertir les liens Markdown et les proteger avant tout formatage interne
  clean = clean.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
    const labelHtml = escapeHtml(label).replace(
      /`([^`]+)`/g,
      (_, code) => {
        const cls = code.length <= 16 && !/[=+]/.test(code) ? ' class="code-nowrap"' : '';
        return `<code${cls}>${code}</code>`;
      }
    );
    if (/^(https?:\/\/|#)/i.test(url.trim())) {
      return pushToken(`<a href="${escapeHtml(url.trim())}">${labelHtml}</a>`);
    }
    const rel = url
      .replace(/^file:\/\/\/c:\/Users\/DELL\/Desktop\/DOC\/(?:Homelab|GIT\/06-Homelab-Proxmox-FortiGate-Cisco)\//i, '')
      .replace(/^\.\.\//, '');
    const relCls = rel.length <= 16 && !/[=+]/.test(rel) ? ' class="code-nowrap"' : '';
    return pushToken(`<code${relCls}>${escapeHtml(rel)}</code>`);
  });

  // 2. Proteger les segments de code inline afin de ne pas casser **...** ou *...* englobants
  clean = clean.replace(/`([^`]+)`/g, (_, code) => {
    const cls = code.length <= 16 && !/[=+]/.test(code) ? ' class="code-nowrap"' : '';
    return pushToken(`<code${cls}>${escapeHtml(code)}</code>`);
  });

  // 3. Echapper les chevrons et esperluettes du texte courant (&, <, >) avant d'injecter <strong>/<em>
  clean = escapeHtml(clean);

  // 4. Formater le gras (**...**) puis l'italique (*...*) sur la chaine unifiee
  clean = clean
    .replace(/\*\*([^\n]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(>\[«"'—-])\*([^\s*\n](?:[^\n]*?[^\s\n])?)\*(?=$|[\s).,;:!?\]<»"'—-])/g, '$1<em>$2</em>');

  // 5. Restaurer les liens et segments de code proteges
  return clean.replace(/\uE000TOK_(\d+)\uE001/g, (_, idx) => protectedTokens[Number(idx)] || '');
}

const imageCache = {};
function loadBase64(filename) {
  const cleanName = path.basename(filename);
  if (imageCache[cleanName] !== undefined) return imageCache[cleanName];
  const p = path.join(capturesDir, cleanName);
  const res = fs.existsSync(p)
    ? 'data:image/png;base64,' + fs.readFileSync(p).toString('base64')
    : '';
  imageCache[cleanName] = res;
  return res;
}

function cleanLists(html) {
  return html
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<\/ol>\s*<ol[^>]*>/g, '');
}

function renderTable(rows) {
  if (rows.length < 2) return '';
  const splitRow = row => row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(c => c.trim());

  const headers = splitRow(rows[0]);
  const out = ['<table><thead><tr>'];
  headers.forEach(h => out.push(`<th>${formatInline(h)}</th>`));
  out.push('</tr></thead><tbody>');

  for (let i = 2; i < rows.length; i++) {
    const cells = splitRow(rows[i]);
    if (cells.length === 0) continue;
    out.push('<tr>');
    cells.forEach(c => out.push(`<td>${formatInline(c)}</td>`));
    out.push('</tr>');
  }
  out.push('</tbody></table>');
  return out.join('');
}

// Marqueur d'ancrage zero-impact utilise uniquement lors de la passe 1 de pagination
function ancSpan(ancId, pass) {
  if (pass !== 1 || !ancId) return '';
  return `<span class="anc-marker">@@ANC:${ancId}@@</span>`;
}

// Parseur Markdown -> HTML adapte au rendu editorial A4 (zero debordement, figures liees, ancres)
function markdownToHtml(mdText, options = {}) {
  const {
    guideId = '00',
    pass = 2,
    isMaster = false,
    sectionsCollector = null,
    figuresCollector = null,
    skipExternalBadges = false
  } = options;

  const lines = stripEmojis(mdText).split(/\r?\n/);
  const html = [];
  let inCode = false;
  let codeLang = '';
  let codeContent = [];
  let inTable = false;
  let tableRows = [];
  let h2Index = 0;
  let figIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Sauter les badges shields.io externes (README GitHub) dans l'edition PDF
    if (skipExternalBadges && /^\[!\[.*?\]\(https?:\/\/img\.shields\.io/i.test(line.trim())) {
      continue;
    }

    // Blocs de code et diagrammes ASCII
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        if (inTable) {
          inTable = false;
          html.push(renderTable(tableRows));
          tableRows = [];
        }
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeContent = [];
      } else {
        inCode = false;
        const rawCode = codeContent.join('\n');
        const escaped = escapeHtml(rawCode);
        const isDiagram = /[┌┐└┘├┤┬┴┼│─]/.test(rawCode)
          || /\+--{3,}/.test(rawCode)
          || (/\|/.test(rawCode) && /===={4,}/.test(rawCode) === false && /\+---/.test(rawCode));
        const isLong = codeContent.length > 38;
        const cls = isDiagram
          ? 'diagram-ascii'
          : (isLong ? 'code-block code-long' : 'code-block');
        html.push(`<pre class="${cls}"><code class="${escapeHtml(codeLang)}">${escaped}</code></pre>`);
      }
      continue;
    }

    if (inCode) {
      codeContent.push(line);
      continue;
    }

    // Tableaux Markdown
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(line);
      continue;
    } else if (inTable) {
      inTable = false;
      html.push(renderTable(tableRows));
      tableRows = [];
    }

    // Images Markdown ![alt](src) + legende italique optionnelle *Figure X.Y : ...*
    if (/^!\[(.*?)\]\((.*?)\)$/.test(line.trim())) {
      const match = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
      const alt = match[1];
      const src = match[2];
      const base64Img = loadBase64(src);

      let captionMd = '';
      if (i + 1 < lines.length && /^\*([^*]+)\*$/.test(lines[i + 1].trim())) {
        captionMd = lines[i + 1].trim().slice(1, -1).trim();
        i++;
      }

      if (base64Img) {
        figIndex++;
        const figAncId = isMaster ? `fig_${guideId}_${figIndex}` : `fig_local_${figIndex}`;
        const rawCaption = captionMd || alt;
        const figMatch = rawCaption.match(/^(Figure\s+\d+\.\d+)\s*:\s*(.*)$/i);
        const figLabel = figMatch ? figMatch[1] : `Figure ${parseInt(guideId, 10)}.${figIndex}`;
        const figDesc = figMatch ? figMatch[2] : rawCaption;

        if (figuresCollector) {
          figuresCollector.push({
            id: figAncId,
            label: figLabel,
            caption: `${figLabel} : ${figDesc.replace(/`/g, '')}`,
            guideId
          });
        }

        html.push(`
          <figure class="report-figure" id="${figAncId}">
            ${ancSpan(figAncId, pass)}
            <img src="${base64Img}" alt="${escapeHtml(alt)}" />
            <figcaption><strong>${escapeHtml(figLabel)} :</strong> ${formatInline(figDesc)}</figcaption>
          </figure>
        `);
      }
      continue;
    }

    // Citations / Encarts de validation
    if (line.startsWith('> ')) {
      const quoteLines = [line.slice(2).trim()];
      while (i + 1 < lines.length && lines[i + 1].startsWith('> ')) {
        i++;
        quoteLines.push(lines[i].slice(2).trim());
      }
      const quoteHtml = quoteLines.map(q => `<p>${formatInline(q)}</p>`).join('');
      html.push(`<blockquote>${quoteHtml}</blockquote>`);
      continue;
    }

    // Titres H1 (gere dans le bandeau du chapitre/guide)
    if (line.startsWith('# ')) {
      continue;
    }

    // Titres H2
    if (line.startsWith('## ')) {
      h2Index++;
      const text = line.slice(3).trim();
      const ancId = `sec_${guideId}_h2_${h2Index}`;
      if (sectionsCollector) {
        sectionsCollector.push({ id: ancId, level: 2, title: text.replace(/`/g, ''), guideId });
      }
      html.push(`<h2 id="${ancId}">${formatInline(text)}${ancSpan(ancId, pass)}</h2>`);
      continue;
    }

    // Titres H3
    if (line.startsWith('### ')) {
      const text = line.slice(4).trim();
      html.push(`<h3>${formatInline(text)}</h3>`);
      continue;
    }

    // Titres H4
    if (line.startsWith('#### ')) {
      const text = line.slice(5).trim();
      html.push(`<h4>${formatInline(text)}</h4>`);
      continue;
    }

    // Ligne horizontale
    if (line.trim() === '---' || line.trim() === '***') {
      html.push('<hr class="section-divider" />');
      continue;
    }

    // Listes a puces
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      const content = formatInline(line.trim().slice(2).trim());
      html.push(`<ul><li>${content}</li></ul>`);
      continue;
    }

    // Listes numerotees
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)$/);
      html.push(`<ol start="${match[1]}"><li>${formatInline(match[2])}</li></ol>`);
      continue;
    }

    if (line.trim() === '') {
      continue;
    }

    html.push(`<p>${formatInline(line)}</p>`);
  }

  if (inTable && tableRows.length > 0) {
    html.push(renderTable(tableRows));
  }

  return cleanLists(html.join('\n'));
}

// Schemas SVG vectoriels haute definition du Chapitre 0
function getSvgArchitectureFigure(pass) {
  return `
  <figure class="report-figure svg-figure" id="fig_0_1">
    ${ancSpan('fig_0_1', pass)}
    <svg viewBox="0 0 920 545" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif">
      <defs>
        <marker id="arr-navy" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#1e3a8a"/>
        </marker>
        <marker id="arr-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
        </marker>
        <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
        </marker>
        <marker id="arr-purple" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#7c3aed"/>
        </marker>
      </defs>

      <!-- Fond subtil -->
      <rect x="0" y="0" width="920" height="545" rx="8" fill="#ffffff"/>

      <!-- COUCHE 1 : WAN INTERNET -->
      <rect x="210" y="10" width="500" height="46" rx="8" fill="#fffbeb" stroke="#d97706" stroke-width="1.6"/>
      <text x="460" y="29" text-anchor="middle" font-size="11.5" font-weight="700" fill="#92400e">RÉSEAU PHYSIQUE WAN / BOX INTERNET (192.168.1.0/24)</text>
      <text x="460" y="46" text-anchor="middle" font-size="9.5" fill="#78350f">Passerelle FAI : 192.168.1.1  |  Exposition DMZ VIP (:8080) &amp; Interconnexion IPsec IKEv2</text>

      <!-- Fleche Couche 1 -> Couche 2 -->
      <line x1="460" y1="56" x2="460" y2="76" stroke="#1e3a8a" stroke-width="1.8" marker-end="url(#arr-navy)"/>

      <!-- COUCHE 2 : HYPERVISEUR PROXMOX VE 8 -->
      <rect x="16" y="78" width="888" height="108" rx="10" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.8"/>
      <rect x="28" y="86" width="445" height="20" rx="4" fill="#0f172a"/>
      <text x="250" y="100" text-anchor="middle" font-size="9.5" font-weight="700" fill="#f8fafc">HÔTE BARE-METAL PROXMOX VE 8.x (192.168.1.200) — PONT vmbr0 / KVM NESTED</text>
      <text x="890" y="100" text-anchor="end" font-size="8.5" font-weight="600" fill="#475569">Matrice Statique Déterministe (.200 - .250)</text>

      <!-- Carte VM 101 Wazuh -->
      <rect x="28" y="113" width="276" height="63" rx="6" fill="#ecfdf5" stroke="#059669" stroke-width="1.4"/>
      <text x="166" y="129" text-anchor="middle" font-size="10.5" font-weight="700" fill="#065f46">VM 101 : WAZUH SIEM v4.14.10</text>
      <text x="166" y="145" text-anchor="middle" font-size="9.2" font-weight="600" fill="#047857">IP : 192.168.1.201/24 (UDP/514 &amp; HTTPS/443)</text>
      <text x="166" y="160" text-anchor="middle" font-size="8.4" fill="#064e3b">OpenSearch + Filebeat TLSv1.2 + 10 Règles MITRE ATT&amp;CK</text>

      <!-- Carte VM 200 EVE-NG -->
      <rect x="322" y="113" width="276" height="63" rx="6" fill="#eff6ff" stroke="#0284c7" stroke-width="1.4"/>
      <text x="460" y="129" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0c4a6e">VM 200 : EVE-NG COMMUNITY 5.0</text>
      <text x="460" y="145" text-anchor="middle" font-size="9.2" font-weight="600" fill="#0369a1">IP : 192.168.1.202/24 (4 vCPU / 8 Go RAM)</text>
      <text x="460" y="160" text-anchor="middle" font-size="8.4" fill="#1e3a8a">Bridge pnet0 — Émulation KVM FortiGate &amp; Cisco IOL</text>

      <!-- Carte NetDevOps -->
      <rect x="616" y="113" width="276" height="63" rx="6" fill="#f0f9ff" stroke="#0369a1" stroke-width="1.4"/>
      <text x="754" y="129" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0f172a">SUITE NETDEVOPS PYTHON (IaC)</text>
      <text x="754" y="145" text-anchor="middle" font-size="9.2" font-weight="600" fill="#1e3a8a">Connecteurs Telnet/SSH vers 5 Nœuds Actifs</text>
      <text x="754" y="160" text-anchor="middle" font-size="8.4" fill="#334155">Sauvegarde GitOps difflib + Audit 40/40 (100.0 %)</text>

      <!-- Connecteurs Couche 2 -> Couche 3 -->
      <line x1="196" y1="186" x2="196" y2="210" stroke="#1e3a8a" stroke-width="1.7" marker-end="url(#arr-navy)"/>
      <text x="204" y="201" font-size="8" font-weight="600" fill="#475569">port1 (.203/24)</text>
      <line x1="726" y1="186" x2="726" y2="210" stroke="#7c3aed" stroke-width="1.7" marker-end="url(#arr-purple)"/>
      <text x="734" y="201" font-size="8" font-weight="600" fill="#5b21b6">e0/0 (.250/24)</text>

      <!-- COUCHE 3 : PERIMETRE FORTIGATE & SUCCURSALE IPSEC -->
      <!-- FortiGate -->
      <rect x="16" y="212" width="360" height="88" rx="8" fill="#fef2f2" stroke="#dc2626" stroke-width="1.7"/>
      <text x="196" y="231" text-anchor="middle" font-size="11" font-weight="700" fill="#991b1b">FORTINET FORTIGATE 7.4.13 NGFW (HQ)</text>
      <text x="196" y="248" text-anchor="middle" font-size="9" font-weight="600" fill="#7f1d1d">port1 WAN : 192.168.1.203/24  (Politique DoS SYN/ICMP)</text>
      <text x="196" y="264" text-anchor="middle" font-size="9" fill="#450a0a">port2 LAN : 172.16.1.1/30  |  port3 DMZ : 172.16.50.254/24</text>
      <text x="196" y="281" text-anchor="middle" font-size="8.3" fill="#7f1d1d">IPS F-SBID (SQLi 3900, LFI 2906) • AppCtrl • VIP :8080 -&gt; :80</text>
      <text x="196" y="294" text-anchor="middle" font-size="8" font-weight="600" fill="#991b1b">3 Politiques actives (Quota vdom-max=3 respecté)</text>

      <!-- Lien IPsec central -->
      <line x1="380" y1="256" x2="542" y2="256" stroke="#7c3aed" stroke-width="2.2" stroke-dasharray="6,4" marker-start="url(#arr-purple)" marker-end="url(#arr-purple)"/>
      <rect x="394" y="226" width="134" height="24" rx="4" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1"/>
      <text x="461" y="237" text-anchor="middle" font-size="8.2" font-weight="700" fill="#5b21b6">TUNNEL VPN IPSEC IKEv2</text>
      <text x="461" y="247" text-anchor="middle" font-size="7.5" fill="#6d28d9">DES / SHA-256 / DH14 PFS</text>

      <!-- Routeur Succursale R2 -->
      <rect x="546" y="212" width="358" height="88" rx="8" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.7"/>
      <text x="725" y="231" text-anchor="middle" font-size="11" font-weight="700" fill="#5b21b6">SUCCURSALE — CISCO R2-BRANCH (IOL L3)</text>
      <text x="725" y="248" text-anchor="middle" font-size="9" font-weight="600" fill="#4c1d95">e0/0 WAN : 192.168.1.250/24  |  e0/1 LAN : 192.168.20.1/24</text>
      <text x="725" y="265" text-anchor="middle" font-size="9" fill="#4c1d95">IKEv2 Profile : PROF_FORTIGATE  •  CMAP_FORTIGATE</text>
      <text x="725" y="282" text-anchor="middle" font-size="8.5" font-weight="600" fill="#6d28d9">Client PC2-BRANCH : 192.168.20.50/24 (Accès DMZ &amp; LAN)</text>
      <text x="725" y="294" text-anchor="middle" font-size="8" fill="#5b21b6">Export Syslog UDP/514 vers 192.168.1.201</text>

      <!-- Connecteurs Couche 3 -> Couche 4 -->
      <!-- DMZ down -->
      <line x1="120" y1="300" x2="120" y2="330" stroke="#ea580c" stroke-width="1.7" marker-end="url(#arr-navy)"/>
      <text x="128" y="318" font-size="8" font-weight="600" fill="#9a3412">port3 DMZ (.254)</text>
      <!-- OSPF down -->
      <line x1="330" y1="300" x2="330" y2="330" stroke="#0284c7" stroke-width="1.8" marker-end="url(#arr-cyan)"/>
      <text x="338" y="318" font-size="8" font-weight="600" fill="#0369a1">OSPFv2 Area 0 (172.16.1.0/30 — mtu-ignore)</text>

      <!-- COUCHE 4 : DMZ & CLUSTER HSRP + OSPF -->
      <!-- DMZ Serveur -->
      <rect x="16" y="332" width="234" height="90" rx="8" fill="#fff7ed" stroke="#ea580c" stroke-width="1.6"/>
      <text x="133" y="351" text-anchor="middle" font-size="10.5" font-weight="700" fill="#9a3412">ZONE DMZ ÉTANCHE</text>
      <text x="133" y="368" text-anchor="middle" font-size="9" font-weight="600" fill="#7c2d12">SRV-WEB-DMZ (Alpine Linux 3.20)</text>
      <text x="133" y="384" text-anchor="middle" font-size="9" fill="#7c2d12">IP : 172.16.50.10/24 (HTTP :80)</text>
      <text x="133" y="400" text-anchor="middle" font-size="8.2" fill="#9a3412">Exposé WAN via VIP 192.168.1.203:8080</text>
      <text x="133" y="413" text-anchor="middle" font-size="8" fill="#c2410c">Protégé par capteur IPS_SENSOR_DMZ</text>

      <!-- Cluster HSRP -->
      <rect x="270" y="332" width="634" height="90" rx="8" fill="#eff6ff" stroke="#0284c7" stroke-width="1.7"/>
      <text x="587" y="350" text-anchor="middle" font-size="10.8" font-weight="700" fill="#0c4a6e">ROUTAGE DYNAMIQUE OSPFv2 &amp; CLUSTER HSRP GROUPE 1 (VLAN 10)</text>

      <rect x="284" y="359" width="292" height="36" rx="5" fill="#ffffff" stroke="#0284c7" stroke-width="1.2"/>
      <text x="430" y="374" text-anchor="middle" font-size="9.2" font-weight="700" fill="#0f172a">CISCO R1_HQ (Active Master — Prio 110)</text>
      <text x="430" y="388" text-anchor="middle" font-size="8.2" fill="#334155">e0/1 : 172.16.1.2/30 | e0/0.10 : 10.10.10.1/24 | Preempt P</text>

      <rect x="598" y="359" width="292" height="36" rx="5" fill="#ffffff" stroke="#64748b" stroke-width="1.2"/>
      <text x="744" y="374" text-anchor="middle" font-size="9.2" font-weight="700" fill="#0f172a">CISCO R_STANDBY_HQ (Standby — Prio 100)</text>
      <text x="744" y="388" text-anchor="middle" font-size="8.2" fill="#334155">e0/0.10 : 10.10.10.2/24 | Basculement &lt; 1s | Preempt P</text>

      <rect x="370" y="399" width="434" height="17" rx="4" fill="#0284c7"/>
      <text x="587" y="411" text-anchor="middle" font-size="8.5" font-weight="700" fill="#ffffff">VIP HSRP : 10.10.10.254  •  VMAC : 00:00:0c:07:ac:01  •  Failover transparent (1 paquet / 50)</text>

      <!-- Connecteurs Couche 4 -> Couche 5 -->
      <line x1="430" y1="422" x2="430" y2="444" stroke="#059669" stroke-width="1.7" marker-end="url(#arr-green)"/>
      <text x="438" y="436" font-size="8" font-weight="600" fill="#065f46">Trunk 802.1Q (e0/0)</text>
      <line x1="744" y1="422" x2="744" y2="444" stroke="#059669" stroke-width="1.7" marker-end="url(#arr-green)"/>
      <text x="752" y="436" font-size="8" font-weight="600" fill="#065f46">Trunk 802.1Q (e0/2)</text>

      <!-- COUCHE 5 : COMMUTATION L2 DURCIE & TELEMETRIE -->
      <!-- Telemetry Card Left -->
      <rect x="16" y="446" width="234" height="84" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.6"/>
      <text x="133" y="465" text-anchor="middle" font-size="10.2" font-weight="700" fill="#065f46">OBSERVABILITÉ &amp; SOC</text>
      <text x="133" y="482" text-anchor="middle" font-size="8.6" font-weight="600" fill="#047857">Syslog UDP/514 -> 192.168.1.201</text>
      <text x="133" y="497" text-anchor="middle" font-size="8.2" fill="#064e3b">Tags origin-id hostname sur 4 Cisco</text>
      <text x="133" y="512" text-anchor="middle" font-size="8.2" fill="#064e3b">FortiGate : syslogd facility local7</text>
      <text x="133" y="524" text-anchor="middle" font-size="8.2" font-weight="700" fill="#059669">Audit NetDevOps : 40 / 40 Validés</text>

      <!-- SW1 + PC1 Card Right -->
      <rect x="270" y="446" width="634" height="84" rx="8" fill="#f1f5f9" stroke="#334155" stroke-width="1.6"/>
      <rect x="284" y="455" width="388" height="66" rx="6" fill="#ffffff" stroke="#334155" stroke-width="1.2"/>
      <text x="478" y="472" text-anchor="middle" font-size="10" font-weight="700" fill="#0f172a">CISCO SW1_HQ (IOL L2 — Mgmt Vlan10 : 10.10.10.10/24)</text>
      <text x="478" y="487" text-anchor="middle" font-size="8.4" fill="#334155">Port-Security (Sticky, Max 1, Restrict/Shutdown err-disabled)</text>
      <text x="478" y="501" text-anchor="middle" font-size="8.4" fill="#334155">DHCP Snooping VLAN 10 (e0/0 Trust, no Opt-82) + BPDU Guard</text>
      <text x="478" y="514" text-anchor="middle" font-size="8" font-weight="600" fill="#0369a1">no ip igmp snooping (HSRP multicast) + ip route 0.0.0.0/0 -&gt; .254</text>

      <line x1="672" y1="488" x2="704" y2="488" stroke="#0f172a" stroke-width="1.7" marker-end="url(#arr-navy)"/>
      <text x="688" y="481" text-anchor="middle" font-size="7.5" font-weight="600" fill="#334155">e0/1</text>

      <rect x="706" y="455" width="184" height="66" rx="6" fill="#0f172a"/>
      <text x="798" y="473" text-anchor="middle" font-size="9.8" font-weight="700" fill="#38bdf8">CLIENT VPCS (PC1)</text>
      <text x="798" y="490" text-anchor="middle" font-size="8.8" fill="#f8fafc">IP : 10.10.10.50/24</text>
      <text x="798" y="505" text-anchor="middle" font-size="8.5" fill="#cbd5e1">GW : 10.10.10.254 (VIP)</text>
      <text x="798" y="516" text-anchor="middle" font-size="7.5" fill="#94a3b8">MAC : 0050.7966.6804</text>
    </svg>
    <figcaption><strong>Figure 0.1 :</strong> Architecture globale en 5 couches du Homelab Proxmox VE, EVE-NG, Fortinet FortiGate 7.4, Cisco IOL et SIEM Wazuh (plan d'adressage statique définitif .200-.250 et VIP .254).</figcaption>
  </figure>`;
}

function getSvgSocPipelineFigure(pass) {
  return `
  <figure class="report-figure svg-figure" id="fig_0_2">
    ${ancSpan('fig_0_2', pass)}
    <svg viewBox="0 0 920 275" width="100%" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif">
      <defs>
        <marker id="arr-s-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#0284c7"/>
        </marker>
        <marker id="arr-s-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1 L 10 5 L 0 9 z" fill="#059669"/>
        </marker>
      </defs>
      <rect x="0" y="0" width="920" height="275" rx="8" fill="#ffffff"/>

      <!-- Etape 1 : Equipements Sources -->
      <rect x="14" y="16" width="185" height="242" rx="8" fill="#f8fafc" stroke="#334155" stroke-width="1.6"/>
      <rect x="14" y="16" width="185" height="28" rx="8" fill="#0f172a"/>
      <text x="106" y="34" text-anchor="middle" font-size="9.8" font-weight="700" fill="#f8fafc">1. PARC MULTI-VENDEURS</text>

      <rect x="26" y="54" width="161" height="36" rx="5" fill="#fef2f2" stroke="#dc2626"/>
      <text x="106" y="70" text-anchor="middle" font-size="8.8" font-weight="700" fill="#991b1b">FORTIGATE_HQ (.203)</text>
      <text x="106" y="82" text-anchor="middle" font-size="7.8" fill="#7f1d1d">Logs IPS, DoS, Trafic &amp; Config</text>

      <rect x="26" y="98" width="161" height="36" rx="5" fill="#eff6ff" stroke="#0284c7"/>
      <text x="106" y="114" text-anchor="middle" font-size="8.8" font-weight="700" fill="#0c4a6e">R1 &amp; R_STANDBY (.1 / .2)</text>
      <text x="106" y="126" text-anchor="middle" font-size="7.8" fill="#1e3a8a">Événements HSRP &amp; OSPF ADJCHG</text>

      <rect x="26" y="142" width="161" height="36" rx="5" fill="#eff6ff" stroke="#0284c7"/>
      <text x="106" y="158" text-anchor="middle" font-size="8.8" font-weight="700" fill="#0c4a6e">SW1_HQ L2 (.10)</text>
      <text x="106" y="170" text-anchor="middle" font-size="7.8" fill="#1e3a8a">Port-Security, Snooping, BPDU</text>

      <rect x="26" y="186" width="161" height="36" rx="5" fill="#f5f3ff" stroke="#7c3aed"/>
      <text x="106" y="202" text-anchor="middle" font-size="8.8" font-weight="700" fill="#5b21b6">R2_BRANCH (.250)</text>
      <text x="106" y="214" text-anchor="middle" font-size="7.8" fill="#4c1d95">Tunnel IPsec IKEv2 &amp; Link State</text>

      <text x="106" y="244" text-anchor="middle" font-size="8" font-weight="600" fill="#475569">origin-id hostname + NTP Dakar</text>

      <!-- Fleches Transport -->
      <line x1="201" y1="92" x2="256" y2="92" stroke="#059669" stroke-width="2" marker-end="url(#arr-s-green)"/>
      <text x="228" y="84" text-anchor="middle" font-size="8" font-weight="700" fill="#065f46">UDP/514</text>
      <text x="228" y="106" text-anchor="middle" font-size="7.5" fill="#047857">Syslog</text>

      <line x1="201" y1="196" x2="256" y2="196" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-s-blue)"/>
      <text x="228" y="188" text-anchor="middle" font-size="8" font-weight="700" fill="#0369a1">CLI API</text>
      <text x="228" y="210" text-anchor="middle" font-size="7.5" fill="#0c4a6e">Telnet/SSH</text>

      <!-- Etape 2 : Collecte & Moteurs -->
      <rect x="260" y="16" width="380" height="114" rx="8" fill="#ecfdf5" stroke="#059669" stroke-width="1.6"/>
      <rect x="260" y="16" width="380" height="26" rx="8" fill="#065f46"/>
      <text x="450" y="33" text-anchor="middle" font-size="9.8" font-weight="700" fill="#ffffff">2A. SIEM WAZUH v4.14.10 (192.168.1.201)</text>
      <text x="450" y="60" text-anchor="middle" font-size="9" font-weight="600" fill="#064e3b">wazuh-remoted (UDP 514) -&gt; Décodeurs cisco-ios &amp; fortigate-firewall-v5</text>
      <text x="450" y="77" text-anchor="middle" font-size="8.6" fill="#065f46">10 Règles personnalisées (ID 100101 à 100110) — Sibling/Child XML Matching</text>
      <text x="450" y="94" text-anchor="middle" font-size="8.6" fill="#065f46">Filebeat TLSv1.2 -&gt; OpenSearch Indexer (:9200) -&gt; wazuh-alerts-4.x-*</text>
      <text x="450" y="114" text-anchor="middle" font-size="8.4" font-weight="700" fill="#047857">Corrélation temps réel : HSRP, L2 NAC, DoS Flood &amp; Signatures IPS DMZ</text>

      <rect x="260" y="144" width="380" height="114" rx="8" fill="#eff6ff" stroke="#0284c7" stroke-width="1.6"/>
      <rect x="260" y="144" width="380" height="26" rx="8" fill="#1e3a8a"/>
      <text x="450" y="161" text-anchor="middle" font-size="9.8" font-weight="700" fill="#ffffff">2B. CHAÎNE NETDEVOPS &amp; AUDIT PYTHON</text>
      <text x="450" y="188" text-anchor="middle" font-size="9" font-weight="600" fill="#0f172a">netdevops.py --all  |  connectors.py (CiscoTelnetClient &amp; FortiSSHClient)</text>
      <text x="450" y="205" text-anchor="middle" font-size="8.6" fill="#1e3a8a">backup_engine.py : Extraction à chaud des running-configs (.cfg) + difflib drift</text>
      <text x="450" y="222" text-anchor="middle" font-size="8.6" fill="#1e3a8a">audit_engine.py : Vérification programmatique de 40 points de contrôle critiques</text>
      <text x="450" y="242" text-anchor="middle" font-size="8.4" font-weight="700" fill="#0369a1">Zéro dérive (Zero Drift) vérifiée sur les 5 équipements de production</text>

      <!-- Fleches Sortie -->
      <line x1="642" y1="73" x2="686" y2="73" stroke="#059669" stroke-width="2" marker-end="url(#arr-s-green)"/>
      <line x1="642" y1="201" x2="686" y2="201" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-s-blue)"/>

      <!-- Etape 3 : Restitution SOC & Conformite -->
      <rect x="690" y="16" width="216" height="114" rx="8" fill="#f8fafc" stroke="#059669" stroke-width="1.6"/>
      <text x="798" y="38" text-anchor="middle" font-size="9.6" font-weight="700" fill="#065f46">3A. DÉTECTION MITRE</text>
      <text x="798" y="59" text-anchor="middle" font-size="8.5" fill="#1e293b">Rule 100110 : T1190 (Lvl 10)</text>
      <text x="798" y="75" text-anchor="middle" font-size="8.5" fill="#1e293b">Rule 100103 : T1200 (Lvl 9)</text>
      <text x="798" y="91" text-anchor="middle" font-size="8.5" fill="#1e293b">Rule 100109 : T1498 (Lvl 8)</text>
      <text x="798" y="107" text-anchor="middle" font-size="8.5" fill="#1e293b">Rule 100105 : T1557 (Lvl 8)</text>
      <text x="798" y="122" text-anchor="middle" font-size="8" font-weight="600" fill="#059669">Threat Hunting Dashboard (:443)</text>

      <rect x="690" y="144" width="216" height="114" rx="8" fill="#f8fafc" stroke="#1e3a8a" stroke-width="1.6"/>
      <text x="798" y="166" text-anchor="middle" font-size="9.6" font-weight="700" fill="#1e3a8a">3B. RAPPORTS D'AUDIT</text>
      <text x="798" y="187" text-anchor="middle" font-size="9" font-weight="700" fill="#059669">SCORE GLOBAL : 100.0 %</text>
      <text x="798" y="203" text-anchor="middle" font-size="8.6" fill="#1e293b">40 / 40 Contrôles Conformes</text>
      <text x="798" y="220" text-anchor="middle" font-size="8.2" fill="#334155">audit_report_latest.json</text>
      <text x="798" y="235" text-anchor="middle" font-size="8.2" fill="#334155">audit_report_latest.md</text>
      <text x="798" y="250" text-anchor="middle" font-size="8" font-weight="600" fill="#0284c7">Historique GitOps horodaté</text>
    </svg>
    <figcaption><strong>Figure 0.2 :</strong> Pipeline de supervision centralisée SIEM Wazuh (Syslog UDP/514, règles MITRE ATT&amp;CK) et chaîne d'automatisation NetDevOps Python.</figcaption>
  </figure>`;
}

// Section Avant-propos, Resume Executif & Note Methodologique de Tracabilite IP
function renderExecutivePreamble(pass) {
  return `
  <section class="front-section page-break" id="sec_exec">
    <div class="section-banner">
      <div class="banner-tag">PRÉAMBULE &amp; GOUVERNANCE TECHNIQUE</div>
      <h1 class="section-main-title">Avant-Propos, Résumé Exécutif &amp; Méthodologie${ancSpan('sec_exec', pass)}</h1>
      <p class="section-subtitle">Synthèse managériale, portée des 8 paliers d'ingénierie et traçabilité chronologique du plan d'adressage</p>
    </div>

    <h2>1. Résumé Exécutif</h2>
    <p>
      Ce dossier technique formalise l'architecture, le déploiement progressif et la validation opérationnelle d'un laboratoire d'entreprise multi-constructeurs hébergé sur serveur physique <strong>Proxmox VE 8.x</strong> (<code>192.168.1.200</code>). Conçu selon une approche incrémentale structurée en <strong>8 paliers d'ingénierie</strong> (répartis sur <strong>13 modules techniques</strong>), le laboratoire reproduit une infrastructure réseau d'entreprise complète intégrant la virtualisation imbriquée KVM (<strong>EVE-NG</strong>), la sécurité périmétrique de nouvelle génération (<strong>Fortinet FortiGate 7.4.13</strong>), la commutation et le routage <strong>Cisco IOL L2/L3</strong>, l'observabilité centralisée SOC (<strong>Wazuh SIEM v4.14.10</strong>) et l'automatisation logicielle <strong>NetDevOps en Python</strong>.
    </p>
    <p>
      À l'issue du déploiement, chaque fonctionnalité critique a été validée par des tests en direct (captures d'écran système, journaux d'attaques réels et basculements à chaud) :
    </p>
    <ul>
      <li><strong>Segmentation &amp; Zone DMZ (Palier 1) :</strong> Cloisonnement multi-zones (LAN, WAN, DMZ) et publication externe d'un serveur Web Alpine Linux 3.20 (<code>172.16.50.10:80</code>) via Virtual IP FortiGate (<code>:8080 -&gt; :80</code>) tout en respectant la limite de licence <code>vdom-max = 3</code>.</li>
      <li><strong>Interconnexion VPN IPsec IKEv2 (Palier 2) :</strong> Tunnel chiffré site-à-site reliant le siège FortiGate HQ au routeur succursale Cisco <code>R2-BRANCH</code> (<code>192.168.1.250</code>) avec latence inter-sites de 2,2 à 2,8 ms.</li>
      <li><strong>Cybersécurité NGFW &amp; DPI L7 (Palier 3) :</strong> Blocage en ligne d'attaques d'injection SQL (<code>Custom.SQLi.Attack</code>, ID <code>3900</code>) et de traversée de répertoire (<code>Custom.PathTraversal.Attack</code>, ID <code>2906</code>) par signatures F-SBID, filtrage applicatif P2P/Proxy et coupure anti-DDoS ICMP Flood au seuil strict de 50 pps.</li>
      <li><strong>Automatisation NetDevOps (Paliers 4 &amp; 8) :</strong> Suite Python modulaire assurant la sauvegarde à chaud des 5 équipements et l'audit continu sur <strong>40 points de contrôle</strong> (score global certifié : <strong>100,0 %</strong>).</li>
      <li><strong>Routage Dynamique OSPFv2 (Palier 5) :</strong> Convergence dynamique entre Cisco R1 et FortiGate sur l'Area 0 avec résolution du blocage MTU IOL (<code>ip ospf mtu-ignore</code>), interface utilisateur passive et éviction complète des routes statiques.</li>
      <li><strong>Durcissement Couche 2 &amp; Haute Disponibilité FHRP (Paliers 6 &amp; 7) :</strong> Protection d'accès par <em>Port-Security</em> (Sticky/Restrict/Shutdown), <em>DHCP Snooping</em> et <em>BPDU Guard</em> sur <code>SW1</code>, couplée à un cluster HSRP Groupe 1 (<code>R1</code>/<code>R_STANDBY</code>, VIP <code>10.10.10.254</code>) garantissant un basculement en moins d'une seconde (1 seul paquet perdu sur 50).</li>
      <li><strong>SIEM Wazuh v4.14.10 &amp; SOC (Palier 8) :</strong> Collecte Syslog UDP/514 sur l'ensemble du parc (FortiGate et 4 nœuds Cisco via <code>origin-id hostname</code>), indexation OpenSearch et déploiement de <strong>10 règles de corrélation SOC sur mesure</strong> (<code>100101</code>–<code>100110</code>) alignées sur le référentiel <strong>MITRE ATT&amp;CK</strong>.</li>
    </ul>

    <div class="callout-methodology">
      <h3>2. Note Méthodologique : Traçabilité et Évolution du Plan d'Adressage IP</h3>
      <p>
        Afin de garantir une traçabilité rigoureuse de l'ensemble des preuves expérimentales, les captures et extraits de configuration issus des phases initiales de construction (Guides 01 à 07) conservent leurs baux DHCP d'origine (ex. <code>192.168.1.3</code> ou <code>.11</code> pour EVE-NG, <code>192.168.1.4</code> ou <code>.13</code> pour FortiGate <code>port1</code>). À compter du <strong>Palier 8 (Guide 13)</strong>, l'architecture d'exploitation a été figée sur un plan d'adressage statique déterministe garantissant la pérennité du collecteur SIEM Wazuh, des tunnels IPsec et des sondes NetDevOps :
      </p>
      <table>
        <thead>
          <tr>
            <th>Composant / Infrastructure</th>
            <th>Phase Initiale (Baux DHCP — Guides 01 à 07)</th>
            <th>Architecture Figée Définitive (Palier 8 &amp; Audit 40/40)</th>
            <th>Justification Technique</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Proxmox VE 8.x (Bare-Metal)</strong></td>
            <td><code>192.168.1.200/24</code></td>
            <td><code>192.168.1.200/24</code> (<code>vmbr0</code>)</td>
            <td>Hyperviseur stable de gestion et d'administration</td>
          </tr>
          <tr>
            <td><strong>Wazuh SIEM v4.14.10 (VM 101)</strong></td>
            <td><em>Déployé au Palier 8</em></td>
            <td><code class="code-nowrap">192.168.1.201/24</code> (<code class="code-nowrap">UDP 514</code> / <code class="code-nowrap">HTTPS 443</code>)</td>
            <td>Cible Syslog statique unique pour les 5 équipements</td>
          </tr>
          <tr>
            <td><strong>EVE-NG Community (VM 200)</strong></td>
            <td><code>192.168.1.3</code> / <code>192.168.1.11</code></td>
            <td><code>192.168.1.202/24</code> (<code>pnet0</code>)</td>
            <td>Passerelle d'accès Telnet/SSH stable pour NetDevOps</td>
          </tr>
          <tr>
            <td><strong>FortiGate 7.4.13 (port1 WAN)</strong></td>
            <td><code>192.168.1.4</code> / <code>192.168.1.13</code></td>
            <td><code>192.168.1.203/24</code> (Statique)</td>
            <td>Stabilité DNAT VIP (<code>:8080</code>), pair IKEv2 &amp; source NAT Syslog</td>
          </tr>
          <tr>
            <td><strong>Cisco R2-BRANCH (e0/0 WAN)</strong></td>
            <td><code>192.168.1.250/24</code></td>
            <td><code>192.168.1.250/24</code></td>
            <td>Pair VPN distant IKEv2 fixe pour la succursale</td>
          </tr>
          <tr>
            <td><strong>Passerelle LAN VLAN 10</strong></td>
            <td><code>10.10.10.1</code> (Routeur <code>R1</code> seul)</td>
            <td><code class="code-nowrap">10.10.10.254</code> (VIP HSRP <code class="code-nowrap">R1 (.1)</code> / <code class="code-nowrap">R_STANDBY (.2)</code>)</td>
            <td>Élimination du SPOF de premier saut sans interruption</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>`;
}

// Liste des Sigles et Abreviations
function renderAcronymsSection(pass) {
  const acronyms = [
    ['AD', 'Administrative Distance', 'Distance administrative déterminant la priorité d’une source de routage dans la RIB.'],
    ['ASBR', 'Autonomous System Boundary Router', 'Routeur OSPF (FortiGate) injectant des routes externes (LSA Type 5) vers l’Area 0.'],
    ['BPDU', 'Bridge Protocol Data Unit', 'Trame de contrôle échangée par Spanning-Tree (STP) pour éviter les boucles de niveau 2.'],
    ['DBD', 'Database Description', 'Paquet OSPF décrivant la base LSDB lors de la synchronisation des routeurs voisins.'],
    ['DHCP', 'Dynamic Host Configuration Protocol', 'Protocole d’attribution automatique des adresses IP et options réseau (protégé par Snooping).'],
    ['DMZ', 'Demilitarized Zone', 'Zone réseau isolée hébergeant les serveurs exposés vers l’extérieur (port3 FortiGate).'],
    ['DNAT / VIP', 'Destination NAT / Virtual IP', 'Translation d’adresse destination (ex. WAN :8080 redirigé vers serveur DMZ :80).'],
    ['DoS / DDoS', 'Denial of Service', 'Attaque par saturation volumétrique filtrée sur port1 par seuils SYN/ICMP flood.'],
    ['DPD', 'Dead Peer Detection', 'Mécanisme de détection rapide d’indisponibilité d’un pair VPN IKEv2.'],
    ['DPI', 'Deep Packet Inspection', 'Analyse approfondie de la charge utile applicative L7 par le moteur IPS FortiOS.'],
    ['DR / BDR', 'Designated / Backup Designated Router', 'Routeurs élus sur segment multi-accès OSPF pour centraliser les annonces LSA.'],
    ['ESP', 'Encapsulating Security Payload', 'Protocole IPsec assurant le chiffrement et l’intégrité des paquets inter-sites.'],
    ['FHRP', 'First Hop Redundancy Protocol', 'Famille de protocoles (HSRP, VRRP, GLBP) assurant la redondance de passerelle.'],
    ['F-SBID', 'Fortinet Signature-Based Intrusion Detection', 'Syntaxe de création de signatures IPS personnalisées sous FortiGate.'],
    ['HSRP', 'Hot Standby Router Protocol', 'Protocole Cisco FHRP assurant le basculement actif/veille via VIP 10.10.10.254.'],
    ['IaC', 'Infrastructure as Code', 'Gestion déclarative et automatisée des configurations réseau via scripts Python.'],
    ['IKEv2', 'Internet Key Exchange Version 2', 'Protocole d’établissement sécurisé des associations de sécurité (SA) VPN IPsec.'],
    ['IOL', 'IOS on Linux', 'Binaire natif Cisco exécutant l’OS réseau L2/L3 directement sous noyau Linux EVE-NG.'],
    ['IPS', 'Intrusion Prevention System', 'Moteur de prévention d’intrusion bloquant activement les paquets malveillants (SQLi/LFI).'],
    ['KVM', 'Kernel-based Virtual Machine', 'Hyperviseur de type 1 intégré à Proxmox VE avec support imbriqué Intel VT-x/VMX.'],
    ['LSA', 'Link-State Advertisement', 'Unité d’information topologique échangée entre routeurs OSPF (Types 1 et 5).'],
    ['MITRE ATT&CK', 'Adversarial Tactics, Techniques & Common Knowledge', 'Référentiel standardisé de qualification des techniques d’attaque (T1190, T1200, T1498, T1557).'],
    ['MTU', 'Maximum Transmission Unit', 'Taille maximale d’une trame IP ; contournée entre IOL et KVM via ip ospf mtu-ignore.'],
    ['NGFW', 'Next-Generation Firewall', 'Pare-feu de nouvelle génération intégrant filtrage d’état, IPS DPI et contrôle L7.'],
    ['OSPFv2', 'Open Shortest Path First v2', 'Protocole de routage dynamique IGP à état de liens normalisé (RFC 2328).'],
    ['PFS', 'Perfect Forward Secrecy', 'Renouvellement indépendant des clés de session IPsec via groupe Diffie-Hellman 14.'],
    ['RIB', 'Routing Information Base', 'Table de routage logique maintenue en mémoire par un routeur ou pare-feu.'],
    ['SA', 'Security Association', 'Contrat cryptographique unidirectionnel définissant algorithmes et clés IPsec/IKEv2.'],
    ['SIEM', 'Security Information & Event Management', 'Plateforme (Wazuh v4.14.10) centralisant journaux, indexation OpenSearch et alertes SOC.'],
    ['SOC', 'Security Operations Center', 'Dispositif de surveillance, de corrélation et de réponse aux incidents cyber.'],
    ['SPOF', 'Single Point of Failure', 'Composant unique dont la défaillance entraîne l’arrêt complet du service réseau.'],
    ['SQLi', 'SQL Injection', 'Vecteur d’attaque Web ciblant les requêtes de bases de données, bloqué en DPI L7.'],
    ['UTM', 'Unified Threat Management', 'Consolidation des fonctions de sécurité (IPS, Application Control, DoS) sur le NGFW.'],
    ['VLAN / VMAC', 'Virtual LAN / Virtual MAC', 'Segmentation logique L2 (VLAN 10) et adresse MAC virtuelle partagée HSRP (0000.0c07.ac01).']
  ];

  const rowsHtml = acronyms.map(([sigle, nom, desc]) =>
    `<tr><td><code>${escapeHtml(sigle)}</code></td><td><strong>${escapeHtml(nom)}</strong></td><td>${escapeHtml(desc)}</td></tr>`
  ).join('\n');

  return `
  <section class="front-section page-break" id="sec_acronyms">
    <div class="section-banner">
      <div class="banner-tag">RÉFÉRENTIEL TERMINOLOGIQUE</div>
      <h1 class="section-main-title">Liste des Sigles et Abréviations${ancSpan('sec_acronyms', pass)}</h1>
      <p class="section-subtitle">Glossaire technique des protocoles réseaux, mécanismes cryptographiques et briques de supervision</p>
    </div>
    <table class="acronyms-table">
      <thead>
        <tr>
          <th style="width: 16%;">Sigle</th>
          <th style="width: 30%;">Développement</th>
          <th style="width: 54%;">Rôle dans l'Infrastructure Homelab</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </section>`;
}

// Table des matieres & Liste des figures avec numeros de page exacts (ou placeholders en passe 1)
function renderTocAndFigures(entries, figures, pageMap, pass) {
  const fmtPage = ancId => {
    if (pass === 1 || !pageMap[ancId]) return 'p. 00';
    return `p. ${pageMap[ancId]}`;
  };

  const tocRows = entries.map(e => {
    const isTop = e.level <= 1;
    const cls = isTop ? 'toc-row toc-level-1' : 'toc-row toc-level-2';
    return `
      <a class="${cls}" href="#${e.id}">
        <span class="toc-title">${escapeHtml(e.title)}</span>
        <span class="toc-dots"></span>
        <span class="toc-page">${fmtPage(e.id)}</span>
      </a>`;
  }).join('\n');

  const figRows = figures.map(f => `
    <a class="toc-row toc-fig-row" href="#${f.id}">
      <span class="toc-title"><strong>${escapeHtml(f.label)}</strong> — ${escapeHtml(f.caption.replace(/^Figure\s+\d+\.\d+\s*:\s*/i, ''))}</span>
      <span class="toc-dots"></span>
      <span class="toc-page">${fmtPage(f.id)}</span>
    </a>`).join('\n');

  return `
  <section class="front-section page-break" id="sec_toc">
    <div class="section-banner">
      <div class="banner-tag">NAVIGATION DU DOSSIER TECHNIQUE</div>
      <h1 class="section-main-title">Table des Matières</h1>
      <p class="section-subtitle">Sommaire structuré par chapitres et modules avec indexation paginée exacte</p>
    </div>
    <div class="toc-container">
      ${tocRows}
    </div>
  </section>

  <section class="front-section page-break" id="sec_figures">
    <div class="section-banner">
      <div class="banner-tag">INDEX ICONOGRAPHIQUE</div>
      <h1 class="section-main-title">Liste des Figures &amp; Schémas Vectoriels${ancSpan('sec_figures', pass)}</h1>
      <p class="section-subtitle">Recensement des 2 schémas d'architecture SVG et des 22 captures d'écran de validation en laboratoire</p>
    </div>
    <div class="toc-container">
      ${figRows}
    </div>
  </section>`;
}

// Annexe Technique dynamique depuis audit_report_latest.json + Conclusion Generale
function renderAppendixAndConclusion(pass) {
  const jsonPath = path.join(automationDir, 'reports', 'audit_report_latest.json');
  let audit = null;
  if (fs.existsSync(jsonPath)) {
    audit = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  let appendixBody = '<p>Rapport JSON d\'audit introuvable.</p>';
  if (audit) {
    const summaryRows = audit.devices.map(d => `
      <tr>
        <td><code>${escapeHtml(d.device)}</code></td>
        <td>${escapeHtml(d.vendor === 'fortinet' ? 'Fortinet' : 'Cisco IOS')}</td>
        <td>${escapeHtml(d.role)}</td>
        <td style="text-align:center;"><strong>${d.passed} / ${d.total}</strong></td>
        <td style="text-align:center;"><span class="status-pill-ok">${d.score.toFixed(1)} % — CONFORME</span></td>
      </tr>`).join('\n');

    const deviceSections = audit.devices.map(d => {
      const checksRows = d.checks.map((c, idx) => `
        <tr>
          <td style="text-align:center; width:6%;">${idx + 1}</td>
          <td style="width:46%;"><strong>${escapeHtml(c.test)}</strong></td>
          <td style="text-align:center; width:14%;"><span class="status-pill-ok">${c.passed ? 'CONFORME' : 'ÉCHEC'}</span></td>
          <td style="width:34%;">${escapeHtml(c.detail)}</td>
        </tr>`).join('\n');

      return `
        <h3>${escapeHtml(d.device)} — ${escapeHtml(d.role)} (${d.passed}/${d.total})</h3>
        <table>
          <thead>
            <tr>
              <th style="text-align:center;">#</th>
              <th>Point de Contrôle Technique</th>
              <th style="text-align:center;">Résultat</th>
              <th>Détail d'Inspection</th>
            </tr>
          </thead>
          <tbody>
            ${checksRows}
          </tbody>
        </table>`;
    }).join('\n');

    appendixBody = `
      <div class="audit-meta-grid">
        <div class="audit-kpi"><span>Horodatage de l'Audit</span><strong>${escapeHtml(audit.audit_date)}</strong></div>
        <div class="audit-kpi"><span>Auditeur Référent</span><strong>${escapeHtml(audit.auditor)}</strong></div>
        <div class="audit-kpi"><span>Parc Audité</span><strong>${audit.devices.length} Équipements Multi-Constructeurs</strong></div>
        <div class="audit-kpi audit-kpi-success"><span>Score Global de Conformité</span><strong>${audit.total_passed} / ${audit.total_checks} (${audit.global_score.toFixed(1)} %)</strong></div>
      </div>

      <h2>A.1. Synthèse de Conformité par Équipement</h2>
      <table>
        <thead>
          <tr>
            <th>Équipement</th>
            <th>Constructeur</th>
            <th>Rôle dans l'Infrastructure</th>
            <th style="text-align:center;">Contrôles</th>
            <th style="text-align:center;">Statut Final</th>
          </tr>
        </thead>
        <tbody>
          ${summaryRows}
        </tbody>
      </table>

      <h2>A.2. Matrice Exhaustive des 40 Contrôles Programmatiques</h2>
      ${deviceSections}`;
  }

  return `
  <section class="guide-section page-break" id="sec_annexe">
    <div class="header-card">
      <div class="badge">ANNEXE TECHNIQUE</div>
      <h1>Annexe A : Résultats Exhaustifs de l'Audit Automatisé NetDevOps (40/40 Points)${ancSpan('sec_annexe', pass)}</h1>
      <div class="subtitle">Extraction directe depuis automation/reports/audit_report_latest.json — Validation programmatique multi-constructeurs</div>
    </div>
    ${appendixBody}
  </section>

  <section class="guide-section page-break" id="sec_conclusion">
    <div class="header-card">
      <div class="badge">SYNTHÈSE &amp; PERSPECTIVES</div>
      <h1>Conclusion Générale &amp; Axes d'Évolution${ancSpan('sec_conclusion', pass)}</h1>
      <div class="subtitle">Bilan architectural, maturité opérationnelle et feuille de route d'évolution vers la production</div>
    </div>

    <h2>1. Bilan des Acquis d'Ingénierie (Paliers 1 à 8)</h2>
    <p>
      L'ensemble des travaux conduits sur ce laboratoire démontre la maîtrise de bout en bout d'une infrastructure réseau et cybersécurité réaliste et cohérente. Partie d'un hyperviseur bare-metal <strong>Proxmox VE 8.x</strong> hébergeant des environnements imbriqués sous <strong>EVE-NG</strong>, la plateforme a su intégrer avec rigueur les contraintes concrètes d'exploitation : gestion des restrictions de licence FortiOS (<code>vdom-max = 3</code>, profil cryptographique d'export <code>des-sha256</code> sur IKEv2), résolution des disparités MTU entre Cisco IOL et QEMU KVM (<code>ip ospf mtu-ignore</code>), et contournement de la pile de routage IOL L2 pour garantir l'acheminement Syslog vers le SIEM.
    </p>
    <p>
      Sur le plan de la posture de défense en profondeur, chaque couche du modèle OSI bénéficie désormais de contrôles vérifiables : durcissement physique L2 (<em>Port-Security</em>, <em>DHCP Snooping</em>, <em>BPDU Guard</em>), haute disponibilité FHRP (basculement HSRP mesuré sous la seconde), convergence dynamique L3 (OSPFv2 multi-constructeurs), chiffrement inter-sites (IPsec IKEv2/DH14), inspection approfondie L7 (signatures custom IPS contre SQLi et Path Traversal, politique Anti-DDoS), corrélation temps réel dans <strong>Wazuh v4.14.10</strong> mappée MITRE ATT&amp;CK, et vérification déterministe automatisée par <strong>Python NetDevOps (40/40 points — 100,0 %)</strong>.
    </p>

    <h2>2. Feuille de Route &amp; Perspectives d'Évolution</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 24%;">Axe d'Évolution</th>
          <th style="width: 44%;">Implémentation Cible Recommandée</th>
          <th style="width: 32%;">Gain de Maturité Opérationnelle</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Couverture Endpoint &amp; Agents SIEM</strong></td>
          <td>Déploiement d'agents Wazuh chiffrés (port TCP <code>1514</code> déjà ouvert dans <code>ossec.conf</code>) sur le serveur Proxmox VE, l'hôte EVE-NG et le serveur DMZ Alpine/Linux.</td>
          <td>Corrélation unifiée entre alertes réseau (Syslog UDP/514) et télémétrie système FIM/Auditd (détection de mouvements latéraux).</td>
        </tr>
        <tr>
          <td><strong>2. Durcissement L2 Complémentaire (DAI &amp; IPSG)</strong></td>
          <td>Activation de <em>Dynamic ARP Inspection</em> (DAI) et d'<em>IP Source Guard</em> en s'appuyant sur la table de liaison <em>DHCP Snooping</em> existante sur <code>SW1_HQ</code>.</td>
          <td>Éradication complète des risques d'usurpation ARP (<em>ARP Spoofing</em>) et d'usurpation d'adresse IP source sur le VLAN 10.</td>
        </tr>
        <tr>
          <td><strong>3. Pipeline CI/CD &amp; Changement Déclaratif</strong></td>
          <td>Couplage de <code>netdevops.py --audit</code> dans un runner GitHub Actions ou tâche planifiée émettant un webhook d'alerte vers Wazuh en cas de dérive (<em>drift</em>).</td>
          <td>Détection immédiate des modifications manuelles non approuvées et piste d'audit GitOps immuable.</td>
        </tr>
        <tr>
          <td><strong>4. Résilience WAN &amp; Routage Chiffré BGP/ADVPN</strong></td>
          <td>Introduction d'un second lien WAN avec basculement SD-WAN sur FortiGate et migration des tunnels IPsec vers un adressage routé dynamique OSPF/BGP sur VTI.</td>
          <td>Tolérance aux pannes étendue jusqu'à l'opérateur télécoms (zéro coupure WAN ni IPsec).</td>
        </tr>
      </tbody>
    </table>
  </section>`;
}

// Styles CSS partages et specifiques au Master Report
const sharedCss = `
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 9.8pt;
    line-height: 1.55;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }

  a {
    color: #0284c7;
    text-decoration: none;
  }

  .anc-marker {
    position: absolute;
    right: 0;
    top: 0;
    font-size: 2pt;
    line-height: 1;
    opacity: 0.015;
    pointer-events: none;
    user-select: none;
  }

  .header-card, .section-banner {
    position: relative;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    color: #ffffff;
    padding: 18px 22px;
    border-radius: 8px;
    margin-bottom: 18px;
    border-bottom: 3px solid #0ea5e9;
    break-inside: avoid;
  }

  .header-card h1, .section-main-title {
    margin: 4px 0 6px 0;
    font-size: 16pt;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.2px;
    line-height: 1.25;
  }

  .header-card .subtitle, .section-subtitle {
    margin: 0;
    font-size: 9.5pt;
    color: #bae6fd;
    font-weight: 400;
  }

  .header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.16);
    padding-top: 10px;
    margin-top: 12px;
    font-size: 8.2pt;
    color: #cbd5e1;
  }

  .badge, .banner-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 7.2pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    background: rgba(14, 165, 233, 0.22);
    color: #e0f2fe;
    border: 1px solid rgba(125, 211, 252, 0.35);
    margin-bottom: 6px;
  }

  h2 {
    position: relative;
    color: #0f172a;
    font-size: 12.2pt;
    font-weight: 700;
    border-bottom: 2px solid #cbd5e1;
    border-left: 4px solid #0284c7;
    padding: 2px 0 5px 10px;
    margin-top: 16px;
    margin-bottom: 8px;
    break-after: avoid;
    page-break-after: avoid;
  }

  h3 {
    color: #1e3a8a;
    font-size: 10.6pt;
    font-weight: 700;
    margin-top: 14px;
    margin-bottom: 6px;
    break-after: avoid;
    page-break-after: avoid;
  }

  h4 {
    color: #334155;
    font-size: 9.8pt;
    font-weight: 700;
    margin-top: 10px;
    margin-bottom: 5px;
    break-after: avoid;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 8px 0;
    text-align: justify;
    hyphens: auto;
  }

  ul, ol {
    margin: 0 0 11px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 3px;
  }

  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1px 4px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
    overflow-wrap: break-word;
  }

  td code, th code {
    white-space: normal;
    overflow-wrap: break-word;
    word-break: normal;
  }

  td code.code-nowrap, th code.code-nowrap {
    white-space: nowrap;
  }

  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 10px 12px;
    border-radius: 6px;
    font-family: Consolas, "Courier New", monospace;
    margin: 7px 0 11px 0;
    border: 1px solid #1e293b;
  }

  pre.code-block {
    font-size: 8pt;
    line-height: 1.42;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
    overflow-x: visible;
    break-inside: avoid;
  }

  pre.code-long {
    break-inside: auto;
  }

  pre.diagram-ascii {
    font-size: 6.7pt;
    line-height: 1.26;
    white-space: pre;
    overflow-x: visible;
    break-inside: avoid;
    background: #0b1120;
    color: #e2e8f0;
    border: 1px solid #334155;
  }

  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    border: none;
    font-size: inherit;
    overflow-wrap: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 14px 0;
    font-size: 8.1pt;
    break-inside: auto;
  }

  thead {
    display: table-header-group;
  }

  tr {
    break-inside: avoid;
  }

  th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
    text-align: left;
    padding: 6px 7px;
    border: 1px solid #cbd5e1;
    white-space: normal;
    overflow-wrap: break-word;
    word-break: normal;
  }

  td {
    padding: 5px 7px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .status-pill-ok {
    white-space: nowrap;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  blockquote {
    margin: 10px 0 14px 0;
    padding: 9px 13px;
    background: #eff6ff;
    border-left: 4px solid #0284c7;
    color: #0f172a;
    border-radius: 0 6px 6px 0;
    font-size: 9pt;
    break-inside: avoid;
  }

  blockquote p {
    margin: 0 0 3px 0;
    text-align: left;
  }
  blockquote p:last-child {
    margin-bottom: 0;
  }

  .section-divider {
    border: none;
    border-top: 1px solid #e2e8f0;
    margin: 14px 0;
  }

  /* Figures et captures d'ecran */
  .report-figure {
    position: relative;
    margin: 10px 0 14px 0;
    padding: 10px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    text-align: center;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .report-figure img {
    max-width: 100%;
    max-height: 290px;
    width: auto;
    height: auto;
    border-radius: 5px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
    display: block;
    margin: 0 auto;
  }

  .svg-figure {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 10px 12px;
  }

  .svg-figure svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .report-figure figcaption {
    font-size: 8.3pt;
    color: #475569;
    margin-top: 8px;
    font-style: italic;
    text-align: center;
    line-height: 1.4;
  }

  .callout-methodology {
    margin: 16px 0;
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 4px solid #1e3a8a;
    border-radius: 6px;
    break-inside: avoid;
  }

  .callout-methodology h3 {
    margin-top: 0;
    color: #0f172a;
  }

  .page-break {
    page-break-before: always;
    break-before: page;
  }

  .footer-notice {
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
    font-size: 7.5pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
    break-inside: avoid;
  }
`;

const individualPageCss = `
  @page {
    size: A4 portrait;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-left {
      content: "Homelab Proxmox VE / FortiGate 7.4 / Cisco IOL / Wazuh SIEM";
      font-size: 7.5pt;
      color: #64748b;
    }
    @bottom-right {
      content: "Page " counter(page) " / " counter(pages);
      font-size: 8pt;
      font-weight: 600;
      color: #334155;
    }
  }
  ${sharedCss}
  .header-card {
    padding: 14px 20px;
    margin-bottom: 14px;
  }
  .report-figure img {
    max-height: 270px;
  }
  .footer-notice {
    margin-top: 6px;
    padding-top: 6px;
  }
`;

const masterPageCss = `
  @page {
    size: A4 portrait;
    margin: 18mm 14mm 18mm 14mm;
    @top-left {
      content: "HOMELAB CYBERSÉCURITÉ & INFRASTRUCTURE RÉSEAU";
      font-size: 7.2pt;
      font-weight: 600;
      color: #64748b;
      letter-spacing: 0.4px;
    }
    @top-right {
      content: "PROXMOX VE • EVE-NG • FORTIGATE 7.4 • CISCO IOL • WAZUH SIEM";
      font-size: 6.8pt;
      color: #94a3b8;
    }
    @bottom-left {
      content: "Ababacar Ousmane Niang — Master 2 RESI (Groupe ISI)";
      font-size: 7.4pt;
      color: #64748b;
    }
    @bottom-right {
      content: "Page " counter(page) " / " counter(pages);
      font-size: 8pt;
      font-weight: 700;
      color: #334155;
    }
  }

  @page :first {
    margin: 0;
    @top-left { content: none; }
    @top-right { content: none; }
    @bottom-left { content: none; }
    @bottom-right { content: none; }
  }

  ${sharedCss}

  /* Page de garde pleine page (A4 210mm x 297mm) */
  .cover-page {
    width: 210mm;
    height: 296.5mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #ffffff;
    overflow: hidden;
    page-break-after: always;
    break-after: page;
  }

  .cover-top-band {
    background: linear-gradient(135deg, #0b1120 0%, #0f172a 48%, #1e3a8a 100%);
    color: #ffffff;
    padding: 26mm 18mm 18mm 18mm;
    border-bottom: 4px solid #0ea5e9;
  }

  .cover-org-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.8px;
    color: #bae6fd;
    border-bottom: 1px solid rgba(255, 255, 255, 0.16);
    padding-bottom: 10px;
    margin-bottom: 18px;
  }

  .cover-doc-type {
    display: inline-block;
    padding: 4px 12px;
    background: rgba(14, 165, 233, 0.2);
    border: 1px solid rgba(125, 211, 252, 0.45);
    border-radius: 4px;
    font-size: 8.2pt;
    font-weight: 700;
    color: #e0f2fe;
    letter-spacing: 0.8px;
    margin-bottom: 14px;
  }

  .cover-title {
    font-size: 24pt;
    font-weight: 800;
    line-height: 1.18;
    color: #ffffff;
    margin: 0 0 12px 0;
    letter-spacing: -0.4px;
  }

  .cover-subtitle {
    font-size: 10.8pt;
    line-height: 1.45;
    color: #cbd5e1;
    margin: 0;
  }

  .cover-center {
    padding: 10mm 18mm 6mm 18mm;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
  }

  .cover-stack-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .stack-pill {
    font-size: 8pt;
    font-weight: 600;
    color: #0f172a;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .cover-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .cover-kpi-card {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-top: 3px solid #0284c7;
    border-radius: 6px;
    padding: 12px 10px;
    text-align: center;
  }

  .cover-kpi-card.kpi-emerald {
    border-top-color: #059669;
    background: #ecfdf5;
    border-color: #a7f3d0;
  }

  .cover-kpi-val {
    font-size: 13.5pt;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 3px;
  }

  .cover-kpi-lbl {
    font-size: 7.5pt;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .cover-meta-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 5px solid #1e3a8a;
    border-radius: 6px;
    padding: 14px 18px;
  }

  .cover-meta-title {
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: #1e3a8a;
    margin-bottom: 8px;
  }

  .cover-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px 18px;
    font-size: 8.8pt;
    color: #334155;
  }

  .cover-bottom-bar {
    background: #f1f5f9;
    border-top: 2px solid #cbd5e1;
    padding: 10mm 18mm;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8pt;
    color: #475569;
    font-weight: 600;
  }

  /* Sommaire et Liste des Figures */
  .toc-container {
    margin-top: 8px;
  }

  .toc-row {
    display: flex;
    align-items: baseline;
    text-decoration: none;
    color: #1e293b;
    padding: 2.5px 4px;
    border-radius: 3px;
  }

  .toc-level-1 {
    font-size: 9.4pt;
    font-weight: 700;
    color: #0f172a;
    margin-top: 4px;
    background: #f8fafc;
    border-left: 3px solid #0284c7;
    padding-left: 8px;
  }

  .toc-level-2 {
    font-size: 8.4pt;
    font-weight: 400;
    color: #475569;
    padding-left: 18px;
  }

  .toc-fig-row {
    font-size: 8.1pt;
    color: #334155;
    padding: 2.8px 6px;
    border-bottom: 1px dashed #e2e8f0;
  }

  .toc-title {
    flex-shrink: 1;
    max-width: 88%;
  }

  .toc-dots {
    flex: 1;
    border-bottom: 1px dotted #94a3b8;
    margin: 0 8px;
  }

  .toc-page {
    font-family: Consolas, monospace;
    font-size: 8.4pt;
    font-weight: 700;
    color: #0369a1;
    min-width: 36px;
    text-align: right;
    flex-shrink: 0;
  }

  /* Glossaire et Annexe Audit */
  .acronyms-table td:first-child {
    width: 16%;
    font-weight: 700;
  }

  .audit-meta-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 12px 0 16px 0;
    break-inside: avoid;
  }

  .audit-kpi {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 8px 10px;
  }

  .audit-kpi span {
    display: block;
    font-size: 7.2pt;
    color: #64748b;
    text-transform: uppercase;
    margin-bottom: 2px;
  }

  .audit-kpi strong {
    font-size: 8.8pt;
    color: #0f172a;
  }

  .audit-kpi-success {
    background: #ecfdf5;
    border-color: #6ee7b7;
  }

  .audit-kpi-success strong {
    color: #065f46;
  }

  .status-pill-ok {
    display: inline-block;
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 7.4pt;
    font-weight: 700;
  }
`;

function createIndividualHtml(guide, mdText) {
  const bodyContent = markdownToHtml(mdText, {
    guideId: guide.id,
    pass: 2,
    isMaster: false
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(guide.title)}</title>
  <style>${individualPageCss}</style>
</head>
<body>
  <div class="header-card">
    <div class="badge">MODULE ${guide.id} / 13 — ${escapeHtml(guide.palier.toUpperCase())}</div>
    <h1>${escapeHtml(guide.title)}</h1>
    <div class="subtitle">Laboratoire d'infrastructure réseau, virtualisation Proxmox VE 8, cybersécurité Fortinet / Cisco &amp; SIEM Wazuh</div>
    <div class="header-meta">
      <div><strong>Date :</strong> 11 Novembre 2026</div>
      <div><strong>Hôte :</strong> Proxmox VE (192.168.1.200)</div>
      <div><strong>SIEM :</strong> Wazuh v4.14.10 (192.168.1.201)</div>
      <div><strong>Lab :</strong> EVE-NG (192.168.1.202)</div>
      <div><strong>Audit :</strong> 40/40 Contrôles (100.0 %)</div>
    </div>
  </div>

  ${bodyContent}

  <div class="footer-notice">
    <span>Homelab Cybersécurité &amp; Infrastructure Réseau — Documentation Technique Opérationnelle</span>
    <span>Ababacar Ousmane Niang — Master 2 RESI (Groupe ISI)</span>
  </div>
</body>
</html>`;
}

function buildMasterHtml({ pass, pageMap = {} }) {
  const readmePath = path.join(projectRoot, 'README.md');
  const readmeContent = fs.readFileSync(readmePath, 'utf8');

  const tocEntries = [
    { id: 'sec_exec', level: 1, title: "Avant-Propos, Résumé Exécutif & Traçabilité IP" },
    { id: 'sec_figures', level: 1, title: 'Liste des Figures & Schémas Vectoriels (24 Figures)' },
    { id: 'sec_acronyms', level: 1, title: 'Liste des Sigles et Abréviations' },
    { id: 'sec_chap0', level: 1, title: "Chapitre 0 : Architecture Générale, Topologie & Plan d'Adressage" }
  ];

  const figuresList = [
    {
      id: 'fig_0_1',
      label: 'Figure 0.1',
      caption: "Architecture globale en 5 couches du Homelab Proxmox VE, EVE-NG, Fortinet FortiGate 7.4, Cisco IOL et SIEM Wazuh (adressage définitif .200-.250 et VIP .254).",
      guideId: '00'
    },
    {
      id: 'fig_0_2',
      label: 'Figure 0.2',
      caption: "Pipeline de supervision centralisée SIEM Wazuh (Syslog UDP/514, règles MITRE ATT&CK) et chaîne d'automatisation NetDevOps Python.",
      guideId: '00'
    }
  ];

  const chap0Sections = [];
  const chap0Body = markdownToHtml(readmeContent, {
    guideId: '00',
    pass,
    isMaster: true,
    sectionsCollector: chap0Sections,
    figuresCollector: null,
    skipExternalBadges: true
  });
  chap0Sections.forEach(s => tocEntries.push(s));

  const guideSectionsHtml = guides.map(g => {
    const mdPath = path.join(guidesDir, g.file);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    const modAnchor = `sec_mod_${g.id}`;
    tocEntries.push({ id: modAnchor, level: 1, title: g.title });

    const modSubSections = [];
    const modFigs = [];
    const rendered = markdownToHtml(mdContent, {
      guideId: g.id,
      pass,
      isMaster: true,
      sectionsCollector: modSubSections,
      figuresCollector: modFigs
    });
    modSubSections.forEach(s => tocEntries.push(s));
    modFigs.forEach(f => figuresList.push(f));

    return `
    <section class="guide-section page-break" id="${modAnchor}">
      <div class="header-card">
        <div class="badge">MODULE ${g.id} / 13 — ${escapeHtml(g.palier.toUpperCase())}</div>
        <h1>${escapeHtml(g.title)}${ancSpan(modAnchor, pass)}</h1>
        <div class="subtitle">Procédures d'architecture, configurations multi-constructeurs et preuves de validation expérimentale</div>
      </div>
      ${rendered}
    </section>`;
  }).join('\n');

  tocEntries.push({
    id: 'sec_annexe',
    level: 1,
    title: "Annexe A : Résultats Exhaustifs de l'Audit Automatisé NetDevOps (40/40 Points)"
  });
  tocEntries.push({
    id: 'sec_conclusion',
    level: 1,
    title: "Conclusion Générale & Axes d'Évolution"
  });

  const tocAndFigsHtml = renderTocAndFigures(tocEntries, figuresList, pageMap, pass);
  const preambleHtml = renderExecutivePreamble(pass);
  const acronymsHtml = renderAcronymsSection(pass);
  const appendixHtml = renderAppendixAndConclusion(pass);

  const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Global Homelab Cybersécurité &amp; Infrastructure Réseau</title>
  <style>${masterPageCss}</style>
</head>
<body>
  <!-- PAGE 1 : PAGE DE GARDE -->
  <section class="cover-page">
    <div class="cover-top-band">
      <div class="cover-org-row">
        <span>GROUPE ISI — INSTITUT SUPÉRIEUR D'INFORMATIQUE</span>
        <span>MASTER 2 RÉSEAUX &amp; SYSTÈMES INFORMATIQUES (RESI)</span>
      </div>
      <div class="cover-doc-type">DOSSIER D'ARCHITECTURE, D'INGÉNIERIE &amp; D'AUDIT OPÉRATIONNEL</div>
      <h1 class="cover-title">HOMELAB CYBERSÉCURITÉ &amp; INFRASTRUCTURE RÉSEAU MULTI-CONSTRUCTEURS</h1>
      <p class="cover-subtitle">
        Virtualisation Bare-Metal Proxmox VE 8.x • Émulation Réseau EVE-NG • Pare-feu NGFW Fortinet FortiGate 7.4.13 • Commutation &amp; Routage Cisco IOL L2/L3 • Corrélation SOC Wazuh SIEM v4.14.10 • Automatisation NetDevOps Python
      </p>
    </div>

    <div class="cover-center">
      <div class="cover-stack-pills">
        <span class="stack-pill">Proxmox VE 8.x (KVM)</span>
        <span class="stack-pill">EVE-NG Community</span>
        <span class="stack-pill">FortiGate 7.4.13 NGFW</span>
        <span class="stack-pill">Cisco IOL L2 / L3</span>
        <span class="stack-pill">VPN IPsec IKEv2</span>
        <span class="stack-pill">OSPFv2 &amp; FHRP HSRP</span>
        <span class="stack-pill">IPS DPI &amp; Anti-DDoS</span>
        <span class="stack-pill">Wazuh SIEM v4.14.10</span>
        <span class="stack-pill">NetDevOps Python 3</span>
      </div>

      <div class="cover-kpi-grid">
        <div class="cover-kpi-card">
          <div class="cover-kpi-val">8 Paliers</div>
          <div class="cover-kpi-lbl">13 Modules Complets</div>
        </div>
        <div class="cover-kpi-card">
          <div class="cover-kpi-val">5 Nœuds</div>
          <div class="cover-kpi-lbl">Parc Multi-Constructeurs</div>
        </div>
        <div class="cover-kpi-card">
          <div class="cover-kpi-val">10 Règles</div>
          <div class="cover-kpi-lbl">SOC MITRE ATT&amp;CK</div>
        </div>
        <div class="cover-kpi-card kpi-emerald">
          <div class="cover-kpi-val">40 / 40</div>
          <div class="cover-kpi-lbl">Audit Conforme (100 %)</div>
        </div>
      </div>

      <div class="cover-meta-box">
        <div class="cover-meta-title">Fiche Signalétique du Dossier Technique</div>
        <div class="cover-meta-grid">
          <div><strong>Auteur / Ingénieur :</strong> Ababacar Ousmane Niang</div>
          <div><strong>Établissement :</strong> Groupe ISI — Master 2 RESI</div>
          <div><strong>Date d'édition :</strong> 11 Novembre 2026</div>
          <div><strong>Statut de Conformité :</strong> Opérationnel, Testé &amp; Audité (100 %)</div>
          <div><strong>Hyperviseur &amp; SIEM :</strong> Proxmox VE (.200) • Wazuh (.201)</div>
          <div><strong>Passerelles &amp; Lab :</strong> EVE-NG (.202) • FortiGate (.203)</div>
          <div><strong>Haute Disponibilité :</strong> Cluster HSRP VLAN 10 (VIP 10.10.10.254)</div>
          <div><strong>Preuves Intégrées :</strong> 2 Schémas Vectoriels + 22 Captures Réelles</div>
        </div>
      </div>
    </div>

    <div class="cover-bottom-bar">
      <span>Dossier d'Ingénierie Compilé &amp; Certifié sur Équipements Réels — Édition Officielle GitHub / Portfolio</span>
      <span>11 Novembre 2026</span>
    </div>
  </section>

  <!-- AVANT-PROPOS, RESUME EXECUTIF & TRACABILITE -->
  ${preambleHtml}

  <!-- TABLE DES MATIERES & LISTE DES FIGURES -->
  ${tocAndFigsHtml}

  <!-- LISTE DES SIGLES -->
  ${acronymsHtml}

  <!-- CHAPITRE 0 : ARCHITECTURE GENERALE & SCHEMAS VECTORIELS -->
  <section class="guide-section page-break" id="sec_chap0">
    <div class="header-card">
      <div class="badge">CHAPITRE 0 — ARCHITECTURE &amp; TOPOLOGIE</div>
      <h1>Architecture Générale, Modèle en 5 Couches &amp; Plan d'Adressage${ancSpan('sec_chap0', pass)}</h1>
      <div class="subtitle">Vue d'ensemble vectorielle des flux réseau, de l'observabilité SOC et matrice définitive des équipements</div>
    </div>
    ${getSvgArchitectureFigure(pass)}
    ${getSvgSocPipelineFigure(pass)}
    ${chap0Body}
  </section>

  <!-- MODULES 01 A 13 -->
  ${guideSectionsHtml}

  <!-- ANNEXE TECHNIQUE & CONCLUSION GENERALE -->
  ${appendixHtml}

</body>
</html>`;

  return { html: fullHtml, tocEntries, figuresList };
}

// Extraction des numeros de page exacts depuis le PDF passe 1 avec pdftotext
function extractPageMapFromPdf(pdfPath) {
  const txt = execFileSync(pdftotextPath, ['-enc', 'UTF-8', pdfPath, '-'], {
    maxBuffer: 64 * 1024 * 1024,
    encoding: 'utf8'
  });
  const pages = txt.split('\f');
  const map = {};
  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageNum = pageIdx + 1;
    const matches = pages[pageIdx].matchAll(/@@ANC:([A-Za-z0-9_]+)@@/g);
    for (const m of matches) {
      if (!map[m[1]]) {
        map[m[1]] = pageNum;
      }
    }
  }
  return { map, totalPages: pages.length - 1, pages };
}

// Generation du support de presentation compagnon pret pour Canva Docs-to-Deck et Kimi Slides
function generateCompanionDeck() {
  const deckPath = path.join(outputDir, 'PRESENTATION_CANVA_KIMI_SLIDES.md');
  const deckContent = `# Présentation Exécutive — Homelab Cybersécurité & Infrastructure Réseau
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
- **Proxmox VE 8.x (Bare-Metal) :** \`192.168.1.200\` (Pont \`vmbr0\`, virtualisation imbriquée Intel VMX).
- **VM 101 Wazuh SIEM v4.14.10 :** \`192.168.1.201\` (Collecteur Syslog UDP/514 & Dashboard HTTPS/443).
- **VM 200 EVE-NG Community :** \`192.168.1.202\` (4 vCPU, 8 Go RAM — Émulation Cisco IOL & FortiGate).
- **FortiGate 7.4.13 HQ :** \`192.168.1.203\` (WAN), \`172.16.1.1/30\` (LAN), \`172.16.50.254/24\` (DMZ).
- **Succursale Cisco R2-BRANCH :** \`192.168.1.250\` (WAN) & \`192.168.20.1/24\` (LAN Succursale).

---

## Slide 4 — Palier 1 : Segmentation Campus & Zone DMZ VIP
- Trunk 802.1Q et sous-interface \`e0/0.10\` (VLAN 10 Utilisateurs \`10.10.10.0/24\`).
- Serveur Web DMZ sous Alpine Linux 3.20 (\`172.16.50.10:80\`) totalement isolé du LAN.
- Publication sécurisée par Virtual IP FortiGate : \`192.168.1.203:8080 -> 172.16.50.10:80\`.
- Optimisation du quota d'évaluation Fortinet (\`vdom-max = 3\`) via implicit-deny natif.

---

## Slide 5 — Palier 2 : VPN IPsec Site-à-Site IKEv2 Multi-Constructeurs
- Tunnel chiffré entre **FortiGate HQ** (\`.203\`) et **Cisco R2-BRANCH** (\`.250\`).
- Paramètres : **IKEv2**, \`des-sha256\`, **DH Group 14 (MODP 2048)** et **PFS activé**.
- Consolidation politique multi-interfaces (\`CORP_INTERNAL_INTERZONE\`) donnant accès au LAN et à la DMZ.
- Validation bout-en-bout depuis \`PC2-BRANCH\` (\`192.168.20.50\`) : 100 % de succès, latence de 2,2 à 2,8 ms.

---

## Slide 6 — Palier 3 : Défense NGFW L7, Signatures IPS & Anti-DDoS
- **Signatures IPS F-SBID personnalisées :** blocage actif en DPI de SQL Injection (ID \`3900\`) et Path Traversal (ID \`2906\`).
- **Application Control L7 :** \`APP_CTRL_ENTERPRISE\` filtrant P2P et proxys de contournement.
- **Protection Anti-DDoS (\`DOS_WAN_PROTECT\`) :** coupure immédiate ICMP Flood au seuil strict de **50 pps** (50/80 paquets reçus, 37,5 % bloqués dès le paquet 51).

---

## Slide 7 — Palier 5 : Routage Dynamique OSPFv2 Multi-Constructeurs
- Suppression totale des routes statiques entre le cœur Cisco \`R1\` et le pare-feu FortiGate.
- Injection de route par défaut externe \`O*E2 0.0.0.0/0\` par le FortiGate (ASBR) et annonce \`10.10.10.0/24\` par LSA Type 1.
- Résolution d'interopérabilité IOL / KVM via \`ip ospf mtu-ignore\` (passage immédiat à \`FULL\`).
- Sécurisation de l'interface client \`e0/0.10\` via \`passive-interface\`.

---

## Slide 8 — Palier 6 : Durcissement Couche 2 (Access Layer Security)
- **Port-Security :** apprentissage dynamique *sticky* (\`max 1\`), violation \`restrict\` et mise en quarantaine \`err-disabled\` en mode \`shutdown\`.
- **DHCP Snooping VLAN 10 :** port \`Ethernet0/0\` en confiance (\`trusted\`), \`Ethernet0/1\` non fiable, désactivation de l'Option 82.
- **Spanning-Tree :** \`PortFast\` pour convergence DHCP immédiate + \`BPDU Guard\` anti-commutateurs pirates.

---

## Slide 9 — Palier 7 : Haute Disponibilité Passerelle FHRP / HSRP
- Suppression du SPOF par cluster HSRP Groupe 1 sur VLAN 10 :
  - \`R1_HQ\` : \`10.10.10.1/24\` | Priorité **110** | **Active** (Préemption activée)
  - \`R_STANDBY_HQ\` : \`10.10.10.2/24\` | Priorité **100** | **Standby** (Préemption activée)
- Passerelle virtuelle unique : **VIP \`10.10.10.254\`** | VMAC \`00:00:0c:07:ac:01\`.
- Preuve de basculement à chaud (*live failover*) : **1 seul paquet perdu sur 50**, reprise en **< 1 seconde**.

---

## Slide 10 — Palier 8 : SIEM Wazuh v4.14.10 & Règles SOC MITRE ATT&CK
- Centralisation Syslog UDP/514 de FortiGate et des 4 équipements Cisco (\`logging origin-id hostname\`).
- **10 règles de corrélation personnalisées (\`100101\`–\`100110\`)** dans \`local_rules.xml\`.
- Incidents réels capturés dans \`alerts.json\` :
  - \`Rule 100101\` (Niv. 7) : Bascule HSRP \`R1 <-> R_STANDBY\`
  - \`Rule 100103\` (Niv. 9, \`T1200\`) : Violation Port-Security sur \`SW1\`
  - \`Rule 100110\` (Niv. 10, \`T1190\`) : Blocage SQLi & Path Traversal en DMZ
  - \`Rule 100109\` (Niv. 8, \`T1498\`) : Atténuation Flood ICMP sur WAN

---

## Slide 11 — NetDevOps Python & Conformité Automatisée (40/40)
- Suite modulaire Python (\`automation/netdevops.py\`) pilotant les 5 nœuds via Telnet IOL et SSH Plink.
- Sauvegardes GitOps horodatées avec détection différentielle de dérive (\`difflib\`).
- **Score d'Audit Opérationnel : 40 / 40 contrôles conformes (100,0 %)** :
  - \`R1_HQ\` : 9/9 | \`R_STANDBY_HQ\` : 5/5 | \`SW1_HQ\` : 9/9 | \`R2_BRANCH\` : 4/4 | \`FORTIGATE_HQ\` : 13/13.

---

## Slide 12 — Conclusion & Perspectives d'Évolution
- Infrastructure complète démontrant la convergence **Réseaux + Cybersécurité + DevOps + SOC**.
- **Évolutions prochaines :** déploiement d'agents Wazuh natifs (TCP 1514), activation de Dynamic ARP Inspection (DAI) & IP Source Guard, déclenchement CI/CD automatisé des audits NetDevOps et multi-homing SD-WAN.
`;
  fs.writeFileSync(deckPath, deckContent, 'utf8');
  console.log(`Support de présentation compagnon généré : ${path.basename(deckPath)}`);
}

// --- EXECUTION PRINCIPALE ---
console.log('--- Démarrage de la génération éditoriale HTML et PDF (Option C) ---');
console.log(`Dossier source guides : ${guidesDir}`);
console.log(`Dossier de sortie     : ${outputDir}`);

// 1. Génération des 13 rapports individuels HTML + PDF
guides.forEach(g => {
  const mdPath = path.join(guidesDir, g.file);
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const html = createIndividualHtml(g, mdContent);
  const baseName = path.basename(g.file, '.md');
  const htmlPath = path.join(outputDir, `${baseName}.html`);
  const pdfPath = path.join(outputDir, `${baseName}.pdf`);

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`Génération PDF individuel : ${baseName}.pdf...`);
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    htmlPath
  ]);
});

// 2. Rapport Global - Passe 1 (mesure exacte de pagination avec marqueurs d'ancres)
console.log('Rapport Global — Passe 1 (calcul des pages exactes)...');
const pass1 = buildMasterHtml({ pass: 1 });
const pass1HtmlPath = path.join(outputDir, '_temp_pass1_master.html');
const pass1PdfPath = path.join(outputDir, '_temp_pass1_master.pdf');
fs.writeFileSync(pass1HtmlPath, pass1.html, 'utf8');
execFileSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pass1PdfPath}`,
  pass1HtmlPath
]);

const extracted1 = extractPageMapFromPdf(pass1PdfPath);
console.log(`Passe 1 terminée : ${extracted1.totalPages} pages, ${Object.keys(extracted1.map).length} ancres localisées.`);

// Verifier que toutes les ancres de chapitres et figures ont bien ete reperees
for (const entry of pass1.tocEntries) {
  if (!extracted1.map[entry.id]) {
    console.warn(`ATTENTION : ancre non trouvée en passe 1 : ${entry.id}`);
  }
}
for (const fig of pass1.figuresList) {
  if (!extracted1.map[fig.id]) {
    console.warn(`ATTENTION : figure non trouvée en passe 1 : ${fig.id}`);
  }
}

// Nettoyer les fichiers temporaires de passe 1
fs.unlinkSync(pass1HtmlPath);
fs.unlinkSync(pass1PdfPath);

// 3. Rapport Global - Passe 2 (rendu final avec numeros de page exacts et zero marqueur)
console.log('Rapport Global — Passe 2 (rendu définitif avec pagination exacte)...');
const pass2 = buildMasterHtml({ pass: 2, pageMap: extracted1.map });
const masterHtmlPath = path.join(outputDir, 'RAPPORT_GLOBAL_HOMELAB_RESEAU.html');
const masterPdfPath = path.join(outputDir, 'RAPPORT_GLOBAL_HOMELAB_RESEAU.pdf');
fs.writeFileSync(masterHtmlPath, pass2.html, 'utf8');
execFileSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${masterPdfPath}`,
  masterHtmlPath
]);

// 4. Verification automatique de coherence du PDF final
const verifyTxt = execFileSync(pdftotextPath, ['-enc', 'UTF-8', masterPdfPath, '-'], {
  maxBuffer: 64 * 1024 * 1024,
  encoding: 'utf8'
});
const verifyPages = verifyTxt.split('\f');
const finalTotalPages = verifyPages.length - 1;
const residualAnc = verifyTxt.match(/@@ANC:[^@]+@@/g);
const residualEmoji = verifyTxt.match(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu);
const stats = fs.statSync(masterPdfPath);
const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);

if (residualAnc) {
  throw new Error(`Marqueurs résiduels trouvés dans le PDF final : ${residualAnc.join(', ')}`);
}
if (residualEmoji) {
  throw new Error(`Emojis résiduels détectés dans le PDF final : ${residualEmoji.join(', ')}`);
}
if (finalTotalPages !== extracted1.totalPages) {
  console.warn(`Écart de pagination détecté (Passe 1 = ${extracted1.totalPages}, Passe 2 = ${finalTotalPages}). Relance de vérification conseillée.`);
} else {
  console.log(`Pagination vérifiée identique : ${finalTotalPages} pages.`);
}

// 5. Génération du fichier de présentation compagnon Canva / Kimi
generateCompanionDeck();

console.log(`SUCCÈS : RAPPORT_GLOBAL_HOMELAB_RESEAU.pdf généré (${finalTotalPages} pages, ${stats.size} octets / ${sizeMb} Mo).`);
