# Team Collaboration Guide

This guide helps team members work together effectively on content using the multi-agent workflow.

## 🎯 Quick Start for Team Members

### Getting Access

1. **Request Repository Access**
   - Contact the repository admin
   - Provide your GitHub username
   - Specify your role (writer, editor, reviewer)

2. **Accept Invitation**
   - Check your email for GitHub invitation
   - Click the invitation link
   - Accept to join the repository

3. **Clone Repository**
   ```bash
   git clone https://github.com/kevinsundstrom/kevinsundstrom.github.io.git
   cd kevinsundstrom.github.io
   ```

### Your First Content Brief

1. **Copy the Template**
   ```bash
   cp content-workflow/briefs/TEMPLATE-content-brief.md \
      content-workflow/briefs/my-first-article.md
   ```

2. **Fill Out the Brief**
   - Open `my-first-article.md` in your editor
   - Complete all required sections
   - Be specific about goals and audience
   - Include examples and references

3. **Submit Your Brief**
   ```bash
   git add content-workflow/briefs/my-first-article.md
   git commit -m "Add brief: My First Article"
   git push
   ```

4. **Watch It Process**
   - Go to the repository on GitHub
   - Click the "Actions" tab
   - Watch your workflow run
   - Check outputs folder for results

## 👥 Team Roles and Responsibilities

### Content Creators
**Can:**
- Create and submit content briefs
- Review generated drafts
- Suggest improvements to style guide
- Request editorial reviews

**Should:**
- Follow the brief template completely
- Provide clear, detailed requirements
- Review outputs promptly
- Communicate blockers or issues

### Editors
**Can:**
- Review all generated content
- Approve/reject drafts
- Update style guide and brand guidelines
- Make final edits before publication

**Should:**
- Review drafts within 24-48 hours
- Provide constructive feedback
- Ensure quality standards are met
- Communicate changes clearly

### Administrators
**Can:**
- Manage team access
- Configure workflows
- Update agent configurations
- Resolve technical issues

**Should:**
- Monitor workflow health
- Keep documentation updated
- Support team members
- Maintain quality standards

## 🔄 Collaboration Workflows

### Workflow 1: Simple Direct Push (Recommended for Small Teams)

```
1. Create brief → 2. Push to main → 3. Agents process → 4. Review output → 5. Publish
```

**Best for:**
- Small, trusted teams
- Quick turnaround needs
- Less formal process

**Steps:**
1. Create your brief in `content-workflow/briefs/`
2. Push directly to main branch
3. Workflow runs automatically
4. Review generated content
5. Publish when ready

### Workflow 2: Pull Request Review (Recommended for Large Teams)

```
1. Create brief → 2. Create PR → 3. Team reviews → 4. Merge PR → 5. Agents process → 6. Publish
```

**Best for:**
- Larger teams
- Multiple stakeholders
- More oversight needed

**Steps:**
1. Create a feature branch: `git checkout -b content/my-article`
2. Add your brief to the branch
3. Push and create a Pull Request
4. Team reviews and approves the brief
5. Merge PR to trigger workflow
6. Review generated content

### Workflow 3: Issue-Based Planning (Recommended for Complex Projects)

```
1. Discuss in issue → 2. Approve idea → 3. Create brief → 4. Process → 5. Review → 6. Publish
```

**Best for:**
- Content planning
- Multiple rounds of feedback
- Strategic alignment needed

**Steps:**
1. Create GitHub issue to discuss content idea
2. Use issue comments for discussion
3. Once approved, create the brief
4. Reference issue in brief and commit
5. Workflow processes the brief
6. Close issue when published

## 💬 Communication Best Practices

### Using GitHub Issues

**For:**
- Content ideas and suggestions
- Questions about the workflow
- Reporting problems
- Requesting new features

**Labels to use:**
- `content-brief`: For content requests
- `workflow-issue`: For technical problems
- `style-guide`: For writing standard questions
- `help-wanted`: When you need assistance

**Example issue:**
```markdown
Title: Content Idea: AI Safety in Marketing

Hi team! I'd like to write about AI safety considerations for marketing teams. 

**Target Audience:** Marketing managers
**Key Points:** Risk assessment, ethical guidelines, vendor evaluation
**Length:** ~1500 words

Thoughts? Should I proceed with a brief?
```

### Using Pull Request Comments

**For:**
- Reviewing specific briefs
- Suggesting changes to context files
- Discussing workflow modifications

**Example PR comment:**
```markdown
The brief looks good overall! A few suggestions:

1. Can we add more specifics about the target audience's pain points?
2. The SEO keywords seem a bit generic - maybe focus on long-tail keywords?
3. Love the examples section - very helpful!

Approve once these are addressed.
```

### Using Discussions (if enabled)

**For:**
- Broader strategy conversations
- Style guide debates
- Process improvements
- Sharing learnings

## 🗓️ Content Calendar Workflow

### Using GitHub Projects

1. **Create Project Board**
   - Go to repository Projects
   - Create "Content Calendar"
   - Add columns: Ideas, In Brief, Processing, Review, Published

