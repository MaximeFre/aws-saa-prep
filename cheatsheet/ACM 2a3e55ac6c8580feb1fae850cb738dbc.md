# ACM

Category: Security Identity and Compliance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures
Priority: Tier 1

# **AWS Certificate Manager (ACM) – Study Sheet**

*(Automated SSL/TLS certificate management for secure AWS applications)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**AWS Certificate Manager (ACM)** simplifies the **provisioning, deployment, and renewal of SSL/TLS certificates** for use with AWS services.

It ensures **encrypted communication** between clients and AWS resources such as **CloudFront, ALB, API Gateway**, and **Elastic Beanstalk**, without manual certificate management.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **SSL/TLS Certificate Management** | Create or import certificates for use with AWS resources. |
| **Automatic Renewal** | ACM automatically renews certificates issued by AWS. |
| **Public and Private Certificates** | Issue public certs via ACM (Amazon Trust Services) or private certs via **ACM Private CA**. |
| **Integration with AWS Services** | Works seamlessly with **CloudFront**, **ALB/NLB**, **API Gateway**, **App Runner**, and **Elastic Beanstalk**. |
| **Private Certificate Authority (CA)** | Issue and manage internal PKI certificates for private domains. |
| **Domain Validation (DV)** | Certificates require domain ownership validation via DNS or email. |
| **Regional vs. Global Scope** | Public certificates are **Region-bound**, except for **CloudFront**, which requires certificates in **us-east-1**. |
| **Encryption in Transit** | Enables HTTPS (TLS 1.2 or 1.3) connections between clients and AWS endpoints. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Enable HTTPS on an ALB or CloudFront distribution | Use **ACM-issued public certificate** |
| Secure custom domain on API Gateway | Attach **ACM certificate** in the same Region |
| Manage certificates automatically | Use **ACM automatic renewal** |
| Use private SSL/TLS certs for internal apps | Deploy **ACM Private CA** |
| Validate domain ownership automatically | Use **DNS validation** (recommended) |
| Support HTTPS on global CloudFront distributions | Request or import cert **in us-east-1 Region** |
| Rotate certificates for compliance | Rely on **ACM’s automatic renewal** |
| Manage certificates across multiple accounts | Use **AWS Organizations + Private CA** |
| Enforce encryption between client and service | Configure **HTTPS listener** on ALB or API Gateway |
| Issue short-lived internal certificates | Use **ACM Private CA + short validity periods** |

---

## 🔐 **Security Considerations**

- Certificates are stored **securely and managed automatically** by AWS.
- Public certs issued by **Amazon Trust Services**, trusted by all major browsers.
- Use **DNS validation** for automation and easier renewals (preferred over email).
- **Private CAs** can be used for internal services — control key validity and lifecycle.
- ACM integrates with **CloudTrail** for certificate request and renewal logging.
- Only **authorized principals** (IAM users/roles) can issue or associate certificates.
- Apply **least privilege IAM permissions** (e.g., `acm:RequestCertificate`, `acm:ImportCertificate`).

---

## 💲 **Pricing Model**

| Feature | Cost | Notes |
| --- | --- | --- |
| **Public Certificates (ACM-issued)** | Free | Unlimited issuance and renewal |
| **Private CA Certificates** | Paid | $400/month per Private CA + $0.75 per issued cert |
| **Import Existing Certificates** | Free | No ACM charge |
| **Renewal** | Free for ACM-managed certs | Automatic before expiry |

💡 **Tip:** Even though ACM certificates are free, using them with resources like CloudFront or ALB incurs their respective service costs.

---

## 🔗 **Integration Patterns**

- **ALB / NLB:** Add HTTPS listeners with ACM certificate.
- **CloudFront:** Use ACM certificate (must be in **us-east-1**).
- **API Gateway:** Secure custom domain with ACM certificate.
- **Elastic Beanstalk / App Runner:** Simplify HTTPS configuration.
- **Route 53:** Automate domain validation using DNS records.
- **Private CA:** Issue internal certs for microservices in private VPCs.

---

## 🧠 **Exam Tips**

✅ **ACM = managed SSL/TLS certificate service (no manual renewal needed).**

✅ **Public certificates are free** and integrate with AWS services automatically.

✅ **Private CA** = enterprise-grade internal PKI management (paid feature).

✅ Always request **CloudFront certificates in us-east-1**.

✅ Use **DNS validation** for automation; **email validation** requires manual action.

✅ Certificates can be **imported** (e.g., from a corporate CA).

✅ ACM is **regional**, except when used with **CloudFront**.

✅ Automatically renews ACM-issued certificates **30 days before expiration**.

✅ Protect internal APIs or services with **ACM Private CA**.

✅ Use **AWS Certificate Manager + Route 53** for full domain validation automation.

---

## 🏁 **Real-World Example**

**Scenario:**

An e-commerce company wants to serve its website securely via CloudFront using HTTPS on a custom domain (`shop.example.com`).

**Solution:**

- Request a **public certificate** from **ACM (us-east-1)** for `shop.example.com`.
- Validate domain ownership using **Route 53 DNS validation**.
- Associate the certificate with the **CloudFront distribution**.
- Redirect all HTTP requests to HTTPS for secure communication.
- Enable **ACM auto-renewal** to maintain uptime without manual renewal.

**Outcome:**

A globally secure, HTTPS-enabled e-commerce site with automated certificate lifecycle management and zero downtime during renewals.