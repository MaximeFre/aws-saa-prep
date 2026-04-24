from __future__ import annotations

import json
import re
import sqlite3
import sys
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Iterable

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = (
    ROOT
    / "AWS-Certified-Solutions-Architect-Associate-SAA-C03-Exam-Dump-With-Solution"
)
PDF_PATH = SOURCE_DIR / "AWS Certified Solutions Architect Associate SAA-C03.pdf"
SOLUTIONS_PATH = SOURCE_DIR / "AWS SAA-03 Solution.txt"
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "aws-saa.sqlite"

EXAM_QUESTION_COUNT = 65
TIMED_EXAM_SECONDS = 2 * 60 * 60 + 10 * 60

MANUAL_SOLUTIONS: dict[int, dict[str, object]] = {
    191: {
        "correct_answers": ["A"],
        "explanation": (
            "Create an RDS read replica and move reporting queries to it. "
            "That removes long-running read traffic from the primary MySQL "
            "instance so order processing can keep using the writer without "
            "timing out."
        ),
    },
    192: {
        "correct_answers": ["B", "E"],
        "explanation": (
            "Store the uploaded documents and extracted data in Amazon S3 so "
            "Athena can query them with SQL, and use a Lambda function with "
            "Amazon Textract plus Amazon Comprehend Medical to extract text "
            "and medical entities automatically as files arrive."
        ),
    },
    193: {
        "correct_answers": ["B"],
        "explanation": (
            "Use Amazon ElastiCache for Redis to cache frequently read data "
            "and reduce pressure on the Amazon RDS databases. Redis is the "
            "managed cache option here that also supports high availability."
        ),
    },
    194: {
        "correct_answers": ["A"],
        "explanation": (
            "If the database must run on Amazon EC2, the highly available "
            "option is to run clustered database nodes in different "
            "Availability Zones with replication and automatic failover at "
            "the database layer."
        ),
    },
    195: {
        "correct_answers": ["C"],
        "explanation": (
            "Place the workers in an Auto Scaling group and decouple order "
            "submission with Amazon SQS. Orders stay durable in the queue and "
            "can be processed automatically after an outage without forcing "
            "users to resubmit them."
        ),
    },
    196: {
        "correct_answers": ["D"],
        "explanation": (
            "Add a TTL attribute to each new DynamoDB item and configure the "
            "table to expire items automatically after 30 days. That is the "
            "lowest-effort and lowest-cost native solution."
        ),
    },
    197: {
        "correct_answers": ["B", "E"],
        "explanation": (
            "Rehost the .NET application on AWS Elastic Beanstalk with a "
            "Multi-AZ deployment to minimize code changes, and migrate the "
            "Oracle database to Oracle on Amazon RDS Multi-AZ by using AWS "
            "Database Migration Service."
        ),
    },
    198: {
        "correct_answers": ["D"],
        "explanation": (
            "Amazon EKS preserves the Kubernetes deployment model, AWS "
            "Fargate minimizes cluster operations, and Amazon DocumentDB "
            "provides a managed MongoDB-compatible data layer with far less "
            "operational overhead than self-managed databases on EC2."
        ),
    },
    199: {
        "correct_answers": ["B"],
        "explanation": (
            "Amazon Transcribe supports speaker separation for call "
            "transcripts, and Amazon Athena can query transcript data stored "
            "in Amazon S3 for later analysis and long-term retention."
        ),
    },
    200: {
        "correct_answers": ["D"],
        "explanation": (
            "Use an Amazon Cognito user pool authorizer in API Gateway. It is "
            "the managed way to validate Cognito-backed users on each API "
            "request with the least custom code."
        ),
    },
}

