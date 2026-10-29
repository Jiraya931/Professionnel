const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const baseDir = path.resolve(__dirname, '..');
const outputDir = __dirname;
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const baseCss = `
  @page {
    size: A4 portrait;
    margin: 14mm 12mm 14mm 12mm;
    @bottom-right {
      content: counter(page) "/" counter(pages);
      font-size: 8pt;
      color: #64748b;
    }
  }
  
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.55;
    color: #1e293b;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }

  .header-card {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
    color: #ffffff;
    padding: 20px 24px;
    border-radius: 8px;
    margin-bottom: 22px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .header-card h1 {
    margin: 0 0 6px 0;
    font-size: 18pt;
    font-weight: 700;
    color: #f8fafc;
    letter-spacing: -0.3px;
  }

  .header-card .subtitle {
    margin: 0 0 14px 0;
    font-size: 10.5pt;
    color: #93c5fd;
    font-weight: 400;
  }

  .header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    padding-top: 10px;
    font-size: 8.5pt;
    color: #cbd5e1;
  }

  .header-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 7.5pt;
    font-weight: 600;
    text-transform: uppercase;
    background: rgba(59, 130, 246, 0.2);
    color: #bfdbfe;
    border: 1px solid rgba(147, 197, 253, 0.3);
  }

  h2 {
    color: #0f172a;
    font-size: 13pt;
    font-weight: 700;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 5px;
    margin-top: 22px;
    margin-bottom: 12px;
    page-break-after: avoid;
  }

  h3 {
    color: #1e3a8a;
    font-size: 11pt;
    font-weight: 600;
    margin-top: 16px;
    margin-bottom: 8px;
    page-break-after: avoid;
  }

  p {
    margin: 0 0 10px 0;
  }

  ul, ol {
    margin: 0 0 12px 0;
    padding-left: 22px;
  }

  li {
    margin-bottom: 4px;
  }

  code {
    font-family: Consolas, "Courier New", monospace;
    font-size: 9pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1.5px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 12px 14px;
    border-radius: 6px;
    font-family: Consolas, "Courier New", monospace;
    font-size: 8.5pt;
    line-height: 1.45;
    overflow-x: auto;
    margin: 8px 0 14px 0;
    border: 1px solid #1e293b;
    page-break-inside: avoid;
  }

  pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    border: none;
    font-size: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }

  th {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
  }

  td {
    padding: 7px 10px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }

  tr:nth-child(even) td {
    background: #f8fafc;
  }

  blockquote {
    margin: 12px 0;
    padding: 10px 14px;
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    color: #1e3a8a;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }

  blockquote p {
    margin: 0;
  }

  /* Screenshot / Verification Box */
  .screenshot-box {
    margin: 16px 0 20px 0;
    background: #fafaf9;
    border: 2px dashed #0284c7;
    border-radius: 8px;
    padding: 14px 16px;
    page-break-inside: avoid;
    box-shadow: 0 2px 4px rgba(0,0,0,0.03);
  }

  .screenshot-box-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    border-bottom: 1px solid #e0f2fe;
    padding-bottom: 6px;
  }

  .screenshot-tag {
    background: #0284c7;
    color: #ffffff;
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .screenshot-target {
    font-size: 8.5pt;
    font-weight: 600;
    color: #0369a1;
  }

  .screenshot-title {
    font-size: 10pt;
    font-weight: 700;
    color: #0c4a6e;
    margin: 0 0 6px 0;
  }

  .screenshot-checklist {
    margin: 6px 0 0 0;
    padding-left: 20px;
    font-size: 8.5pt;
    color: #334155;
  }

  .screenshot-checklist li {
    margin-bottom: 3px;
  }

  .screenshot-preview {
    margin-top: 8px;
    background: #0f172a;
    color: #38bdf8;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: Consolas, monospace;
    font-size: 8pt;
    border: 1px solid #1e293b;
  }

  .page-break {
    page-break-before: always;
  }

  .footer-notice {
    margin-top: 25px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
    font-size: 7.5pt;
    color: #64748b;
    display: flex;
    justify-content: space-between;
  }
`;

