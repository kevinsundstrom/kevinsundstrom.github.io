# Human Edits Folder

This folder contains human-edited versions of agent outputs, used by the Learning Agent to improve the system over time.

## Purpose

When agents produce content that gets edited by humans, we store both versions here to enable learning and continuous improvement. The Learning Agent analyzes these edits to identify consistent patterns and recommend agent configuration improvements.

## How to Submit Edited Content

### Step 1: Save the Original Output

When you receive agent output that needs editing:

```bash
# Copy the original agent output to this folder
cp content-workflow/outputs/my-article-draft-20260213.md \
   content-workflow/edits/my-article-draft-original-20260213.md
```

### Step 2: Create Your Edited Version

Edit the content as needed, then save:

```bash
# Save your edited version
# Use the same filename with '-edited' suffix
content-workflow/edits/my-article-draft-edited-20260213.md
```

### Step 3: Provide Edit Context (Optional but Helpful)

Create a context file explaining your edits:

```bash
# Create context file
content-workflow/edits/my-article-draft-context-20260213.md
```

**Context File Template:**

```markdown
# Edit Context for [Article Title]

**Editor**: [Your name]
**Date**: [Edit date]
**Agent**: [Which agent produced this]
**Brief**: [Link to original brief]

## Why These Edits Were Made

### Overall Assessment
[General thoughts on the agent output]

### Major Changes
1. **[Type of change]**: [Why you made it]
2. **[Type of change]**: [Why you made it]

### Patterns Noticed
- [Consistent issue you saw]
- [Another consistent issue]

### Suggestions for Agent Improvement
- [Specific suggestion]
- [Specific suggestion]

## Quality Assessment

**What Worked Well**:
- [Positive aspects]

**What Needed Improvement**:
- [Areas needing work]
```

### Step 4: Trigger Learning Analysis (Optional)

```bash
# Run learning agent manually
# Or wait for scheduled analysis

# Manual trigger example:
gh workflow run learning-analysis.yml \
  -f original_file=my-article-draft-original-20260213.md \
  -f edited_file=my-article-draft-edited-20260213.md \
  -f agent=drafter
```

## File Naming Convention

Use consistent naming:

```
{slug}-{output-type}-original-{date}.md     # Original agent output
{slug}-{output-type}-edited-{date}.md       # Your edited version
{slug}-{output-type}-context-{date}.md      # Optional context
```

Examples:
- `ai-marketing-draft-original-20260213.md`
- `ai-marketing-draft-edited-20260213.md`
- `ai-marketing-draft-context-20260213.md`

## What Gets Analyzed

The Learning Agent compares:
- Original agent output
- Your edited version
- Edit context (if provided)
- Agent configuration that produced the output

It looks for:
- Consistent patterns across multiple edits
- Teachable improvements
- Systematic agent weaknesses
- Opportunities to refine agents

## Learning Thresholds

Changes need to be **consistent** to trigger agent updates:
- Same type of edit in 3+ pieces of content, OR
- Same edit by 2+ different editors, OR
- Pattern matches known best practices

Single edits are tracked but don't automatically update agents.

## Privacy and Sensitivity

- Don't include confidential information in edits
- Content here may be used for training and improvement
- Edit context helps but isn't required
- Your feedback improves the system for everyone

## Workflow Integration

Edits can be submitted:
1. **Manually**: As described above
2. **Via PR**: Include edits when submitting content
3. **Via Issue**: Reference edits in improvement issues
4. **Automated**: Future workflow may auto-capture edits

## Example Edit Submission

```bash
# Complete workflow for submitting edits

# 1. Copy original
cp content-workflow/outputs/article-draft-20260213.md \
   content-workflow/edits/article-draft-original-20260213.md

# 2. Edit the content
# (Make your improvements)

# 3. Save edited version
# As: content-workflow/edits/article-draft-edited-20260213.md

# 4. Create context file (optional)
cat > content-workflow/edits/article-draft-context-20260213.md << 'EOF'
# Edit Context

**Editor**: Jane Smith
**Agent**: Drafter

## Major Changes
- Simplified complex sentences (5 instances)
- Added concrete examples (3 sections)
- Strengthened conclusion

## Pattern
Drafter consistently produces sentences over 30 words that need breaking up.

## Suggestion
Add instruction: "Keep sentences under 25 words for clarity"
EOF

# 5. Commit and push
git add content-workflow/edits/
git commit -m "Add edited version of article draft for learning"
git push
```

## Questions?

- How often should I submit edits? **Every time you edit agent output**
- Do minor edits matter? **Yes! Even small consistent patterns matter**
- What if I disagree with agent output? **Perfect! That's when we learn most**
- How long until changes take effect? **After 3-5 consistent patterns detected**

---

**Your edits make the system smarter. Thank you for contributing to continuous improvement!**
