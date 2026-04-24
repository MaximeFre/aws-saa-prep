# Organizations & AWS Control Tower

Category: Management and Governance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 2

# **AWS Organizations & AWS Control Tower – Study Sheet**

*(Multi-account governance, security baselines, and automated landing zones)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures
- Design Cost-Optimized Architectures

---

# 🟦 **Part 1 — AWS Organizations**

## 🧭 **Purpose**

**AWS Organizations** helps you centrally manage and govern multiple AWS accounts.

It provides:

- **Multi-account structure (OUs)**
- **Service Control Policies (SCPs)** for governance
- **Consolidated billing**
- **Cross-account automation & baselines**
- **Policy-based management (tag policies, backup policies, AI opt-out)**

It is the foundational service for enterprise-scale AWS environments.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Organizational Units (OUs)** | Logical grouping of accounts (Prod, Dev, Sandbox). |
| **Service Control Policies (SCPs)** | Restrict max permissions across accounts, including the root user. |
| **Consolidated Billing** | One bill + RI/Savings Plan sharing. |
| **Tag Policies** | Enforce consistent tagging across the organization. |
| **Backup Policies** | Standardize backup behavior across accounts. |
| **AI Opt-Out Policies** | Organization-wide control for AI data usage. |
| **Integration with IAM Identity Center** | Centralized access and SSO across accounts. |

---

## 🏗️ **Common Exam Use Cases — Organizations**

| Scenario | Recommended Solution |
| --- | --- |
| Block usage of unwanted services in all accounts | Apply **SCP (Deny)** to OU |
| Enforce tagging standards | Use **Tag Policies** |
| Separate Prod/Dev environments | Create **separate OUs** |
| Apply global governance | Use **Organization-level SCPs** |
| Centralize billing and cost savings | Use **Consolidated Billing** |
| Restrict Regions for compliance | SCP to **Deny actions in disallowed Regions** |
| Prevent IAM root actions | SCP + MFA across accounts |

---

## 🔐 **Security Considerations**

- SCPs **do not grant** permissions → they only restrict.
- SCPs apply to **all principals**, including root user.
- Lock down the management account.
- Use **AWS CloudTrail Organization Trail** for global auditing.
- Enforce MFA at scale via SCP or Identity Center.

---

---

# 🟩 **Part 2 — AWS Control Tower**

## 🧭 **Purpose**

**AWS Control Tower** automatically sets up a secure, multi-account **landing zone** aligned with AWS best practices.

It’s the easiest way to establish a **governed AWS environment** at scale.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Landing Zone** | Prebuilt multi-account environment with governance. |
| **Guardrails** | Preconfigured best-practice policies (preventive & detective). |
| **Account Factory** | Automated creation of new governed accounts. |
| **Baseline Security** | CloudTrail, Config, IAM, DNS, and logging automatically deployed. |
| **Drift Detection** | Detects when accounts deviate from expected configuration. |
| **Central Dashboard** | View compliance status across all accounts. |

---

## 🏗️ **Common Exam Use Cases — Control Tower**

| Scenario | Recommended Solution |
| --- | --- |
| Quickly deploy multi-account architecture | Use **Landing Zone** |
| Enforce compliance across all accounts | Apply **Guardrails** |
| Automatically provision new accounts | Use **Account Factory** |
| Prevent creation of non-compliant resources | Use **Preventive Guardrails** |
| Detect configuration drift | Control Tower **Drift Detection** |
| Enable enterprise-wide logging | Use **Baseline CloudTrail + Config** |

---

## 🔐 **Security Considerations**

- Preventive guardrails use **SCPs**.
- Detective guardrails use **AWS Config rules**.
- Central logging is enforced.
- IAM Identity Center recommended for unified access.
- Accounts created via Account Factory inherit baselines automatically.

---

# 💲 **Pricing**

| Service | Cost |
| --- | --- |
| **AWS Organizations** | Free |
| **AWS Control Tower** | Free — only underlying AWS resources cost money (CloudTrail, Config, S3 logs, etc.) |

---

# 🔗 **Integration Patterns**

- **Organizations + Control Tower** → multi-account governance
- **CloudTrail / Config** → compliance + audit baseline
- **IAM Identity Center** → access control across accounts
- **SSM** → multi-account operations & patching
- **Service Catalog** → templates for Account Factory

---

# 🧠 **Exam Tips**

### Organizations

- SCP = *maximum permissions boundary* for entire accounts.
- SCP **restricts**, never grants permissions.
- Use OUs to group accounts (Prod/Dev/Security).
- Consolidated Billing = central cost optimization.
- Best practice = multi-account architecture.

### Control Tower

- The fastest way to deploy a governed multi-account environment.
- Guardrails = preventive (SCPs) + detective (Config).
- Account Factory automates compliant account creation.
- Landing Zone gives you CloudTrail + Config out of the box.
- Common exam pattern: “Company wants governance at scale → Control Tower.”

---

# 🏁 **Real-World Example**

**Scenario:**

A company with 50 teams needs a secure, compliant AWS environment with logging, guardrails, and automated account provisioning.

**Solution:**

- Deploy **Control Tower** to create the landing zone.
- Use **Organizations** to structure Prod/Dev/Sandbox/Security accounts.
- Apply **guardrails** to enforce compliance.
- Use **Account Factory** for new team accounts.
- Store logs centrally via CloudTrail + Config.

**Outcome:**

A scalable, governed, multi-account environment aligned with AWS best practices.