# AWS Backup

Category: Storage
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **AWS Backup – Study Sheet**

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**AWS Backup** is a **fully managed, centralized backup service** that automates and consolidates data protection across multiple AWS services (e.g., EBS, RDS, DynamoDB, EFS, FSx, and EC2).

It enables compliance, retention policies, and recovery management **at scale** without building custom backup scripts.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Centralized Backup Management** | Define, schedule, and manage backups across AWS services from one console. |
| **Backup Plans** | Predefined policies specifying frequency, retention, and lifecycle rules. |
| **Cross-Region and Cross-Account Backups** | Replicate backups for DR or compliance across Regions or accounts. |
| **Backup Vaults** | Logical containers with encryption, access control, and immutability (Vault Lock). |
| **Supported Services** | EBS, RDS, DynamoDB, EFS, FSx, EC2, S3 (partial), and on-prem via Storage Gateway. |
| **Vault Lock** | Enforces WORM (Write Once Read Many) compliance for backups. |
| **Lifecycle Management** | Transition backups from warm to cold storage automatically. |
| **Point-in-Time Recovery (PITR)** | Available for certain services (e.g., RDS, DynamoDB). |
| **Tag-Based Policies** | Automatically include new resources in backup plans. |
| **Auditing and Compliance** | Integrated with AWS CloudTrail and AWS Config for visibility. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Centralize backups for multiple AWS services | Use **AWS Backup with Backup Plans** |
| Enforce retention and immutability for compliance | Use **Vault Lock** |
| Automatically protect new resources by tag | Use **Tag-based backup plans** |
| Create DR copies in another Region | Enable **Cross-Region Backup replication** |
| Manage backups across multiple AWS accounts | Use **Cross-Account Backups** via **Organizations** |
| Transition old backups to cheaper storage | Configure **Lifecycle policies** (warm → cold tier) |
| Protect on-prem workloads | Integrate **AWS Backup with Storage Gateway** |
| Audit backup activities | Use **CloudTrail** and **AWS Backup Audit Manager** |
| Ensure backups can’t be deleted early | Use **Vault Lock** (compliance enforcement) |
| Quickly restore EBS or RDS volumes | Use **Point-in-Time Recovery (PITR)** |

---

## 🔐 **Security Considerations**

- **Encryption:** All backups encrypted with **KMS** (service-managed or customer-managed keys).
- **Vault Lock:** Prevents backup deletion/modification (WORM compliance).
- **IAM policies:** Control who can create, restore, or delete backups.
- **Cross-Account Backups:** Share via **AWS Organizations** with fine-grained permissions.
- **Audit:** Track events with **CloudTrail** and monitor compliance via **AWS Backup Audit Manager**.
- **Private access:** Use **VPC endpoints** to prevent exposure to the public internet.

---

## 💲 **Pricing Model**

- **Pay per GB-month** of backup storage (warm and cold tiers).
- **Pay per GB** of restored data.
- **No charge** for backup management operations.
- **Lifecycle management** automatically reduces cost by moving data to cold storage tiers.
- Additional cost for **cross-Region** and **cross-account** backup transfers.

---

## 🔗 **Integration Patterns**

- **EBS / EC2:** Automated volume-level snapshots.
- **RDS / Aurora:** Point-in-time backups for databases.
- **DynamoDB:** Table backups + PITR integration.
- **EFS / FSx:** File system and Windows file server backups.
- **S3:** Partial backup support (object-level).
- **Storage Gateway:** Extend AWS Backup to on-prem workloads.
- **KMS:** Encryption key management for all vaults.
- **AWS Organizations:** Multi-account policies.

---

## 🧠 **Exam Tips**

✅ **AWS Backup = centralized, automated backup control plane.**

✅ Use **Vault Lock** for compliance (immutable backups).

✅ **Lifecycle policies** move old backups to cheaper cold storage tiers.

✅ **Cross-Region and Cross-Account replication** support DR strategies.

✅ Supports **EBS, RDS, EFS, FSx, DynamoDB, EC2, Storage Gateway**.

✅ **Tag-based backups** auto-include new resources matching tag rules.

✅ Use **CloudTrail + Backup Audit Manager** for visibility and compliance.

✅ Use **KMS encryption** for all backups by default.

✅ AWS Backup **integrates with AWS Organizations** for policy enforcement.

---

## 🏁 **Real-World Example**

**Scenario:**

A financial company must ensure encrypted daily backups of RDS and EFS data, replicated across Regions and retained for 7 years per compliance laws.

**Solution:**

- Create an **AWS Backup Plan** with daily schedule and 7-year retention.
- Enable **Cross-Region replication** for DR.
- Store backups in an encrypted **Backup Vault** with **Vault Lock** enabled.
- Use **KMS CMK** for encryption.
- Monitor compliance using **AWS Backup Audit Manager**.

**Outcome:**

Secure, compliant, automated, and cost-optimized backup solution meeting retention, encryption, and audit requirements.