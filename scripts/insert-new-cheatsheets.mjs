import { mkdirSync, writeFileSync } from "node:fs";
import { makeClient } from "./_db-helpers.mjs";

const D1 = "Domain 1: Design Secure Architectures";
const D2 = "Domain 2: Design Resilient Architectures";
const D3 = "Domain 3: Design High-Performing Architectures";
const D4 = "Domain 4: Design Cost-Optimized Architectures";

const SHEETS = [
  // -------- New services --------
  {
    slug: "storage-gateway",
    title: "Storage Gateway",
    category: "Storage",
    domains: [D1, D2, D4],
    priority: "Tier 1",
    blurb:
      "Hybrid cloud storage service: File Gateway (NFS/SMB to S3), Volume Gateway (iSCSI block, cached/stored), Tape Gateway (VTL to S3/Glacier).",
  },
  {
    slug: "outposts-local-zones-wavelength",
    title: "Outposts / Local Zones / Wavelength",
    category: "Compute",
    domains: [D2, D3, D4],
    priority: "Tier 2",
    blurb:
      "AWS hybrid and edge offerings: Outposts (full AWS rack on-prem), Local Zones (metro low-latency), Wavelength (5G/telco edge).",
  },
  {
    slug: "iam-identity-center",
    title: "IAM Identity Center (AWS SSO)",
    category: "Security Identity and Compliance",
    domains: [D1, D2],
    priority: "Tier 1",
    blurb:
      "Centralized workforce identity for multi-account AWS Organizations. SAML/OIDC federation, permission sets, integrated apps.",
  },
  {
    slug: "resource-access-manager-ram",
    title: "Resource Access Manager (RAM)",
    category: "Management and Governance",
    domains: [D1, D2, D4],
    priority: "Tier 2",
    blurb:
      "Securely share AWS resources (subnets, TGW, License Manager configs, Route 53 resolver rules, etc.) across accounts and Organizations.",
  },
  {
    slug: "network-firewall-firewall-manager",
    title: "Network Firewall & Firewall Manager",
    category: "Security Identity and Compliance",
    domains: [D1, D2],
    priority: "Tier 2",
    blurb:
      "AWS Network Firewall: managed stateful/stateless VPC firewall (Suricata-compatible). AWS Firewall Manager: central org-wide policy enforcement (WAF, Shield, Network Firewall, SGs, Route 53 Resolver DNS Firewall).",
  },
  {
    slug: "compute-optimizer",
    title: "Compute Optimizer",
    category: "Management and Governance",
    domains: [D3, D4],
    priority: "Tier 2",
    blurb:
      "ML-based right-sizing recommendations for EC2, Auto Scaling groups, EBS volumes, Lambda functions, ECS on Fargate, and RDS.",
  },
  {
    slug: "license-manager",
    title: "License Manager",
    category: "Management and Governance",
    domains: [D1, D4],
    priority: "Tier 3",
    blurb:
      "Track and enforce software license usage (BYOL) across AWS and on-prem. Integrates with Systems Manager and Organizations.",
  },
  {
    slug: "cloudhsm",
    title: "CloudHSM",
    category: "Security Identity and Compliance",
    domains: [D1, D2],
    priority: "Tier 2",
    blurb:
      "FIPS 140-2 Level 3 dedicated HSM for customer-managed keys, custom KMS key store, code signing, SSL offload, and PKI.",
  },
  {
    slug: "amazon-mq",
    title: "Amazon MQ",
    category: "Application Integration",
    domains: [D2, D3],
    priority: "Tier 2",
    blurb:
      "Managed Apache ActiveMQ and RabbitMQ broker for migrating existing on-prem JMS/AMQP/STOMP/MQTT/WebSocket workloads.",
  },
  {
    slug: "appsync",
    title: "AppSync",
    category: "Front-End Web and Mobile",
    domains: [D1, D2, D3],
    priority: "Tier 3",
    blurb:
      "Managed GraphQL service with real-time subscriptions, offline sync, and multi-source resolvers (DynamoDB, Lambda, RDS, OpenSearch, HTTP).",
  },
  {
    slug: "batch",
    title: "AWS Batch",
    category: "Compute",
    domains: [D2, D3, D4],
    priority: "Tier 2",
    blurb:
      "Managed batch / HPC scheduler over EC2, Fargate or EKS. Job queues, priorities, array jobs, multi-node parallel jobs, Spot integration.",
  },
  {
    slug: "dax",
    title: "DynamoDB Accelerator (DAX)",
    category: "Database",
    domains: [D2, D3],
    priority: "Tier 2",
    blurb:
      "Fully managed, in-memory, write-through cache for DynamoDB. Microsecond reads, API-compatible with DynamoDB SDK.",
  },
  {
    slug: "memorydb-for-redis",
    title: "MemoryDB for Redis",
    category: "Database",
    domains: [D2, D3],
    priority: "Tier 2",
    blurb:
      "Redis-compatible, durable, in-memory database with Multi-AZ transaction log. Microsecond reads, single-digit ms writes, 99.99% SLA.",
  },
  {
    slug: "vpc-endpoints-privatelink",
    title: "VPC Endpoints & PrivateLink",
    category: "Networking",
    domains: [D1, D2, D4],
    priority: "Tier 1",
    blurb:
      "Private connectivity to AWS services and SaaS without internet/NAT. Gateway endpoints (S3, DynamoDB) vs Interface endpoints (ENI/ELB, PrivateLink).",
  },
  {
    slug: "vpn-site-to-site-client",
    title: "Site-to-Site VPN & Client VPN",
    category: "Networking",
    domains: [D1, D2, D4],
    priority: "Tier 1",
    blurb:
      "AWS Site-to-Site VPN (IPsec to VGW/TGW), accelerated VPN, Client VPN (OpenVPN-based, end-user remote access).",
  },
  {
    slug: "specialized-databases",
    title: "Specialized Databases (DocumentDB / Neptune / Keyspaces / Timestream / QLDB)",
    category: "Database",
    domains: [D2, D3],
    priority: "Tier 3",
    blurb:
      "Purpose-built databases: DocumentDB (MongoDB-compat), Neptune (graph), Keyspaces (Cassandra-compat), Timestream (time-series), QLDB (immutable ledger).",
  },

  // -------- Concepts (cross-service patterns) --------
  {
    slug: "disaster-recovery-strategies",
    title: "Disaster Recovery Strategies",
    category: "Concepts",
    domains: [D1, D2, D3, D4],
    priority: "Tier 1",
    blurb:
      "RTO/RPO trade-offs across the 4 AWS DR strategies: Backup & Restore, Pilot Light, Warm Standby, Multi-Site Active/Active.",
  },
  {
    slug: "high-availability-multi-az-multi-region",
    title: "High Availability: Multi-AZ vs Multi-Region",
    category: "Concepts",
    domains: [D2, D3],
    priority: "Tier 1",
    blurb:
      "Choosing between Multi-AZ (HA within a Region) and Multi-Region (DR / global low-latency). Service-by-service capabilities and failover patterns.",
  },
  {
    slug: "storage-selection-decision-tree",
    title: "Storage Selection Decision Tree",
    category: "Concepts",
    domains: [D2, D3, D4],
    priority: "Tier 1",
    blurb:
      "S3 vs EBS vs EFS vs FSx vs Storage Gateway vs Instance Store: how to pick based on access pattern, latency, throughput, durability, sharing model.",
  },
  {
    slug: "database-selection-decision-tree",
    title: "Database Selection Decision Tree",
    category: "Concepts",
    domains: [D2, D3, D4],
    priority: "Tier 1",
    blurb:
      "Relational vs NoSQL vs in-memory vs purpose-built: RDS, Aurora, DynamoDB, ElastiCache, MemoryDB, DocumentDB, Neptune, Keyspaces, Timestream, QLDB.",
  },
  {
    slug: "vpc-connectivity-matrix",
    title: "VPC Connectivity Matrix",
    category: "Concepts",
    domains: [D1, D2, D3, D4],
    priority: "Tier 1",
    blurb:
      "Side-by-side comparison of VPC peering, Transit Gateway, VPN, Direct Connect, PrivateLink, VPC endpoints, Cloud WAN, AWS RAM-shared subnets.",
  },
  {
    slug: "encryption-at-rest-and-in-transit",
    title: "Encryption at Rest & In Transit",
    category: "Concepts",
    domains: [D1],
    priority: "Tier 1",
    blurb:
      "KMS, ACM, CloudHSM, envelope encryption, TLS termination, SSE-S3/SSE-KMS/SSE-C, dbms-native, EBS, RDS, DDB, S3 — full catalogue.",
  },
  {
    slug: "identity-and-federation-patterns",
    title: "Identity & Federation Patterns",
    category: "Concepts",
    domains: [D1],
    priority: "Tier 1",
    blurb:
      "IAM users/groups/roles, AssumeRole, cross-account access, Identity Center, Cognito (user/identity pools), SAML, OIDC, AD-integrated patterns.",
  },
  {
    slug: "caching-strategies",
    title: "Caching Strategies",
    category: "Concepts",
    domains: [D3, D4],
    priority: "Tier 1",
    blurb:
      "CloudFront, ElastiCache (Redis/Memcached), DAX, API Gateway cache, Aurora reader-cache. Lazy loading vs write-through, TTLs, invalidation.",
  },
  {
    slug: "decoupling-and-event-driven-patterns",
    title: "Decoupling & Event-Driven Patterns",
    category: "Concepts",
    domains: [D2, D3],
    priority: "Tier 1",
    blurb:
      "When to use SQS, SNS, EventBridge, Kinesis, MSK, Step Functions, MQ. Fan-out, filter, dead-letter, ordering, replay, throttling.",
  },
  {
    slug: "cost-optimization-patterns",
    title: "Cost Optimization Patterns",
    category: "Concepts",
    domains: [D4],
    priority: "Tier 1",
    blurb:
      "RIs, Savings Plans, Spot, lifecycle, intelligent tiering, right-sizing, Trusted Advisor, Compute Optimizer, Cost Explorer, Budgets, anomaly detection.",
  },
  {
    slug: "migration-strategies-7-rs",
    title: "Migration Strategies (7 R's)",
    category: "Concepts",
    domains: [D2, D4],
    priority: "Tier 2",
    blurb:
      "Rehost, Replatform, Repurchase, Refactor, Retire, Retain, Relocate — and which AWS services support each (MGN, DMS, App2Container, etc.).",
  },
  {
    slug: "multi-account-and-landing-zone",
    title: "Multi-Account & Landing Zone",
    category: "Concepts",
    domains: [D1, D4],
    priority: "Tier 2",
    blurb:
      "Organizations OU design, SCPs, Control Tower, Landing Zone Accelerator, RAM, AFT, account vending, central logging/audit accounts.",
  },
  {
    slug: "monitoring-and-observability",
    title: "Monitoring & Observability",
    category: "Concepts",
    domains: [D2, D3],
    priority: "Tier 1",
    blurb:
      "CloudWatch metrics/logs/alarms/dashboards, CloudTrail, X-Ray, Container Insights, Lambda Insights, EventBridge for ops, AWS Health.",
  },
  {
    slug: "shared-responsibility-model",
    title: "Shared Responsibility Model",
    category: "Concepts",
    domains: [D1],
    priority: "Tier 1",
    blurb:
      "AWS vs customer responsibilities across IaaS/PaaS/SaaS, plus per-service nuances (S3, RDS, EC2, Lambda, managed AI services).",
  },
  {
    slug: "well-architected-pillars",
    title: "Well-Architected Framework Pillars",
    category: "Concepts",
    domains: [D1, D2, D3, D4],
    priority: "Tier 1",
    blurb:
      "The 6 pillars (Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, Sustainability) — design principles and exam-relevant questions per pillar.",
  },
];

