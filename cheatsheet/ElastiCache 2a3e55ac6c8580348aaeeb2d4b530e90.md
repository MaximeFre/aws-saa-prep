# ElastiCache

Category: Database
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **Amazon ElastiCache – Study Sheet**

*(Managed in-memory caching service for Redis and Memcached)*

**Exam Domains:**

- Design High-Performing Architectures
- Design Cost-Optimized Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**Amazon ElastiCache** is a **fully managed, in-memory caching service** that improves application performance by **retrieving data from memory instead of disk**.

It supports **Redis** and **Memcached**, providing sub-millisecond latency for frequently accessed data such as session stores, leaderboards, and query results.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Supported Engines** | Redis (persistent, highly available) and Memcached (simple, non-persistent). |
| **Low Latency Caching** | Delivers sub-millisecond response times. |
| **Managed Service** | AWS handles setup, patching, backups, and failover. |
| **Multi-AZ Clustering (Redis)** | Enables automatic failover and read scaling across replicas. |
| **Replication** | Redis supports replication groups (primary + read replicas). |
| **Persistence Options (Redis)** | AOF and RDB snapshot-based persistence for durability. |
| **Sharding / Partitioning** | Distributes cache data across nodes for scalability. |
| **Encryption** | In-transit and at-rest encryption with KMS support (Redis only). |
| **Automatic Discovery** | Clients automatically detect cluster topology changes. |
| **CloudWatch Metrics** | Monitor performance, eviction rates, and CPU usage. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Improve read performance and reduce DB load | Use **ElastiCache (Redis or Memcached)** as a cache layer |
| Maintain user session state for web apps | Use **Redis with persistence** for session caching |
| Provide leaderboard or ranking data | Use **Redis Sorted Sets** |
| Cache frequent RDS query results | Use **ElastiCache (Redis/Memcached)** between app and RDS |
| Scale cache horizontally across nodes | Use **Redis Cluster** or **Memcached Sharding** |
| Handle failover and replication | Use **Redis Multi-AZ with Auto-Failover** |
| Secure cache in private network | Deploy in **private subnets with SG and KMS encryption** |
| Minimize cold start latency for Lambda apps | Use **Redis** for hot cache storage |
| Require simple, non-persistent cache | Use **Memcached** for stateless, easy horizontal scaling |

---

## 🔐 **Security Considerations**

- Deploy inside a **VPC private subnet**.
- Control access via **Security Groups** and **IAM policies**.
- **Encryption at rest and in transit** supported for Redis (KMS).
- Use **AUTH tokens** for Redis client authentication.
- Enable **Redis AUTH + TLS** for strong security posture.
- Monitor with **CloudWatch Logs** and **Engine Metrics**.

---

## 💲 **Pricing Model**

- Pay per **node-hour** (instance type + size).
- Additional charges for **data transfer between AZs** (for replication).
- **No charge** for automatic failover or patching.
- Redis persistence (AOF/RDB) increases storage costs.
- Choose smaller cache sizes to optimize cost when eviction rates are low.

| Engine | Durability | Use Case | Notes |
| --- | --- | --- | --- |
| **Redis** | Optional (persistent) | Session store, leaderboards, analytics | Supports Multi-AZ, failover, and encryption |
| **Memcached** | Non-persistent | Simple caching, object caching | Scales horizontally, no replication |

---

## 🔗 **Integration Patterns**

- **RDS / DynamoDB:** Cache read queries and hot items.
- **Lambda / API Gateway:** Reduce response latency for serverless apps.
- **CloudWatch:** Monitor cache performance and hit/miss ratios.
- **KMS:** Manage encryption keys (Redis only).
- **Auto Scaling Groups:** Use caching to reduce backend load under traffic spikes.

---

## 🧠 **Exam Tips**

✅ **ElastiCache = managed Redis/Memcached.**

✅ Use **Redis** for persistence, replication, and Multi-AZ; **Memcached** for simple, stateless caching.

✅ Caching = improves **performance** and **reduces database costs**.

✅ **Redis AUTH + KMS + TLS** for secure configurations.

✅ Use **ElastiCache between application and database tiers** for read-heavy workloads.

✅ **Redis Cluster Mode Enabled** supports sharding; **Disabled** simplifies management.

✅ Multi-AZ = automatic failover (Redis only).

✅ Use **CloudWatch metrics** to monitor hit rate and optimize TTL settings.

✅ Typical pattern: **Application → ElastiCache → RDS**.

---

## 🏁 **Real-World Example**

**Scenario:**

A social media app experiences slow read times on its RDS database during traffic spikes and needs to serve user timelines faster.

**Solution:**

- Deploy **ElastiCache Redis** in private subnets.
- Cache frequently read user timeline data.
- Use **TTL policies** to expire stale cache entries.
- Enable **Multi-AZ failover** for high availability.
- Encrypt at rest with **KMS** and in transit with **TLS**.

**Outcome:**

Database read load reduced by 80%, sub-millisecond response times achieved, and overall infrastructure costs optimized.