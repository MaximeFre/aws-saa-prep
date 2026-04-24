# Elastic Load Balancing (ELB)

Category: Compute
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 1

# **Elastic Load Balancing (ELB) – Study Sheet**

*(Includes ALB, NLB, and Gateway Load Balancer)*

**Exam Domains:**

- Design Resilient Architectures
- Design High-Performing Architectures
- Design Cost-Optimized Architectures

---

## 🧭 **Purpose**

**Elastic Load Balancing (ELB)** automatically distributes incoming network traffic across multiple targets (such as EC2 instances, containers, or IPs) in one or more Availability Zones.

It improves **fault tolerance**, **scalability**, and **application availability** while abstracting the complexity of manual traffic management.

---

## ⚙️ **Key Features**

| Feature | Description |
| --- | --- |
| **Automatic Traffic Distribution** | Balances requests across multiple healthy targets. |
| **Health Checks** | Monitors target health and routes traffic only to healthy ones. |
| **Multi-AZ Load Balancing** | Ensures availability even if one AZ fails. |
| **Sticky Sessions (Session Affinity)** | Optionally route client requests to the same backend target. |
| **Cross-Zone Load Balancing** | Distributes traffic evenly across all registered targets in all AZs. |
| **TLS Termination** | Offloads SSL/TLS decryption to the load balancer. |
| **Integration with Auto Scaling** | Dynamically adds/removes instances from load balancer target groups. |
| **Access Logs and Metrics** | Integrated with CloudWatch and S3 for monitoring and analysis. |

---

## ⚖️ **Load Balancer Types**

| Type | Layer | Use Case | Key Features |
| --- | --- | --- | --- |
| **Application Load Balancer (ALB)** | Layer 7 (HTTP/HTTPS) | Web apps, microservices, containers | Path-based & host-based routing, WAF integration, native WebSocket support |
| **Network Load Balancer (NLB)** | Layer 4 (TCP/UDP/TLS) | High-performance, low-latency workloads | Millions of requests/sec, static IPs, supports TLS termination |
| **Gateway Load Balancer (GLB)** | Layer 3 | Virtual appliances (firewalls, security) | Combines transparent network gateway + load balancing using GENEVE protocol |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Distribute HTTP/HTTPS traffic to web servers | Use **Application Load Balancer (ALB)** |
| Handle millions of TCP connections per second | Use **Network Load Balancer (NLB)** |
| Deploy third-party firewalls or network appliances | Use **Gateway Load Balancer (GLB)** |
| Route traffic based on URL paths (e.g., /api, /images) | Use **ALB path-based routing** |
| Route traffic based on domain name (e.g., api.example.com) | Use **ALB host-based routing** |
| Need static IP or IP whitelisting | Use **NLB** |
| Combine security inspection with traffic distribution | Use **GLB + Firewall Appliance** |
| Perform blue/green deployments for web apps | Use **ALB Target Groups** |
| Offload SSL/TLS from backend servers | Enable **TLS termination** on the load balancer |
| Maintain user session stickiness | Enable **Session Stickiness (cookies)** on ALB |

---

## 🔐 **Security Considerations**

- Terminate or re-encrypt TLS at the load balancer using **AWS Certificate Manager (ACM)**.
- Integrate **ALB** with **AWS WAF** for web-layer protection.
- Use **Security Groups** for ALBs; **NLBs** use **subnet-level security (no SGs)**.
- Configure **access logs** for auditing and compliance.
- Use **private ALBs/NLBs** for internal-only communication within a VPC.

---

## 💲 **Pricing Model**

- Charged per **hour of load balancer operation** + **GB processed**.
- **ALB/NLB/GLB** each have separate pricing tiers.
- Additional cost for:
    - **Data transfer** across AZs
    - **WAF rules** (for ALB)
    - **ACM certificates** (if not using free public certs)

---

## 🔗 **Integration Patterns**

- **Auto Scaling Groups:** Automatically add/remove targets as capacity changes.
- **Route 53:** DNS-level routing to ALBs or NLBs.
- **CloudWatch:** Monitor latency, request counts, and target health.
- **AWS WAF + Shield:** Protect ALBs from attacks.
- **VPC:** Integrate with private subnets for internal load balancing.

---

## 🧠 **Exam Tips**

✅ **ALB = Layer 7**, supports advanced routing and WAF integration.

✅ **NLB = Layer 4**, supports static IPs and extreme performance.

✅ **GLB = Layer 3**, used for virtual appliance deployment.

✅ Always enable **Cross-Zone Load Balancing** for even traffic distribution (cost varies).

✅ For **sticky sessions**, configure **target group stickiness** in ALB.

✅ ALB supports **Lambda functions** as targets (serverless backend).

✅ Use **multi-AZ** load balancers for high availability.

✅ Use **CloudWatch metrics** like `HealthyHostCount` and `TargetResponseTime` to monitor.

---

## 🏁 **Real-World Example**

**Scenario:**

A fintech company hosts microservices-based web applications with APIs and user dashboards.

**Solution:**

- Deploy each microservice in its own **target group**.
- Use an **Application Load Balancer** with **path-based routing** (e.g., `/api/*`, `/dashboard/*`).
- Enable **WAF** for SQL injection protection.
- Connect ALB to **Auto Scaling Groups** for elasticity.

**Outcome:**

Highly available, secure, and scalable multi-tier web architecture that automatically adapts to demand.