MANUAL_SOLUTIONS.update(
    {
        36: {
            "correct_answers": ["B"],
            "explanation": (
                "Use a customer managed multi-Region KMS key so equivalent key "
                "material exists in both Regions. Client-side encryption lets "
                "the application use the same multi-Region key for data stored "
                "in both S3 buckets."
            ),
        },
        80: {
            "correct_answers": ["B"],
            "explanation": (
                "Share the encrypted AMI only with the MSP account by updating "
                "the launch permissions, and allow that account to use the KMS "
                "customer managed key. That keeps access scoped to the partner "
                "account instead of making the AMI public."
            ),
        },
        96: {
            "correct_answers": ["C"],
            "explanation": (
                "The policy allows termination only in us-east-1 and only when "
                "the caller comes from the permitted source IP range. A user at "
                "10.100.100.254 can therefore terminate an instance in us-east-1."
            ),
        },
        112: {
            "correct_answers": ["A"],
            "explanation": (
                "Amazon ECS on AWS Fargate is the lowest-operations way to run "
                "the existing containerized application with minimal code change, "
                "while the ALB and Service Auto Scaling handle variable traffic."
            ),
        },
        167: {
            "correct_answers": ["C"],
            "explanation": (
                "Reserved Instances cover the steady baseline at lower cost, and "
                "Spot Instances can handle bursts for the SQS-driven workers. "
                "Because the queue is durable, intermittent Spot interruption "
                "does not mean message loss or downtime."
            ),
        },
        207: {
            "correct_answers": ["D"],
            "explanation": (
                "Insert Amazon SQS between the API and DynamoDB writes so "
                "requests are buffered durably instead of being lost when write "
                "capacity is exhausted. Lambda can then drain the queue at a "
                "rate DynamoDB can sustain."
            ),
        },
        210: {
            "correct_answers": ["D"],
            "explanation": (
                "Use separate SQS queues for collection and fulfillment, have "
                "each Auto Scaling group poll its queue, and scale on backlog "
                "per instance. That preserves orders durably while letting both "
                "stages scale independently and efficiently."
            ),
        },
        219: {
            "correct_answers": ["D"],
            "explanation": (
                "The workload is memory-sensitive, so move from M5 to memory-"
                "optimized R5 instances. EC2 does not publish built-in memory "
                "metrics, so the CloudWatch agent is required for future custom "
                "latency and capacity planning metrics."
            ),
        },
        224: {
            "correct_answers": ["C", "E"],
            "explanation": (
                "Use Route 53 multivalue answer routing to return multiple "
                "healthy instance records randomly, and place the instances "
                "evenly across two Availability Zones for high availability."
            ),
        },
        235: {
            "correct_answers": ["C"],
            "explanation": (
                "Migrate the Oracle schema with AWS Schema Conversion Tool, "
                "then use AWS DMS with a full load plus CDC task so data stays "
                "synchronized while applications are moved gradually. A memory-"
                "optimized replication instance is appropriate for heavy read and "
                "write activity."
            ),
        },
        248: {
            "correct_answers": ["D"],
            "explanation": (
                "Put job requests on Amazon SQS and have an EC2 Auto Scaling "
                "group scale from queue depth. That decouples submission from "
                "processing and lets compute scale with user demand."
            ),
        },
        250: {
            "correct_answers": ["D"],
            "explanation": (
                "Send VPC Flow Logs to Amazon S3 and transition them to "
                "S3 Standard-IA after 90 days. That preserves frequent access "
                "for the first 90 days and lowers cost afterward."
            ),
        },
        253: {
            "correct_answers": ["C"],
            "explanation": (
                "The combined IAM permissions allow the cloud engineer to delete "
                "Amazon EC2 instances, but not the other listed resources."
            ),
        },
        257: {
            "correct_answers": ["A"],
            "explanation": (
                "CloudWatch metric streams can push Auto Scaling metrics to "
                "Kinesis Data Firehose continuously without adding work to the "
                "instance launch path. Firehose can then deliver the data to S3 "
                "for near-real-time dashboarding."
            ),
        },
        272: {
            "correct_answers": ["B"],
            "explanation": (
                "Keep the existing ALB-based architecture and place CloudFront "
                "in front of it. Caching by the Accept-Language header lets the "
                "site serve language-specific content efficiently to global users "
                "without building a multi-Region backend."
            ),
        },
        283: {
            "correct_answers": ["D"],
            "explanation": (
                "Amazon FSx for NetApp ONTAP supports both NFS and SMB from the "
                "same managed storage platform, so the Linux simulation and "
                "Windows visualization applications can share data without code "
                "changes or duplicate file systems."
            ),
        },
        297: {
            "correct_answers": ["B"],
            "explanation": (
                "Move the instances into an Auto Scaling group that uses target "
                "tracking on average CPU utilization. That keeps cost lower than "
                "a fixed fleet while adding capacity automatically during surges."
            ),
        },
        298: {
            "correct_answers": ["C"],
            "explanation": (
                "A highly available design needs a subnet in each Availability "
                "Zone, EC2 instances spread across both Zones by the Auto Scaling "
                "group, and an RDS Multi-AZ deployment for database failover."
            ),
        },
        308: {
            "correct_answers": ["A", "C"],
            "explanation": (
                "Trusted Advisor recommendations for RDS must be checked from "
                "the account that actually owns the DB instances, and the "
                "relevant cost check is Amazon RDS Reserved Instance "
                "Optimization."
            ),
        },
        311: {
            "correct_answers": ["C"],
            "explanation": (
                "Use SNS with message filtering to fan out requests by quote "
                "type into durable SQS queues, and have each backend service "
                "consume its own queue. That keeps requests for up to the queue "
                "retention period and minimizes operational overhead."
            ),
        },
        315: {
            "correct_answers": ["D"],
            "explanation": (
                "Amazon Inspector is the service that performs vulnerability "
                "assessments on EC2 instances. The Inspector agent plus an "
                "automated reporting Lambda function meets the scanning and "
                "reporting requirements."
            ),
        },
        327: {
            "correct_answers": ["A"],
            "explanation": (
                "AWS Network Firewall can inspect outbound traffic and enforce "
                "domain allow lists, which is the right control when instances "
                "must reach only approved third-party repository URLs."
            ),
        },
        341: {
            "correct_answers": ["D"],
            "explanation": (
                "Bring the Aurora data into the Lake Formation-governed S3 data "
                "lake, apply column-level permissions in Lake Formation, and use "
                "Athena as the QuickSight source. That keeps governance in one "
                "place with the least operational overhead."
            ),
        },
        366: {
            "correct_answers": ["D"],
            "explanation": (
                "API Gateway usage plans and API keys are the least operationally "
                "heavy option among the choices for segmenting premium API access. "
                "The other options do not provide a practical subscription gate at "
                "the API layer."
            ),
        },
        390: {
            "correct_answers": ["A", "D"],
            "explanation": (
                "ALB sticky sessions keep a shopper bound to the same instance "
                "during a transaction, and ElastiCache for Redis provides a "
                "shared session store across the fleet so session data is not "
                "tied to a single web server."
            ),
        },
        402: {
            "correct_answers": ["A"],
            "explanation": (
                "Kinesis Data Streams keeps records for only 24 hours by default. "
                "Because the data is consumed every other day, the retention "
                "period must be increased so records are still available when the "
                "application reads them."
            ),
        },
        414: {
            "correct_answers": ["B"],
            "explanation": (
                "An Amazon S3 File Gateway exposes a network share while storing "
                "the files in S3, which is the simplest near-real-time way to get "
                "the CSV reports into AWS without building custom automation."
            ),
        },
        417: {
            "correct_answers": ["C"],
            "explanation": (
                "A Compute Savings Plan covers both EC2 and Lambda. Connecting the "
                "Lambda functions to the private subnet with the EC2 instances "
                "keeps east-west latency low while allowing the functions direct "
                "network access."
            ),
        },
        423: {
            "correct_answers": ["A", "B"],
            "explanation": (
                "Identity-based IAM policies attach to IAM identities such as "
                "roles and groups. They do not attach directly to organizations "
                "or EC2/ECS resources."
            ),
        },
        429: {
            "correct_answers": ["D"],
            "explanation": (
                "The policy allows general EC2 actions in us-east-1, but it only "
                "allows stop and terminate operations in that Region when MFA is "
                "present. That matches the most specific effective permission set."
            ),
        },
        434: {
            "correct_answers": ["A"],
            "explanation": (
                "For the least downtime, pre-provision the Auto Scaling group and "
                "load balancer in the disaster recovery Region and replicate the "
                "DynamoDB table as a global table. Then use Route 53 failover to "
                "switch traffic to the standby Region."
            ),
        },
        477: {
            "correct_answers": ["C"],
            "explanation": (
                "s3:DeleteObject must be granted on the object ARN pattern, not "
                "just on the bucket ARN. Adding an allow statement for "
                "arn:aws:s3:::bucket-name/* fixes delete access with least "
                "privilege."
            ),
        },
        491: {
            "correct_answers": ["A"],
            "explanation": (
                "An SQS standard queue with Lambda event source mapping is the "
                "cost-effective way to achieve at-least-once processing. Using "
                "SSE-KMS secures the queue, and the Lambda execution role needs "
                "kms:Decrypt permission to read the encrypted messages."
            ),
        },
        494: {
            "correct_answers": ["D"],
            "explanation": (
                "The request is denied because it does not originate from one of "
                "the CIDR blocks allowed by the policy condition."
            ),
        },
        528: {
            "correct_answers": ["D"],
            "explanation": (
                "AWS Transfer Family provides a managed FTP endpoint with minimal "
                "change for existing clients, S3 event notifications can trigger "
                "Lambda as soon as each file lands, and Lambda can process and "
                "delete each file within the required 3-8 minute runtime window."
            ),
        },
        539: {
            "correct_answers": ["C"],
            "explanation": (
                "AWS Elastic Disaster Recovery provides low-cost continuous block-"
                "level replication with very low RPO and a pilot-light style DR "
                "pattern, which fits the 30-second RPO and 60-minute RTO better "
                "than nightly backups or SQL Server Enterprise features."
            ),
        },
        543: {
            "correct_answers": ["A", "E"],
            "explanation": (
                "Savings Plan discount sharing works across an AWS Organizations "
                "organization when discount sharing is enabled in the management "
                "account. The existing account that owns the Savings Plan should "
                "become the organization management account and invite the other "
                "accounts."
            ),
        },
        563: {
            "correct_answers": ["B"],
            "explanation": (
                "Amazon EKS Connector is designed to register and display "
                "Kubernetes clusters, including on-premises clusters, in a single "
                "central EKS view with minimal operational overhead."
            ),
        },
        569: {
            "correct_answers": ["A"],
            "explanation": (
                "Amazon EventBridge publishes CloudWatch metrics such as "
                "TriggeredRules, Invocations, and FailedInvocations. Those metrics "
                "show whether the rule matched events and whether EventBridge "
                "attempted to invoke the target."
            ),
        },
        581: {
            "correct_answers": ["A"],
            "explanation": (
                "A minimum capacity of two On-Demand Instances spread across two "
                "Availability Zones ensures that at least two instances remain "
                "running while also meeting high-availability requirements."
            ),
        },
        599: {
            "correct_answers": ["A", "C", "F"],
            "explanation": (
                "With Outposts, the customer is responsible for facility power and "
                "networking, physical security of the site, and capacity planning "
                "for workloads. AWS manages the Outposts hardware, maintenance, "
                "and AWS control plane components."
            ),
        },
        608: {
            "correct_answers": ["A"],
            "explanation": (
                "AWS WAF with IP sets on the ALB is the scalable way to allow only "
                "registered storefront IP addresses. Network ACLs are too limited "
                "for thousands of entries, and the ALB does not support a Lambda "
                "authorizer."
            ),
        },
        638: {
            "correct_answers": ["D"],
            "explanation": (
                "AWS Transfer Family gives employees a managed, secure file "
                "transfer endpoint backed by S3 while avoiding per-user IAM user "
                "management. A custom identity provider with Secrets Manager keeps "
                "credential operations lightweight."
            ),
        },
        672: {
            "correct_answers": ["B"],
            "explanation": (
                "Use a Glue crawler to catalog the new clickstream data and query "
                "it immediately with Athena. That is the lowest-operations way to "
                "analyze S3 data quickly before deciding whether to continue "
                "processing."
            ),
        },
    }
)

