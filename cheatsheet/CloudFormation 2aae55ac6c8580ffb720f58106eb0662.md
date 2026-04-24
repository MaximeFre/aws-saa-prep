# CloudFormation

Category: Management and Governance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 2

# **AWS CloudFormation – Study Sheet**

*(Infrastructure as Code (IaC) to model and provision AWS resources reliably)*

**Exam Domains:**

- Design Resilient Architectures
- Design Secure Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**AWS CloudFormation** allows you to define and provision AWS infrastructure **using templates** (YAML or JSON).

It ensures **consistent, repeatable, version-controlled deployments** of your entire stack (networking, compute, security, and application resources).

It is foundational for **automation, multi-account deployments, and compliance**.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Templates (YAML/JSON)** | Declarative IaC files defining AWS resources. |
| **Stacks** | Deploy all resources from a template as a single unit. |
| **Change Sets** | Preview modifications before applying updates. |
| **Drift Detection** | Identify configuration changes made outside CloudFormation. |
| **StackSets** | Deploy stacks **across multiple accounts and Regions**. |
| **Intrinsic Functions** | `!Ref`, `!Sub`, `!GetAtt`, `!ImportValue`, etc. |
| **Outputs & Exports** | Share values across stacks (e.g., VPC ID). |
| **Rollback Protection** | Automatic rollback on deployment failure. |
| **Parameters** | Reusable templates with dynamic inputs. |
| **Conditional Resources** | Deploy different configs based on params or environment. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Deploy identical network stacks across AWS accounts | Use **StackSets** |
| Detect manual changes to resources | Use **Drift Detection** |
| Avoid surprises when updating a stack | Use **Change Sets** |
| Share outputs (e.g., VPC ID, Subnet IDs) across stacks | Use **Exports + !ImportValue** |
| Parameterize environment-specific values | Use **Parameters** |
| Ensure rollback safety for risky deployments | Enable **Stack Policies / Rollback** |
| Manage resources using IaC for compliance | Store templates in **version control** + CloudFormation |
| Avoid circular dependencies between stacks | Use **Modular stacks** with Outputs/Imports |

---

## 🔐 **Security Considerations**

- Templates should never store secrets → use **SSM Parameter Store** or **Secrets Manager**.
- Restrict permissions with **IAM roles for CloudFormation** (service role).
- Use **Stack Policies** to prevent accidental deletion of critical resources.
- CloudFormation logs actions in **CloudTrail**.
- Keep templates in **private repositories** (CodeCommit/GitHub).
- Enable **termination protection** on production stacks.

---

## 💲 **Pricing Model**

CloudFormation itself is **free**.

You pay only for the underlying AWS resources it creates.

| Feature | Cost |
| --- | --- |
| **Stacks** | Free |
| **StackSets** | Free |
| **Drift Detection** | Free |
| **Resources** | Standard AWS pricing |

💡 **Tip:**

Exam often asks: *“How to audit infrastructure changes at scale?”* → CloudFormation + CloudTrail + Drift Detection.

---

## 🔗 **Integration Patterns**

- **Systems Manager Parameter Store** → dynamic parameters.
- **CodePipeline + CodeBuild** → CI/CD for IaC.
- **AWS Config** → detect configuration compliance.
- **AWS Organizations** → StackSets across accounts.
- **Lambda-backed custom resources** → extend CloudFormation capabilities.
- **Service Catalog** → provision pre-approved CloudFormation templates.

---

## 🧠 **Exam Tips**

✅ **CloudFormation = core AWS IaC tool** (expect multiple questions).

✅ Reuse templates with **Parameters**, **Mappings**, **Conditions**.

✅ **StackSets** = deploy to *multiple accounts/Regions*.

✅ **Change Sets** = safe updates (preview before apply).

✅ **Drift Detection** = detect manual changes.

✅ **Exports + ImportValue** = stack-to-stack communication.

✅ Don’t hardcode credentials → use **Secrets Manager/SSM**.

✅ If stack update fails → automatic **rollback**.

✅ Use **DeletionPolicy** to protect data (e.g., retain RDS snapshots).

✅ Exam scenario: company wants consistency → **CloudFormation** is the answer.

---

## 🏁 **Real-World Example**

**Scenario:**

A global company wants to deploy the same VPC architecture (VPC, subnets, NAT gateways, route tables) across 20 AWS accounts in 3 Regions.

**Solution:**

- Create modular CloudFormation templates.
- Use **StackSets** with AWS Organizations integration.
- Enable **automatic deployments** to new accounts.
- Monitor drift for unauthorized manual edits.

**Outcome:**

Consistent, secure, and scalable network architecture across all environments, fully automated and audited.