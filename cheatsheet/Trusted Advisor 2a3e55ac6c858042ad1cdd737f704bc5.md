# Trusted Advisor

Category: Management and Governance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **AWS Trusted Advisor – Study Sheet**

*(Automated AWS account optimization and best-practice insights)*

**Exam Domains:**

- Design Cost-Optimized Architectures
- Design Secure Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**AWS Trusted Advisor** is an **automated auditing and recommendation service** that analyzes your AWS environment against **AWS best practices** across multiple categories:

**Cost Optimization, Performance, Security, Fault Tolerance, and Service Limits.**

It’s designed to help architects **improve efficiency**, **reduce costs**, and **strengthen security** proactively.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Best-Practice Checks** | Evaluates your account configuration across 5 pillars. |
| **Cost Optimization** | Identifies idle or underutilized resources (e.g., EC2, EBS, RDS). |
| **Performance** | Suggests improvements for latency, throughput, and scaling. |
| **Security** | Highlights potential security risks (e.g., open S3 buckets, MFA disabled). |
| **Fault Tolerance** | Recommends redundancy or multi-AZ setups. |
| **Service Limits** | Warns when you approach AWS resource quotas. |
| **Actionable Recommendations** | Links directly to the AWS console for one-click remediation. |
| **Organizational View** | View insights across all AWS accounts via **AWS Organizations**. |
| **Notifications** | Integrate with **AWS Health Dashboard** and **EventBridge** for alerts. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Identify idle EC2 instances to reduce cost | Use **Cost Optimization checks** |
| Detect unencrypted S3 buckets or security risks | Use **Security checks** |
| Ensure EBS volumes are snapshotted regularly | Enable **Fault Tolerance checks** |
| Avoid hitting API or service limits | Monitor **Service Limits** |
| Audit organization-wide resource usage | Use **Trusted Advisor + AWS Organizations** |
| Detect RDS DBs without Multi-AZ | Use **Fault Tolerance category** |
| Receive real-time alerts for risks | Integrate with **EventBridge or Health Dashboard** |
| View compliance summaries in Security Hub | Connect **Trusted Advisor findings → Security Hub** |
| Get full insights beyond the free tier | Enable **Business or Enterprise Support Plan** |

---

## 🔐 **Security Considerations**

- Trusted Advisor **reads account metadata only** (no access to data).
- Integrates with **Security Hub** to surface findings.
- Supports **IAM permissions** to restrict access (`trustedadvisor:*`).
- Recommendations **do not auto-remediate** — manual or automation required.
- Access control and visibility can be **centralized via AWS Organizations**.
- Data encrypted at rest and in transit by default.

---

## 💲 **Pricing Model**

| Tier | Access Level | Description |
| --- | --- | --- |
| **Basic / Developer Support Plans** | Limited Checks | Service limits + basic security checks |
| **Business / Enterprise Support Plans** | Full Checks | All 5 categories, refresh every 5 min |
| **Cost** | Included in support plan | No per-check charge |

💡 **Tip:** Exam questions often note that **full Trusted Advisor features require Business or Enterprise Support Plans**.

---

## 🔗 **Integration Patterns**

- **Security Hub:** Centralize Trusted Advisor security findings.
- **EventBridge:** Trigger alerts or remediation workflows.
- **AWS Organizations:** Consolidate checks across accounts.
- **CloudWatch Dashboards:** Visualize cost and performance improvements.
- **AWS Support API:** Automate retrieval of check results.

---

## 🧠 **Exam Tips**

✅ **Trusted Advisor = AWS account health & optimization auditor.**

✅ Covers **five categories:** Cost, Performance, Security, Fault Tolerance, and Service Limits.

✅ **Free tier (Basic/Developer)** = only Service Limits + some Security checks.

✅ **Full checks require Business/Enterprise Support Plans.**

✅ Integrates with **Security Hub** and **EventBridge**.

✅ Does **not** enforce changes — provides recommendations only.

✅ Can run across **multiple accounts** using **AWS Organizations**.

✅ Helps identify cost waste (e.g., idle EC2/EBS, unattached IPs).

✅ Refresh checks manually or automatically (every 5 minutes with Enterprise Support).

✅ Useful for **ongoing architecture reviews** and **operational excellence**.

---

## 🏁 **Real-World Example**

**Scenario:**

An e-commerce company wants to reduce AWS costs and strengthen security by automatically auditing its accounts for inefficiencies.

**Solution:**

- Enable **Trusted Advisor** with **Business Support Plan**.
- Review recommendations across all 5 pillars.
- Identify and stop **idle EC2 instances** and **unused EBS volumes**.
- Enable **MFA** for all IAM users flagged by the Security checks.
- Integrate with **Security Hub** and **EventBridge** for centralized visibility.

**Outcome:**

Reduced monthly AWS costs, improved security posture, and better fault tolerance across all environments with automated governance visibility.