# Fargate

Category: Containers
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 2

# **AWS Fargate – Study Sheet**

*(Serverless compute engine for ECS and EKS containers)*

**Exam Domains:**

- Design High-Performing Architectures
- Design Cost-Optimized Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**AWS Fargate** is a **serverless, pay-per-use compute platform for containers**.

With Fargate, you do **not** manage EC2 instances, clusters, scaling groups, or patching.

It runs containers defined in:

- **ECS Task Definitions**
- **EKS Pod Specifications**

It is ideal for teams that want to run production containers with minimal operational overhead.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **No servers to manage** | AWS manages cluster capacity, scaling, patching. |
| **Automatic scaling** | Tasks/pods scale independently of underlying hardware. |
| **Pay for resources per second** | vCPU and memory billed only while containers run. |
| **Granular resource allocation** | Specify CPU & memory per task/pod. |
| **Works with ECS & EKS** | Same engine, different orchestrators. |
| **Improved security isolation** | Each task runs in its own microVM (Firecracker). |
| **No need for ASGs, EC2, or nodes** | Fully serverless container runtime. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Run containers without EC2 cluster management | **Use Fargate** |
| Scale tasks independently of EC2 capacity | Fargate (ECS or EKS) |
| Pay only for vCPU/memory used per task | Fargate |
| Improve isolation between workloads | Fargate microVMs |
| Run short-lived jobs or event-driven workloads | Fargate + EventBridge/Lambda trigger |
| Kubernetes workloads with no node management | **EKS on Fargate** |
| Microservices needing high availability without ops overhead | ECS on Fargate |

---

## 🔐 **Security Considerations**

- No SSH access → reduces attack surface.
- Each task/pod runs in an isolated **microVM** sandbox.
- Supports **IAM Task Roles** (ECS) and **IRSA** (EKS).
- Use **VPC networking** (ENI attached to each task).
- Encryption via **KMS** for secrets in SSM/Secrets Manager.
- Use **security groups** per task/POD for microservice isolation.

---

## 💲 **Pricing Model**

| Component | Pricing |
| --- | --- |
| **vCPU-seconds** | Billed by requested CPU |
| **GB-seconds** | Billed by requested memory |
| **Storage (Fargate Ephemeral)** | Billed per GB-hour |

💡 Exam Tip: You pay for **requested**, not actual usage.

---

## 🔗 **Integration Patterns**

- **ECS Service** → run tasks on Fargate with ALB routing.
- **EKS** → pods run without node groups.
- **CloudWatch Logs** → logging driver for containers.
- **X-Ray** → distributed tracing.
- **Parameter Store / Secrets Manager** → inject secrets.
- **App Mesh** → service mesh with Envoy sidecar.

---

## 🧠 **Exam Tips**

- **Fargate = serverless containers.**
- You **do not** manage Auto Scaling Groups or EC2 nodes.
- Use ECS/Fargate when Kubernetes is **not** a requirement.
- Use EKS/Fargate when Kubernetes **is** required but you want zero node management.
- Each Fargate task gets its **own ENI** → subnet planning matters.
- Great for microservices, scheduled jobs, and event-driven processing.
- Fargate provides **strong isolation** via microVMs → better security profile.
- Fargate is usually **more expensive** than EC2 but much **lower operational overhead**.

---

## 🏁 **Real-World Example**

**Scenario:**

A startup wants to deploy 20 microservices in containers but does not want to manage EC2, scaling groups, or patching.

**Solution:**

- Use **ECS on Fargate** for compute.
- Store images in **ECR**.
- Route traffic with **ALB**.
- Use **IAM Task Roles** per microservice.

**Outcome:**

Highly scalable and fully serverless microservices stack with no cluster management.