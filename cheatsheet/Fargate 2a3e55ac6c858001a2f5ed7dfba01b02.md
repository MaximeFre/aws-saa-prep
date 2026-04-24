# Fargate

Category: Serverless
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **AWS Fargate – Study Sheet**

**Exam Domains:**

- Design Resilient Architectures
- Design High-Performing Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**AWS Fargate** is a **serverless compute engine for containers** that runs with **Amazon ECS** or **Amazon EKS**.

It removes the need to provision or manage EC2 instances — you define CPU and memory per task or pod, and Fargate launches and scales containers automatically.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Serverless Containers** | No cluster or EC2 instance management; AWS provisions compute automatically. |
| **Per-Task/POD Resource Spec** | Define vCPU and RAM for each workload independently. |
| **Seamless Integration** | Works with **ECS tasks** and **EKS pods**. |
| **Isolation & Security** | Each task/pod runs in its own lightweight VM isolation boundary. |
| **Auto Scaling** | Scales container count automatically based on ECS/EKS service rules. |
| **Networking** | Native **VPC integration** using ENIs — each task gets its own private IP. |
| **Observability** | Integrated with **CloudWatch**, **X-Ray**, and **CloudTrail**. |
| **EFS Support** | Mount persistent file systems directly to tasks/pods. |
| **Launch Type** | Alternative to “EC2 launch type” in ECS clusters. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Deploy containers without managing EC2 instances | Use **Fargate launch type** with ECS or EKS |
| Need consistent isolation between container workloads | Run each task on **dedicated Fargate infrastructure** |
| Host microservices with variable load | Combine **Fargate + ECS Service Auto Scaling** |
| Run containers in a private subnet | Configure **Fargate tasks** with **AWS VPC mode** |
| Store container data persistently | Mount **EFS volumes** in Fargate tasks |
| Process asynchronous jobs from SQS queue | Use **Fargate service** triggered by queue messages |
| Simplify container lifecycle management | Use **ECS Fargate** rather than EC2 cluster launch type |
| Containerized workloads across accounts | Combine **Fargate + ECS + PrivateLink** for secure connectivity |
| Manage containers via Kubernetes | Use **EKS on Fargate profile** for serverless pods |

---

## 🔐 **Security Considerations**

- Each task/pod runs in its **own isolation boundary** (Firecracker micro-VM).
- Assign least-privilege **IAM task roles** instead of embedding credentials.
- Use **Security Groups** and **NACLs** for inbound/outbound control.
- Encrypt data in transit with **TLS**, and at rest with **EFS + KMS**.
- Enable **CloudTrail** for audit logs.
- Use **Private subnets** for internal services.

---

## 💲 **Pricing Model**

- Pay per **vCPU and GB of memory** per second while tasks/pods run.
- Billed separately for **EFS storage** and **data transfer**.
- No charge for ECS/EKS control plane (except EKS $0.10 per hour).
- Stop paying instantly when tasks stop.

---

## 🔗 **Integration Patterns**

- **Amazon ECS / EKS:** Primary orchestrators.
- **CloudWatch + X-Ray:** Monitoring, logging, and tracing.
- **AWS App Mesh:** Service-to-service traffic management.
- **ECR:** Container image repository.
- **IAM Roles for Tasks:** Fine-grained permissions.
- **AWS Backup / EFS:** Persistent storage integration.
- **Application Load Balancer:** Distribute traffic to Fargate tasks.

---

## 🧠 **Exam Tips**

✅ Fargate = **serverless containers (no EC2 management)**.

✅ Use **ECS or EKS as control plane**, Fargate as data plane.

✅ **Each task gets its own ENI** — ensure subnet capacity.

✅ Supports **EFS** for shared storage.

✅ Choose **ECS on Fargate** for simplicity; **EKS on Fargate** for Kubernetes compatibility.

✅ Fargate tasks cannot use instance-level custom AMIs or ephemeral storage > 20 GB (default).

✅ Ideal for **microservices, event-driven jobs, and batch processing**.

---

## 🏁 **Real-World Example**

**Scenario:**

A fintech startup needs to run containerized Python microservices handling API requests, without managing EC2 clusters.

**Solution:**

- Create an **ECS cluster** using **Fargate launch type**.
- Store container images in **ECR**.
- Use an **Application Load Balancer** to route traffic.
- Define **IAM task roles** and use **EFS** for shared data.
- Monitor performance via **CloudWatch metrics**.

**Outcome:**

Serverless, scalable container environment with pay-per-use pricing and zero infrastructure overhead.