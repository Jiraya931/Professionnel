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

# Plan d'adressage fixe de l'infrastructure (Proxmox / Wazuh / EVE-NG)
PROXMOX_HOST = "192.168.1.200"
WAZUH_HOST = "192.168.1.201"
EVE_HOST = "192.168.1.202"
FORTIGATE_HOST = "192.168.1.203"

# Passerelle EVE-NG
EVE_USER = "root"
EVE_PASS = "eve"
PLINK_PATH = r"C:\Program Files\PuTTY\plink.exe"
HOSTKEY = "SHA256:LEKSYns1V6Dap/f2XoRUIQl/dE23HldjZHwVGqBOR30"

# Inventaire des Equipements Reseau
INVENTORY = {
    "R1_HQ": {
        "vendor": "cisco",
        "model": "Cisco IOL L3 (15.7M)",
        "role": "Routeur de Campus HQ / Passerelle HSRP Active VLAN 10",
        "host": EVE_HOST,
        "port": 32771,
        "proto": "telnet",
        "expected_interfaces": ["Ethernet0/1", "Ethernet0/0.10"],
        "expected_routes": ["0.0.0.0/0", "10.10.10.0/24", "172.16.1.0/30"],
        "expected_ospf_neighbors": ["172.16.1.1"],
        "expected_dhcp_pools": ["POOL_VLAN10"],
        "expected_hsrp": {"group": 1, "vip": "10.10.10.254", "state": "Active"},
        "expected_syslog_host": WAZUH_HOST
    },
    "R_STANDBY_HQ": {
        "vendor": "cisco",
        "model": "Cisco IOL L3 (15.5T)",
        "role": "Routeur de Secours Campus HQ / Passerelle HSRP Standby VLAN 10",
        "host": EVE_HOST,
        "port": 32776,
        "proto": "telnet",
        "expected_interfaces": ["Ethernet0/0.10"],
        "expected_routes": ["0.0.0.0/0", "10.10.10.0/24"],
        "expected_hsrp": {"group": 1, "vip": "10.10.10.254", "state": "Standby"},
        "expected_syslog_host": WAZUH_HOST
    },
    "SW1_HQ": {
        "vendor": "cisco",
        "model": "Cisco IOL L2 (15.2d)",
        "role": "Commutateur d Acces Campus HQ",
        "host": EVE_HOST,
        "port": 32770,
        "proto": "telnet",
        "expected_interfaces": ["Ethernet0/0", "Ethernet0/1", "Vlan10"],
        "expected_vlans": [1, 10],
        "expected_port_security": ["Ethernet0/1"],
        "expected_dhcp_snooping_vlans": [10],
        "expected_bpduguard": ["Ethernet0/1"],
        "expected_syslog_host": WAZUH_HOST
    },
    "R2_BRANCH": {
        "vendor": "cisco",
        "model": "Cisco IOL L3 (15.5T)",
        "role": "Routeur Succursale Distante (Branch)",
        "host": EVE_HOST,
        "port": 32774,
        "proto": "telnet",
        "expected_interfaces": ["Ethernet0/0", "Ethernet0/1"],
        "expected_routes": ["192.168.1.0/24"],
        "expected_syslog_host": WAZUH_HOST
    },
    "FORTIGATE_HQ": {
        "vendor": "fortinet",
        "model": "FortiGate-VM64-KVM (FortiOS 7.4.13)",
        "role": "Next-Generation Firewall & Passerelle Perimetrique HQ",
        "ip": FORTIGATE_HOST,
        "user": "admin",
        "password": "Fortinet2026!",
        "proto": "ssh",
        "expected_interfaces": ["port1", "port2", "port3"],
        "expected_vips": ["VIP_WEB_DMZ"],
        "expected_policies": ["LAN_TO_INTERNET", "CORP_INTERNAL_INTERZONE", "WAN_TO_DMZ_VIP"],
        "expected_ips_sensors": ["IPS_SENSOR_DMZ"],
        "expected_app_ctrl": ["APP_CTRL_ENTERPRISE"],
        "expected_ospf_neighbors": ["1.1.1.1"],
        "expected_routes": ["10.10.10.0/24"],
        "expected_syslog_host": WAZUH_HOST
    }
}
