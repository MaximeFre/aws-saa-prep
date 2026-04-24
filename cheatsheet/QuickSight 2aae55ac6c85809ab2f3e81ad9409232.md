# QuickSight

Category: Analytics
Domains: Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 2

# **Amazon QuickSight – Study Sheet**

*(Serverless Business Intelligence (BI) dashboards for AWS analytics workloads)*

**Exam Domains:**

- Design Cost-Optimized Architectures
- Design High-Performing Architectures

---

## 🧭 **Purpose**

**Amazon QuickSight** is a **serverless BI and dashboarding service** that connects directly to AWS analytics sources like **Athena, Redshift, RDS, S3, and more**.

It allows teams to build **interactive dashboards**, perform **ad-hoc analysis**, and share insights securely—without managing servers.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **SPICE In-Memory Engine** | High-performance, in-memory data caching for fast dashboards. |
| **Serverless BI** | No servers to manage; auto-scales with users & queries. |
| **Direct Query Mode** | Query Athena/Redshift/RDS live without importing data. |
| **Scheduled Reports** | Email/PDF reports generated on schedule. |
| **ML Insights** | Forecasting, anomaly detection, natural-language Q&A. |
| **Data Sources** | S3, Athena, Redshift, RDS, Aurora, S3 via Athena, Salesforce, Snowflake, etc. |
| **Row-Level Security (RLS)** | Limit data visibility per user/group. |
| **Embedded Dashboards** | Integrate dashboards directly in apps (B2B/SAAS). |
| **Federated Single Sign-On** | SSO via IAM Identity Center, AD, or SAML. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Create dashboards from S3 log data | **QuickSight → Athena → S3** |
| Need fast dashboard refreshes | Use **SPICE imports** instead of direct query |
| Limit dashboard data by user role | Implement **Row-Level Security (RLS)** |
| BI for SaaS customers | **Embed dashboards** with multi-tenant isolation |
| Share weekly analytics reports | Use **scheduled email/PDF report exports** |
| Secure dashboard access | Integrate **SSO (IAM Identity Center / SAML)** |
| Visualize transformed ETL data | Glue ETL → Parquet → Athena → QuickSight |
| Multi-account dataset access | Use **Athena federation + Lake Formation permissions** |

---

## 🔐 **Security Considerations**

- Integrates with **IAM Identity Center**, SAML, or AD for authentication.
- **RLS (Row-Level Security)** ensures users only see allowed data.
- Encrypt SPICE datasets and dashboards with **KMS**.
- VPC connectivity for private data sources (RDS, Redshift).
- CloudTrail logs track all dashboard and dataset actions.

---

## 💲 **Pricing Model**

| Component | Cost | Notes |
| --- | --- | --- |
| **Authors** | ~$24/month | Can create dashboards |
| **Readers** | ~$0.30 per session or $5/user | View-only users |
| **SPICE Capacity** | ~$0.38 per GB/month | Dramatically improved performance |
| **Direct Query** | No extra cost | Only underlying data sources billed |

💡 **Tip :**

SPICE is **faster, cheaper**, and avoids repeated Athena/Redshift query costs.

---

## 🔗 **Integration Patterns**

- **Athena** → Query S3 data lakes.
- **Glue Data Catalog** → Schema management.
- **Redshift** → Warehouse analytics.
- **RDS/Aurora** → Live dashboards over transactional data.
- **S3 → Athena → QuickSight** → Most common pipeline for exam.
- **EventBridge** → Trigger dataset refreshes.
- **Lambda** → Custom connectors for non-native data sources.

---

## 🧠 **Exam Tips**

✅ **QuickSight = serverless BI dashboards (no servers to manage).**

✅ **SPICE** = in-memory cache → fast performance + reduced Athena cost.

✅ Works naturally with **S3 + Glue + Athena** → most common exam combo.

✅ Use **Row-Level Security** for multi-tenant or sensitive dashboards.

✅ Supports **embedded dashboards** for SaaS apps.

✅ Supports **scheduled reports** for recurring BI needs.

✅ For private RDS/Redshift, configure **VPC connectivity**.

✅ Exam loves: “Visualize S3 data without provisioning servers → QuickSight.”

---

## 🏁 **Real-World Example**

**Scenario:**

A retail company stores billions of clickstream events in S3 and wants to build executive dashboards without building a BI platform.

**Solution:**

- Raw data → Glue Crawler → Glue Catalog.
- Query data using **Athena**.
- Import aggregated datasets into **QuickSight SPICE**.
- Build dashboards with RLS for business units.

**Outcome:**

Fast, low-cost analytics dashboards with minimal operational overhead.