MANUAL_OPTION_OVERRIDES: dict[int, tuple[tuple[str, str], ...]] = {
    477: (
        (
            "A",
            (
                '"Action": ["s3:*Object"], "Resource": '
                '["arn:aws:s3:::bucket-name/*"], "Effect": "Allow"'
            ),
        ),
        (
            "B",
            (
                '"Action": ["s3:*"], "Resource": '
                '["arn:aws:s3:::bucket-name/*"], "Effect": "Allow"'
            ),
        ),
        (
            "C",
            (
                '"Action": ["s3:DeleteObject"], "Resource": '
                '["arn:aws:s3:::bucket-name/*"], "Effect": "Allow"'
            ),
        ),
        (
            "D",
            (
                '"Action": ["s3:DeleteObject"], "Resource": '
                '["arn:aws:s3:::bucket-name"], "Effect": "Allow"'
            ),
        ),
    ),
}


@dataclass(frozen=True)
class QuestionOption:
    label: str
    body: str


@dataclass(frozen=True)
class QuestionRecord:
    source_number: int
    prompt: str
    selection_mode: str
    options: tuple[QuestionOption, ...]


@dataclass(frozen=True)
class RawSolutionBlock:
    marker_number: int
    start: int
    end: int
    body: str
    prompt: str


def clean_inline(text: str) -> str:
    text = text.replace("\x00", "fi")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_multiline(text: str) -> str:
    text = text.replace("\x00", "fi")
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n[ \t]+", "\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"\n?-{6,}\s*$", "", text)
    return text.strip()


