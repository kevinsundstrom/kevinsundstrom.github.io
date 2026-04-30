# Editor Guide: Providing Feedback in the Automated Pipeline

This guide explains the **easiest ways** to review and edit content as it moves through the automated pipeline.

## 🎯 Quick Overview

The pipeline automatically:
1. Runs each agent phase
2. Commits output to a branch
3. **Waits for your review**
4. Continues when you approve

## ✅ Three Ways to Review & Edit (Choose Your Preferred Method)

### Method 1: GitHub Web UI (Easiest - No Setup)

**Best for**: Quick edits, reviews, minor changes

1. **Navigate to the PR**
   - Go to repository → Pull Requests
   - Find the "Content Pipeline: [your-article]" PR

2. **Review the Output**
   - Click "Files changed" tab
   - Review the generated content

3. **Edit if Needed**
   - Click the file you want to edit
   - Click the pencil icon (Edit file)
   - Make your changes directly in browser
   - Click "Commit changes"
   - Choose "Commit directly to the [branch-name] branch"

4. **Approve to Continue**
   - Go to "Conversation" tab
   - Comment: `/approve-phase-N` (e.g., `/approve-phase-1`)
   - Next phase runs automatically

**Pros**: No local setup, visual interface, easy
**Cons**: Limited for complex edits

---

### Method 2: Local Text Editor (Most Powerful)

**Best for**: Substantial edits, complex changes, your preferred editor

1. **Clone/Pull the Branch**
   ```bash
   # If first time
   git fetch origin
   git checkout content-pipeline/your-article-20260213
   
   # Or if already have it
   git pull origin content-pipeline/your-article-20260213
   ```

2. **Edit in Your Favorite Editor**
   ```bash
   # Use VS Code, Sublime, Vim, whatever you prefer
   code content-workflow/outputs/your-article-draft-20260213.md
   
   # Make your changes and save
   ```

3. **Commit and Push**
   ```bash
   git add content-workflow/outputs/
   git commit -m "Editor review: improved clarity in draft"
   git push origin content-pipeline/your-article-20260213
   ```

4. **Approve to Continue**
   - Go to the PR on GitHub
   - Comment: `/approve-phase-N`

**Pros**: Use your preferred editor, powerful tools, version control
**Cons**: Requires git/command line knowledge

---

### Method 3: GitHub Desktop (Visual + Local)

**Best for**: Visual git interface with local editing power

1. **Open in GitHub Desktop**
   - Go to the PR on GitHub
   - Click "Open in GitHub Desktop"
   - Or manually switch to the pipeline branch

2. **Edit Files**
   - In GitHub Desktop, right-click file → "Open in [your editor]"
   - Edit and save

3. **Commit Changes**
   - GitHub Desktop shows your changes
   - Write commit message
   - Click "Commit to [branch]"
   - Click "Push origin"

4. **Approve in Browser**
   - Go to PR
   - Comment: `/approve-phase-N`

**Pros**: Visual interface + local editing
**Cons**: Requires GitHub Desktop installation

---

## 🎓 Your Edits Power the Learning System

**Good news**: Any method you choose automatically captures your edits for learning!

When you edit a file:
1. Original output is saved to `edits/` folder
2. Your edited version is saved
3. Learning agent compares them
4. After 3-5 similar edits, agent configs improve automatically

**You don't need to do anything special** - just edit naturally!

---

## 📋 Review Commands

Use these commands in PR comments to control the pipeline:

| Command | Action |
|---------|--------|
| `/approve-phase-1` | Approve outline, start research |
| `/approve-phase-2` | Approve research, start drafting |
| `/approve-phase-3` | Approve draft, start refinement |
| `/approve-phase-4` | Approve refinement, start polishing |
| `/approve-phase-5` | Approve polish, start QA |
| `/approve-phase-6` | Approve QA, start copy editing |
| `/approve-phase-7` | Approve copy edit, ready to publish |
| `/regenerate-phase-N` | Re-run a specific phase |
| `/skip-to-phase-N` | Jump to a specific phase |
| `/pause` | Pause the pipeline |
| `/resume` | Resume the pipeline |

---

## 🔄 Typical Workflow

Here's what a typical review cycle looks like:

```
1. Pipeline creates PR
   ↓
2. Phase 1 (Outline) runs → commits to PR
   ↓
3. You receive notification
   ↓
4. You review outline in GitHub or locally
   ↓
5. You make edits if needed (any method above)
   ↓
6. You comment: /approve-phase-1
   ↓
7. Phase 2 (Research) runs automatically
   ↓
8. Repeat for each phase...
```

---

## 💡 Pro Tips

### For Quick Reviews
- Use GitHub web UI
- Just click through and approve if good
- Takes 30 seconds per phase

### For Substantial Edits
- Use local editor (Method 2)
- Edit multiple files at once
- Use your IDE features (find/replace, etc.)

### For Learning
- Add context when you edit:
  - Commit message: "Simplified complex sentences"
  - This helps learning agent understand patterns

### For Collaboration
- Multiple people can review same PR
- Each person's edits are captured for learning
- Discuss changes in PR comments

---

## 🚨 Troubleshooting

**Q: Pipeline not continuing after approval?**
- Make sure you used exact command: `/approve-phase-N`
- Check GitHub Actions tab for workflow status

**Q: Want to skip a phase?**
- Comment: `/skip-to-phase-N`
- Pipeline jumps to that phase

**Q: Made a mistake in edit?**
- Just edit again! All versions are tracked
- Or use git to revert: `git revert HEAD`

**Q: Want to restart from beginning?**
- Close the PR
- Delete the branch
- Re-add the brief file to trigger new pipeline

---

## 🎬 Quick Start

**Your first pipeline review:**

1. **You'll get a notification** about a new PR
2. **Click the PR link**
3. **Click "Files changed"** to see what was generated
4. **If it looks good**: Comment `/approve-phase-1`
5. **If needs edits**: Click pencil icon, edit, save, then approve
6. **Repeat** for each phase

That's it! The system handles the rest.

---

## 📝 Example: Editing a Draft

Let's say Phase 3 (Draft) just completed and you want to edit it:

**In Browser**:
```
1. Go to PR → Files changed
2. Find: content-workflow/outputs/article-draft-20260213.md
3. Click file name → Click pencil icon
4. Edit the draft
5. Commit changes
6. Go back to Conversation tab
7. Comment: /approve-phase-3
```

**In Local Editor**:
```bash
# Get the branch
git checkout content-pipeline/article-20260213

# Edit in your editor
vim content-workflow/outputs/article-draft-20260213.md

# Commit and push
git add content-workflow/outputs/
git commit -m "Improved draft clarity and examples"
git push

# Approve in browser
# Go to PR and comment: /approve-phase-3
```

---

## ✨ Best Practices

1. **Review promptly** - Pipeline waits for you, so timely reviews keep things moving
2. **Be specific** - When requesting changes, explain what needs fixing
3. **Use commit messages** - Helps learning system understand your edits
4. **Trust the process** - Early phases may not be perfect; later phases refine
5. **Edit freely** - All edits help improve the system

---

**The goal**: Make reviewing and editing as easy as possible while capturing valuable feedback for continuous improvement!
