# Kinesis (Data Streams, Firehose)

Category: Analytics
Domains: Domain 2: Design Resilient Architectures, Domain 3: Design High-Performing Architectures
Priority: Tier 2

# **Amazon Kinesis – Study Sheet**

*(Collect, process, and analyze real-time streaming data at scale)*

**Exam Domains:**

- Design High-Performing Architectures
- Design Resilient Architectures

---

## 🧭 **Purpose**

**Amazon Kinesis** enables real-time data streaming on AWS.

It captures, processes, and delivers **gigabytes per second of continuous data** from sources like application logs, IoT devices, or clickstreams for analytics, dashboards, or ML pipelines.

---

## ⚙️ **Kinesis Services Overview**

| Component | Description | Typical Use Case |
| --- | --- | --- |
| **Kinesis Data Streams (KDS)** | Ingest and process raw streaming data with custom consumers. | Build real-time apps (e.g., fraud detection, metrics aggregation). |
| **Kinesis Data Firehose** | Fully managed delivery service that loads streaming data into S3, Redshift, OpenSearch, or Splunk. | ETL or near-real-time analytics pipelines. |
| **Kinesis Data Analytics (KDA)** | Run SQL queries or Apache Flink apps on streaming data. | Real-time transformations and dashboards. |
| **Kinesis Video Streams** | Stream video/audio data to AWS for analysis or storage. | Live video ingestion for ML or surveillance. |

---

## ⚙️ **Key Features (Streams & Firehose Focus)**

| Feature | Data Streams | Data Firehose |
| --- | --- | --- |
| **Control** | Developer-managed consumers, scaling by shard. | Fully managed, auto-scaling, near real-time (~60 s buffer). |
| **Latency** | Millisecond processing. | Near-real-time delivery (1 min buffer). |
| **Storage Duration** | 1–365 days. | None – data delivered immediately. |
| **Transformation** | Lambda or Kinesis Data Analytics. | Lambda preprocessing or KDA. |
| **Destinations** | Lambda, ECS, custom apps. | S3, Redshift, OpenSearch, Splunk, HTTP endpoint. |
| **Security** | IAM, KMS, PrivateLink. | IAM, KMS, PrivateLink. |

---

## 🏗️ **Common Exam Use Cases**

| Scenario | Recommended Solution |
| --- | --- |
| Collect app logs and process them in real time | **Kinesis Data Streams + Lambda consumer** |
| Deliver transformed data into S3/Redshift | **Kinesis Firehose + Lambda preprocessing** |
| Stream data from IoT sensors to S3 | **Firehose** (simple, managed delivery) |
| Real-time clickstream analytics | **Kinesis Data Analytics (SQL)** over **KDS** |
| Retain and replay event data | **Increase KDS retention period** |
| Near-real-time ELT pipeline | **Kinesis Firehose → S3 → Athena/Redshift** |
| Video monitoring and ML inference | **Kinesis Video Streams** |
| Integrate with private network | Use **VPC endpoints (PrivateLink)** for secure data paths |
| Encrypt data streams | Enable **KMS encryption** on streams |
| Scale producer throughput | Add **more shards** or use **enhanced fan-out** |

---

## 🔐 **Security Considerations**

- **IAM policies** control producer/consumer access.
- **KMS** encrypts records at rest; TLS in transit.
- **PrivateLink** enables VPC-to-service private connectivity.
- Audit API usage with **CloudTrail**.
- Use **VPC endpoints** for Firehose → S3/Redshift without internet exposure.

---

## 💲 **Pricing Model**

| Service | Pricing Unit | Notes |
| --- | --- | --- |
| **Data Streams** | Per shard-hour + per PUT payload unit (25 KB) | Scale cost with throughput. |
| **Firehose** | Per GB ingested | Includes buffering + transformation. |
| **Data Analytics** | Per GB processed / App instance-hour | Stream SQL or Flink apps. |
| **Video Streams** | Per GB ingested + stored | Usage-based. |

💡 **Tip:** Firehose is cheaper and easier — Streams gives more control.

---

## 🔗 **Integration Patterns**

- **Kinesis → Lambda:** Real-time triggers per record batch.
- **Firehose → S3/Redshift:** Automatic near-real-time ETL.
- **Kinesis Data Analytics:** Run continuous SQL transformations.
- **Athena/Glue:** Query data after delivery to S3.
- **CloudWatch:** Monitor shard utilization and throttling.
- **VPC Endpoints:** Private ingestion pipelines.

---

## 🧠 **Exam Tips**

✅ **Kinesis Data Streams = real-time event stream (low latency).**

✅ **Kinesis Firehose = managed data delivery to AWS targets.**

✅ **Kinesis Data Analytics = real-time SQL/Flink over streams.**

✅ Use **shards** to scale throughput (1 MB/s in, 2 MB/s out per shard).

✅ **Enhanced Fan-Out** for high-throughput multiple consumers.

✅ Compare vs SQS: Kinesis = ordered streaming; SQS = messaging queue.

✅ Encryption = KMS; Monitoring = CloudWatch; Auditing = CloudTrail.

✅ Common exam pattern: “Log analytics or IoT ingestion → Firehose.”

---

## 🏁 **Real-World Example**

**Scenario:**

A fintech platform needs to process 2 TB/day of transaction logs in real time, detecting anomalies and storing results in S3 for later analytics.

**Solution:**

- Producers push records to **Kinesis Data Streams**.
- **Kinesis Data Analytics** detects anomalies in-flight.
- Processed events delivered via **Firehose → S3**.
- **Athena** queries stored logs for historical review.

**Outcome:**

End-to-end, scalable, low-latency pipeline enabling continuous fraud detection and low operational overhead.