import { makeClient } from "./_db-helpers.mjs";

const policy = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["ec2:TerminateInstances"],
      "Resource": ["*"]
    },
    {
      "Effect": "Deny",
      "Action": ["ec2:TerminateInstances"],
      "Condition": {
        "NotIpAddress": {
          "aws:SourceIp": [
            "192.0.2.0/24",
            "203.0.113.0/24"
          ]
        }
      },
      "Resource": ["*"]
    }
  ]
}`;

const client = makeClient();

const cols = await client.execute("PRAGMA table_info(questions)");
if (!cols.rows.some((c) => String(c.name) === "extra_content")) {
  await client.execute("ALTER TABLE questions ADD COLUMN extra_content TEXT");
  console.log("Added extra_content column");
}

const result = await client.execute({
  sql: "UPDATE questions SET extra_content = ? WHERE source_number = 494",
  args: [policy],
});
console.log(`Rows changed: ${result.rowsAffected}`);

const check = await client.execute(
  "SELECT source_number, extra_content FROM questions WHERE source_number = 494",
);
console.log(check.rows[0]);
