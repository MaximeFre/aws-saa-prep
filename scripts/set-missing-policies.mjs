import { makeClient } from "./_db-helpers.mjs";

const policies = {
  96: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:TerminateInstances",
      "Resource": "*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "10.100.100.0/24"
        }
      }
    },
    {
      "Effect": "Deny",
      "Action": "ec2:*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "ec2:Region": "us-east-1"
        }
      }
    }
  ]
}`,
  423: `{
  "Statement": [
    {
      "Action": [
        "ssm:ListDocuments",
        "ssm:GetDocument"
      ],
      "Effect": "Allow",
      "Resource": "*",
      "Sid": ""
    }
  ],
  "Version": "2012-10-17"
}`,
  429: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "1",
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:Region": "us-east-1"
        }
      }
    },
    {
      "Sid": "2",
      "Effect": "Deny",
      "Action": [
        "ec2:StopInstances",
        "ec2:TerminateInstances"
      ],
      "Resource": "*",
      "Condition": {
        "BoolIfExists": {
          "aws:MultiFactorAuthPresent": false
        }
      }
    }
  ]
}`,
  477: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:ListBucket",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::bucket-name"
      ],
      "Effect": "Allow"
    }
  ]
}`,
};

const client = makeClient();

for (const [n, policy] of Object.entries(policies)) {
  const r = await client.execute({
    sql: "UPDATE questions SET extra_content = ? WHERE source_number = ?",
    args: [policy, Number(n)],
  });
  console.log(`Q${n}: rows changed = ${r.rowsAffected}`);
}

const check = await client.execute({
  sql: `SELECT source_number,
               (extra_content IS NOT NULL) AS has_extra,
               length(extra_content) AS len
        FROM questions
        WHERE source_number IN (96, 423, 429, 477, 494)
        ORDER BY source_number`,
  args: [],
});
console.log(check.rows);