2. **Add Content Items**
   - Create issues for each content piece
   - Assign to project board
   - Move through stages as they progress

3. **Track Status**
   - Monitor what's in progress
   - See publication pipeline
   - Identify bottlenecks

### Example Project Structure

```
Ideas           In Brief        Processing      Review         Published
---------       ----------      ----------      ---------      -----------
[ Article 1 ]   [ Article 2 ]   [ Article 3 ]   [ Article 4 ]  [ Article 5 ]
[ Article 6 ]                   [ Article 7 ]                  [ Article 8 ]
[ Article 9 ]                                                  [ Article 10]
```

## ⚠️ Common Pitfalls and Solutions

### Issue: Conflicting Edits

**Problem:** Multiple people editing the same files
**Solution:** 
- Coordinate in issues before starting
- Use feature branches for parallel work
- Communicate in team chat

### Issue: Incomplete Briefs

**Problem:** Briefs missing required information
**Solution:**
- Use the template checklist
- Get peer review before submitting
- Reference examples from successful briefs

### Issue: Workflow Failures

**Problem:** GitHub Actions workflow fails
**Solution:**
- Check the Actions tab for error details
- Verify file paths and names are correct
- Ensure required files exist
- Ask admin for help if needed

### Issue: Slow Review Process

**Problem:** Drafts sitting in outputs too long
**Solution:**
- Set team SLAs (e.g., 48-hour review)
- Use GitHub notifications
- Tag reviewers in issues
- Schedule regular review sessions

## 📋 Team Guidelines

### Response Time Expectations

- **Content briefs**: Review within 1 business day
- **Generated drafts**: Editorial review within 2 business days
- **Questions/issues**: Acknowledge within 24 hours
- **Urgent requests**: Tag with `urgent` label

### Quality Standards

**Every brief must:**
- Follow the template structure
- Include all required sections
- Have clear, measurable goals
- Specify target audience
- Define success criteria

**Every draft must:**
- Meet style guide requirements
- Follow brand guidelines
- Provide actionable value
- Be factually accurate
- Include proper citations

### Feedback Guidelines

**When giving feedback:**
- Be specific about what needs improvement
- Explain why changes are needed
- Suggest solutions, not just problems
- Be respectful and constructive
- Focus on content, not the person

**When receiving feedback:**
- Ask clarifying questions
- Don't take it personally
- Consider all suggestions
- Implement agreed-upon changes
- Thank reviewers for their time

## 🎓 Training Resources

### For New Team Members

**Week 1: Learn the Basics**
- [ ] Read this collaboration guide
- [ ] Review style guide and brand guidelines
- [ ] Study the brief template
- [ ] Watch a workflow run (Actions tab)

**Week 2: Practice**
- [ ] Create a test brief
- [ ] Review generated output
- [ ] Provide feedback on a team member's brief
- [ ] Ask questions in issues

**Week 3: Contribute**
- [ ] Submit your first real brief
- [ ] Review another team member's work
- [ ] Suggest an improvement to documentation
- [ ] Help onboard someone else

### Helpful Resources

- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)
- [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet/)
- [Writing Effective Content Briefs](https://kevinsundstrom.com/articles/)
- Repository Style Guide: `content-workflow/context/style-guide.md`

## 🔐 Access and Security

### Permissions Overview

| Role | Access Level | Can Do |
|------|-------------|---------|
| Read | View only | Clone, view files |
| Write | Create content | Create briefs, commit |
| Maintain | Manage workflows | Configure actions, manage branches |
| Admin | Full control | All of the above + settings |

### Security Best Practices

1. **Never commit secrets**: No API keys, tokens, or passwords
2. **Use branches**: Don't force push to main
3. **Review before merge**: Have someone check your work
4. **Keep credentials private**: Don't share personal access tokens
5. **Report issues**: If you see something concerning, speak up

### Managing Your Access

**GitHub Personal Access Token:**
- Create one in GitHub Settings → Developer settings
- Use it for command-line operations
- Keep it secure - treat it like a password
- Regenerate if compromised

**SSH Keys (Alternative):**
- Generate with `ssh-keygen`
- Add public key to GitHub account
- More secure than HTTPS for frequent pushes

## 📞 Getting Help

### When You're Stuck

1. **Check Documentation First**
   - This guide
   - Workflow README
   - Style guide

2. **Search Existing Issues**
   - Maybe someone had the same problem
   - Solutions might already exist

3. **Ask the Team**
   - Create a new issue
   - Tag relevant team members
   - Provide context and details

4. **Contact Admin**
   - For access or permission issues
   - Technical problems you can't solve
   - Urgent workflow failures

### Support Channels

- **GitHub Issues**: Technical problems, content questions
- **Pull Request Comments**: Brief-specific discussions
- **Team Chat**: Quick questions, coordination
- **Email**: Sensitive or private matters

---

**Welcome to the team!** We're excited to collaborate with you on creating great content.

_Questions about this guide? Open an issue or suggest improvements via PR._
