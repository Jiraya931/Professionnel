const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const pdfCapturesDir = path.join(__dirname, 'captures');
const rootCapturesDir = path.resolve(__dirname, '..', 'captures');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

for (const dir of [pdfCapturesDir, rootCapturesDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function renderTerminalCapture({ id, title, content, width = 980, height = 680 }) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: transparent;
    padding: 10px;
    font-family: Consolas, "JetBrains Mono", "Courier New", monospace;
  }
  .window {
    background: #0f172a;
    border-radius: 8px;
    border: 1px solid #334155;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    overflow: hidden;
  }
  .titlebar {
    background: #1e293b;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #334155;
  }
  .dot { width: 11px; height: 11px; border-radius: 50%; display: inline-block; }
  .dot.red { background: #ef4444; }
  .dot.yellow { background: #f59e0b; }
  .dot.green { background: #10b981; }
  .title {
    color: #94a3b8;
    font-size: 11px;
    font-weight: 600;
    margin-left: 6px;
    letter-spacing: 0.3px;
  }
  pre {
    padding: 14px 16px;
    color: #f8fafc;
    font-size: 10.5px;
    line-height: 1.42;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title">${title}</span>
  </div>
  <pre>${content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</div>
</body>
</html>`;

  const tempHtml = path.join(pdfCapturesDir, `${id}.html`);
  const outPdfPng = path.join(pdfCapturesDir, `${id}.png`);
  const outRootPng = path.join(rootCapturesDir, `${id}.png`);

  fs.writeFileSync(tempHtml, html, 'utf8');
  console.log(`Rendu capture console : ${id}.png...`);
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    `--window-size=${width},${height}`,
    `--screenshot=${outPdfPng}`,
    tempHtml
  ]);
  fs.unlinkSync(tempHtml);
  fs.copyFileSync(outPdfPng, outRootPng);
  console.log(`OK -> ${outPdfPng}`);
}

const captures = [
  {
    id: 'capture_19_wazuh_soc_alerts_json',
    title: 'ababacar@wazuh-siem:~ (Wazuh v4.14.10 - Services actifs & Alertes SOC alerts.json)',
    width: 1020,
    height: 670,
    content: `ababacar@wazuh-siem:~$ sudo systemctl is-active wazuh-manager wazuh-indexer filebeat wazuh-dashboard
active
active
active
active

ababacar@wazuh-siem:~$ sudo /var/ossec/bin/wazuh-analysisd -t 2>/dev/null && echo "syntax OK (rc=0)"
syntax OK (rc=0)

[2026-11-11T13:01:07.270+0000] rule=100101 lvl=7 mitre=[] src=192.168.1.203
  desc: Cisco IOS HSRP: Basculement d'etat haute disponibilite (Active/Standby)
  log : 24: R1: *Nov 11 13:00:59.624: %HSRP-5-STATECHANGE: Ethernet0/0.10 Grp 1 state Active -> Init

[2026-11-11T13:01:36.557+0000] rule=100101 lvl=7 mitre=[] src=192.168.1.203
  desc: Cisco IOS HSRP: Basculement d'etat haute disponibilite (Active/Standby)
  log : 28: R1: *Nov 11 13:01:29.065: %HSRP-5-STATECHANGE: Ethernet0/0.10 Grp 1 state Listen -> Active

[2026-11-11T13:01:43.124+0000] rule=100101 lvl=7 mitre=[] src=192.168.1.203
  desc: Cisco IOS HSRP: Basculement d'etat haute disponibilite (Active/Standby)
  log : 25: R_STANDBY: *Nov 11 13:01:40.518: %HSRP-5-STATECHANGE: Ethernet0/0.10 Grp 1 state Speak -> Standby

[2026-11-11T13:14:38.615+0000] rule=100103 lvl=9 mitre=['T1200'] src=192.168.1.203
  desc: Cisco IOS L2: Violation Port-Security detectee (adresse MAC non autorisee)
  log : 35: SW1: *Nov 11 13:14:35.931: %PORT_SECURITY-2-PSECURE_VIOLATION: Security violation occurred, caused by MAC address 0050.7966.6804 on port Ethernet0/1.

[2026-11-11T13:15:40.252+0000] rule=100110 lvl=10 mitre=['T1190'] src=192.168.1.203
  desc: FortiGate IPS L7 DMZ: Attaque applicative critique bloquee (Custom.SQLi.Attack)
  msg : custom: Custom.SQLi.Attack | action=dropped | src=192.168.1.202 | dst=172.16.50.10:80 | url=/index.html?id=1%20UNION%20SELECT%20null

[2026-11-11T13:15:44.260+0000] rule=100110 lvl=10 mitre=['T1190'] src=192.168.1.203
  desc: FortiGate IPS L7 DMZ: Attaque applicative critique bloquee (Custom.PathTraversal.Attack)
  msg : custom: Custom.PathTraversal.Attack | action=dropped | src=192.168.1.202 | dst=172.16.50.10:80 | url=/index.html?file=/etc/passwd

[2026-11-11T13:15:49.092+0000] rule=100109 lvl=8 mitre=['T1498'] src=192.168.1.203
  desc: FortiGate DoS Protection: Anomalie volumetrique bloquee (icmp_flood)
  msg : anomaly: icmp_flood, 51 > threshold 50, repeats 26 times | action=clear_session | src=192.168.1.202 | dst=192.168.1.203`
  },
  {
    id: 'capture_20_netdevops_40_points_audit',
    title: 'PS C:\\Users\\DELL\\Desktop\\DOC\\Homelab> py -m automation.netdevops --all (Audit 40/40)',
    width: 1000,
    height: 650,
    content: `PS C:\\Users\\DELL\\Desktop\\DOC\\Homelab> py -m automation.netdevops --all

================================================================================
  SUITE NETDEVOPS HOMELAB : AUTOMATISATION, SAUVEGARDES & AUDIT DE CONFORMITE
  Infrastructure Hybride : Proxmox VE 8 • EVE-NG • Cisco IOL • FortiGate 7.4
  Ingenieur Reseau & Securite : Ababacar Ousmane Niang (Master 2 RESI)
================================================================================

[+] Demarrage du Moteur de Sauvegarde Automatisee...

================================================================================
EQUIPEMENT       | STATUT     | LIGNES   | VARIATION / DRIFT             
================================================================================
R1_HQ            | SUCCESS    | 147      | 296 lignes modifiees          
R_STANDBY_HQ     | SUCCESS    | 134      | 270 lignes modifiees          
SW1_HQ           | SUCCESS    | 111      | 224 lignes modifiees          
R2_BRANCH        | SUCCESS    | 3132     | 6934 lignes modifiees         
FORTIGATE_HQ     | SUCCESS    | 11143    | 148 lignes modifiees          
================================================================================
[+] Sauvegardes terminees. Fichiers stockes dans : C:\\Users\\DELL\\Desktop\\DOC\\Homelab\\automation\\backups

[+] Demarrage du Moteur d'Audit et de Conformite...

================================================================================
RAPPORT GLOBAL : SCORE DE CONFORMITE = 100.0 % (40/40 tests valides)
================================================================================
EQUIPEMENT       | CONSTRUCTEUR   | SCORE    | CONTROLES    | STATUT    
--------------------------------------------------------------------------------
R1_HQ            | Cisco          | 100.0  % | 9/9          | CONFORME  
R_STANDBY_HQ     | Cisco          | 100.0  % | 5/5          | CONFORME  
SW1_HQ           | Cisco          | 100.0  % | 9/9          | CONFORME  
R2_BRANCH        | Cisco          | 100.0  % | 4/4          | CONFORME  
FORTIGATE_HQ     | Fortinet       | 100.0  % | 13/13        | CONFORME  
================================================================================
[+] Rapports generes avec succes dans : C:\\Users\\DELL\\Desktop\\DOC\\Homelab\\automation\\reports
    - Rapport JSON : C:\\Users\\DELL\\Desktop\\DOC\\Homelab\\automation\\reports\\audit_report_latest.json
    - Rapport MD   : C:\\Users\\DELL\\Desktop\\DOC\\Homelab\\automation\\reports\\audit_report_latest.md`
  }
];

captures.forEach(renderTerminalCapture);
console.log('Captures Palier 8 generees avec succes.');
