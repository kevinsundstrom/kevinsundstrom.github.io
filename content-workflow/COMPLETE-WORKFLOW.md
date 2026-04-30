# Complete Multi-Phase Content Workflow

This document describes the full content production pipeline with all agents working together, from brief to publication, including the learning system.

## Overview

The system consists of:
- **8 Content Production Agents**: Transform a brief into published content
- **1 Learning Agent**: Analyzes human edits to improve all agents over time
- **Automated Workflows**: GitHub Actions orchestrates the process
- **Human Oversight**: Quality control and learning feedback

## Complete Content Pipeline

```
BRIEF → Outline → Research → Draft → Refine → Polish → QA → Copy Edit → PUBLISH
         ↓         ↓          ↓        ↓         ↓       ↓      ↓
      (outline) (research) (draft) (refined)(polished)(QA'd)(final)
         
Human Edit → Learning Agent → Agent Improvements → Better Output (feedback loop)
```

## Phase-by-Phase Breakdown

### Phase 0: Brief Creation

**Human Task**

**Input**: Content idea, goals, requirements
**Output**: `{slug}-brief.md` in `content-workflow/briefs/`

**What Happens**:
1. Content creator copies template
2. Fills in all sections:
   - Goals and audience
   - Key messages
   - Required sections
   - SEO requirements
   - Success criteria
3. Commits to repository
4. Workflow automatically triggers

---

### Phase 1: Outline Writing

**Agent**: `outline-writer.agent.md`

**Input**: Content brief
**Output**: 
- `{slug}-outline-{date}.md`
- `{slug}-outline-rationale-{date}.md`

**What It Does**:
- Analyzes brief for key themes
- Creates hierarchical structure (H2, H3 headers)
- Plans narrative flow
- Identifies where examples needed
- Maps reader journey
- Documents structural decisions

**Quality Focus**: Structure, flow, completeness

**Typical Time**: 2-5 minutes

---

### Phase 2: Research

**Agent**: `researcher.agent.md`

**Input**: 
- Content outline
- Content brief

**Output**:
- `{slug}-research-{date}.md`
- `{slug}-sources-{date}.md`

**What It Does**:
- Identifies research needs from outline
- Finds authoritative sources
- Gathers facts, statistics, examples
- Verifies information accuracy
- Documents citations
- Organizes by outline section

**Quality Focus**: Accuracy, credibility, relevance

**Typical Time**: 10-15 minutes

---

### Phase 3: Drafting

**Agent**: `drafter.agent.md`

**Input**:
- Content outline
- Research document
- Content brief
- Style guide
- Brand guidelines

**Output**:
- `{slug}-draft-{date}.md`
- `{slug}-drafting-notes-{date}.md`

**What It Does**:
- Follows outline structure
- Weaves in research naturally
- Writes in brand voice
- Creates engaging prose
- Develops introduction and conclusion
- Flags areas needing attention

**Quality Focus**: Content, voice, readability

**Typical Time**: 15-30 minutes

---

### Phase 4: Refinement

**Agent**: `refiner.agent.md`

**Input**:
- Content draft
- Drafting notes
- Content brief
- Style guide

**Output**:
- `{slug}-refined-{date}.md`
- `{slug}-refinement-notes-{date}.md`

**What It Does**:
- Strengthens weak arguments
- Improves clarity and precision
- Enhances flow and transitions
- Restructures for impact
- Eliminates redundancy
- Sharpens focus

**Quality Focus**: Clarity, flow, argument strength

**Typical Time**: 10-20 minutes

---

### Phase 5: Polishing

**Agent**: `polisher.agent.md`

**Input**:
- Refined content
- Style guide
- Brand guidelines

**Output**:
- `{slug}-polished-{date}.md`
- `{slug}-polish-notes-{date}.md`

**What It Does**:
- Optimizes word choice
- Perfects sentence rhythm
- Ensures voice consistency
- Eliminates weak language
- Adds elegance
- Achieves professional quality

**Quality Focus**: Style, word choice, elegance

**Typical Time**: 10-15 minutes

---

### Phase 6: Quality Assurance

**Agent**: `qa-checker.agent.md`

**Input**:
- Polished content
- Content brief
- Research document
- Style guide

**Output**:
- `{slug}-qa-report-{date}.md`
- `{slug}-qa-approved-{date}.md` (if passed)

**What It Does**:
- Verifies factual accuracy
- Checks completeness vs brief
- Validates all links
- Ensures SEO elements present
- Checks formatting
- Verifies style compliance
- Determines pass/fail

**Quality Focus**: Accuracy, completeness, standards

**Typical Time**: 5-10 minutes

**Decision Point**: 
- **PASS**: Proceed to copy editing
- **FAIL**: Return to appropriate phase for fixes

---

### Phase 7: Copy Editing

**Agent**: `copy-editor.agent.md`

**Input**:
- QA-approved content
- Style guide

**Output**:
- `{slug}-final-{date}.md`
- `{slug}-copy-edit-report-{date}.md`

**What It Does**:
- Corrects grammar errors
- Fixes punctuation
- Corrects spelling/typos
- Ensures proper capitalization
- Applies style guide strictly
- Achieves technical perfection

**Quality Focus**: Grammar, punctuation, correctness

**Typical Time**: 5-10 minutes

**Result**: Publication-ready content

---

### Phase 8: Publication

**Human Task**

**Input**: Final, copy-edited content
**Output**: Published article

**What Happens**:
1. Human reviewer performs final check
2. Content published to platform
3. Original and final versions archived
4. Success metrics tracked