def normalize_with_mapping(text: str) -> tuple[str, list[int]]:
    out: list[str] = []
    mapping: list[int] = []
    last_was_space = True

    for index, char in enumerate(text.replace("\x00", "fi")):
        if char.isalnum():
            out.append(char.lower())
            mapping.append(index)
            last_was_space = False
            continue

        if not last_was_space:
            out.append(" ")
            mapping.append(index)
            last_was_space = True

    return "".join(out), mapping


def normalize_query(text: str) -> str:
    normalized, _ = normalize_with_mapping(text)
    return normalized.strip()


def split_letter_list(value: str) -> list[str]:
    tokens = re.split(r"[\s,/&+]+|and", value.upper())
    letters = [token for token in tokens if re.fullmatch(r"[A-F]", token)]
    return sorted(dict.fromkeys(letters))


def detect_selection_mode(prompt: str) -> str:
    prompt_lower = prompt.lower()
    if "choose two" in prompt_lower or "choose three" in prompt_lower:
        return "multiple"
    return "single"


def extract_questions_from_pdf() -> list[QuestionRecord]:
    reader = PdfReader(str(PDF_PATH))
    full_text = "\n".join((page.extract_text() or "") for page in reader.pages)

    block_pattern = re.compile(
        r"(?:Topic\s+\d+\s*)?Question #(\d+)\n(.*?)(?=(?:Topic\s+\d+\s*)?Question #\d+|\Z)",
        re.S,
    )
    option_pattern = re.compile(r"([A-F])\.\s(.*?)(?=(?:\n[A-F]\.\s)|\Z)", re.S)

    questions: list[QuestionRecord] = []

    for match in block_pattern.finditer(full_text):
        number = int(match.group(1))
        block = match.group(2).strip()
        first_option = re.search(r"\nA\.\s", block)
        if first_option is None:
            raise RuntimeError(f"Could not find option A for question {number}.")

        prompt = clean_inline(block[: first_option.start()])
        options_text = block[first_option.start() :].strip()

        options: list[QuestionOption] = []
        for option_match in option_pattern.finditer(options_text):
            options.append(
                QuestionOption(
                    label=option_match.group(1),
                    body=clean_inline(option_match.group(2)),
                )
            )

        if number in MANUAL_OPTION_OVERRIDES:
            options = [
                QuestionOption(label=label, body=body)
                for label, body in MANUAL_OPTION_OVERRIDES[number]
            ]

        if number == 125 and len(options) == 5 and options[-1].label == "D":
            options[-1] = QuestionOption(label="E", body=options[-1].body)

        if not options:
            raise RuntimeError(f"Could not parse options for question {number}.")

        questions.append(
            QuestionRecord(
                source_number=number,
                prompt=prompt,
                selection_mode=detect_selection_mode(prompt),
                options=tuple(options),
            )
        )

    if len(questions) != 684:
        raise RuntimeError(f"Expected 684 questions, found {len(questions)}.")

    return questions


