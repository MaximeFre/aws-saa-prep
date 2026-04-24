# Security Hub &  GuardDuty

Category: Security Identity and Compliance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures
Priority: Tier 1

# **AWS Security Hub & Amazon GuardDuty – Study Sheet**

*(Centralized threat detection, security monitoring, and compliance automation)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**AWS Security Hub** and **Amazon GuardDuty** provide **continuous monitoring and threat detection** across your AWS environment.

They work together to **detect, analyze, and aggregate** potential security issues from AWS accounts and services.

- **GuardDuty** → Detects **threats** using AI and threat intelligence.
- **Security Hub** → **Aggregates**, **normalizes**, and **prioritizes** findings from GuardDuty, Inspector, Macie, and others.

---

## ⚙️ **Key Features**

### 🛡️ **Amazon GuardDuty**

| Feature | Description |
| --- | --- |
| **Threat Detection** | Uses ML and threat intelligence (AWS, CrowdStrike, Proofpoint) to detect anomalies. |
| **Data Sources** | Analyzes **VPC Flow Logs**, **CloudTrail events**, and **DNS logs** (no agents needed). |
| **Findings** | Detects reconnaissance, credential compromise, and data exfiltration. |
| **No Performance Impact** | Works by reading log data streams (non-intrusive). |
| **Multi-Account Support** | Centralized management across organizations. |
| **Automated Response** | Integrate with **EventBridge** and **Lambda** for automated remediation. |

---

### 🧩 **AWS Security Hub**

| Feature | Description |
| --- | --- |
| **Security Aggregation Service** | Centralizes security findings from AWS and partner tools. |
| **Integrated Services** | GuardDuty, Inspector, Macie, Firewall Manager, IAM Access Analyzer, Config, and more. |
| **Security Standards** | Evaluates compliance with **CIS AWS Foundations**, **PCI DSS**, and **AWS Foundational Security Best Practices**. |
| **Findings Format** | Normalized into **AWS Security Finding Format (ASFF)** for consistency. |
| **Automated Remediation** | Trigger **EventBridge rules** or **Lambda functions** to fix issues. |
| **Multi-Account View** | Central security posture visibility via AWS Organizations. |
| **Integration with SIEMs** | Send findings to third-party tools (Splunk, Datadog, etc.). |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Detect suspicious API activity | Use **GuardDuty** (analyzes CloudTrail events) |
| Detect data exfiltration from EC2 instances | Use **GuardDuty with VPC Flow Logs** |
| Centralize and visualize findings from multiple security services | Use **Security Hub** |
| Automate responses to GuardDuty alerts | Connect **EventBridge → Lambda** for remediation |
| Monitor security posture across all AWS accounts | Enable **Security Hub across Org accounts** |
| Check compliance with AWS best practices | Use **Security Hub’s Foundational Security Standard** |
| Detect malicious IPs or domains | GuardDuty threat intelligence detection |
| Trigger ticket creation or alerts for findings | Integrate **Security Hub with EventBridge + SNS** |
| Audit which users accessed resources anomalously | GuardDuty + CloudTrail correlation |
| Correlate findings across Macie, Inspector, and GuardDuty | Use **Security Hub dashboard** |

---

## 🔐 **Security Considerations**

- **No agents required** — both services use AWS logs and APIs.
- Use **IAM roles** for cross-account data aggregation.
- Findings are **read-only** — cannot modify resource configurations directly.
- Integrate **GuardDuty findings** into **Security Hub** for unified dashboards.
- **EventBridge** enables automated alerting/remediation.
- Data encrypted at rest with **KMS** and in transit with **TLS**.
- Findings automatically expire after **90 days** (GuardDuty).

---

## 💲 **Pricing Model**

| Service | Cost Model | Notes |
| --- | --- | --- |
| **GuardDuty** | Pay per analyzed log data volume | Based on CloudTrail events, VPC Flow Logs, and DNS logs |
| **Security Hub** | Pay per ingested security finding | ~$0.001 per finding per month |
| **Free Tier** | 30-day free trial for both | Useful for exam labs |
| **Data Transfer** | No extra cost | Intra-Region only |

---

## 🔗 **Integration Patterns**

- **CloudTrail, VPC Flow Logs, DNS Logs:** Data sources for GuardDuty.
- **Security Hub + EventBridge:** Automate alerts and remediation actions.
- **AWS Organizations:** Manage multi-account security posture.
- **Macie / Inspector / IAM Access Analyzer:** Feed compliance findings into Security Hub.
- **SNS or Lambda:** Notify security teams or auto-remediate.
- **SIEM / SOAR Systems:** Export findings externally for deeper analysis.

---

## 🧠 **Exam Tips**

✅ **GuardDuty = detection; Security Hub = aggregation & compliance.**

✅ GuardDuty analyzes **CloudTrail, VPC Flow Logs, and DNS logs** — no agents required.

✅ **Security Hub** evaluates against **CIS, PCI DSS, and AWS Best Practices** frameworks.

✅ **Findings** from GuardDuty, Macie, and Inspector feed into **Security Hub** automatically.

✅ Use **EventBridge** for **automated remediation workflows**.

✅ **Security Hub integrates across accounts** for centralized management.

✅ **GuardDuty is Regional**, but can aggregate data across accounts.

✅ **Security Hub normalizes data** using **ASFF (AWS Security Finding Format)**.

✅ Both services integrate with **AWS Organizations** for scalability.

✅ Enable **30-day free trial** to explore in exam labs.

---

## 🏁 **Real-World Example**

**Scenario:**

A financial enterprise needs to continuously detect security threats, centralize alerts from multiple AWS services, and evaluate compliance with AWS best practices.

**Solution:**

- Enable **Amazon GuardDuty** across all accounts to analyze CloudTrail, DNS, and VPC logs.
- Enable **AWS Security Hub** as the **central aggregation service**.
- Connect both via **AWS Organizations** for multi-account visibility.
- Configure **EventBridge → Lambda** to isolate compromised EC2 instances automatically.
- Enable **AWS Foundational Security Best Practices** standard in Security Hub.

**Outcome:**

Proactive, automated, and centralized security posture management with continuous compliance checks and automated response to potential threats.