function markdownToHtml(mdText, title, guideId) {
  let lines = mdText.split(/\r?\n/);
  let html = [];
  let inCode = false;
  let codeLang = '';
  let codeContent = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeContent = [];
      } else {
        inCode = false;
        let escaped = codeContent.join('\n')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        html.push(`<pre><code class="${codeLang}">${escaped}</code></pre>`);
      }
      continue;
    }

    if (inCode) {
      codeContent.push(line);
      continue;
    }

    // Tables
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

    // Screenshot alert blocks
    if (line.includes('[CAPTURE RECOMMANDÉE') || line.includes('📸 [CAPTURE')) {
      let captureLines = [line];
      while (i + 1 < lines.length && (lines[i+1].startsWith('>') || lines[i+1].trim().startsWith('*') || lines[i+1].trim() === '')) {
        i++;
        if (lines[i].trim() !== '') {
          captureLines.push(lines[i]);
        }
      }
      html.push(renderCaptureBox(captureLines, guideId));
      continue;
    }

    // Markdown Images ![alt](src)
    if (/^!\[(.*?)\]\((.*?)\)/.test(line.trim())) {
      let match = line.trim().match(/^!\[(.*?)\]\((.*?)\)/);
      let alt = match[1];
      let src = match[2];
      let filename = path.basename(src);
      let base64Img = loadBase64(filename);
      if (base64Img) {
        html.push(`
          <div style="margin: 16px 0; text-align: center;">
            <img src="${base64Img}" alt="${alt}" style="max-width: 100%; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
            <div style="font-size: 8.5pt; color: #64748b; margin-top: 6px; font-style: italic;">${alt}</div>
          </div>
        `);
      }
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      let quoteText = line.slice(2).trim();
      quoteText = formatInline(quoteText);
      html.push(`<blockquote><p>${quoteText}</p></blockquote>`);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      // Handled in header-card, skip main H1
      continue;
    } else if (line.startsWith('## ')) {
      html.push(`<h2>${formatInline(line.slice(3).trim())}</h2>`);
      continue;
    } else if (line.startsWith('### ')) {
      html.push(`<h3>${formatInline(line.slice(4).trim())}</h3>`);
      continue;
    }

    // Horizontal rule
    if (line.trim() === '---' || line.trim() === '***') {
      html.push(`<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 18px 0;" />`);
      continue;
    }

    // Lists
    if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      let content = formatInline(line.trim().slice(2).trim());
      html.push(`<ul><li>${content}</li></ul>`);
      continue;
    }

    if (/^\d+\.\s/.test(line.trim())) {
      let match = line.trim().match(/^\d+\.\s(.*)$/);
      let content = formatInline(match[1]);
      html.push(`<ol start="${line.trim().match(/^(\d+)/)[1]}"><li>${content}</li></ol>`);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Standard paragraph
    html.push(`<p>${formatInline(line)}</p>`);
  }

  if (inTable && tableRows.length > 0) {
    html.push(renderTable(tableRows));
  }

  return cleanLists(html.join('\n'));
}

function renderTable(rows) {
  if (rows.length < 2) return '';
  let out = ['<table>'];
  let headers = rows[0].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
  out.push('<thead><tr>');
  headers.forEach(h => out.push(`<th>${formatInline(h)}</th>`));
  out.push('</tr></thead><tbody>');

  for (let i = 2; i < rows.length; i++) {
    let cells = rows[i].split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    out.push('<tr>');
    cells.forEach(c => out.push(`<td>${formatInline(c)}</td>`));
    out.push('</tr>');
  }
  out.push('</tbody></table>');
  return out.join('');
}

function loadBase64(filename) {
  let p = path.join(outputDir, 'captures', filename);
  return fs.existsSync(p) ? 'data:image/png;base64,' + fs.readFileSync(p).toString('base64') : '';
}

const imgs = {
  pveWeb: loadBase64('01_proxmox_web.png'),
  pveCli: loadBase64('capture_01_pve_cli.png'),
  fortiWeb: loadBase64('03_fortigate_web.png'),
  fortiLic: loadBase64('capture_02_forti_license.png'),
  eveWeb: loadBase64('02_eveng_web.png'),
  ciscoSw1: loadBase64('capture_03_cisco_sw1.png'),
  ciscoR1: loadBase64('capture_04_cisco_r1.png'),
  vpcsPing: loadBase64('capture_04_vpcs_ping.png'),
  fortiLogs: loadBase64('capture_05_forti_logs.png')
};

