# Direct Connect

Category: Networking
Domains: Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# AWS Direct Connect Gateway – Study Sheet

**Exam Domain(s):**

- Design Resilient Architectures
- Design Cost-Optimized Network Architectures

---

## 🧭 **Purpose**

**AWS Direct Connect Gateway (DX Gateway)** allows you to connect your **on-premises data center** to **multiple VPCs across different AWS Regions** using **a single Direct Connect connection**.

It provides a **centralized network architecture** that simplifies management and reduces cost by eliminating the need for multiple physical connections.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Multi-Region VPC Connectivity** | Enables access to VPCs in any AWS Region (except China) through one Direct Connect connection. |
| **Simplified Architecture** | Reduces need for multiple VIFs or redundant connections to each Region. |
| **Virtual Interface (VIF)** | Connects to a private or transit virtual interface (VIF). |
| **Supports Multiple Accounts** | Can be used with **AWS Resource Access Manager (RAM)** to share DX Gateway across accounts. |
| **Transit Virtual Interface (Transit VIF)** | Allows connection to **AWS Transit Gateway** to reach multiple VPCs. |
| **Private Virtual Interface (Private VIF)** | Used to connect directly to **VPC private IP addresses**. |
| **Isolation & Security** | Traffic does **not traverse the public internet** — provides predictable latency and consistent bandwidth. |
| **Global Access** | Supports inter-region routing, making it ideal for multinational or hybrid architectures. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Connect one on-premises router to **multiple VPCs in multiple Regions** | Use **Direct Connect Gateway** |
| Connect multiple AWS accounts through centralized networking | Use **DX Gateway + AWS RAM** |
| Integrate Direct Connect with existing Transit Gateway setup | Use **Transit VIF** on DX Gateway |
| Ensure high availability for hybrid workloads | Combine **DX Gateway** with **VPN failover** (AWS Site-to-Site VPN) |
| Reduce egress costs over public internet | Route through **private DX connection** instead of public endpoints |

---

## 🔐 **Security Considerations**

- Traffic **never traverses the public internet**.
- Apply **BGP (Border Gateway Protocol)** for dynamic routing.
- You can **advertise specific prefixes** to control routing.
- Pair with **AWS IAM policies**, **RAM**, and **Network ACLs** for access control.
- **Encryption:** Not inherently encrypted — use **VPN over DX** if encryption is required.

---

## 💲 **Pricing Model**

- **Port-hour charges:** Based on port speed (1 Gbps, 10 Gbps, 100 Gbps).
- **Data transfer charges:** Significantly **lower than internet egress rates**.
- **Private VIF** and **Transit VIF** are priced separately.
- No additional fee for the DX Gateway itself — you pay for data transfer and port usage.

---

## 🔗 **Integration Patterns**

- **With Transit Gateway:** Connect multiple VPCs across accounts/Regions.
- **With VPN:** Create hybrid redundant connections for DR (Direct Connect + VPN failover).
- **With AWS RAM:** Share DX Gateway resources across AWS Organizations.
- **With Private VIFs:** Enable direct access to private subnets within VPCs.

---

## 🧠 **Exam Tips**

✅ **DX Gateway = Cross-Region + Multi-VPC connectivity.**

✅ Use **Transit VIF** to connect to **Transit Gateway**.

✅ Use **Private VIF** to connect directly to a **single VPC**.

✅ Combine with **Site-to-Site VPN** for **high availability** and **encryption**.

✅ DX traffic **bypasses the internet** → **predictable latency + cost savings**.

✅ **Not a data encryption mechanism** — VPN required if security mandates encryption.

---

## 🏁 **Quick Comparison**

| Feature | Direct Connect Gateway | Transit Gateway | Site-to-Site VPN |
| --- | --- | --- | --- |
| Connection Type | Private, dedicated | Regional hub for VPCs | Encrypted over internet |
| Cross-Region | ✅ Yes | ❌ No (Regional) | ✅ Yes |
| Encryption | ❌ No | N/A | ✅ Yes |
| Bandwidth | High | High | Moderate |
| Cost | Lower egress | Standard | Data transfer + VPN costs |
| Use Case | Multi-Region hybrid | Multi-VPC in one Region | Secure backup connection |

---

## 🧩 **Real-World Example**

**Scenario:**

A global enterprise wants to connect its on-premises data center in London to VPCs in **Ireland**, **Frankfurt**, and **Paris**, using one physical Direct Connect link.

**Solution:**

- Set up **AWS Direct Connect** at the London colocation facility.
- Create a **Direct Connect Gateway**.
- Associate VPCs in each Region (eu-west-1, eu-central-1, eu-west-3).
- Use **Private VIF** or **Transit VIF** depending on topology.

**Outcome:**

✅ Single, scalable, cost-effective hybrid architecture with predictable performance.