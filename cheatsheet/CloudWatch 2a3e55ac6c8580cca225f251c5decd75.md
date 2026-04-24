# CloudWatch

Category: Management and Governance
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **Amazon CloudWatch – Study Sheet**

*(Comprehensive monitoring and observability service for AWS resources and applications)*

**Exam Domains:**

- Design Resilient Architectures
- Design High-Performing Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**Amazon CloudWatch** provides **monitoring, logging, and alerting** for AWS resources and applications.

It collects **metrics, logs, and events** in near real time, enabling proactive operations, troubleshooting, and automation via alarms and dashboards.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Metrics** | Numerical data about resource performance (e.g., CPUUtilization, Latency, Errors). |
| **Alarms** | Trigger actions (e.g., SNS notifications, Auto Scaling) when metrics exceed thresholds. |
| **Logs** | Capture application/system logs via CloudWatch Logs or unified agent. |
| **Log Insights** | Query and analyze log data using SQL-like queries. |
| **Dashboards** | Create custom visualizations across multiple services and accounts. |
| **Anomaly Detection** | Automatically detect metric deviations using ML models. |
| **Events (EventBridge)** | React to state changes across AWS services in real time. |
| **Contributor Insights** | Identify high-impact contributors (e.g., top IPs causing errors). |
| **ServiceLens & Synthetics** | Monitor distributed apps with traces and canary testing. |
| **Cross-Account Monitoring** | Centralize CloudWatch data across accounts and Regions. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Monitor EC2 CPU usage and trigger Auto Scaling | Create **CloudWatch Alarm** tied to **Auto Scaling policy** |
| Collect application logs from EC2 or Lambda | Use **CloudWatch Logs Agent** or **Lambda Integration** |
| Monitor API latency and errors | Use **CloudWatch Metrics** from **API Gateway** |
| Automatically detect metric anomalies | Enable **Anomaly Detection** |
| Centralize log analysis across microservices | Use **CloudWatch Logs Insights** |
| Monitor custom app metrics | Use **PutMetricData** API for custom metrics |
| Automate remediation on alarms | Connect **Alarms → SNS → Lambda/EventBridge** |
| Track top sources of traffic or errors | Use **Contributor Insights** |
| Monitor end-to-end app performance | Use **CloudWatch ServiceLens (X-Ray integration)** |
| Detect downtime in key endpoints | Deploy **CloudWatch Synthetics canaries** |

---

## 🔐 **Security Considerations**

- Logs and metrics are **encrypted at rest** using **KMS**.
- Control access using **IAM policies** (`cloudwatch:*` and `logs:*`).
- Use **VPC endpoints** to send logs privately (no internet).
- Sensitive log data should be encrypted and masked before ingestion.
- Restrict log group access by ARN to avoid data leakage.
- All CloudWatch API actions are auditable in **CloudTrail**.

---

## 💲 **Pricing Model**

| Feature | Cost Model | Notes |
| --- | --- | --- |
| **Metrics** | $0.30 per metric per month | Custom metrics billed separately |
| **Logs** | Pay for ingestion + storage | ~$0.50/GB ingested |
| **Alarms** | $0.10 per alarm/month | Each alarm metric billed |
| **Dashboards** | $3/month per dashboard | Free tier available |
| **Log Insights** | Pay per query volume | ~$0.005 per GB scanned |
| **Synthetics & Contributor Insights** | Billed per canary or report | Optional advanced monitoring features |

💡 **Tip:** Use **metric filters** and **log retention policies** to optimize costs.

---

## 🔗 **Integration Patterns**

- **EC2 / Lambda / RDS / API Gateway:** Native metrics + logs.
- **SNS / Lambda / EventBridge:** Alarm-based actions and automation.
- **CloudTrail:** Monitor API-level activity in metrics or alarms.
- **AWS X-Ray:** Integrated tracing via **ServiceLens**.
- **CloudFormation / Terraform:** Infrastructure as code setup for alarms/dashboards.
- **AWS Config:** Track compliance alongside performance metrics.

---

## 🧠 **Exam Tips**

✅ **CloudWatch = metrics + logs + alarms + dashboards.**

✅ **Metrics** are retained for **15 months** (different granularity levels).

✅ Use **Alarms** for **Auto Scaling, SNS notifications, and automated recovery**.

✅ **Logs Insights** = ad-hoc analysis of structured/unstructured logs.

✅ **Events** (EventBridge) = react to AWS service changes automatically.

✅ **Anomaly Detection** identifies unexpected spikes/drops in performance.

✅ Use **Synthetics** for **endpoint monitoring** (canary tests).

✅ **Custom metrics** = use `PutMetricData` API (e.g., app performance).

✅ Keep logs cost-efficient with **retention policies** and **filter patterns**.

✅ Centralize visibility via **CloudWatch Dashboards** (multi-account supported).

---

## 🏁 **Real-World Example**

**Scenario:**

A SaaS platform hosts multiple microservices across EC2, Lambda, and API Gateway. It needs a centralized view of system health and automatic alerting when latency exceeds 200ms.

**Solution:**

- Configure **CloudWatch metrics** for latency, 4XX/5XX errors, and CPU usage.
- Create **alarms** to trigger **SNS notifications** when thresholds are breached.
- Use **CloudWatch Dashboards** for real-time visibility.
- Enable **Logs Insights** to analyze error trends.
- Deploy **Synthetics canaries** to test endpoints from multiple Regions.

**Outcome:**

Centralized, automated monitoring system with proactive alerting, anomaly detection, and performance insights — improving reliability and incident response.