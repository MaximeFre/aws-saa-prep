# ECS / EKS / ECR

Category: Containers
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 2

# **Amazon ECS / Amazon EKS / Amazon ECR – Study Sheet**

*(Container orchestration & registry services on AWS)*

**Exam Domains:**

- Design High-Performing Architectures
- Design Resilient Architectures
- Design Cost-Optimized Architectures

---

# 🟦 **Part 1 — Amazon ECR (Elastic Container Registry)**

## 🧭 **Purpose**

**Amazon ECR** is a fully managed container image registry, used to store, scan, and manage Docker images for ECS, EKS, and Lambda.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Private container registry** | Fully managed, like AWS-native Docker Hub. |
| **Image scanning** | Vulnerability scans using Clair. |
| **Lifecycle rules** | Automatically delete old images. |
| **Encryption** | KMS encryption at rest. |
| **Cross-account access** | Share images across accounts. |
| **Authenticated pulls** | IAM, IAM Roles for Tasks, IRSA for EKS. |

---

## 🏗️ **Common Exam Use Cases — ECR**

| Scenario | Recommended Solution |
| --- | --- |
| Store and version container images | Use **ECR private repository** |
| Automate cleanup of old images | **Lifecycle rules** |
| Share container images across accounts | Use **cross-account IAM policies** |
| Scan images before deployment | Enable **vulnerability scanning** |

---

---

# 🟫 **Part 2 — Amazon ECS (Elastic Container Service)**

*(Simplest, most AWS-native orchestrator; deeply integrated with AWS)*

## 🧭 **Purpose**

**Amazon ECS** is a fully managed container orchestration service.

It is **simpler than Kubernetes**, very AWS-integrated, and widely used for production workloads.

Supports:

- **EC2 launch type** (you manage EC2 cluster)
- **Fargate launch type** (serverless containers)

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Task Definitions** | Blueprint for container runtime settings. |
| **Tasks vs Services** | Task = 1 run; Service = long-running with scaling. |
| **EC2 or Fargate launch types** | Run containers on EC2 or serverless. |
| **Service Auto Scaling** | Scale containers based on metrics. |
| **ALB/NLB integration** | Load-balancing at service level. |
| **IAM Roles for Tasks** | Fine-grained permissions per task. |
| **ECS Cluster** | Logical grouping of compute resources. |

---

## 🏗️ **Common Exam Use Cases — ECS**

| Scenario | Recommended Solution |
| --- | --- |
| Simple, cost-effective container orchestration | Use **ECS on EC2** |
| Serverless containers with no cluster mgmt | **ECS on Fargate** |
| IAM permissions for each container | **Task Role** |
| Blue/green deployments | **CodeDeploy + ECS** |
| Private service-to-service communication | Run ECS in **private subnets** |
| Multi-AZ highly available service | ECS Service + ALB |

---

---

# 🟩 **Part 3 — Amazon EKS (Elastic Kubernetes Service)**

*(Managed Kubernetes for advanced teams or when Kubernetes is a requirement)*

## 🧭 **Purpose**

**Amazon EKS** provides fully managed Kubernetes control planes.

Use EKS when your team **requires Kubernetes**, not just containers.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Managed Control Plane** | AWS manages master nodes, etcd, API server. |
| **Node Options** | Self-managed EC2 nodes, Managed Node Groups, or Fargate. |
| **Networking (CNI plugin)** | Pods receive VPC IPs (common exam topic). |
| **IAM Roles for Service Accounts (IRSA)** | Kubernetes → IAM integration. |
| **Autoscaling** | Cluster Autoscaler + HPA. |
| **Ingress Controllers** | ALB Ingress Controller supported. |

---

## 🏗️ **Common Exam Use Cases — EKS**

| Scenario | Recommended Solution |
| --- | --- |
| Company requires Kubernetes ecosystem | **EKS** |
| Granular IAM per Kubernetes service | **IRSA (IAM Roles for Service Accounts)** |
| Need to run thousands of pods | EKS with **Managed Node Groups** |
| Hybrid or multi-cloud Kubernetes | EKS → standardized K8s APIs |
| Serverless pods | **EKS on Fargate** |

---

# 🧱 **ECS vs EKS – Exam Comparison**

| Feature | ECS | EKS |
| --- | --- | --- |
| Complexity | Simple | Complex |
| When to use | Native AWS, fast, low-overhead | Kubernetes required |
| Compute | EC2 or Fargate | EC2, Fargate |
| IAM integration | Task IAM Roles | IRSA (IAM Roles for Service Accounts) |
| Networking | Straightforward | Advanced (CNI assigns VPC IPs to pods) |
| Scaling | ECS Service Auto Scaling | HPA + Cluster Autoscaler |

**Exam rule of thumb:**

> If the question does NOT explicitly require Kubernetes → choose ECS.
> 

---

# 🏗️ **Common Exam Use Cases (Combined)**

| Scenario | Recommended Solution |
| --- | --- |
| Run containers without managing servers | **Fargate (ECS or EKS)** |
| Need Kubernetes ecosystem | **EKS** |
| Need simplest container orchestration | **ECS** |
| Per-task permissions | **IAM Task Role (ECS)** |
| Per-pod permissions | **IRSA (EKS)** |
| Continuous deployment with blue/green | ECS + **CodeDeploy** |
| CI/CD pipeline for containers | **ECR + CodePipeline + ECS/EKS** |
| Registering images | **Push to ECR** |

---

# 🔐 **Security Considerations**

- **IAM Roles for Tasks (ECS)** → least privilege for containers.
- **IRSA (EKS)** → map Kubernetes Service Accounts to IAM roles.
- Use **security groups** per service or per pod.
- Use private subnets for tasks/pods via NAT or VPC endpoints.
- Encrypt ECR images at rest via **KMS**.
- Encrypt container environment variables via **KMS + SSM**.

---

# 💲 **Pricing Model**

| Service | Pricing |
| --- | --- |
| **ECS** | Free (pay for EC2/Fargate) |
| **EKS Control Plane** | ~$0.10/hour per cluster |
| **ECR** | Pay for storage + data transfer |
| **Fargate** | Per vCPU-second and GB-second |
| **EC2** | Standard EC2 pricing |

---

# 🔗 **Integration Patterns**

- **ECR → ECS/EKS** for container images
- **ALB** for routing to services/pods
- **CloudWatch** for logs/metrics
- **X-Ray** for tracing microservices
- **Parameter Store / Secrets Manager** for secrets
- **App Mesh** for service mesh in microservices architectures

---

# 🧠 **Exam Tips**

- If Kubernetes is **not** explicitly required → default to **ECS**.
- For no servers → **Fargate** (ECS or EKS).
- ECS IAM = **Task Role**; EKS IAM = **IRSA**.
- ECR integrates natively with both ECS/EKS.
- EKS networking uses **CNI**, assign VPC IPs → subnet planning matters.
- Multi-account image sharing → **ECR cross-account access**.
- ECS integrates more tightly with AWS (easier to operate).

---

# 🏁 **Real-World Example**

**Scenario:**

A fintech needs to run microservices with minimal operational overhead, auto-scaling, IAM-based permissions, and fast deployment.

**Solution:**

- Use **ECS on Fargate** for serverless containers.
- Store images in **ECR**.
- Route traffic through **ALB**.
- Use **IAM Task Roles** for fine-grained permissions.
- Deploy using **CodePipeline + CodeDeploy**.

**Outcome:**

Highly scalable, secure, cost-efficient microservices architecture with no cluster management.