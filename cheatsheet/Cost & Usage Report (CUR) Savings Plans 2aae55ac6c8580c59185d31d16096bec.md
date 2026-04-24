# Cost & Usage Report (CUR) / Savings Plans

Category: Cost Management
Domains: Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 3

# **AWS Cost & Usage Report (CUR) / Savings Plans – Study Sheet**

*(Deep cost visibility + long-term cost optimization commitments)*

**Exam Domains:**

- Design Cost-Optimized Architectures
- Design High-Performing Architectures

---

# 🟥 **AWS Cost & Usage Report (CUR)**

*(The most detailed cost and usage dataset available in AWS)*

## 🧭 Purpose

The **Cost & Usage Report (CUR)** is the **gold standard** for AWS cost visibility.

It provides *every* line item of cost and usage, across all accounts and services.

Think of it as:

**“The source of truth for all AWS billing data.”**

It is used for:

- Deep cost analysis
- Chargeback / showback
- Custom dashboards
- FinOps automation
- Savings & anomaly detection

---

## ⚙️ Key Features

- Delivers **hourly** or **daily** cost and usage logs
- Stored in **S3**
- Queryable via **Athena** automatically (common exam pattern!)
- Integrates with:
    - Redshift
    - QuickSight
    - Glue (schema auto-generated)
- Records all discounts (RI, SP, credits)
- Multi-account support (Organizations)

---

## 🏗️ Common Exam Use Cases — CUR

| Scenario | Recommended Solution |
| --- | --- |
| Need the most detailed billing data | **Enable CUR** |
| Build custom dashboards for cost | CUR → Athena → QuickSight |
| Do cost allocation by tag | Enable **cost allocation tags** + CUR |
| Analyze usage across multiple AWS accounts | CUR (Org-level) |
| Track RI/Savings Plan usage and anomalies | CUR |
| Build internal chargeback system | CUR + Athena + QuickSight |

---

## 🔐 Security Considerations

- CUR delivered to **S3** — secure with:
    - KMS SSE encryption
    - Bucket policies
    - IAM permissions
- S3 access logs recommended
- Athena queries restricted via IAM

---

## 💲 Pricing

- CUR itself is **free**
- You pay for:
    - S3 storage
    - Athena queries

---

## 🧠 Exam Tips — CUR

- CUR = **most granular billing mechanism**.
- Delivered to S3 → query via Athena.
- Must **enable cost allocation tags** for detailed breakdown.
- Used for **FinOps**, forecasting, and chargeback.
- Much deeper visibility than Cost Explorer.

---

---

# 🟦 **AWS Savings Plans**

*(Commitment-based discount for compute services)*

## 🧭 Purpose

**Savings Plans** give significant discounts (up to 72%) in exchange for committing to **a consistent amount of compute usage ($/hour)** for **1 or 3 years**.

They replace most use cases of Reserved Instances (except certain database cases).

Think:

**“Reserved pricing but flexible across instance families, sizes, and Regions.”**

---

## ⚙️ Types of Savings Plans

### 1️⃣ **Compute Savings Plans (most flexible)**

Apply to ANY:

- EC2 instance type
- EC2 instance family
- Region
- OS
- Tenancy
- **Also applies to: Lambda + Fargate**

### 2️⃣ **EC2 Instance Savings Plans**

Less flexible but higher discount

- Locked to instance family (e.g., m5)
- Flexible on size (m5.large, m5.2xlarge…)
- Region-locked

---

## 🏗️ Common Exam Use Cases — Savings Plans

| Scenario | Recommended Solution |
| --- | --- |
| Save cost across EC2 + Lambda + Fargate | **Compute Savings Plan** |
| You know the instance family (e.g., m5) will remain stable | **EC2 Instance Savings Plan** |
| Migrate workloads across Regions | **Compute SP** |
| Autoscaling workloads with stable baseline | Savings Plan |
| Reduce cost for long-running compute | Savings Plans |

---

## 🔐 Security Considerations

- Only billing/admin access can create SP commitments.
- Organization-level Savings Plans apply across all linked accounts.
- Use IAM + SCP to restrict purchase permissions.

---

## 💲 Pricing

Depends on commitment:

- **1-year vs 3-year**
- **No upfront / partial upfront / all upfront**
- More commitment = more discount

---

## 🧠 Exam Tips — Savings Plans

- Savings Plans are **more flexible** than Reserved Instances.
- If the scenario mentions **Lambda or Fargate**, the answer cannot be RIs → must be **Compute Savings Plan**.
- EC2 Instance SPs: locked to instance family + Region.
- Compute SPs: apply to *any* compute usage.
- SPs work across **multiple accounts** with Consolidated Billing.
- Great for workloads with a **consistent baseline** (e.g., minimum traffic).

---

# 🧱 Savings Plans vs Reserved Instances (Exam Comparison)

| Feature | Savings Plans | Reserved Instances |
| --- | --- | --- |
| Flexibility (types, sizes, Regions) | **High** | Low |
| Applies to Lambda/Fargate | **Yes** | No |
| Applies to EC2 | Yes | Yes |
| Payment options | Yes | Yes |
| Instance family lock-in | EC2 SP only | Yes |
| Legacy database discounts | No | **RDS is RI-based only** |

**Exam rule:**

> If choosing between RIs and Savings Plans, use Savings Plans unless the question is specifically about RDS or Redshift.
> 

---

# 🏁 Real-World Example

**Scenario:**

A company has long-running EC2 workloads, but also uses Lambda and Fargate for microservices. They want to lower cost without locking into a single instance type.

**Solution:**

- Purchase a **Compute Savings Plan ($/hr)** commitment.
- Use the CUR to monitor cost, savings, and consumption.

**Outcome:**

Significant cost reduction with maximum flexibility.