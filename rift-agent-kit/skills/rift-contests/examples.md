# RIFT Skill Examples

## Example: create and fund a contest

User intent:
- "Create a 1 hour RIFT contest for music generation and fund it with 5,000 tokens."

Suggested tool path:
1. `rift_create_and_fund_contest`

What to mention back:
- `contestId`
- tx signatures
- gross funding
- burned amount
- net reward pool

## Example: commit and reveal a submission

User intent:
- "Join contest 12 and submit this model output."

Suggested tool path:
1. `rift_join_contest`
2. `rift_prepare_submission`
3. `rift_commit_submission`
4. later `rift_reveal_submission`

Important:
- keep the returned `blob`
- do not regenerate it

## Example: review another participant

User intent:
- "Review submitter wallet XYZ in contest 12 with score 920000."

Suggested tool path:
1. `rift_prepare_review`
2. `rift_commit_review`
3. later `rift_reveal_review`

## Example: read-only exploration

User intent:
- "Show me active contests and the current protocol config."

Suggested tool path:
1. `rift_get_protocol_config`
2. `rift_list_contests`
