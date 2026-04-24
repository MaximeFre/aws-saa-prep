# CloudTrail

Category: Management and Governance
Domains: Domain 1: Design Secure Architectures, Domain 2: Design Resilient Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **AWS CloudTrail – Study Sheet**

*(API call logging and governance for AWS accounts)*

**Exam Domains:**

- Design Secure Architectures
- Design Resilient Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**AWS CloudTrail** provides **visibility into all AWS API activity** across your account.

It records who did what, when, and from where — capturing **management, data, and insight events** for **auditing, security analysis, and troubleshooting**.

It is an essential component of governance and compliance in AWS.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Event Logging** | Captures AWS API calls from the Management Console, SDKs, CLI, and services. |
| **Event Types** | Logs **Management**, **Data**, and **Insight Events**. |
| **Trails** | Define how and where events are delivered (S3 bucket, CloudWatch Logs, or EventBridge). |
| **Organization Trails** | Centralized logging across multiple accounts via **AWS Organizations**. |
| **CloudTrail Lake** | Store and query events with SQL-like interface for long-term analysis. |
| **CloudTrail Insights** | Detects unusual API activity (e.g., spikes in EC2 launches). |
| **Integration with CloudWatch** | Real-time monitoring of API calls and events. |
| **Multi-Region Trails** | Aggregate events from all Regions into a single log. |
| **Encryption & Integrity** | Logs encrypted with **KMS** and validated via digests. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Audit all API activity across AWS accounts | Enable **Organization Trail** |
| Detect unusual API call patterns | Use **CloudTrail Insights** |
| Investigate security breaches or failed logins | Search **CloudTrail Events** |
| Trigger automation on API actions (e.g., bucket creation) | Send events to **EventBridge → Lambda** |
| Store audit logs securely | Deliver logs to **S3 (encrypted with KMS)** |
| Identify who stopped a critical EC2 instance | Query **CloudTrail logs** |
| Integrate with SIEM tools | Stream events via **CloudWatch Logs or Lake export** |
| Capture S3 object-level access | Enable **Data Events** |
| Maintain 7-year compliance logs | Use **CloudTrail Lake + S3 versioning + Glacier** |
| Automate security responses | Use **EventBridge rules for real-time reactions** |

---

## 🔐 **Security Considerations**

- **Enable CloudTrail in all Regions** for complete visibility.
- Store logs in **S3 with SSE-KMS encryption**.
- Enable **log file validation** to ensure integrity.
- Use **organization trails** to enforce account-wide governance.
- Restrict S3 bucket access with **bucket policies** (only CloudTrail & security roles).
- Forward logs to **CloudWatch Logs** for real-time detection.
- Apply **least privilege** for IAM users accessing CloudTrail logs.
- Use **CloudTrail Insights** to identify anomalies like privilege escalation.

---

## 💲 **Pricing Model**

| Feature | Cost | Notes |
| --- | --- | --- |
| **First trail per Region** | Free | Includes Management Events |
| **Additional trails** | ~$2 per 100,000 events | Optional |
| **Data Events** | ~$0.10 per 100,000 events | e.g., S3 object or Lambda invocation |
| **Insight Events** | ~$0.35 per 100,000 events | Detects anomalies |
| **CloudTrail Lake** | ~$2 per GB ingested | Long-term storage + query engine |

💡 **Tip:** The **default event history (90 days)** is always free; you pay for custom trails or Lake storage.

---

## 🔗 **Integration Patterns**

- **S3:** Long-term encrypted log storage.
- **CloudWatch Logs:** Stream events for real-time alerts.
- **EventBridge:** Automate responses to key API actions.
- **AWS Config:** Combine for compliance tracking.
- **GuardDuty & Security Hub:** Use CloudTrail as a threat detection source.
- **Lambda:** Automate remediation on specific API events.
- **SIEM Systems:** Export logs for centralized visibility.

---

## 🧠 **Exam Tips**

✅ **CloudTrail = API activity tracking and auditing.**

✅ Default event history = **90 days** (free).

✅ Create **Trails** to store and query logs long-term in **S3**.

✅ **Organization Trails** apply across all accounts automatically.

✅ **Management Events** = control plane (e.g., EC2 StopInstances).

✅ **Data Events** = data plane (e.g., S3 GetObject, Lambda Invoke).

✅ **CloudTrail Insights** = detects anomalies in API usage.

✅ Always enable **multi-Region trails** for full coverage.

✅ Use **KMS encryption** + **log validation** for compliance.

✅ Integrate with **CloudWatch or EventBridge** for automation.

---

## 🏁 **Real-World Example**

**Scenario:**

A healthcare company needs to comply with HIPAA by tracking all API access, logging data-level events, and detecting unusual activity.

**Solution:**

- Enable **Organization Trail** across all AWS accounts.
- Deliver logs to **centralized S3 bucket (KMS-encrypted)**.
- Enable **Data Events** for S3 and Lambda.
- Turn on **CloudTrail Insights** for anomaly detection.
- Stream logs to **CloudWatch** for real-time alerting via **SNS**.
- Use **Glacier Deep Archive** for 7-year retention.

**Outcome:**

Comprehensive, compliant, and secure auditing system with anomaly detection and automated alerts across all AWS accounts.