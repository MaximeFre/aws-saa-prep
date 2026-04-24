# Database Migration Service (DMS)

Category: Migration and Transfer
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 2

# **AWS Database Migration Service (AWS DMS) – Study Sheet**

*(Migrate and replicate databases to AWS securely and with minimal downtime)*

**Exam Domains:**

- Design Resilient Architectures
- Design Cost-Optimized Architectures
- Design Secure Architectures

---

## 🧭 **Purpose**

**AWS Database Migration Service (DMS)** helps migrate **databases to AWS** quickly and securely while keeping the **source database fully operational** during the migration.

It supports **homogeneous migrations** (e.g., Oracle → Oracle) and **heterogeneous migrations** (e.g., Oracle → Aurora or PostgreSQL).

DMS can also be used for **ongoing replication** and **hybrid data synchronization**.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Continuous Data Replication (CDC)** | Uses *Change Data Capture* to replicate changes in near real time. |
| **Heterogeneous Migrations** | Supports migrations across different database engines. |
| **Schema Conversion Tool (AWS SCT)** | Converts database schema automatically for heterogeneous migrations. |
| **Supported Sources/Destinations** | Includes Oracle, MySQL, PostgreSQL, SQL Server, MariaDB, MongoDB, SAP ASE, and Amazon RDS/Aurora/Redshift. |
| **Minimal Downtime** | Source DB remains operational during migration (CDC mode). |
| **Validation & Monitoring** | Monitors migration progress and data validation metrics in the DMS console. |
| **High Availability Option** | Multi-AZ replication instances for fault tolerance. |
| **Task Types** | Full Load, CDC, or Full Load + CDC (most common). |
| **Encryption** | Supports SSL/TLS for in-transit and KMS for at-rest encryption. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Migrate an on-prem Oracle DB to Amazon Aurora PostgreSQL | Use **AWS DMS + AWS SCT** for schema conversion and data migration |
| Enable near real-time replication between on-prem and AWS | Use **Change Data Capture (CDC)** in DMS |
| Keep source DB online during migration | Use **Full Load + CDC** task |
| Migrate RDS MySQL to RDS PostgreSQL | Use **DMS with SCT** (heterogeneous migration) |
| Periodic data sync between AWS and on-prem systems | Schedule **recurring replication tasks** |
| Move data to a data warehouse (Redshift) | Use **DMS as ETL-lite tool** (basic transformations supported) |
| Ensure HA migration setup | Deploy **Multi-AZ DMS replication instance** |
| Encrypt data in transit and at rest | Enable **SSL + KMS encryption** |
| Migrate workloads to reduce license costs | Use **DMS + Aurora** for open-source database migration |

---

## 🔐 **Security Considerations**

- All data can be **encrypted at rest (KMS)** and **in transit (SSL)**.
- DMS uses **IAM roles** for replication instance access.
- Run replication instances in **private subnets** (no internet exposure).
- Limit security group access to source and target databases.
- Monitor using **CloudWatch metrics and DMS task logs**.
- Delete endpoints and replication instances after migration for compliance.

---

## 💲 **Pricing Model**

| Component | Pricing Basis | Notes |
| --- | --- | --- |
| **Replication Instance** | per hour (size-based) | Small (t3.medium) → Large (r5.4xlarge) |
| **Storage** | per GB-month | Stores migration logs and cached data |
| **Data Transfer** | per GB | Standard AWS data transfer rates apply |
| **Schema Conversion Tool (SCT)** | Free | Pay only for AWS resources used |

💡 **Tip:**

Most exam questions assume **you run DMS in the same Region as the target DB** to avoid cross-Region data transfer costs.

---

## 🔗 **Integration Patterns**

- **AWS SCT:** Converts schema + stored procedures for heterogeneous migrations.
- **AWS Snowball:** Pre-seed large datasets before starting CDC replication.
- **Amazon CloudWatch:** Monitor migration progress and latency.
- **AWS Secrets Manager:** Secure DB credentials for DMS endpoints.
- **AWS Config / CloudTrail:** Track DMS configuration and API activity.

---

## 🧠 **Exam Tips**

✅ **DMS = continuous replication with minimal downtime.**

✅ Supports both **homogeneous and heterogeneous** migrations.

✅ Use **SCT** for schema and code conversion.

✅ **Full Load + CDC** = best choice when uptime is required.

✅ **Multi-AZ replication instances** improve reliability.

✅ Can replicate to **RDS, Aurora, Redshift, S3, or DynamoDB**.

✅ **Encrypt with KMS** and secure endpoints with **IAM + SGs**.

✅ Monitor progress via **CloudWatch + DMS console metrics**.

✅ DMS does **light transformations** only — for complex ETL, use **AWS Glue**.

✅ After cutover, stop CDC to finalize replication and decommission DMS.

---

## 🏁 **Real-World Example**

**Scenario:**

A retail company wants to migrate its 5 TB Oracle on-prem database to **Amazon Aurora PostgreSQL**, minimizing downtime during cutover.

**Solution:**

- Use **AWS SCT** to convert schema and PL/SQL to PostgreSQL-compatible format.
- Deploy a **DMS replication instance** in the target VPC.
- Run a **Full Load + CDC** task to migrate all data while keeping source live.
- Validate replication metrics in CloudWatch.
- Once sync is caught up, **switch application traffic** to the new Aurora DB.

**Outcome:**

Migration completed with less than 5 minutes of downtime, full schema compatibility, and no impact on live users.