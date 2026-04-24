# Transit Gateway

Category: Networking
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **AWS Transit Gateway – Study Sheet**

**Exam Domains:**

- Design Resilient Architectures
- Design Secure Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**AWS Transit Gateway (TGW)** acts as a **central networking hub** that simplifies and scales connectivity between **multiple VPCs**, **on-premises networks**, and **AWS Direct Connect** connections.

It replaces complex **VPC Peering meshes** with a **hub-and-spoke model**, reducing operational overhead and improving routing control.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Centralized Hub** | Connects multiple VPCs and on-prem networks via a single gateway. |
| **Scalable Routing** | Uses route tables for flexible traffic control between attachments. |
| **Cross-Account Attachments** | Share a Transit Gateway across AWS accounts using AWS RAM. |
| **Inter-Region Peering** | Connect Transit Gateways across Regions for global networking. |
| **Integration with Direct Connect** | Use **Transit Virtual Interface (Transit VIF)** for hybrid connectivity. |
| **Multicast Support** | Native multicast traffic support for applications like video streaming. |
| **Transit Gateway Connect** | Integrates with SD-WAN appliances via GRE and BGP tunnels. |
| **Propagation & Association** | Manage which routes are learned (propagated) and applied (associated) per VPC or VPN. |
| **Bandwidth Aggregation** | Combine multiple attachments for higher throughput. |
| **High Availability** | Fully managed and automatically scales within the Region. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Simplify connectivity among multiple VPCs | Use **Transit Gateway** instead of many **VPC peerings** |
| Centralize on-premises VPN connections | Attach VPNs to a **Transit Gateway hub** |
| Extend hybrid connectivity from one DX link to multiple VPCs | Use **Direct Connect Gateway + Transit VIF → Transit Gateway** |
| Enable routing between VPCs in multiple AWS accounts | Share **Transit Gateway** via **AWS Resource Access Manager (RAM)** |
| Control which VPCs can communicate | Use **Transit Gateway route tables** and route propagation |
| Connect multiple Regions with unified routing | Use **TGW Inter-Region Peering** |
| Integrate SD-WAN appliances | Use **Transit Gateway Connect** |
| Ensure high availability for hybrid workloads | Deploy redundant **VPN + Direct Connect** attachments |
| Replace VPC Peering mesh | Migrate to **hub-and-spoke model with TGW** |
| Segment workloads (e.g., dev/prod) | Use separate **TGW route tables** per environment |

---

## 🔐 **Security Considerations**

- TGW is **Region-specific**, but supports **encrypted inter-Region peering**.
- Use **route table associations and propagation** to control communication flow.
- Enforce **segmentation** between environments using multiple TGW route tables.
- **IAM policies** control who can create/attach/disassociate VPCs.
- **Traffic between attachments is private** — no internet traversal.
- For compliance, log routes and changes with **CloudTrail**.
- Pair with **Network Firewall** or **Inspection VPCs** for deep packet inspection.

---

## 💲 **Pricing Model**

- Charged per **attachment-hour** (VPC, VPN, Direct Connect, or peering).
- **Data processing charge** per GB transferred through TGW.
- **No cost for propagation/association changes** or static routes.
- **Cross-Region peering** incurs inter-Region data transfer fees.

---

## 🔗 **Integration Patterns**

- **VPC Attachments:** Connect VPCs via private ENIs in subnets.
- **VPN Attachments:** IPsec tunnels for hybrid connectivity.
- **Direct Connect Gateway:** Extend DX to multiple VPCs.
- **Resource Access Manager (RAM):** Share TGW with multiple accounts.
- **CloudWatch:** Monitor metrics such as `BytesIn/Out` per attachment.
- **AWS Network Firewall:** Secure central inspection.
- **Transit Gateway Connect:** Integration with third-party SD-WAN.

---

## 🧠 **Exam Tips**

✅ **Transit Gateway = hub-and-spoke network architecture.**

✅ **Replaces VPC Peering meshes** (non-transitive peering).

✅ **Route Tables:** Control communication paths — only associated/propagated routes are active.

✅ **Cross-Region Peering:** Encrypted and private.

✅ **Share across accounts** with **RAM** (same Org).

✅ Combine **TGW + Direct Connect Gateway** for global hybrid connectivity.

✅ TGW supports **multicast** and **SD-WAN Connect** (exam favorite).

✅ **No overlapping CIDRs** across connected VPCs.

✅ For segmentation (e.g., prod vs dev), use **separate TGW route tables**.

---

## 🏁 **Real-World Example**

**Scenario:**

A multinational enterprise operates 10 VPCs across three accounts in **us-east-1** and wants a single, secure way to connect them to each other and to the on-premises data center via Direct Connect.

**Solution:**

- Deploy an **AWS Transit Gateway** in `us-east-1`.
- Attach all VPCs using **VPC attachments**.
- Connect the on-prem data center via **Direct Connect Gateway** and **Transit VIF**.
- Use **RAM** to share TGW across accounts.
- Create separate **route tables** for production and development traffic segmentation.

**Outcome:**

Simplified, scalable, and cost-efficient network hub enabling centralized management, isolation, and hybrid connectivity with high availability.