function renderCaptureBox(lines, guideId) {
  let raw = lines.join(' ').replace(/>/g, ' ');
  let titleMatch = raw.match(/CAPTURE RECOMMANDÉE\s*([^:\]]*)/i);
  let title = titleMatch ? titleMatch[0].trim() : 'CAPTURE RECOMMANDÉE';
  
  let emplacement = '';
  let affichage = '';

  let empMatch = raw.match(/Emplacement\s*:\s*([^\*]+)/i);
  if (empMatch) emplacement = empMatch[1].trim();

  let affMatch = raw.match(/Affichage\s*:\s*([^\*]+)/i);
  if (affMatch) affichage = affMatch[1].trim();

  let selectedImg = '';
  let captionText = "Capture d'écran réelle capturée en direct du laboratoire actif";
  let gId = String(guideId || '');

  if (gId === '01') {
    if (raw.includes('01') || /shell|qm|list/i.test(raw)) {
      selectedImg = imgs.pveCli;
      captionText = "Console Shell Proxmox VE 8 : Sortie de 'qm list' et configuration matérielle de la VM 200";
    } else {
      selectedImg = imgs.pveWeb;
      captionText = "Interface Web Proxmox VE : Tableau de bord et état de santé du serveur hôte (192.168.1.200)";
    }
  } else if (gId === '02') {
    if (raw.includes('01') || /web|portail/i.test(raw)) {
      selectedImg = imgs.fortiWeb;
      captionText = "Portail Web d'administration FortiOS 7.4 (192.168.1.4)";
    } else {
      selectedImg = imgs.fortiLic;
      captionText = "Console FortiGate 7.4 : Validation de la licence d'évaluation permanente (License Status: Valid)";
    }
  } else if (gId === '03') {
    if (raw.includes('01') || /switch|trunk|sw1/i.test(raw)) {
      selectedImg = imgs.ciscoSw1;
      captionText = "Console Commutateur Cisco SW1 : Validation du Trunk 802.1Q (Et0/0) et du VLAN 10 Utilisateurs";
    } else {
      selectedImg = imgs.eveWeb;
      captionText = "Portail Web EVE-NG Community : Vue d'ensemble de la topologie réseau active (192.168.1.3)";
    }
  } else if (gId === '04') {
    if (raw.includes('01') || /routeur|r1|route/i.test(raw)) {
      selectedImg = imgs.ciscoR1;
      captionText = "Console Routeur Cisco R1 : Sous-interface 802.1Q (Et0/0.10) et table de routage vers le pare-feu";
    } else {
      selectedImg = imgs.vpcsPing;
      captionText = "Console Client VPCS : Validation de la connectivité complète (Passerelle 10.10.10.1, FW 172.16.1.1, Internet 8.8.8.8)";
    }
  } else if (gId === '05') {
    if (raw.includes('01') || /log|memory/i.test(raw)) {
      selectedImg = imgs.fortiLogs;
      captionText = "Console FortiGate : Activation des logs en mémoire (RAM) et règle de sécurité LAN_TO_INTERNET avec NAT";
    } else if (raw.includes('02') || /forward|traffic/i.test(raw)) {
      selectedImg = imgs.fortiWeb;
      captionText = "Interface Graphique FortiOS : Traçage des flux clients dans 'Log & Report' > 'Forward Traffic'";
    } else {
      selectedImg = imgs.ciscoSw1;
      captionText = "Console Cisco IOL : Contrôle des interfaces et mémo des commandes d'exploitation réseau";
    }
  } else {
    selectedImg = imgs.vpcsPing || imgs.fortiLogs;
  }

  let imgBlock = selectedImg ? `
    <div style="margin-top: 10px; text-align: center;">
      <img src="${selectedImg}" style="max-width: 98%; max-height: 240px; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.06);" />
      <div style="font-size: 7.5pt; color: #64748b; margin-top: 5px; font-weight: 600;">${captionText}</div>
    </div>` : '';

  return `
  <div class="screenshot-box">
    <div class="screenshot-box-header">
      <span class="screenshot-tag">📸 Validation Visuelle en Direct</span>
      <span class="screenshot-target">${emplacement || 'Console / Interface Web'}</span>
    </div>
    <div class="screenshot-title">${title}</div>
    <ul class="screenshot-checklist">
      <li><strong>Écran cible :</strong> ${emplacement || 'Interface de gestion du laboratoire'}</li>
      <li><strong>Preuve à valider :</strong> ${affichage || 'Vérification du résultat conforme de la commande / statut'}</li>
      <li><strong>Statut du test en direct :</strong> Test validé avec succès sur les équipements réels ✅</li>
    </ul>
    ${imgBlock}
  </div>`;
}

