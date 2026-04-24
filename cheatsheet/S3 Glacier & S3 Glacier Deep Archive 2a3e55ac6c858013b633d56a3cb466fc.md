# S3 Glacier & S3 Glacier Deep Archive

Category: Storage
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **Amazon S3 Glacier & S3 Glacier Deep Archive – Study Sheet**

**Exam Domains:**

- Design Secure Architectures
- Design Cost-Optimized Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**Amazon S3 Glacier** and **S3 Glacier Deep Archive** are **secure, durable, and extremely low-cost storage classes** in Amazon S3, designed for **data archiving and long-term backup**.

They offer the same **11 nines (99.999999999%) durability** as S3 Standard but at a fraction of the cost, with **retrieval times from minutes to hours** depending on the access tier.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Archival Object Storage** | Optimized for data rarely accessed but requiring long-term retention. |
| **Integrated with S3** | Available as S3 storage classes — not a separate service. |
| **Retrieval Options (S3 Glacier)** | Expedited (1–5 min), Standard (3–5 hrs), Bulk (5–12 hrs). |
| **Retrieval Options (S3 Glacier Deep Archive)** | Standard (12 hrs), Bulk (up to 48 hrs). |
| **Lifecycle Transitions** | Automatically move data from S3 Standard/IA → Glacier/Deep Archive. |
| **Vault Lock (Legacy)** | Compliance feature for write-once-read-many (WORM) storage (now replaced by **S3 Object Lock**). |
| **Encryption** | Server-side encryption with **SSE-S3**, **SSE-KMS**, or client-side encryption. |
| **Cross-Region Replication** | Supported when versioning and replication rules are enabled. |
| **Durability & Redundancy** | Data stored across multiple AZs in the same Region. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Archive compliance data for 7–10 years | Use **S3 Glacier Deep Archive** |
| Store monthly database snapshots for regulatory requirements | Transition to **S3 Glacier** after 30 days using **Lifecycle rules** |
| Retrieve archived data quickly for audit purposes | Use **Expedited retrieval** (S3 Glacier only) |
| Enforce retention policies for compliance | Use **Object Lock (Compliance Mode)** |
| Archive logs or backups automatically | Use **Lifecycle policies** from S3 Standard → Glacier |
| Store cold data at minimal cost | Use **S3 Glacier Deep Archive** |
| Recover all archived data in bulk (low priority) | Use **Bulk retrieval** |
| Migrate on-prem tape archives to AWS | Use **S3 Glacier or Deep Archive** via **Storage Gateway Tape Gateway** |
| Maintain encrypted, durable backup storage | Enable **SSE-KMS encryption** |

---

## 🔐 **Security Considerations**

- Data automatically encrypted at rest (SSE-S3 by default).
- Optionally encrypt with **SSE-KMS** for key management visibility and control.
- Use **Bucket policies** and **IAM** for access control.
- **MFA Delete** and **Object Lock** protect against accidental or malicious deletions.
- Glacier retrieval jobs can be audited in **CloudTrail**.
- Use **private VPC endpoints** to prevent internet access.

---

## 💲 **Pricing Model**

- Lowest-cost S3 storage classes.
- Pay for:
    - **Storage per GB/month**
    - **Retrieval requests and data restored**
    - **Early deletion fees** (for objects deleted <90 days in Glacier, <180 days in Deep Archive)
- Retrieval pricing tiers:
    - **Expedited** = Highest cost, fastest retrieval
    - **Standard** = Balanced
    - **Bulk** = Lowest cost, slowest retrieval

| Storage Class | Storage Cost | Min Retention | Retrieval Time | Use Case |
| --- | --- | --- | --- | --- |
| **S3 Glacier** | Low | 90 days | Minutes–12 hrs | Archival with occasional retrieval |
| **S3 Glacier Deep Archive** | Very low | 180 days | 12–48 hrs | Long-term cold storage (rarely retrieved) |

---

## 🔗 **Integration Patterns**

- **S3 Lifecycle Policies:** Automate archival transitions.
- **AWS Backup:** Centralized policy-based backup to Glacier.
- **Storage Gateway (Tape Gateway):** Migrate on-prem tapes to Glacier.
- **Athena / Glacier Select:** Query archived data directly (limited).
- **CloudTrail:** Track retrieval and access events.
- **KMS:** Encrypt data at rest.

---

## 🧠 **Exam Tips**

✅ **Glacier = archival**, **Deep Archive = ultra-cold storage.**

✅ Both have **11 nines durability**, but longer retrieval times.

✅ **Lifecycle rules** automate tier transitions (e.g., after 30/60/90 days).

✅ Retrieval is asynchronous — data must be **restored before access**.

✅ **Glacier Vault Lock** = WORM protection (legacy). Prefer **S3 Object Lock** today.

✅ **Glacier and Deep Archive** are **S3 storage classes**, not separate services.

✅ For tape replacement → **Storage Gateway Tape Gateway → Glacier**.

✅ Early deletion fees apply if data deleted too soon.

✅ Use **SSE-KMS** for encryption and compliance reporting.

---

## 🏁 **Real-World Example**

**Scenario:**

A healthcare provider must retain patient imaging data for 7 years to meet compliance, with rare access for audits.

**Solution:**

- Store images in **S3 Standard** for 90 days.
- Transition to **S3 Glacier Deep Archive** using **Lifecycle rules**.
- Enable **S3 Object Lock (Compliance Mode)** to prevent deletion.
- Encrypt all data with **SSE-KMS**.
- Use **AWS Backup** for centralized retention tracking.

**Outcome:**

Compliant, secure, and ultra-low-cost long-term data storage with audit visibility and automatic lifecycle transitions.