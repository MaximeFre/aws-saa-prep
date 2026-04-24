# Redshift / OpenSearch Service

Category: Analytics
Domains: Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 3

# **Amazon Redshift / Amazon OpenSearch Service – Study Sheet**

*(Data warehousing + search & analytics engines)*

**Exam Domains:**

- Design High-Performing Architectures
- Design Cost-Optimized Architectures

---

# 🟥 **Amazon Redshift**

*(Cloud data warehouse optimized for large-scale analytics)*

## 🧭 Purpose

**Amazon Redshift** is a fully managed **petabyte-scale data warehouse** designed for OLAP (analytical queries), BI dashboards, and high-speed SQL analytics across structured datasets.

Best used when:

- You need **complex joins**, aggregations, or BI queries
- You query structured data frequently
- You need performance beyond Athena

---

## ⚙️ Key Features

- **Columnar storage** for analytical speed
- **Massively Parallel Processing (MPP)**
- **Redshift Spectrum** → query S3 data lake directly
- **Materialized views** for cached analytics
- **Result caching**
- **RA3 nodes** → manage compute/storage separately
- **Concurrency scaling** → automatic capacity bursts
- **COPY/UNLOAD** to/from S3
- **Automatic table distribution styles**

---

## 🏗️ Common Exam Use Cases — Redshift

| Scenario | Recommended Solution |
| --- | --- |
| Need high-performance analytics with complex joins | **Redshift cluster** |
| Query S3 data lake + warehouse data | **Redshift Spectrum** |
| BI dashboards + hundreds of users | Redshift with **Concurrency Scaling** |
| Load large data quickly from S3 | **COPY command** |
| Offload historical data from warehouse | Use **Spectrum → S3** |
| Minimize cost for variable workloads | **RA3 nodes + managed storage** |

---

## 🔐 Security Considerations

- KMS encryption for data at rest
- TLS for connections
- Redshift **IAM-based credential-less authentication**
- VPC deployment for private access
- Audit logging → S3 / CloudWatch

---

## 💲 Pricing

- Node-hours (DC2, RA3)
- Managed storage (for RA3)
- Spectrum queries billed per TB scanned
- Concurrency scaling billed per second

**Exam Tip:** Redshift Spectrum makes Redshift + S3 behave like a unified warehouse.

---

---

# 🟦 **Amazon OpenSearch Service**

*(Search engine + log analytics + observability)*

## 🧭 Purpose

**Amazon OpenSearch Service** (formerly Elasticsearch Service) provides:

- Search engine for text, logs, metrics
- Real-time analytics
- Observability dashboards (Kibana-like)

Used for:

- Full-text search
- Log analytics at scale
- Operational dashboards
- Ingest pipelines

---

## ⚙️ Key Features

- Full-text search with indexing
- Distributed search clusters
- Integration with **Logstash**, **Beats**, **OpenSearch Dashboards**
- **UltraWarm** & **Cold Storage** for cost-effective log retention
- Fine-grained access control
- Domain-level encryption + node-to-node TLS

---

## 🏗️ Common Exam Use Cases — OpenSearch

| Scenario | Recommended Solution |
| --- | --- |
| Full-text search on large document sets | **OpenSearch index** |
| Analyze millions of log lines per minute | OpenSearch ingestion pipeline |
| Replace self-managed ELK stack | **OpenSearch Service** |
| Retain logs for 1 year cheaply | **Warm/Cold tiers** |
| Real-time operational dashboards | OpenSearch Dashboards |
| Search-based application features | OpenSearch index |

---

## 🔐 Security Considerations

- Fine-grained access control with IAM & OpenSearch roles
- HTTPS enforced
- Node-to-node encryption
- VPC-only cluster (recommended for exam)
- KMS encryption at rest
- Audit logs

---

## 💲 Pricing

- Charged per node type + storage
- UltraWarm = cheaper for infrequent access
- Snapshot storage in S3

**Exam Tip:** Use **S3 + Athena** for cost efficiency; use **OpenSearch** for real-time log search.

---

# 🧱 Redshift vs Athena vs OpenSearch (Exam Comparison)

| Requirement | Best Service |
| --- | --- |
| Complex joins, MPP analytics, BI dashboards | **Redshift** |
| Ad-hoc SQL queries on S3 | **Athena** |
| Real-time log analytics with search | **OpenSearch** |
| Lowest-cost large-scale queries | **Athena (S3)** |
| High concurrency BI workloads | **Redshift + Concurrency Scaling** |
| Full-text search | **OpenSearch** |

**Golden Rule:**

> Redshift = data warehouse
> 
> 
> Athena = *serverless SQL on S3*
> 
> OpenSearch = *search + logs*
> 

---

# 🏁 Real-World Example

**Scenario:**

A security team needs to analyze millions of CloudTrail events in near real time and make them searchable.

**Solution:**

- CloudTrail → S3
- S3 → Lambda → **OpenSearch** (indexing pipeline)
- Query with OpenSearch Dashboards
- Long-term data archived in S3 + Athena

**Outcome:**

Real-time search + low-cost long-term retention.