---

## The Learning Loop

### Phase 9: Human Editing (Optional but Valuable)

**When**: Anytime agent output needs improvement

**Process**:
1. Human receives agent output
2. Makes improvements
3. Saves both versions to `edits/` folder
4. Optionally adds context explaining changes
5. Triggers learning analysis

---

### Phase 10: Learning Analysis

**Agent**: `learning-agent.agent.md`

**Input**:
- Original agent output
- Human-edited version
- Edit context (optional)
- Agent configuration

**Output**:
- `{agent}-analysis-{date}.md`
- `{agent}-recommendations-{date}.md`
- `edit-patterns-{agent}.json` (updated)

**What It Does**:
- Compares original to edited version
- Identifies and categorizes changes
- Detects patterns across multiple edits
- Distinguishes consistent vs one-off changes
- Generates recommendations (if patterns consistent)
- Updates pattern database
- Tracks improvement trends

**Quality Focus**: Pattern detection, learning accuracy

**Trigger**: After each human edit submission

---

### Phase 11: Agent Improvement

**Human Task**

**When**: Recommendation reaches threshold (3-5 consistent patterns)

**Process**:
1. Learning Agent generates recommendation
2. Team reviews recommendation file
3. Team discusses evidence and impact
4. Decision: Approve, Reject, or Monitor
5. If approved, agent config updated
6. Changes tested and deployed
7. Results monitored

**Expected Outcome**: Agents produce better outputs, less editing needed

---

## Workflow Variations

### Quick Path (For Simple Content)

```
Brief → Drafter → Polisher → Copy Editor → Publish
```

Skip outline, research, refinement, and QA for:
- Short blog posts
- Simple updates
- Straightforward content

### Research-Heavy Path

```
Brief → Outline → Research → Research Review (Human) → Draft → ...
```

Add human research review for:
- Technical deep dives
- Controversial topics
- High-stakes content

### High-Quality Path (Default)

```
Brief → Outline → Research → Draft → Refine → Polish → QA → Copy Edit → Publish
```

Use full pipeline for:
- Important content
- Long-form articles
- Brand-critical pieces

---

## Parallel Processing Opportunities

Some phases can run in parallel:

**Outline + Initial Research**:
```
Brief → [Outline Writer + Researcher] → Draft
```

**Polish + QA Prep**:
```
Refined → [Polisher | QA Checker prep] → QA → Copy Edit
```

---

## Quality Gates

### Gate 1: After Outline
**Check**: Does outline address all brief requirements?
**Action if No**: Revise outline

### Gate 2: After Draft
**Check**: Does draft follow outline and incorporate research?
**Action if No**: Redraft

### Gate 3: After QA
**Check**: Does content meet all quality standards?
**Action if No**: Return to appropriate phase

### Gate 4: Before Publication
**Check**: Final human approval
**Action if No**: Additional refinement

---

## Time Estimates

**Full Pipeline**:
- Automated: 60-90 minutes
- Human review: 15-30 minutes
- **Total**: 75-120 minutes

**Quick Path**:
- Automated: 30-45 minutes
- Human review: 10-15 minutes
- **Total**: 40-60 minutes

**Learning Analysis**:
- Per edit: 5-10 minutes
- Recommendation generation: As patterns emerge
- Implementation: 15-30 minutes per change

---

## Success Metrics

Track these metrics:

### Production Metrics
- Time from brief to publication
- Number of phases required
- Pass rate at QA gate
- Human editing time required

### Quality Metrics
- Content quality scores
- Error rates by phase
- Reader engagement
- SEO performance

### Learning Metrics
- Edit patterns detected
- Recommendations generated
- Implementation rate
- Improvement impact

---

## Workflow Automation

### GitHub Actions Workflows

**1. Main Content Pipeline** (`multi-agent-content-workflow.yml`)
- Triggers: New brief added
- Runs: Phases 1-7 automatically
- Output: Content ready for human final review

**2. Learning Analysis** (`learning-analysis.yml`)
- Triggers: Edit submitted or manual
- Runs: Learning Agent analysis
- Output: Analysis and recommendations

**3. Agent Update** (`agent-improvement.yml`)
- Triggers: Recommendation approved
- Runs: Config update and testing
- Output: Updated agent configuration

---

## Best Practices

### For Content Creators
- Write detailed briefs
- Provide clear requirements
- Review agent outputs
- Submit edits for learning

### For Editors
- Make thoughtful edits
- Document why you made changes
- Submit edit context
- Review recommendations

### For Administrators
- Monitor workflow performance
- Review recommendations regularly
- Test agent changes thoroughly
- Track improvement metrics

---

## Troubleshooting

### Phase Fails
**Problem**: Agent output doesn't meet quality bar
**Solution**: 
1. Check brief completeness
2. Review agent configuration
3. Check for recent changes
4. Submit to learning system

### Learning Not Improving Agents
**Problem**: Same edits keep happening
**Solution**:
1. Check pattern database
2. Verify recommendations were implemented
3. Check for conflicting guidance
4. May need manual agent adjustment

### Quality Regression
**Problem**: Recent agent changes made things worse
**Solution**:
1. Revert agent changes
2. Review recommendation evidence
3. Test more thoroughly
4. Implement more gradually

---

## Future Enhancements

Potential additions:
- Image generation agent
- SEO optimization agent
- Social media agent
- Fact-checking agent
- Localization agent
- A/B testing integration

---

**This pipeline transforms briefs into high-quality published content while continuously improving based on human feedback.**
