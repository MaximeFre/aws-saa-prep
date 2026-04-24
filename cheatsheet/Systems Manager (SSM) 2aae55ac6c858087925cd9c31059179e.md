# Systems Manager (SSM)

Category: Management and Governance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures
Priority: Tier 2

# **AWS Systems Manager (SSM) – Study Sheet**

*(Unified operational management for EC2, on-prem servers, containers, and multi-account environments)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures
- Design High-Performing Architectures

---

## 🧭 **Purpose**

**AWS Systems Manager** centralises **operational management**, **patching**, **automation**, **configuration**, and **remote execution** across:

- EC2 instances
- On-premises servers
- Containers
- Hybrid environments
- Multi-account infrastructures

It eliminates the need for SSH/RDP, improves security, and provides consistent ops across fleets.

---

## ⚙️ **Key Features (must-know for the exam)**

| Component | Description |
| --- | --- |
| **SSM Agent** | Installed on EC2/on-prem servers to enable SSM features. |
| **Session Manager** | Secure shell-less remote access (no SSH, no inbound ports). |
| **Run Command** | Execute commands/scripts across multiple instances. |
| **State Manager** | Enforce desired configuration state (e.g., install packages). |
| **Patch Manager** | Automate OS patching at scale. |
| **Automation** | Execute playbooks (YAML documents) for deployment / maintenance tasks. |
| **Parameter Store** | Secure key/value store for configuration (Standard + SecureString). |
| **Inventory** | Collect metadata (packages, network config, patches). |
| **OpsCenter & Incident Manager** | Centralized operational dashboard and incident handling. |
| **Maintenance Windows** | Scheduled operations (patching, commands, automation). |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Access EC2 instances without SSH | **Session Manager** (no inbound ports) |
| Automate patching across EC2 fleets | **Patch Manager + Maintenance Windows** |
| Enforce configuration (e.g., install agent) | **State Manager** |
| Store app secrets (db passwords) | **Parameter Store SecureString (KMS encrypted)** |
| Deploy commands to hundreds of servers | **Run Command** |
| Automate AMI creation and golden images | **Automation documents (AWS-UpdateLinuxAmi)** |
| Manage hybrid servers | Install **SSM Agent + Hybrid Activation** |
| Collect inventory for compliance | **SSM Inventory** |
| Zero-trust remote access | **Session Manager + IAM permissions** |
| Roll out new software across environments | **Automation + Run Command** |

---

## 🔐 **Security Considerations**

- **No inbound ports required** → Session Manager tunnels via outbound 443.
- IAM controls all actions (`ssm:SendCommand`, `ssm:StartSession`, etc.).
- **Session logs** stored in S3 or CloudWatch.
- **KMS encryption** for SecureString parameters + session data.
- Use **VPC Endpoints** to keep SSM traffic private.
- Patch Manager ensures OS compliance.
- Complete audit trail via **CloudTrail**.

---

## 💲 **Pricing Model**

| Component | Cost | Notes |
| --- | --- | --- |
| **Run Command** | Free | Included |
| **Session Manager** | Free | Logs storage billed separately |
| **Patch Manager** | Free | Uses Run Command |
| **Automation** | Free for 100K steps/month | Then billed per step |
| **Parameter Store Standard** | Free | 100K API transactions/month |
| **Parameter Store Advanced** | ~$0.05 per parameter/month | More features (larger size, policies) |
| **Inventory / State Manager** | Free | Basic usage |

💡 **Tip:** Most exam questions assume **Standard** Parameter Store unless features are needed.

---

## 🔗 **Integration Patterns**

- **EC2** → management, patching, automation, remote access.
- **Lambda** → automation workflows.
- **CloudWatch** → alarms trigger SSM Automation.
- **AWS Config** → detect drift → remediate via SSM Automation.
- **Secrets Manager** → alternative to Parameter Store for rotation.
- **Hybrid servers** → via SSM Agent + activations.
- **Service Catalog** → provision compliant environments via SSM documents.

---

## 🧠 **Exam Tips**

✅ **Session Manager** = SSH/RDP replacement, no inbound ports, IAM-based.

✅ **Run Command** = run scripts/commands across many EC2 instances.

✅ **Parameter Store**:

- Standard = free, 4 KB limit.
- Advanced = larger, versioning, policies, TTL.
- SecureString = KMS encryption.
    
    ✅ **Patch Manager** = automated OS patching via Maintenance Windows.
    
    ✅ **Automation Docs** = YAML tasks for remediation or orchestration.
    
    ✅ **State Manager** = ensure instances stay compliant (install agents, apply configs).
    
    ✅ **VPC endpoints** avoid internet-based SSM traffic.
    
    ✅ SSM Agent must be installed & IAM role attached.
    
    ✅ Great for hybrid use (on-prem + EC2).
    

---

## 🏁 **Real-World Example**

**Scenario:**

A security team wants to eliminate SSH access on all EC2 instances (port 22), enforce patching weekly, and manage configuration centrally.

**Solution:**

- Remove inbound SSH from security groups.
- Use **SSM Session Manager** for remote access.
- Use **Patch Manager + Maintenance Windows** for updates.
- Use **State Manager** to enforce configuration.
- Store DB passwords in **Parameter Store SecureString**.

**Outcome:**

Fully secure, automated, and scalable operations without any SSH exposure.