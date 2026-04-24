# Global Accelerator

Category: Networking
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 3

# **AWS Global Accelerator – Study Sheet**

*(Global performance optimization + multi-Region failover with Anycast networking)*

**Exam Domains:**

- Design High-Performing Architectures
- Design Resilient Architectures
- Design Cost-Optimized Architectures

---

## 🧭 Purpose

**AWS Global Accelerator (AGA)** improves global application performance and availability by routing user traffic through the **AWS global edge network**, not the public internet.

Key benefits:

- Lower latency for users worldwide
- Automatic **Region-level failover**
- Static Anycast IP addresses
- Faster and more reliable routing

Think of it as:

**A global TCP/UDP accelerator that routes traffic into the nearest AWS edge location and then uses the AWS backbone to your origin.**

---

## ⚙️ Key Features

- **Anycast IPs** (2 static IPs advertised globally)
- Intelligent routing to nearest AWS edge
- Automatic health checks and **failover between Regions**
- Supports **TCP and UDP**
- Works with:
    - ALB / NLB
    - EC2 instances
    - Elastic IPs
- Traffic dials and weight-based routing
- DDoS protection (Shield automatically included)

---

## 🏗️ Common Exam Use Cases

| Scenario | Recommended Solution |
| --- | --- |
| Improve global latency for users worldwide | **Global Accelerator** |
| Multi-Region failover with zero DNS TTL dependencies | Global Accelerator |
| Global static IP for multi-Region app | Global Accelerator |
| Users connect via TCP/UDP (gaming, VoIP, APIs) | Global Accelerator |
| Fast, reliable routing for real-time apps | Global Accelerator |
| Avoid slow DNS propagation for disaster recovery | Global Accelerator |
| Reduce packet loss and jitter | AGA via AWS backbone |

---

## 🔐 Security Considerations

- Built-in **AWS Shield** protections
- Can restrict origins with **security groups / NACLs**
- Works with private VPC endpoints through ALB/NLB
- Does not expose origins directly (users hit AGA IPs)
- IAM-controlled management

---

## 💲 Pricing

- Hourly charge for the accelerator
- Data transfer costs based on traffic direction
- Often cheaper than CloudFront for **TCP/UDP acceleration**, but not a CDN

---

## 🔗 Integration Patterns

- **Global accelerator → ALB** (common web app HA pattern)
- **Global accelerator → NLB** for TCP gaming, IoT, VoIP
- **Multi-Region active-active**: AGA manages traffic weighting
- **Multi-Region failover**: health checks automatically shift traffic
- **Disaster Recovery**: instant failover (no DNS TTL delays)

---

## 🧠 Exam Tips

- **Anycast IPs** = global static IPs for your app.
- AGA routes traffic via **AWS global backbone**, not public internet.
- Faster failover than Route 53 because it’s *not DNS-based*.
- Works with TCP and UDP, unlike CloudFront (HTTP-only).
- Use for APIs, gaming, VoIP, real-time services.
- For content caching → **CloudFront**, not AGA.
- For latency optimization only (HTTP) → AGA is often better.
- For multi-Region HA with sub-second failover → AGA.

---

## 🧱 AGA vs CloudFront (Exam Comparison)

| Feature | Global Accelerator | CloudFront |
| --- | --- | --- |
| Protocols | TCP & UDP | HTTP/HTTPS |
| Caching | No | Yes |
| Accelerates dynamic traffic | **Yes** | Yes (but less effective) |
| Static global IP | **Yes** | No |
| Multi-Region failover | **Instant** | DNS-based or routing rules |
| Content Delivery Network | No | **Yes** |

**Exam rule:**

> Need caching? → CloudFront
> 
> 
> Need global acceleration + multi-Region failover? → Global Accelerator
> 

---

## 🏁 Real-World Example

**Scenario:**

A global multiplayer game experiences lag due to routing over the public internet. The backend runs in two AWS Regions for resilience.

**Solution:**

- Deploy **AWS Global Accelerator** with endpoints in both Regions
- AGA routes players to their nearest edge location
- Health checks failover traffic instantly if a Region goes down

**Outcome:**

Lower latency, stable performance, instant cross-Region failover.