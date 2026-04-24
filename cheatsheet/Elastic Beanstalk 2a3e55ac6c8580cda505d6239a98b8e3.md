# Elastic Beanstalk

Category: Compute
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **AWS Elastic Beanstalk – Study Sheet**

**Exam Domains:**

- Design Resilient Architectures
- Design High-Performing Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**AWS Elastic Beanstalk** is a **Platform as a Service (PaaS)** that automatically handles deployment, scaling, monitoring, and provisioning of resources (EC2, ELB, Auto Scaling, RDS, etc.) for web applications.

It’s ideal when you want to **focus on code, not infrastructure**.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Managed Deployment Platform** | Handles provisioning of EC2, ALB, Auto Scaling, and monitoring. |
| **Supported Platforms** | Java, .NET, Node.js, Python, Ruby, Go, PHP, Docker. |
| **Deployment Models** | All at once, Rolling, Rolling with additional batch, Immutable, Blue/Green. |
| **Environment Types** | Web server (with load balancer) or Worker (with SQS). |
| **Integration with CI/CD** | Compatible with CodePipeline and CodeBuild. |
| **Configuration Management** | Customize environments via `.ebextensions` or saved configurations. |
| **Health Monitoring** | Built-in health checks via ALB and EC2. |
| **Automatic Scaling** | Uses EC2 Auto Scaling groups and load balancers automatically. |
| **Version Control** | Each deployment creates a new application version. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Quickly deploy a web app without managing infrastructure | Use **Elastic Beanstalk Web Environment** |
| Run background jobs asynchronously | Use **Worker Environment** with **SQS queue** |
| Simplify blue/green deployments | Deploy new environment and swap **CNAMEs** |
| Manage multiple environments (dev/test/prod) easily | Use **Elastic Beanstalk environment tiers** |
| Customize EC2 instance settings (e.g., software, logs) | Use **`.ebextensions` configuration files** |
| Integrate with CI/CD pipelines | Connect **CodePipeline → Elastic Beanstalk** |
| Handle auto scaling without manual setup | Beanstalk provisions **ASGs + ELBs** automatically |
| Monitor and debug application performance | Use **CloudWatch metrics** integrated into Beanstalk |
| Control cost and performance tuning | Adjust **instance types and Auto Scaling policies** |

---

## 🔐 **Security Considerations**

- Beanstalk environments run under a **service role** and **instance profile** (IAM).
- Use **least privilege IAM roles** for both service and EC2 instances.
- Store environment variables securely with **KMS** or **Secrets Manager**.
- Use **VPC** integration to isolate applications.
- Manage SSL/TLS certificates via **ACM** on load balancer.
- Log all operations via **CloudTrail**.

---

## 💲 **Pricing Model**

- **No additional charge** for Elastic Beanstalk itself.
- You pay for the **underlying resources** (EC2, RDS, ELB, S3, etc.).
- Cost depends on environment configuration (instance size, scaling).

---

## 🔗 **Integration Patterns**

- **EC2 + ELB + Auto Scaling:** Core managed stack.
- **RDS:** Optional database provisioning (choose “decouple” for production).
- **CloudWatch:** Health metrics and alarms.
- **CodePipeline + CodeBuild:** CI/CD automation.
- **S3:** Application bundle storage.
- **VPC:** Private networking.
- **IAM:** Role-based access control.

---

## 🧠 **Exam Tips**

✅ Beanstalk = “**Managed orchestration for EC2-based web apps**.”

✅ Two environment types: **Web Server** (HTTP/S via ALB) and **Worker** (background processing via SQS).

✅ For **zero downtime**, use **Blue/Green deployments**.

✅ Store configuration changes in **`.ebextensions`**.

✅ Use **Saved Configurations** to clone environments.

✅ Beanstalk manages resources, but **you retain control** (can access EC2, modify scaling policies, etc.).

✅ For production, **create RDS separately** to avoid data loss on environment deletion.

---

## 🏁 **Real-World Example**

**Scenario:**

A development team wants to deploy a Node.js web application quickly without manually configuring EC2, ALB, or scaling policies.

**Solution:**

- Upload the application package (ZIP) to **Elastic Beanstalk**.
- Beanstalk automatically creates an **EC2 Auto Scaling Group**, **ALB**, **CloudWatch alarms**, and **CloudFormation stack**.
- Enable **rolling deployment** to update instances gradually.
- Use **ACM** certificate for HTTPS and **VPC private subnets** for backend access.

**Outcome:**

Fully managed, automatically scaling web application environment with zero manual infrastructure management.