def locate_solution_starts(
    questions: Iterable[QuestionRecord], solutions_text: str
) -> dict[int, int]:
    normalized_solutions, mapping = normalize_with_mapping(solutions_text)
    cursor = 0
    starts: dict[int, int] = {}

    for question in questions:
        words = normalize_query(question.prompt).split()
        found_index = -1

        for snippet_size in (28, 24, 18, 14, 10):
            snippet = " ".join(words[: min(snippet_size, len(words))])
            if not snippet:
                continue
            position = normalized_solutions.find(snippet, cursor)
            if position >= 0:
                found_index = position
                break

        if found_index >= 0:
            starts[question.source_number] = mapping[found_index]
            cursor = found_index + 1

    return starts


def locate_solution_starts_independent(
    questions: Iterable[QuestionRecord], solutions_text: str
) -> dict[int, int]:
    normalized_solutions, mapping = normalize_with_mapping(solutions_text)
    starts: dict[int, int] = {}

    for question in questions:
        words = normalize_query(question.prompt).split()

        for offset in (0, 4, 8):
            if offset >= len(words):
                continue

            for snippet_size in (28, 24, 18, 14, 10):
                snippet = " ".join(words[offset : offset + min(snippet_size, len(words) - offset)])
                if not snippet:
                    continue

                position = normalized_solutions.find(snippet)
                if position >= 0:
                    original_position = mapping[position]
                    rewind_start = max(0, original_position - 500)
                    line_start = solutions_text.rfind("\n", rewind_start, original_position)
                    starts[question.source_number] = line_start + 1 if line_start >= 0 else original_position
                    break

            if question.source_number in starts:
                break

    return starts


def extract_solution_prompt(block_body: str) -> str:
    answer_match = re.search(
        r"(?im)^\s*(ans[-:]\s*|[A-F][.)]\s+|[A-F]\s+(?=[A-Z]))",
        block_body,
    )
    prompt = block_body[: answer_match.start()] if answer_match else block_body
    return clean_inline(prompt)


