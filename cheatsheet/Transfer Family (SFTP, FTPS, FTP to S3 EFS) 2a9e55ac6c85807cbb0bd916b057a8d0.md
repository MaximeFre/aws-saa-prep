# Transfer Family (SFTP, FTPS, FTP to S3/EFS)

Category: Migration and Transfer
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures
Priority: Tier 2

# **AWS Transfer Family – Study Sheet**

*(Managed file transfer service for SFTP, FTPS, and FTP directly into AWS storage)*

**Exam Domains:**

- Design Resilient Architectures
- Design Secure Architectures

---

## 🧭 **Purpose**

**AWS Transfer Family** provides **fully managed SFTP, FTPS, and FTP endpoints** that let customers transfer files **directly into and out of AWS**—most commonly **Amazon S3** or **Amazon EFS**—without managing servers, certificates, or networking stacks.

It’s ideal for **legacy workloads** that can’t be rewritten to use APIs.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Protocols Supported** | SFTP (SSH), FTPS (TLS), and FTP. |
| **Managed Endpoints** | AWS hosts and scales the file transfer servers. |
| **Back-end Storage Options** | Integrate with **Amazon S3** (default) or **Amazon EFS**. |
| **User Authentication** | Options: **Service-managed**, **Custom Identity Provider (via Lambda)**, or **AWS Directory Service**. |
| **VPC Access** | Endpoints can be public or private (VPC-hosted). |
| **Logging & Auditing** | All connections and transfers logged to **CloudWatch** and **CloudTrail**. |
| **Encryption** | TLS/SSH for in-transit encryption, **KMS** for at-rest. |
| **High Availability** | Fully managed and multi-AZ by default. |
| **Custom Hostnames** | Use Route 53 + ACM for custom domain endpoints. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Migrate legacy SFTP transfers to AWS without rewriting apps | Deploy **AWS Transfer Family (SFTP)** with S3 backend |
| Share files securely with external vendors | Use **SFTP endpoint** with IAM-based access |
| Internal workload exchanging large datasets daily | Use **FTPS endpoint → EFS** for POSIX compliance |
| Replace on-prem file servers with AWS service | Deploy **Transfer Family + EFS** |
| Integrate enterprise LDAP or AD auth | Configure **Custom Identity Provider (Lambda)** |
| Restrict access to private network | Create **VPC endpoint** and disable public access |
| Audit file upload/download events | Stream logs via **CloudWatch Logs + CloudTrail** |
| Require custom URL & TLS cert | Use **ACM cert** + **Route 53** custom domain |

---

## 🔐 **Security Considerations**

- **IAM Roles** map users to specific S3 prefixes (per-user isolation).
- All transfers are **TLS/SSH encrypted**.
- **KMS** encrypts data at rest when using S3/EFS.
- Deploy **private endpoints** for sensitive data (no public IP).
- Integrate with **Secrets Manager** for password/key storage.
- Monitor via **CloudTrail**, **CloudWatch**, and **VPC Flow Logs**.
- Access control enforced through **role-based mapping + identity provider**.

---

## 💲 **Pricing Model**

| Component | Cost | Notes |
| --- | --- | --- |
| **Protocol Endpoint** | $0.30/hour per endpoint | Charged while enabled |
| **Data Transferred** | Standard S3/EFS transfer rates | Intra-AZ free, internet egress billed |
| **Auth Requests** | Free | Included in service |
| **CloudWatch Logs** | Standard rates | Optional |

💡 **Tip:** Stop unused endpoints to avoid hourly charges.

---

## 🔗 **Integration Patterns**

- **Amazon S3:** Default backend for file storage.
- **Amazon EFS:** Shared POSIX file system for internal teams.
- **AWS Lambda:** Custom identity provider or post-transfer processing.
- **CloudWatch / CloudTrail:** Monitor connections and file activity.
- **Route 53 + ACM:** Custom hostnames and certificates.
- **Secrets Manager:** Store user credentials and SSH keys securely.

---

## 🧠 **Exam Tips**

✅ **Transfer Family = managed SFTP/FTPS/FTP → S3/EFS.**

✅ Use when clients **require file-based access**, not API calls.

✅ Authentication modes:

1️⃣ Service-managed (user+password),

2️⃣ Custom (Lambda IdP),

3️⃣ Directory Service.

✅ Choose **S3 backend** for scale, **EFS backend** for POSIX.

✅ Runs **fully managed and multi-AZ**; you don’t manage servers.

✅ **Logs every connection** to CloudWatch + CloudTrail.

✅ **Use ACM + Route 53** for custom domains with TLS.

✅ Compare to **DataSync** → automated batch sync, not user-initiated transfers.

---

## 🏁 **Real-World Example**

**Scenario:**

A financial institution needs to retire its on-prem SFTP server used by external partners who upload daily transaction files.

Security policy requires MFA and encryption at rest.

**Solution:**

- Deploy **AWS Transfer Family (SFTP)** with an **S3 bucket backend**.
- Configure **Service-managed users** mapped to unique S3 prefixes.
- Attach **IAM roles** with least-privilege policies.
- Enforce **TLS/SSH**, enable **KMS encryption**, and publish logs to CloudWatch.
- Assign a **custom domain** via ACM and Route 53.

**Outcome:**

Legacy SFTP workflow migrated to AWS seamlessly—no code changes, improved visibility, and fully managed HA infrastructure.