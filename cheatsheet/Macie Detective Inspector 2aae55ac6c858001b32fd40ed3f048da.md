# Macie / Detective / Inspector

Category: Security Identity and Compliance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures
Priority: Tier 3

# **Amazon Macie / Amazon Detective / Amazon Inspector – Study Sheet**

*(Data security • Threat investigation • Vulnerability scanning)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures

---

# 🟥 **Amazon Macie**

*(Automated sensitive data discovery in S3)*

## 🧭 Purpose

**Macie automatically scans S3 buckets for sensitive data** (PII, PHI, financial info).

Uses machine learning + pattern matching.

Think of it as:

**“Automated data classification for S3.”**

---

## ⚙️ Key Features

- Detects PII: email, SSN, address, credentials, API keys
- Classifies **S3 objects** (JSON, CSV, text, logs, Office files)
- Identifies **public** or overly accessible buckets
- Automatically evaluates newly added objects
- Integrates with **Security Hub**, **EventBridge**
- Findings stored in **AWS Security Hub**

---

## 🏗️ Common Exam Use Cases

| Scenario | Use Macie? |
| --- | --- |
| Detect PII in S3 objects | ✅ |
| Find public or misconfigured S3 buckets | ✅ |
| Classify data for compliance (HIPAA, PCI) | ✅ |
| Scan EC2, EBS, RDS | ❌ |
| Find vulnerabilities | ❌ |

---

## 🧠 Exam Tips

- Macie = **S3 + Sensitive Data**.
- If it’s not about *S3 data classification*, it’s not Macie.
- Produces findings → send events → Security Hub / EventBridge.

---

---

# 🟦 **Amazon Detective**

*(Investigate AWS security events — behavioral analytics)*

## 🧭 Purpose

**Amazon Detective helps investigate security incidents** using data from:

- CloudTrail
- VPC Flow Logs
- GuardDuty findings
- EKS audit logs

Think of it as:

**“Security investigation graph engine.”**

---

## ⚙️ Key Features

- Automatically **correlates** logs into a visualized graph
- Provides timelines, relationships, patterns
- Used to analyze:
    - Compromised IAM roles
    - Lateral movement
    - Unusual network behavior
    - EC2 instance anomalies
- Integrates with GuardDuty (recommended exam combo)

---

## 🏗️ Common Exam Use Cases

| Scenario | Recommended Solution |
| --- | --- |
| Investigate a suspicious IAM login | **Detective** |
| Analyze GuardDuty finding deeper | **Detective** |
| Visualize relationships between events | Detective |
| Investigate unusual network traffic | Detective |
| Manage vulnerabilities | ❌ (Inspector) |
| Find PII in S3 | ❌ (Macie) |

---

## 🧠 Exam Tips

- Detective = **investigation tool**, not detection.
- GuardDuty detects, Detective investigates.
- Builds a **behavior graph** from multiple log sources.

---

---

# 🟩 **Amazon Inspector**

*(Automated vulnerability scanning)*

## 🧭 Purpose

**Amazon Inspector automatically scans AWS workloads for vulnerabilities**, focusing on:

- EC2 instances
- Lambda functions
- Container images in ECR
- Software packages (CVE database)

Think of it as:

**“Automated CVE + security vulnerabilities scanning.”**

---

## ⚙️ Key Features

- Continuous scanning for:
    - Unpatched CVEs
    - OS/package vulnerabilities
    - Application security issues
    - Lambda dependency issues
    - ECR image vulnerabilities
- Integrates with:
    - Systems Manager Inventory
    - ECR (automatic scanning on push)
    - Security Hub

---

## 🏗️ Common Exam Use Cases

| Scenario | Use Inspector? |
| --- | --- |
| Scan EC2 instances for CVEs | **Yes** |
| Identify outdated OS packages | Yes |
| Scan ECR images for vulnerabilities | Yes |
| Identify risky Lambda dependencies | Yes |
| Investigate a GuardDuty finding | ❌ Detective |
| Detect PII | ❌ Macie |

---

## 🧠 Exam Tips

- Inspector = **vulnerability scanning**, not behavioral analysis.
- For EC2 scanning, SSM Agent is required.
- For containers → integrates directly with **ECR**.
- For Lambda → scans **function dependencies**.

---

# 🧱 Summary Comparison (High-Value Exam Table)

| Need / Scenario | Best Service |
| --- | --- |
| Find vulnerabilities in EC2, ECR, Lambda | **Inspector** |
| Find PII or sensitive data in S3 | **Macie** |
| Investigate GuardDuty findings | **Detective** |
| Investigate IAM compromise | **Detective** |
| Identify misconfigured public S3 buckets | Macie |
| Analyze network behavior patterns | Detective |
| Patching / remediation | **Not these** → use SSM Patch Manager |

**Golden Rule:**

> Macie = Data classification
> 
> 
> Inspector = Vulnerabilities
> 
> Detective = Investigation
> 

---

# 🏁 Real-World Example

**Scenario:**

A security team receives a GuardDuty alert for suspicious access to an IAM role.

**Solution:**

- Use **Amazon Detective** to analyze:
    - related CloudTrail events
    - VPC flow logs
    - identity activity timeline

**Outcome:**

The team identifies the root cause and determines whether lateral movement occurred.