def extract_raw_solution_blocks(solutions_text: str) -> list[RawSolutionBlock]:
    pattern = re.compile(
        r"(?ms)^(?:IMP>+)?\s*(\d+)[\].]\s*(.*?)(?=^(?:IMP>+)?\s*\d+[\].]\s*|\Z)"
    )

    blocks: list[RawSolutionBlock] = []

    for match in pattern.finditer(solutions_text):
        body = clean_multiline(match.group(2))
        blocks.append(
            RawSolutionBlock(
                marker_number=int(match.group(1)),
                start=match.start(),
                end=match.end(),
                body=body,
                prompt=extract_solution_prompt(body),
            )
        )

    return blocks


def prompt_similarity(solution_prompt: str, question_prompt: str) -> float:
    normalized_solution = normalize_query(solution_prompt)
    normalized_question = normalize_query(question_prompt)

    if not normalized_solution or not normalized_question:
        return 0.0

    solution_words = normalized_solution.split()
    for snippet_size in (24, 18, 12, 8):
        snippet = " ".join(solution_words[: min(snippet_size, len(solution_words))])
        if snippet and normalized_question.startswith(snippet):
            return 2.0

    return SequenceMatcher(
        None,
        normalized_solution[:240],
        normalized_question[:240],
    ).ratio()


def align_solution_blocks(
    questions: list[QuestionRecord],
    raw_blocks: list[RawSolutionBlock],
) -> dict[int, RawSolutionBlock]:
    question_indexes = {
        question.source_number: index for index, question in enumerate(questions)
    }
    aligned: dict[int, RawSolutionBlock] = {}
    question_index = 0

    for block in raw_blocks:
        matched_question: QuestionRecord | None = None
        marker_index = question_indexes.get(block.marker_number)

        if (
            marker_index is not None
            and marker_index >= question_index
            and marker_index < min(len(questions), question_index + 80)
        ):
            candidate = questions[marker_index]
            if prompt_similarity(block.prompt, candidate.prompt) >= 1.5:
                matched_question = candidate

        if matched_question is None:
            window = questions[question_index : min(len(questions), question_index + 80)]
            best_candidate: QuestionRecord | None = None
            best_score = 0.0

            for candidate in window:
                score = prompt_similarity(block.prompt, candidate.prompt)
                if score > best_score:
                    best_candidate = candidate
                    best_score = score

            if best_candidate is not None and best_score >= 0.78:
                matched_question = best_candidate

        if matched_question is None:
            continue

        if matched_question.source_number in aligned:
            continue

        aligned[matched_question.source_number] = block
        question_index = question_indexes[matched_question.source_number] + 1

    return aligned


def extract_answer_section(detail: str) -> tuple[list[str], str]:
    lines = detail.splitlines()
    answer_lines: list[str] = []
    answer_started = False
    explanation_start = 0

    for index, raw_line in enumerate(lines):
        line = raw_line.strip()
        if not line:
            continue

        is_answer_line = bool(
            re.match(
                r"^(?:[Aa]ns[-:]\s*|[Aa]nswers?:\s*[A-F]|[A-F][.)]\s+|[A-F]\s+(?=[A-Z]))",
                line,
            )
        )

        if is_answer_line:
            answer_started = True
            answer_lines.append(line)
            continue

        if answer_started:
            explanation_start = index
            break

    if not answer_started:
        explanation_start = 0

    explanation = clean_multiline("\n".join(lines[explanation_start:]))
    return answer_lines, explanation


def match_answer_text_to_option(
    answer_text: str, options: tuple[QuestionOption, ...]
) -> str | None:
    normalized_answer = normalize_query(answer_text)
    if not normalized_answer:
        return None

    best_label: str | None = None
    best_score = 0.0

    for option in options:
        normalized_option = normalize_query(option.body)
        if not normalized_option:
            continue

        if normalized_answer in normalized_option or normalized_option in normalized_answer:
            shorter = min(len(normalized_answer), len(normalized_option))
            longer = max(len(normalized_answer), len(normalized_option))
            score = 1.0 + (shorter / longer)
        else:
            score = SequenceMatcher(None, normalized_answer, normalized_option).ratio()

        if score > best_score:
            best_label = option.label
            best_score = score

    if best_score < 0.55:
        return None

    return best_label