const PLACEHOLDER = (s) => `# **${s.title} – Study Sheet**

*${s.blurb}*

**Exam Domains:**
${s.domains.map((d) => `- ${d.replace(/^Domain \d+: /, "")}`).join("\n")}

---

## 🧭 **Purpose**

${s.blurb}

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| TODO | Will be enriched by automated review pass. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| TODO | TODO |

---

## 🔐 **Security Considerations**

- TODO

---

## 💲 **Pricing Model**

- TODO

---

## 🔗 **Integration Patterns**

- TODO

---

## 🧠 **Exam Tips**

- TODO

---

## 🏁 **Real-World Example**

TODO
`;

const OUT_DIR = "/tmp/cheatsheet-inputs";
import { mkdirSync as mk, writeFileSync as wf } from "node:fs";
mk(OUT_DIR, { recursive: true });

const client = makeClient();
const now = new Date().toISOString();

let inserted = 0;
let skipped = 0;

for (const s of SHEETS) {
  const exists = await client.execute({
    sql: "SELECT id FROM cheatsheets WHERE slug = ?",
    args: [s.slug],
  });
  if (exists.rows.length > 0) {
    console.log(`SKIP (exists): ${s.slug}`);
    skipped++;
    continue;
  }
  const content = PLACEHOLDER(s);
  await client.execute({
    sql: `INSERT INTO cheatsheets (slug, title, category, domains, priority, content, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      s.slug,
      s.title,
      s.category,
      s.domains.join(", "),
      s.priority,
      content,
      now,
    ],
  });
  console.log(`INSERTED: ${s.slug}`);
  inserted++;

  // Also dump JSON input
  wf(
    `${OUT_DIR}/${s.slug}.json`,
    JSON.stringify(
      {
        slug: s.slug,
        title: s.title,
        category: s.category,
        domains: s.domains.join(", "),
        priority: s.priority,
        existing_content: content,
        existing_length: content.length,
        is_new: true,
        blurb: s.blurb,
      },
      null,
      2,
    ),
  );
}

console.log(`\nTotal: inserted=${inserted}, skipped=${skipped}`);
