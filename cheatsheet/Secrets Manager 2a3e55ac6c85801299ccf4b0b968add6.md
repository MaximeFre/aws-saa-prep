# Secrets Manager

Category: Security Identity and Compliance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures
Priority: Tier 1

# **AWS Secrets Manager – Study Sheet**

*(Centralized, secure, and automated secrets management service)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**AWS Secrets Manager** securely stores, retrieves, and **rotates secrets** — such as database credentials, API keys, and application passwords — to prevent hardcoding sensitive data in code or configuration files.

It integrates with AWS services and automatically handles **encryption, rotation, and access auditing**.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Secure Secrets Storage** | Stores credentials and sensitive information encrypted with **AWS KMS**. |
| **Automatic Rotation** | Automatically rotates supported credentials (e.g., RDS, Redshift, DocumentDB). |
| **Fine-Grained Access Control** | Uses **IAM policies** to control which users or services can retrieve specific secrets. |
| **Integration with AWS Services** | Natively integrates with RDS, Aurora, Redshift, EC2, and Lambda. |
| **Versioning** | Maintains previous versions of secrets for rollback. |
| **Cross-Account Access** | Share secrets across accounts via resource-based policies. |
| **Audit Logging** | All actions logged in **AWS CloudTrail** for compliance. |
| **Rotation Lambda Function** | Allows custom rotation logic through AWS Lambda. |
| **Dynamic References** | Fetch secrets directly into CloudFormation, ECS tasks, or Lambda without storing them in plaintext. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Store database credentials securely | Use **Secrets Manager** with KMS encryption |
| Rotate RDS/Aurora credentials automatically | Enable **automatic rotation** with built-in integration |
| Provide API keys to Lambda functions | Reference secrets using **dynamic retrieval** (`{{resolve:secretsmanager:secret-name}}`) |
| Centralize management of app secrets | Use **Secrets Manager** instead of **SSM Parameter Store** |
| Share secrets between AWS accounts | Use **resource-based policies** |
| Audit secret access for compliance | Enable **CloudTrail logging** |
| Encrypt secrets with customer control | Use **Customer-Managed CMK** in KMS |
| Automate key rotation logic for custom apps | Attach a **Lambda rotation function** |
| Secure app credentials without redeployment | Fetch from Secrets Manager at runtime |
| Integrate with multi-account org | Combine **Secrets Manager + AWS Organizations** for policy management |

---

## 🔐 **Security Considerations**

- Secrets are **encrypted at rest** using **KMS CMKs**.
- Use **IAM and resource-based policies** for access control.
- Rotate credentials frequently — automated or custom.
- Restrict network access (e.g., only allow retrieval from private subnets or specific VPC endpoints).
- All secret access and API calls are **logged in CloudTrail**.
- Use **least privilege** IAM roles (read-only for consuming services).
- For compliance, enforce **key rotation** and **access monitoring**.

---

## 💲 **Pricing Model**

- **$0.40 per secret per month**.
- **$0.05 per 10,000 API calls** to retrieve or manage secrets.
- No charge for **CloudTrail** audit logs (standard rates apply).
- Secrets automatically encrypted with KMS (KMS request fees may apply).

---

## 🔗 **Integration Patterns**

- **RDS, Aurora, Redshift:** Automated credential rotation.
- **Lambda / ECS / EC2:** Retrieve secrets securely at runtime.
- **KMS:** Encryption and decryption of stored secrets.
- **CloudFormation:** Inject dynamic secrets into stacks.
- **CloudTrail:** Monitor secret access and changes.
- **AWS Organizations:** Multi-account access and centralized management.

---

## 🧠 **Exam Tips**

✅ **Secrets Manager = store, rotate, and retrieve secrets securely.**

✅ Always use **KMS encryption** — AWS-managed by default, CMK optional.

✅ **Secrets Manager vs. Parameter Store:**

- Secrets Manager = sensitive credentials, rotation, auditing.
- Parameter Store = generic config data, no automatic rotation.
    
    ✅ Use **dynamic references** to avoid storing secrets in Lambda or CloudFormation.
    
    ✅ **CloudTrail** logs every access — key for compliance.
    
    ✅ **Automatic rotation** supports RDS, Aurora, Redshift; others require custom Lambda.
    
    ✅ Use **resource-based policies** for cross-account access.
    
    ✅ Keep rotation Lambda in the **same Region** as the secret.
    
    ✅ Use **private VPC endpoints** for internal-only access.
    

---

## 🏁 **Real-World Example**

**Scenario:**

A healthcare application must store encrypted RDS credentials securely, automatically rotate them, and ensure no plaintext credentials appear in the codebase.

**Solution:**

- Store credentials in **Secrets Manager** with **KMS encryption (CMK)**.
- Enable **automatic rotation** for RDS via **Lambda rotation function**.
- Grant retrieval permissions to the **application IAM role** only.
- Fetch secrets dynamically in application code using the SDK.
- Monitor all access via **CloudTrail** and set CloudWatch alarms on rotation failures.

**Outcome:**

Fully automated, encrypted, and compliant secret management with no plaintext credentials, centralized control, and seamless rotation.