def derive_correct_answers(
    question: QuestionRecord, answer_lines: list[str], detail: str
) -> list[str]:
    explicit_letters: list[str] = []
    answer_texts: list[str] = []

    for line in answer_lines:
        answer_prefix_match = re.match(
            r"(?i)^answers?:\s*([A-F](?:[\s,/&+]+[A-F])*)\)?\s*(.*)",
            line,
        )
        if answer_prefix_match:
            explicit_letters.extend(split_letter_list(answer_prefix_match.group(1)))
            remainder = answer_prefix_match.group(2).strip(" .:-")
            if remainder:
                answer_texts.append(remainder)
            continue

        ans_match = re.match(r"(?i)^ans[-:]\s*([A-F](?:[\s,/&]+[A-F])*)\b(.*)", line)
        if ans_match:
            explicit_letters.extend(split_letter_list(ans_match.group(1)))
            remainder = ans_match.group(2).strip(" .:-")
            if remainder:
                answer_texts.append(remainder)
            continue

        line_match = re.match(r"^([A-F])[.)]\s*(.*)", line)
        if line_match:
            explicit_letters.append(line_match.group(1))
            if line_match.group(2).strip():
                answer_texts.append(line_match.group(2).strip())
            continue

        bare_match = re.match(r"^([A-F])\s+(?=[A-Z])(.*)", line)
        if bare_match:
            explicit_letters.append(bare_match.group(1))
            if bare_match.group(2).strip():
                answer_texts.append(bare_match.group(2).strip())
            continue

        plain_ans = re.match(r"(?i)^ans[-:]\s*(.*)", line)
        if plain_ans and plain_ans.group(1).strip():
            answer_texts.append(plain_ans.group(1).strip())

    if not explicit_letters:
        for pattern in (
            r"(?i)\banswers?:\s*([A-F](?:[\s,/&+]+[A-F])*)\)?",
            r"(?i)\bcorrect answers?(?: are| is|:)?\s*([A-F](?:[\s,/&+]+[A-F])*)",
            r"(?i)\bcorrect answer\s*([A-F](?:[\s,/&+]+[A-F])*)",
        ):
            match = re.search(pattern, detail)
            if match:
                explicit_letters.extend(split_letter_list(match.group(1)))
                break

    if not explicit_letters:
        first_paragraph = clean_inline(detail.split("\n\n", 1)[0])
        if first_paragraph and len(first_paragraph.split()) > 3:
            answer_texts.append(first_paragraph)

    if not explicit_letters:
        for answer_text in answer_texts:
            matched = match_answer_text_to_option(answer_text, question.options)
            if matched:
                explicit_letters.append(matched)

    return sorted(dict.fromkeys(explicit_letters))


def build_solution_payload(
    question: QuestionRecord,
    block: str | None,
) -> tuple[list[str], str, str]:
    manual_solution = MANUAL_SOLUTIONS.get(question.source_number)

    if block is None:
        if manual_solution is None:
            raise RuntimeError(
                f"Missing solution block for question {question.source_number}."
            )
        return (
            list(manual_solution["correct_answers"]),
            str(manual_solution["explanation"]),
            "generated",
        )

    block = clean_multiline(block)
    normalized_block, mapping = normalize_with_mapping(block)
    normalized_prompt = normalize_query(question.prompt)
    prompt_index = normalized_block.find(normalized_prompt)

    if prompt_index >= 0:
        prompt_end = mapping[prompt_index + len(normalized_prompt) - 1] + 1
        detail = block[prompt_end:].lstrip(" \n\t-?:")
    else:
        detail = block

    if detail == block:
        question_mark = detail.find("?")
        if 0 <= question_mark < 1800:
            detail = detail[question_mark + 1 :].lstrip(" \n\t-?:")

    answer_lines, explanation = extract_answer_section(detail)
    correct_answers = derive_correct_answers(question, answer_lines, detail)

    if not correct_answers and manual_solution is not None:
        correct_answers = list(manual_solution["correct_answers"])
        explanation = explanation or str(manual_solution["explanation"])
        return correct_answers, explanation, "generated"

    if not correct_answers:
        raise RuntimeError(
            f"Could not determine the correct answer for question {question.source_number}."
        )

    if not explanation:
        explanation = clean_multiline(detail)

    return correct_answers, explanation, "provided"


def rebuild_required(force: bool) -> bool:
    if force or not DB_PATH.exists():
        return True

    db_mtime = DB_PATH.stat().st_mtime
    source_files = [Path(__file__), PDF_PATH, SOLUTIONS_PATH]
    return any(path.stat().st_mtime > db_mtime for path in source_files)


