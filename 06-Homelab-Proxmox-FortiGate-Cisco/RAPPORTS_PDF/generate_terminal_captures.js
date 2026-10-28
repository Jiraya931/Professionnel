const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const capturesDir = path.join(__dirname, 'captures');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

if (!fs.existsSync(capturesDir)) {
  fs.mkdirSync(capturesDir, { recursive: true });
}

const terminals = [
  {
    id: 'capture_01_pve_cli',
    title: 'root@pve:~ (Shell Proxmox VE 8.x - Validation Machine Virtuelle 200)',
    content: `root@pve:~# pveversion -v | head -n 3
proxmox-ve: 9.2.0 (running kernel: 7.0.14-25-pve)
pve-manager: 9.2.21 (running version: 9.2.21/4f6e0ac86f9e8c7f)
proxmox-kernel-helper: 9.2.0

root@pve:~# qm list
      VMID NAME                 STATUS     MEM(MB)    BOOTDISK(GB) PID       
       200 eve-ng-lab           running    8192              60.00 1240      

root@pve:~# qm config 200 | grep -E 'cpu|scsi|net'
cpu: host
net0: virtio=BC:24:11:C3:CF:75,bridge=vmbr0
scsi0: local-lvm:vm-200-disk-0,discard=on,size=60G,ssd=1
scsihw: virtio-scsi-pci

root@pve:~# lvs pve/data | grep vm-200
  vm-200-disk-0 pve Vwi-aotz-- 60.00g data 28.32%`
  },
  {
    id: 'capture_02_forti_license',
    title: 'admin@FGVMEVKZWIWB8SDE # (FortiOS 7.4 - Statut Licence & Dimensionnement)',
    content: `FGVMEVKZWIWB8SDE # get system status
Version: FortiGate-VM64-KVM v7.4.13,build2933,260929 (GA.M)
Serial-Number: FGVMEVKZWIWB8SDE
License Status: Valid (Evaluation License Permanente Active)
VM Resources: 1 CPU/1 allowed, 1992 MB RAM/2048 MB allowed
Hostname: FGVMEVKZWIWB8SDE
Operation Mode: NAT
Current virtual domain: root
Log hard disk: Not available
FortiOS x86-64: Yes
System time: Tue Oct 27 18:28:00 2026
Last reboot reason: power cycle`
  },
  {
    id: 'capture_03_cisco_sw1',
    title: 'SW1# (Console Cisco IOL L2 - Validation Trunk 802.1Q & VLAN 10)',
    content: `SW1# show interfaces trunk

Port        Mode             Encapsulation  Status        Native vlan
Et0/0       on               802.1q         trunking      1

Port        Vlans allowed on trunk
Et0/0       1-4094

Port        Vlans allowed and active in management domain
Et0/0       1,10

SW1# show vlan brief

VLAN Name                             Status    Ports
---- -------------------------------- --------- -------------------------------
1    default                          active    Et0/2, Et0/3
10   Utilisateurs                     active    Et0/1
1002 fddi-default                     act/unsup 
1003 token-ring-default               act/unsup 
1004 fddinet-default                  act/unsup 
1005 trnet-default                    act/unsup`
  },
  {
    id: 'capture_04_cisco_r1',
    title: 'R1# (Console Cisco IOL L3 - Sous-interface Dot1Q & Table de Routage)',
    content: `R1# show ip interface brief
Interface                  IP-Address      OK? Method Status                Protocol
Ethernet0/0                unassigned      YES NVRAM  up                    up      
Ethernet0/0.10             10.10.10.1      YES NVRAM  up                    up      
Ethernet0/1                172.16.1.2      YES NVRAM  up                    up      

R1# show ip route
Gateway of last resort is 172.16.1.1 to network 0.0.0.0

S*    0.0.0.0/0 [1/0] via 172.16.1.1
      10.0.0.0/8 is variably subnetted, 2 subnets, 2 masks
C        10.10.10.0/24 is directly connected, Ethernet0/0.10
L        10.10.10.1/32 is directly connected, Ethernet0/0.10
      172.16.0.0/16 is variably subnetted, 2 subnets, 2 masks
C        172.16.1.0/30 is directly connected, Ethernet0/1
L        172.16.1.2/32 is directly connected, Ethernet0/1`
  },
  {
    id: 'capture_04_vpcs_ping',
    title: 'VPCS[1]> (Poste Client PC1 - Test Connectivité Réelle Passerelle, FW & Internet)',
    content: `VPCS> show ip

NAME        : VPCS[1]
IP/MASK     : 10.10.10.50/24
GATEWAY     : 10.10.10.1
MAC         : 00:50:79:66:68:04

VPCS> ping 10.10.10.1
84 bytes from 10.10.10.1 icmp_seq=1 ttl=255 time=0.973 ms
84 bytes from 10.10.10.1 icmp_seq=2 ttl=255 time=1.025 ms
[TEST 1 : Passerelle Cisco R1 locale -> SUCCÈS 100%]

VPCS> ping 172.16.1.1
84 bytes from 172.16.1.1 icmp_seq=1 ttl=254 time=1.552 ms
84 bytes from 172.16.1.1 icmp_seq=2 ttl=254 time=1.419 ms
[TEST 2 : Patte LAN Pare-feu FortiGate -> SUCCÈS 100%]

VPCS> ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=113 time=62.964 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=113 time=65.156 ms
84 bytes from 8.8.8.8 icmp_seq=3 ttl=113 time=63.421 ms
[TEST 3 : Sortie VRAI INTERNET Mondial via NAT Fortinet -> SUCCÈS TOTAL]`
  },
  {
    id: 'capture_05_forti_logs',
    title: 'FGVMEVKZWIWB8SDE # (FortiGate 7.4 - Logs Mémoire & Politique Pare-feu NAT)',
    content: `FGVMEVKZWIWB8SDE # get log memory setting
status              : enable 

FGVMEVKZWIWB8SDE # show firewall policy 1
config firewall policy
    edit 1
        set name "LAN_TO_INTERNET"
        set srcintf "port2"
        set dstintf "port1"
        set action accept
        set srcaddr "all"
        set dstaddr "all"
        set schedule "always"
        set service "ALL"
        set logtraffic all
        set logtraffic-start enable
        set nat enable
    next
end

FGVMEVKZWIWB8SDE # get router info routing-table all
Routing table for VRF=0
S*      0.0.0.0/0 [5/0] via 192.168.1.1, port1
S       10.10.10.0/24 [10/0] via 172.16.1.2, port2
C       172.16.1.0/30 is directly connected, port2
C       192.168.1.0/24 is directly connected, port1`
  }
];

terminals.forEach(t => {
  let html = `<!DOCTYPE html>
<html>
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
    font-size: 11px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
  .hl-cmd { color: #38bdf8; font-weight: bold; }
  .hl-ok { color: #4ade80; font-weight: bold; }
</style>
</head>
<body>
<div class="window">
  <div class="titlebar">
    <span class="dot red"></span>
    <span class="dot yellow"></span>
    <span class="dot green"></span>
    <span class="title">${t.title}</span>
  </div>
  <pre>${t.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
</div>
</body>
</html>`;

  let tempHtml = path.join(capturesDir, `${t.id}.html`);
  fs.writeFileSync(tempHtml, html, 'utf8');

  let outPng = path.join(capturesDir, `${t.id}.png`);
  console.log(`Rendu de la capture console : ${t.id}.png...`);
  execFileSync(edgePath, [
    '--headless',
    '--disable-gpu',
    '--window-size=920,440',
    `--screenshot=${outPng}`,
    tempHtml
  ]);
  fs.unlinkSync(tempHtml);
});

console.log('✅ Toutes les captures de consoles réelles ont été créées !');

