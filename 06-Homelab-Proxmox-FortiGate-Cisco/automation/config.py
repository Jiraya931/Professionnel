"""
Module de Configuration pour la Suite NetDevOps
Projet Homelab Proxmox VE 8, FortiGate 7.4 & Cisco IOL
Auteur : Ababacar Ousmane Niang - Master 2 RESI
"""

from pathlib import Path

# Chemins de base
BASE_DIR = Path(__file__).resolve().parent
BACKUP_DIR = BASE_DIR / "backups"
REPORTS_DIR = BASE_DIR / "reports"

# Passerelle EVE-NG
EVE_HOST = "192.168.1.3"
EVE_USER = "root"
EVE_PASS = "eve"
PLINK_PATH = r"C:\Program Files\PuTTY\plink.exe"
HOSTKEY = "SHA256:LEKSYns1V6Dap/f2XoRUIQl/dE23HldjZHwVGqBOR30"

# Inventaire des Equipements Reseau
INVENTORY = {
    "R1_HQ": {
        "vendor": "cisco",
        "model": "Cisco IOL L3 (15.7M)",
        "role": "Routeur de Campus HQ / Passerelle VLAN 10",
        "host": EVE_HOST,
        "port": 32771,
        "proto": "telnet",
        "expected_interfaces": ["Ethernet0/1", "Ethernet0/0.10"],
        "expected_routes": ["0.0.0.0/0", "10.10.10.0/24", "172.16.1.0/30"],
        "expected_ospf_neighbors": ["172.16.1.1"]
    },
    "SW1_HQ": {
        "vendor": "cisco",
        "model": "Cisco IOL L2 (15.2d)",
        "role": "Commutateur d Acces Campus HQ",
        "host": EVE_HOST,
        "port": 32770,
        "proto": "telnet",
        "expected_interfaces": ["Ethernet0/0", "Ethernet0/1"],
        "expected_vlans": [1, 10]
    },
    "R2_BRANCH": {
        "vendor": "cisco",
        "model": "Cisco IOL L3 (15.5T)",
        "role": "Routeur Succursale Distante (Branch)",
        "host": EVE_HOST,
        "port": 32774,
        "proto": "telnet",
        "expected_interfaces": ["Ethernet0/0", "Ethernet0/1"],
        "expected_routes": ["192.168.1.0/24"]
    },
    "FORTIGATE_HQ": {
        "vendor": "fortinet",
        "model": "FortiGate-VM64-KVM (FortiOS 7.4.13)",
        "role": "Next-Generation Firewall & Passerelle Perimetrique HQ",
        "ip": "192.168.1.4",
        "user": "admin",
        "password": "Fortinet2026!",
        "proto": "ssh",
        "expected_interfaces": ["port1", "port2", "port3"],
        "expected_vips": ["VIP_WEB_DMZ"],
        "expected_policies": ["LAN_TO_INTERNET", "CORP_INTERNAL_INTERZONE", "WAN_TO_DMZ_VIP"],
        "expected_ips_sensors": ["IPS_SENSOR_DMZ"],
        "expected_app_ctrl": ["APP_CTRL_ENTERPRISE"],
        "expected_ospf_neighbors": ["1.1.1.1"],
        "expected_routes": ["10.10.10.0/24"]
    }
}