def write_database(rows: list[dict[str, object]]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    connection = sqlite3.connect(DB_PATH)
    connection.execute("PRAGMA journal_mode = WAL;")
    connection.execute("PRAGMA foreign_keys = ON;")

    connection.executescript(
        """
        DROP TABLE IF EXISTS exam_session_questions;
        DROP TABLE IF EXISTS exam_sessions;
        DROP TABLE IF EXISTS question_options;
        DROP TABLE IF EXISTS questions;

        CREATE TABLE questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_number INTEGER NOT NULL UNIQUE,
            prompt TEXT NOT NULL,
            selection_mode TEXT NOT NULL,
            correct_answers TEXT NOT NULL,
            explanation TEXT NOT NULL,
            explanation_source TEXT NOT NULL
        );

        CREATE TABLE question_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            label TEXT NOT NULL,
            body TEXT NOT NULL,
            position INTEGER NOT NULL,
            UNIQUE(question_id, label),
            FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
        );

        CREATE TABLE exam_sessions (
            id TEXT PRIMARY KEY,
            mode TEXT NOT NULL,
            total_questions INTEGER NOT NULL,
            time_limit_seconds INTEGER,
            started_at TEXT NOT NULL
        );

        CREATE TABLE exam_session_questions (
            session_id TEXT NOT NULL,
            position INTEGER NOT NULL,
            question_id INTEGER NOT NULL,
            PRIMARY KEY(session_id, position),
            FOREIGN KEY(session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
            FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
        );

        CREATE INDEX idx_questions_source_number ON questions(source_number);
        CREATE INDEX idx_question_options_question_id ON question_options(question_id);
        CREATE INDEX idx_exam_session_questions_session_id
            ON exam_session_questions(session_id, position);
        """
    )

    question_cursor = connection.cursor()
    option_cursor = connection.cursor()

    for row in rows:
        question_cursor.execute(
            """
            INSERT INTO questions (
                source_number,
                prompt,
                selection_mode,
                correct_answers,
                explanation,
                explanation_source
            ) VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                row["source_number"],
                row["prompt"],
                row["selection_mode"],
                json.dumps(row["correct_answers"]),
                row["explanation"],
                row["explanation_source"],
            ),
        )
        question_id = question_cursor.lastrowid

        for position, option in enumerate(row["options"], start=1):
            option_cursor.execute(
                """
                INSERT INTO question_options (question_id, label, body, position)
                VALUES (?, ?, ?, ?)
                """,
                (question_id, option["label"], option["body"], position),
            )

    connection.commit()
    connection.close()


def main() -> None:
    force = "--force" in sys.argv

    if not rebuild_required(force):
        print(f"{DB_PATH.name} is already up to date.")
        return

    questions = extract_questions_from_pdf()
    solutions_text = SOLUTIONS_PATH.read_text(encoding="utf-8", errors="replace")
    raw_blocks = extract_raw_solution_blocks(solutions_text)
    aligned_blocks = align_solution_blocks(questions, raw_blocks)
    remaining_questions = [
        question for question in questions if question.source_number not in aligned_blocks
    ]
    sequential_fallback = locate_solution_starts(remaining_questions, solutions_text)
    independent_questions = [
        question
        for question in remaining_questions
        if question.source_number not in sequential_fallback
    ]
    independent_fallback = locate_solution_starts_independent(
        independent_questions,
        solutions_text,
    )
    fallback_starts = {**independent_fallback, **sequential_fallback}
    known_starts = {
        **{number: block.start for number, block in aligned_blocks.items()},
        **fallback_starts,
    }

    rows: list[dict[str, object]] = []
    generated_count = 0

    for index, question in enumerate(questions):
        next_block_start = len(solutions_text)
        for future_question in questions[index + 1 :]:
            future_start = known_starts.get(future_question.source_number)
            if future_start is not None:
                next_block_start = future_start
                break

        aligned_block = aligned_blocks.get(question.source_number)
        current_start = fallback_starts.get(question.source_number)

        if aligned_block is not None:
            block = aligned_block.body
        elif current_start is not None:
            block = solutions_text[current_start:next_block_start]
        else:
            block = None

        correct_answers, explanation, explanation_source = build_solution_payload(
            question,
            block,
        )

        if explanation_source == "generated":
            generated_count += 1

        rows.append(
            {
                "source_number": question.source_number,
                "prompt": question.prompt,
                "selection_mode": question.selection_mode,
                "correct_answers": correct_answers,
                "explanation": explanation,
                "explanation_source": explanation_source,
                "options": [
                    {"label": option.label, "body": option.body}
                    for option in question.options
                ],
            }
        )

    write_database(rows)

    print(
        "Built",
        DB_PATH,
        f"with {len(rows)} questions, {generated_count} reconstructed explanations,",
        f"{EXAM_QUESTION_COUNT} questions per exam and {TIMED_EXAM_SECONDS} seconds in timed mode.",
    )


if __name__ == "__main__":
    main()
