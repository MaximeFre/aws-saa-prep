# DynamoDB

Category: Database
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **Amazon DynamoDB – Study Sheet**

*(Fully managed NoSQL key-value and document database with single-digit millisecond performance)*

**Exam Domains:**

- Design High-Performing Architectures
- Design Resilient Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**Amazon DynamoDB** is a **fully managed NoSQL database** that provides **key-value and document data storage** with **low latency** and **massive scalability**.

It’s designed for applications requiring consistent, high-speed access — such as gaming, IoT, e-commerce, and serverless architectures.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Fully Managed NoSQL Database** | Serverless architecture — no provisioning, patching, or scaling management. |
| **Performance at Scale** | Consistent single-digit millisecond latency at any scale. |
| **Data Model** | Tables, items, and attributes (key-value and document). |
| **Primary Keys** | Simple (Partition Key) or Composite (Partition + Sort Key). |
| **Provisioned & On-Demand Capacity Modes** | Choose between fixed throughput or automatic scaling. |
| **DynamoDB Accelerator (DAX)** | In-memory caching for microsecond response times. |
| **Streams** | Real-time change data capture for Lambda or analytics. |
| **Global Tables** | Multi-Region, multi-master replication for global applications. |
| **Backup and Restore** | On-demand backups and PITR (Point-in-Time Recovery). |
| **Transactions** | ACID-compliant multi-item transactions. |
| **TTL (Time to Live)** | Automatically delete expired items. |
| **Integration with Event-Driven AWS Services** | Streams integrate with **Lambda**, **Kinesis**, and **EventBridge**. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Build a serverless web application backend | Use **DynamoDB + Lambda + API Gateway** |
| Reduce read latency for frequent lookups | Enable **DAX caching** |
| Synchronize data changes with downstream systems | Enable **DynamoDB Streams + Lambda triggers** |
| Design a global application with local reads/writes | Use **Global Tables** |
| Automatically scale throughput with unpredictable workloads | Use **On-Demand capacity mode** |
| Enforce strong consistency on reads | Enable **Strongly Consistent Reads** (default = eventual) |
| Restore database from a previous point | Enable **PITR (Point-in-Time Recovery)** |
| Reduce storage cost for expiring sessions | Use **TTL (Time To Live)** |
| Ensure multi-item atomic updates | Use **DynamoDB Transactions** |
| Migrate from RDBMS for high throughput | Use **DynamoDB + DMS** for migration |

---

## 🔐 **Security Considerations**

- **Encryption at rest** (default) with **KMS**.
- **IAM fine-grained access control** — restrict access to specific items or attributes.
- **Streams encryption** with KMS for data in motion.
- Use **VPC Endpoints** to access DynamoDB privately without the internet.
- Log all access through **CloudTrail**.
- Integrate **WAF** and **Shield** when exposed via API Gateway.

---

## 💲 **Pricing Model**

- **Provisioned Mode:** Pay per read/write capacity unit (RCU/WCU).
- **On-Demand Mode:** Pay per actual read/write request — ideal for variable workloads.
- **Storage:** Per GB-month cost for data stored.
- **Streams, DAX, Global Tables, and PITR:** Additional costs apply.
- No charge for idle database — serverless billing model.

| Feature | Key Pricing Factor | Optimization Tip |
| --- | --- | --- |
| **Provisioned** | RCUs/WCUs defined manually | Use **Auto Scaling** for efficiency |
| **On-Demand** | Pay-per-request | Great for unpredictable workloads |
| **DAX** | In-memory caching cluster | Reduces RCU usage |
| **TTL** | Deletes expired data automatically | Saves storage cost |

---

## 🔗 **Integration Patterns**

- **Lambda + API Gateway:** Build fully serverless APIs.
- **Kinesis / EventBridge:** Stream data changes via DynamoDB Streams.
- **S3 + Athena:** Archive and analyze data from backups.
- **KMS + IAM:** Encryption and fine-grained access.
- **AWS Backup:** Centralized backup and retention management.
- **CloudWatch:** Monitor table throughput and throttling metrics.

---

## 🧠 **Exam Tips**

✅ **DynamoDB = fully managed NoSQL, serverless, high-performance.**

✅ Choose **Provisioned** for predictable workloads; **On-Demand** for unpredictable.

✅ **Streams + Lambda = event-driven architectures.**

✅ Use **Global Tables** for **multi-Region active-active** architectures.

✅ **DAX** = microsecond read latency via caching (reduces RCU usage).

✅ **TTL** = auto-delete expired data, reduces storage cost.

✅ **Strongly consistent reads** double the RCU cost vs eventual.

✅ **PITR** provides up to 35 days of rollback.

✅ Data model design is crucial — **denormalized, query-driven schema**.

✅ No joins, no complex queries — design around **primary keys and indexes**.

---

## 🏁 **Real-World Example**

**Scenario:**

A gaming company needs a globally distributed leaderboard service that must update scores in real time and serve millions of users with low latency.

**Solution:**

- Store player data in **DynamoDB** using `PlayerID` as the partition key.
- Enable **Global Tables** for multi-Region replication.
- Use **DAX** for caching leaderboard reads.
- Trigger **Lambda functions** via **Streams** to update analytics in real time.
- Enable **PITR** for recovery and **TTL** for expiring inactive player sessions.

**Outcome:**

A fully serverless, low-latency, multi-Region database architecture that scales seamlessly with millions of players and zero infrastructure management.