# EventBridge / SQS / SNS / Step Functions

Category: Application Integration
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures, Domain 4: Design Cost-Optimized Architectures
Priority: Tier 3

# **EventBridge / SQS / SNS / Step Functions – Study Sheet**

*(Event-driven design, messaging, decoupling & workflows)*

**Exam Domains:**

- Design Resilient Architectures
- Design High-Performing Architectures
- Design Cost-Optimized Architectures

---

# 🟦 **Amazon EventBridge**

*(Serverless event bus for routing SaaS/AWS events)*

## 🧭 Purpose

**EventBridge** is a fully managed event bus used to **route events** between AWS services, SaaS applications, and custom applications based on matching rules.

Think: **serverless event router** + **schema registry** + **SaaS integrations**.

---

## ⚙️ Key Features

- **Event buses**: default, custom, partner (SaaS)
- **Rules**: filter events by pattern
- **Targets**: Lambda, SQS, SNS, Step Functions, Kinesis, API Gateway, etc.
- **Schema registry** for auto-detected schemas
- **Cross-account event routing**
- **Replay archived events** (important exam feature!)
- **Guaranteed at-least-once delivery**

---

## 🏗️ Common Exam Use Cases — EventBridge

| Scenario | Recommended Solution |
| --- | --- |
| Trigger workflows on AWS service events | Use **Default Event Bus** |
| Integrate with 3rd-party SaaS | Use **Partner Event Bus** |
| Complex event filtering | **Event pattern rules** |
| Replaying past events for debugging | **Event Archive + Replay** |
| Cross-account event ingestion | EventBridge **cross-account rules** |
| Trigger Step Functions / Lambda from events | EventBridge rule → target |

---

## 🔐 Security

- IAM permissions per event bus
- Resource policies for cross-account
- Events encrypted at rest with KMS
- No inbound networking required

---

## 💲 Pricing

- Per million events
- Event replay + archive charged per GB-month

---

---

# 🟩 **Amazon SQS (Simple Queue Service)**

*(Fully managed message queue — decoupling services)*

## 🧭 Purpose

**SQS** is a fully managed message queue used to **decouple producers and consumers**.

Two queue types:

- **Standard Queue** → high throughput, *at-least-once*, unordered
- **FIFO Queue** → ordered, *exactly-once*, slower throughput

---

## ⚙️ Key Features

- **Visibility timeout** controls redelivery window
- **Dead-Letter Queues (DLQ)** for failed messages
- **Long polling** reduces empty responses
- **Message retention** up to 14 days
- **Serverless, infinite scale**
- Works with **Lambda event source mapping**

---

## 🏗️ Common Exam Use Cases — SQS

| Scenario | Recommended Solution |
| --- | --- |
| Decouple microservices | **SQS Standard** |
| Preserve ordering | **FIFO Queue** |
| Avoid duplicate processing | **FIFO + deduplication** |
| Handle failed jobs | **DLQ** |
| Batch processing | **SQS + Lambda batch event source** |
| Avoid tight loops polling queue | **Long polling (20 seconds)** |

---

## 🔐 Security

- KMS encryption
- IAM policies for send/receive/delete
- VPC endpoints for private access
- No public exposure

---

## 💲 Pricing

- Per million requests
- Long polling cheaper than short polling

---

---

# 🟧 **Amazon SNS (Simple Notification Service)**

*(Pub/Sub fan-out messaging)*

## 🧭 Purpose

**SNS** is a **publish/subscribe** messaging service for **fan-out**, alerts, and notifications.

Publish once → deliver to **multiple subscribers**.

---

## ⚙️ Key Features

- Pub/sub pattern
- Protocols: Lambda, SQS, HTTP/S, email, SMS, mobile push
- **Message filtering** (very important!)
- **Fan-out to SQS** for scalable processing
- FIFO topics (ordered)
- Cross-account publish

---

## 🏗️ Common Exam Use Cases — SNS

| Scenario | Recommended Solution |
| --- | --- |
| Fan-out event to multiple systems | **SNS → N SQS queues** |
| Notify multiple subscribers | SNS |
| Filter messages per subscriber | **SNS Message Filtering** |
| Push notifications to users | SNS mobile push |
| Trigger Lambda on event | SNS → Lambda |

---

## 🔐 Security

- KMS encryption
- Topic policies for cross-account publish
- IAM for publish access

---

## 💲 Pricing

- Per million publishes
- SMS/email additional charges

---

---

# 🟫 **AWS Step Functions**

*(Serverless workflow orchestration / state machines)*

## 🧭 Purpose

**Step Functions** orchestrate complex serverless workflows using **state machines**, replacing custom orchestration code.

---

## ⚙️ Key Features

- **Workflow states**: Task, Choice, Parallel, Wait, Map, Retry, Catch
- Integrates with:
    - Lambda
    - ECS/Fargate
    - DynamoDB
    - SQS/SNS
    - EventBridge
    - Glue
    - SageMaker, etc.
- **Built-in retries** with exponential backoff
- **Visual execution graph**
- **Standard Workflows** vs **Express Workflows**

---

## 🏗️ Common Exam Use Cases — Step Functions

| Scenario | Recommended Solution |
| --- | --- |
| Orchestrate multiple Lambda functions | **Standard workflow** |
| High-volume event ingestion | **Express workflow** |
| Automatic retries on failure | Built-in **Retry + Catch** |
| Multi-step business process | Step Functions |
| Branching logic | **Choice state** |
| Parallel tasks | **Parallel state** |
| Long-running workflows (days) | **Standard** (up to 1 year) |

---

## 🔐 Security

- IAM role for state machine
- Encryption with KMS
- Execution logs to CloudWatch

---

## 💲 Pricing

- **Standard**: Per state transition
- **Express**: Based on execution duration + memory

---

---

# 🧱 **Comparing the Four (for Exam Scenarios)**

| Use Case | Best Service |
| --- | --- |
| Decouple components | **SQS** |
| Fan-out to many consumers | **SNS** |
| Event-driven architectures | **EventBridge** |
| Workflow orchestration / multi-step logic | **Step Functions** |
| Filter events by attributes | **EventBridge** or **SNS Filtering** |
| Ordered processing | **SQS FIFO** |
| Replaying events | **EventBridge Archive + Replay** |
| Durable message persistence | **SQS** |
| Real-time push notifications | **SNS** |

**Golden rule:**

> SNS = pub/sub
> 
> 
> SQS = queue
> 
> EventBridge = event router
> 
> Step Functions = orchestrator
> 

---

# 🏁 Real-World Example

**Scenario:**

An ecommerce app needs to process orders, notify systems, and run fraud checks.

**Solution:**

- API Gateway → Lambda → **SQS** (order queue)
- **SNS** → fan-out notifications to fulfillment + analytics
- **EventBridge** → route events to monitoring and auditing
- **Step Functions** → orchestrate fraud checks, payment, and shipping

**Outcome:**

Fully decoupled, resilient, scalable event-driven architecture.