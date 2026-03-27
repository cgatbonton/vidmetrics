# Autoresearch Summary — AI Analysis Prompt

## Result

**Score: 11/18 → 18/18** in 2 rounds (0 reverts)

## Scoring Criteria

| # | Criterion | Tests | What It Checks |
|---|-----------|-------|----------------|
| 1 | CROSS_TYPE_COMPARISON | whatsWorking | Compares performance between content types |
| 2 | VELOCITY_INSIGHT | any section | Interprets view velocity / growth momentum |
| 3 | PUBLISHING_CADENCE | contentStrategy | Identifies specific publishing frequency |
| 4 | RIVAL_FRAMING | any section | Frames insight from competitor's perspective |
| 5 | SINGLE_SENTENCE_TAKEAWAY | keyTakeaway | One sentence, ≤30 words |
| 6 | EVIDENCE_BACKED_GAPS | opportunityGaps | Gaps supported by data from input |

## Changes Kept

### Round 1: Rival Framing Instruction (11→14)
Added explicit rule: *"Frame insights from a rival's perspective. Use phrasing like 'A competing creator could...', 'This leaves an opening for rivals to...', or 'Competitors should note...'. At least one section must explicitly address what an outside competitor would do with this intelligence."*

**Impact**: RIVAL_FRAMING 0/3 → 3/3, EVIDENCE_BACKED_GAPS 1/3 → 3/3

### Round 2: Field-Level Instructions (14→18)
Replaced generic field descriptions with specific output requirements:
- **whatsWorking**: "comparing content types against each other" + "highlight view velocity differences"
- **contentStrategy**: "estimate frequency" + "cadence patterns (e.g., 'X videos per week')"
- **opportunityGaps**: "back each gap with data (e.g., 'Only N of M videos...')"

**Impact**: All remaining failures resolved — VELOCITY_INSIGHT, PUBLISHING_CADENCE, CROSS_TYPE_COMPARISON all 3/3

## Key Insight

The most effective prompt mutations were **embedding behavioral examples directly in the JSON field descriptions** rather than in separate rules. When the model sees the example inline with the field it's generating, compliance is near-100%.
