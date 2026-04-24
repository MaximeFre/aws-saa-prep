# Well-Architected Tool

Category: Management and Governance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **AWS Well-Architected Tool – Study Sheet**

*(Evaluate and improve workloads using AWS best-practice guidance)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures
- Design Cost-Optimized Architectures
- Design High-Performing Architectures

---

## 🧭 **Purpose**

The **AWS Well-Architected Tool** helps you **review, measure, and improve your cloud architectures** against the **five pillars of the AWS Well-Architected Framework**:

1. 🛡️ **Security** – Protect data and systems.
2. 💪 **Reliability** – Recover from failures and meet availability goals.
3. ⚙️ **Performance Efficiency** – Use computing resources efficiently.
4. 💰 **Cost Optimization** – Avoid unnecessary expenses.
5. 🔄 **Operational Excellence** – Run and evolve systems effectively.

It provides a structured approach for **architectural reviews** and **actionable recommendations** based on AWS best practices.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Workload Reviews** | Create workload assessments across AWS accounts and services. |
| **Well-Architected Lenses** | Specialized checklists for specific domains (e.g., Serverless, Analytics, Machine Learning, SaaS). |
| **Improvement Plans** | Auto-generated recommendations for identified risks. |
| **Workload Milestones** | Track progress over time as architectures evolve. |
| **Multi-Account Visibility** | Use AWS Organizations for central management. |
| **Custom Lenses** | Create your own assessment frameworks. |
| **Integration with Trusted Advisor** | Leverage existing cost, security, and performance insights. |
| **API Access** | Automate workload reviews or export reports via API. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Perform architectural reviews to align with AWS best practices | Use **Well-Architected Tool** |
| Assess a serverless or analytics workload | Apply the appropriate **Well-Architected Lens** |
| Track architecture improvements over time | Use **Milestones and Improvement Plans** |
| Identify security or resilience gaps | Run a **Well-Architected Review** |
| Generate automated remediation steps | Implement **Improvement Plans** recommendations |
| Integrate findings into governance tools | Export via **API or AWS Organizations** |
| Provide organization-wide architectural governance | Share workloads across accounts using **AWS Organizations** |
| Combine with Trusted Advisor for cost and security findings | Use **Integrated Insights** |
| Align solutions with the AWS Well-Architected Framework | Reference **the 5 Pillars** during design reviews |

---

## 🔐 **Security Considerations**

- **IAM permissions** control who can create or view workload reviews.
- All data stored is **encrypted at rest (KMS)** and **in transit (TLS)**.
- Sensitive architecture data can be shared **only with trusted accounts**.
- Integrates with **AWS Organizations** for secure cross-account access.
- Leverages findings from **Trusted Advisor** and **Config** without exposing sensitive resources.

---

## 💲 **Pricing Model**

- **Free service** – available to all AWS customers.
- No charge for:
    - Creating workloads and lenses
    - Exporting improvement plans
    - Using the API

💡 **Tip:** There’s no cost to use the tool — the only potential costs are for implementing its improvement recommendations (e.g., enabling Multi-AZ).

---

## 🔗 **Integration Patterns**

- **Trusted Advisor:** For automated cost and security checks.
- **AWS Organizations:** Share workloads across accounts.
- **CloudFormation:** Document architectures automatically.
- **AWS Config:** Validate compliance against Well-Architected best practices.
- **Security Hub:** Track alignment with security-related recommendations.

---

## 🧠 **Exam Tips**

✅ **Well-Architected Tool = structured architectural reviews and improvement tracking.**

✅ Based on the **5 Pillars** of the **AWS Well-Architected Framework**.

✅ Supports **Workload Reviews**, **Lenses**, and **Improvement Plans**.

✅ **Serverless Lens** is common in exam questions.

✅ Integrated with **Trusted Advisor** for actionable insights.

✅ **Free to use** — ideal for continuous improvement.

✅ **Milestones** = track progress across architecture iterations.

✅ AWS SA Associate exam frequently references “Design according to Well-Architected best practices.”

✅ Supports **multi-account governance** via **AWS Organizations**.

✅ Provides **security, reliability, and cost** recommendations — not automatic enforcement.

---

## 🏁 **Real-World Example**

**Scenario:**

A fintech company wants to validate that its new payment processing application meets AWS best practices for security, reliability, and cost optimization.

**Solution:**

- Run a **Well-Architected Review** using the **Serverless Lens**.
- Identify risks such as missing encryption and lack of Multi-AZ redundancy.
- Implement **Improvement Plan** actions (e.g., enable RDS Multi-AZ, use KMS encryption).
- Track progress using **Milestones** for each sprint.
- Integrate with **Trusted Advisor** for ongoing cost/security checks.

**Outcome:**

A fully reviewed, compliant, and cost-efficient architecture aligned with AWS best practices — ready for scaling and future audits.