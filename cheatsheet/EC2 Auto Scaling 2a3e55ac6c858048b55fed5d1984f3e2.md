# EC2 Auto Scaling

Category: Compute
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **Amazon EC2 Auto Scaling – Study Sheet**

**Exam Domains:**

- Design Resilient Architectures
- Design High-Performing Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**Amazon EC2 Auto Scaling** automatically adjusts the number of EC2 instances to maintain performance and minimize cost.

It ensures applications remain **available, elastic, and efficient** by scaling out during load spikes and scaling in when demand drops.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Auto Scaling Groups (ASGs)** | Logical groups of EC2 instances managed as a single unit. |
| **Launch Templates / Configurations** | Define instance type, AMI, networking, and user data for launches. |
| **Scaling Policies** | Define how and when to scale (e.g., target tracking, step, scheduled). |
| **Health Checks** | Automatically replace unhealthy instances (EC2 or ELB-based). |
| **Lifecycle Hooks** | Pause instance transitions for custom actions (e.g., config scripts). |
| **Cooldown Periods** | Prevents excessive scaling events by enforcing wait times. |
| **Warm Pools** | Pre-initialized instances kept ready to launch quickly. |
| **Instance Refresh** | Replaces all instances in an ASG with new configurations safely. |
| **Predictive Scaling (with AWS Auto Scaling)** | Uses machine learning to forecast and schedule scaling actions. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Handle unpredictable traffic spikes | Configure **Target Tracking Scaling Policy** (e.g., CPU utilization at 60%). |
| Maintain consistent performance for a web app | Combine **ALB + ASG** across multiple AZs. |
| Automate scaling during business hours | Use **Scheduled Scaling**. |
| Replace failed instances automatically | Enable **Health Check Replacement** (EC2 or ELB). |
| Migrate to new instance type or AMI | Use **Instance Refresh** for rolling updates. |
| Ensure quick startup for burst loads | Use **Warm Pools** to keep pre-initialized instances. |
| Scale based on custom metrics (e.g., queue length) | Integrate **CloudWatch custom metrics**. |
| Maintain minimum capacity during low demand | Set **Desired Capacity** and **Min Size**. |
| Balance cost and reliability | Combine **Spot + On-Demand Instances** in a **Mixed Instances Policy**. |

---

## 🔐 **Security Considerations**

- Use **IAM roles** for ASG-launched instances (no hardcoded credentials).
- Control access via **Security Groups** inherited from the launch template.
- Use **Systems Manager Parameter Store** for dynamic configuration values.
- Audit scaling activity with **CloudTrail**.
- Store scaling metrics and alarms securely in **CloudWatch**.

---

## 💲 **Pricing Model**

- **No charge** for the ASG service itself.
- You only pay for **EC2 instances**, **EBS volumes**, and **CloudWatch metrics/alarms** used by the group.

---

## 🔗 **Integration Patterns**

- **Amazon CloudWatch** → Triggers scaling actions based on metrics.
- **Elastic Load Balancing (ALB/NLB)** → Distributes traffic to instances in ASGs.
- **AWS Systems Manager** → Runs automation during lifecycle hooks.
- **AWS Auto Scaling** → Centralized scaling management across multiple services.
- **AWS CloudFormation** → Defines ASGs as part of templates for automation.

---

## 🧠 **Exam Tips**

✅ Auto Scaling = **availability + elasticity + cost efficiency**.

✅ For **steady CPU performance**, use **Target Tracking Scaling**.

✅ **Mixed Instance Policies** let you combine **Spot + On-Demand**.

✅ **Health checks** can come from EC2 or ALB — choose ALB for real traffic validation.

✅ Use **Lifecycle Hooks** for pre-launch or pre-terminate tasks.

✅ For **zero downtime** instance upgrades, use **Instance Refresh**.

✅ Always distribute ASGs across **multiple AZs** for fault tolerance.

---

## 🏁 **Real-World Example**

**Scenario:**

A SaaS application experiences heavy user load every weekday morning and low load at night.

**Solution:**

- Deploy app servers in an **Auto Scaling Group** across **2+ AZs**.
- Use **Target Tracking Scaling** for CPU utilization.
- Configure **Scheduled Scaling** to scale out at 8 AM and scale in at 6 PM.
- Integrate with **ALB** for load distribution and **CloudWatch** alarms for health.

**Outcome:**

The system scales automatically, maintaining performance during peak hours and saving cost during idle periods.