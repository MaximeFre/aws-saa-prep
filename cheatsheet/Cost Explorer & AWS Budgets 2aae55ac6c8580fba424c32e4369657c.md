# Cost Explorer & AWS Budgets

Category: Management and Governance
Domains: Domain 1: Design Secure Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 2

# **AWS Cost Explorer & AWS Budgets – Study Sheet**

*(Cost visibility, forecasting, alerts, and proactive cost governance)*

**Exam Domains:**

- Design Cost-Optimized Architectures
- Design Secure Architectures

---

# 🟦 **Part 1 — AWS Cost Explorer**

## 🧭 **Purpose**

**AWS Cost Explorer** is a visualization and reporting tool that helps analyze AWS spending trends over time.

It enables:

- Cost breakdown by service, Region, tag, or account
- Forecasting future costs
- Identifying spending anomalies
- Understanding Reserved Instance and Savings Plan utilization

It is the primary **cost visibility tool** in AWS.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Cost & Usage Reports (CUR)** integration | Most detailed source for cost analytics. |
| **Service-level cost analysis** | Find which AWS services cost the most. |
| **Filtering by tags, accounts, and usage types** | Visibility across entire organization. |
| **Cost forecasting** | Predicts costs 3–12 months out. |
| **RI & Savings Plans recommendations** | Purchases based on historical usage. |
| **Anomaly Detection** | ML-powered cost anomaly alerts. |
| **Charts and dashboards** | Visual breakdowns over time. |

---

## 🏗️ **Common Exam Use Cases — Cost Explorer**

| Scenario | Recommended Solution |
| --- | --- |
| Identify which service caused yesterday’s cost spike | Use **Cost Explorer → Daily breakdown** |
| Analyze cost per account in multi-account setup | Use **Cost Explorer + tags + account filters** |
| Get RI/Savings Plan purchase recommendations | Use **Cost Explorer Recommendations** |
| Forecast cloud spend for next quarter | Use **Cost Forecasting** |
| Investigate sudden EC2 or Data Transfer costs | Use **Cost & Usage breakdowns** |

---

## 🔐 **Security Considerations**

- IAM policies restrict which users can see organization-wide cost data.
- Use AWS Organizations to limit financial visibility between OUs.
- CUR files stored in S3 should be encrypted with **KMS**.

---

## 💲 **Pricing**

- **Free** for default usage (Cost Explorer interface).
- **CUR storage** billed as S3 usage.
- **Anomaly Detection** has no additional charge.

---

---

# 🟩 **Part 2 — AWS Budgets**

## 🧭 **Purpose**

**AWS Budgets** lets you set **custom cost or usage budgets** and receive alerts when thresholds are exceeded.

It provides **proactive cost control**, unlike Cost Explorer (reactive analysis).

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Cost Budgets** | Alert when spending exceeds or is forecast to exceed a threshold. |
| **Usage Budgets** | Control usage of resources (e.g., hours of EC2 running). |
| **Savings Plans/RIs Budgets** | Track utilization and coverage. |
| **Alerts via Email, SNS, or Chatbot** | Trigger automated notifications. |
| **Action Budgets** | Automatically stop EC2/RDS resources when thresholds hit (Powerful for exam scenarios). |
| **High granularity** | Filter by service, Region, tag, or account. |

---

## 🏗️ **Common Exam Use Cases — AWS Budgets**

| Scenario | Recommended Solution |
| --- | --- |
| Alert finance team if monthly spend > $10,000 | Create **Cost Budget + Email/SNS alerts** |
| Automatically stop EC2 instances if costs spike | Use **Budget Action → Stop EC2** |
| Track RI or Savings Plan utilization | Use **RI/SP Utilization Budget** |
| Notify teams when S3 usage exceeds budget | Configure **Usage Budget** |
| Multi-account cost governance | Use **AWS Budgets with Organizations** |

---

## 🔐 **Security Considerations**

- IAM policies control who can create or modify budgets.
- Budget Actions must be explicitly authorized (e.g., `ec2:StopInstances`).
- SNS topics for alerts should be encrypted with KMS.

---

## 💲 **Pricing**

| Component | Cost |
| --- | --- |
| **Two budgets per account** | Free |
| **Additional budgets** | ~$0.02 per budget per day |
| **Budget Actions** | Free |

---

# 🔗 **Integration Patterns**

- **Organizations** → enforce budgets across accounts.
- **SNS** → send budget alerts to teams or Slack (via Chatbot).
- **Lambda** → automated remediation (stop instances, reduce usage).
- **CloudWatch** → pair with alarms for operational cost spikes.
- **CUR + Athena** → deep analysis powering budget decisions.

---

# 🧠 **Exam Tips**

### Cost Explorer

- Use it to **analyze past and current** spend.
- It provides **RI/SP recommendations** based on historical usage.
- Good for **root cause analysis** of a cost anomaly.
- Anomaly Detection built-in, no setup required.

### Budgets

- Use Budgets to **proactively alert or enforce actions**.
- **Budget Actions** = stop resources automatically → common exam trick.
- Can track **cost, usage, RI utilization, and SP coverage**.
- Multi-account support with Organizations.
- Alerts can be sent via **SNS / Email / Chatbot**.

---

# 🏁 **Real-World Example**

**Scenario:**

A SaaS company wants to ensure that development environments never exceed $5,000 per month and needs proactive alerts.

**Solution:**

- Create a **Cost Budget** set at $5,000 for the Dev OU.
- Configure **SNS alerts** to the engineering manager.
- Add a **Budget Action** to stop non-critical EC2 instances automatically.
- Use **Cost Explorer** to analyze trends and adjust budget thresholds.

**Outcome:**

Predictable spending, no runaway cost incidents, and automated cost controls.