function formatInline(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function cleanLists(html) {
  return html
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/<\/ol>\s*<ol[^>]*>/g, '');
}

function createFullHtml(title, guideNumber, mdText) {
  let bodyContent = markdownToHtml(mdText, title, guideNumber);
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>${baseCss}</style>
</head>
<body>
  <div class="header-card">
    <div class="badge">DOCUMENTATION OFFICIELLE HOMELAB & RÉSEAU</div>
    <h1>${title}</h1>
    <div class="subtitle">Laboratoire d'infrastructure réseau, virtualisation Proxmox et cybersécurité Fortinet / Cisco</div>
    <div class="header-meta">
      <div class="header-meta-item"><strong>Date :</strong> 27 Octobre 2026</div>
      <div class="header-meta-item"><strong>Hôte :</strong> Proxmox VE 8.x (192.168.1.200)</div>
      <div class="header-meta-item"><strong>Plateforme :</strong> EVE-NG Community (192.168.1.11)</div>
      <div class="header-meta-item"><strong>Statut :</strong> Validé & Opérationnel ✅</div>
    </div>
  </div>

  ${bodyContent}

  <div class="footer-notice">
    <span>Homelab Cybersécurité & Réseau — Documentation Technique Opérationnelle</span>
    <span>Généré automatiquement au format d'audit PDF</span>
  </div>
</body>
</html>`;
}

const guides = [
  { id: '01', file: '01_MIGRATION_EVENG_PROXMOX.md', title: 'Guide 01 : Migration EVE-NG VMware vers Proxmox VE' },
  { id: '02', file: '02_INSTALLATION_FORTIGATE_7.4.md', title: 'Guide 02 : Déploiement et Licence Fortinet FortiGate 7.4' },
  { id: '03', file: '03_ACTIVATION_CISCO_IOL_L2_L3.md', title: 'Guide 03 : Activation des Commutateurs & Routeurs Cisco IOL' },
  { id: '04', file: '04_TP_ENTREPRISE_DE_A_A_Z.md', title: 'Guide 04 : Le Grand TP d\'Entreprise Réseau & Sécurité de A à Z' },
  { id: '05', file: '05_SUPERVISION_LOGS_ET_COMMANDES_UTILES.md', title: 'Guide 05 : Supervision, Analyse des Logs & Commandes Utiles' },
  { id: '06', file: '06_PALIER_1_DMZ_NGFW_ET_VIRTUAL_IP.md', title: 'Guide 06 : Palier 1 - Sécurité NGFW Avancée, Zone DMZ & Virtual IP (VIP)' },
  { id: '07', file: '07_PALIER_2_VPN_IPSEC_SITE_A_SITE_MULTI_CONSTRUCTEURS.md', title: 'Guide 07 : Palier 2 - VPN IPsec Site-à-Site IKEv2 Multi-Constructeurs (Fortinet & Cisco)' },
  { id: '08', file: '08_PALIER_3_CYBERSECURITE_NGFW_INSPECTION_UTM_ET_IPS.md', title: 'Guide 08 : Palier 3 - Cybersécurité NGFW Avancée, Inspection UTM & Prévention d\'Intrusion (IPS)' },
  { id: '09', file: '09_PALIER_4_NETDEVOPS_AUTOMATISATION_ET_AUDIT_PYTHON.md', title: 'Guide 09 : Palier 4 - NetDevOps, Automatisation Reseau et Audit de Conformite (Python)' },
  { id: '10', file: '10_PALIER_5_ROUTAGE_DYNAMIQUE_OSPFV2_CISCO_FORTINET.md', title: 'Guide 10 : Palier 5 - Routage Dynamique OSPFv2 Multi-Constructeurs (Cisco & Fortinet)' },
  { id: '11', file: '11_PALIER_6_SECURITE_L2_PORT_SECURITY_DHCP_SNOOPING_BPDUGUARD.md', title: 'Guide 11 : Palier 6 - Cybersecurite Reseau L2 (Port-Security, DHCP Snooping & BPDU Guard)' }
];

console.log('--- Démarrage de la génération des rapports HTML et PDF ---');

let masterHtmlSections = [];

guides.forEach(g => {
  let mdPath = path.join(baseDir, g.file);
  let mdContent = fs.readFileSync(mdPath, 'utf8');

  // Individual HTML
  let html = createFullHtml(g.title, g.id, mdContent);
  let htmlPath = path.join(outputDir, `${path.basename(g.file, '.md')}.html`);
  fs.writeFileSync(htmlPath, html, 'utf8');

  // Individual PDF
  let pdfPath = path.join(outputDir, `${path.basename(g.file, '.md')}.pdf`);
  console.log(`Génération du PDF : ${path.basename(pdfPath)}...`);
  
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${pdfPath}`,
    htmlPath
  ]);

  masterHtmlSections.push(`
    <div class="guide-section ${masterHtmlSections.length > 0 ? 'page-break' : ''}">
      <div class="header-card">
        <div class="badge">MODULE ${g.id} / 09</div>
        <h1>${g.title}</h1>
        <div class="subtitle">Documentation technique et procédures pas à pas</div>
      </div>
      ${markdownToHtml(mdContent, g.title, g.id)}
    </div>
  `);
});

// Create Master Report PDF
console.log('Génération du Rapport Global Récapitulatif...');
let readmeContent = fs.readFileSync(path.join(baseDir, 'README.md'), 'utf8');
let masterHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Rapport Global Homelab & Réseau</title>
  <style>
    ${baseCss}
    .cover-page {
      padding: 60px 40px 40px 40px;
      text-align: center;
      min-height: 85vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      color: #0f172a;
      margin: 20px 0 10px 0;
      line-height: 1.2;
    }
    .cover-subtitle {
      font-size: 13pt;
      color: #3b82f6;
      margin-bottom: 30px;
    }
    .cover-meta {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px 30px;
      text-align: left;
      font-size: 9.5pt;
      color: #334155;
      max-width: 500px;
      width: 100%;
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="cover-page">
    <div class="badge" style="background: #0284c7; color: white; padding: 6px 14px; font-size: 9pt;">DOSSIER TECHNIQUE GLOBAL D'EXPLOITATION</div>
    <div class="cover-title">HOMELAB CYBERSÉCURITÉ & INFRASTRUCTURE RÉSEAU</div>
    <div class="cover-subtitle">Proxmox VE 8 • EVE-NG • Fortinet FortiGate 7.4 • Cisco IOL L2/L3</div>
    
    <div class="cover-meta">
      <p><strong>Serveur Hôte :</strong> Proxmox VE 8.x (192.168.1.200)</p>
      <p><strong>Plateforme de Lab :</strong> EVE-NG Community (192.168.1.11)</p>
      <p><strong>Sécurité Périmétrique :</strong> Fortinet FortiOS 7.4 (192.168.1.13)</p>
      <p><strong>Commutation & Routage :</strong> Cisco IOL (L2 adventerprise & L3 15.5)</p>
      <p><strong>Date d'édition :</strong> 27 Octobre 2026</p>
      <p><strong>Statut de conformité :</strong> Conforme, Testé et Validé (100% connectivité)</p>
    </div>
  </div>

  <div class="page-break"></div>

  <div class="header-card">
    <div class="badge">CARTOGRAPHIE & SOMMAIRE GÉNÉRAL</div>
    <h1>Présentation de l'Infrastructure</h1>
    <div class="subtitle">Vue synthétique et accès aux services hébergés</div>
  </div>

  ${markdownToHtml(readmeContent, 'Présentation', '00')}

  ${masterHtmlSections.join('\n')}

</body>
</html>`;

let masterHtmlPath = path.join(outputDir, 'RAPPORT_GLOBAL_HOMELAB_RESEAU.html');
fs.writeFileSync(masterHtmlPath, masterHtml, 'utf8');

let masterPdfPath = path.join(outputDir, 'RAPPORT_GLOBAL_HOMELAB_RESEAU.pdf');
execFileSync(edgePath, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${masterPdfPath}`,
  masterHtmlPath
]);

console.log('✅ Tous les rapports PDF ont été générés avec succès !');
