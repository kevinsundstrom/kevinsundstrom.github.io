# Multi-Agent Content Workflow - Complete Setup Guide

Welcome! This guide provides everything you need to understand, implement, and share a multi-agent content workflow system.

## 📚 What You'll Find Here

This repository now contains a complete multi-agent content workflow system with:

1. **Organized Folder Structure** - Logical organization for context, briefs, and outputs
2. **Agent Configurations** - Two example agents (Writer and Editor) with full specifications
3. **Context Documents** - Style guide and brand guidelines for agent reference
4. **GitHub Actions Workflow** - Automated pipeline that triggers agents
5. **Comprehensive Documentation** - Everything your team needs to collaborate
6. **Working Examples** - Real templates and example briefs to get started

## 🗂️ Repository Structure

```
kevinsundstrom.github.io/
├── .github/
│   └── workflows/
│       └── multi-agent-content-workflow.yml    # Automated workflow
├── content-workflow/
│   ├── context/                                # Reference materials
│   │   ├── style-guide.md                      # Writing standards
│   │   └── brand-guidelines.md                 # Brand voice & tone
│   ├── briefs/                                 # Content briefs (INPUT)
│   │   ├── TEMPLATE-content-brief.md           # Template to copy
│   │   └── EXAMPLE-ai-agents-marketing-workflow.md  # Example brief
│   ├── outputs/                                # Generated content (OUTPUT)
│   │   └── README.md                           # Output management guide
│   ├── content-writer.agent.md                 # Writer agent config
│   ├── content-editor.agent.md                 # Editor agent config
│   ├── README.md                               # Main workflow documentation
│   └── COLLABORATION.md                        # Team collaboration guide
└── [rest of repository...]
```

## 🚀 Quick Start

### For Team Members

1. **Get Access** - Request repository access from admin
2. **Read Documentation** - Start with `content-workflow/README.md`
3. **Review Guidelines** - Read the style guide and brand guidelines
4. **Create a Brief** - Copy the template and fill it out
5. **Submit** - Commit and push to trigger the workflow
6. **Review Output** - Check the outputs folder for generated content

### For Administrators

1. **Add Collaborators** - Invite team members via Settings → Collaborators
2. **Set Permissions** - Configure appropriate access levels
3. **Enable Actions** - Ensure GitHub Actions has write permissions
4. **Configure Notifications** - Set up alerts for workflow runs
5. **Customize Agents** - Adjust agent configs to match your needs

## 📖 Documentation Map

### Start Here
- **`content-workflow/README.md`** - Complete workflow documentation
  - How it works
  - Usage instructions
  - Customization options
  - Monitoring and maintenance

### For Team Collaboration
- **`content-workflow/COLLABORATION.md`** - Team collaboration guide
  - Roles and responsibilities
  - Collaboration workflows
  - Communication best practices
  - Training resources

### For Content Creation
- **`content-workflow/context/style-guide.md`** - Writing standards
  - Voice and tone
  - Formatting standards
  - SEO guidelines
  - Common mistakes to avoid

- **`content-workflow/context/brand-guidelines.md`** - Brand voice
  - Brand values and personality
  - Content themes
  - Key messages
  - Content quality standards

### Templates and Examples
- **`content-workflow/briefs/TEMPLATE-content-brief.md`** - Brief template
  - Complete structure for creating briefs
  - All required fields explained
  - Instructions for agents

- **`content-workflow/briefs/EXAMPLE-ai-agents-marketing-workflow.md`** - Example brief
  - Real, filled-out example
  - Shows best practices
  - Demonstrates comprehensive brief

## 🔧 Technical Components

### 1. Agent Configurations

#### Content Writer Agent (`content-writer.agent.md`)
- **Purpose**: Generate initial content drafts
- **Inputs**: Brief, style guide, brand guidelines
- **Outputs**: Draft markdown, metadata YAML
- **Capabilities**: Structure content, follow guidelines, create SEO metadata

#### Content Editor Agent (`content-editor.agent.md`)
- **Purpose**: Review and refine drafts
- **Inputs**: Draft, brief, style guide, brand guidelines
- **Outputs**: Final content, review notes
- **Capabilities**: Quality checks, style compliance, optimization

### 2. GitHub Actions Workflow

**File**: `.github/workflows/multi-agent-content-workflow.yml`

**Triggers:**
- Push to `content-workflow/briefs/*.md` (excluding template)
- Manual dispatch with brief filename

**Jobs:**
1. **generate-draft** - Content Writer agent creates initial draft
2. **review-draft** - Content Editor agent reviews and polishes
3. **notify** - Updates related issues with results

**Permissions Required:**
- `contents: write` - To commit generated content
- `pull-requests: write` - To create/update PRs
- `issues: write` - To comment on issues

### 3. Context Files

**Style Guide** (`context/style-guide.md`)
- Voice and tone definitions
- Writing principles
- Formatting standards
- SEO guidelines
- Examples of good/poor writing

**Brand Guidelines** (`context/brand-guidelines.md`)
- Brand values and personality
- Content themes and topics
- Audience definitions
- Key messages
- Quality standards

## 🤝 Making Your Repository Collaborative

### Step 1: Add Team Members

```bash
# Via GitHub Web UI
Settings → Collaborators and teams → Add people

# Or via GitHub CLI
gh api repos/:owner/:repo/collaborators/:username -X PUT
```

### Step 2: Configure Permissions

**Recommended Permissions:**
- **Content Creators**: Write access
- **Editors**: Maintain access  
- **Administrators**: Admin access

### Step 3: Set Up Branch Protection (Optional)

For main branch:
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date

### Step 4: Enable GitHub Actions

```
Settings → Actions → General
- Workflow permissions: Read and write
- Allow GitHub Actions to create pull requests: Yes
```

### Step 5: Create Teams (Optional for Organizations)

- Content Team (Write)
- Editorial Team (Maintain)
- Admin Team (Admin)

## 📋 Collaboration Workflows

### Workflow A: Direct to Main (Simple)
Best for small, trusted teams
```
Create brief → Push to main → Auto-process → Review → Publish
```

### Workflow B: Pull Request (Controlled)
Best for larger teams
```
Create brief → Create PR → Team review → Merge → Auto-process → Publish
```

### Workflow C: Issue Planning (Strategic)
Best for complex projects
```
Discuss in issue → Approve → Create brief → Process → Review → Publish
```

## 💡 Usage Examples

### Example 1: Creating Your First Brief

```bash
# Copy template
cp content-workflow/briefs/TEMPLATE-content-brief.md \
   content-workflow/briefs/ai-in-marketing.md

# Edit the file (fill in all sections)
# Then commit and push

git add content-workflow/briefs/ai-in-marketing.md
git commit -m "Add brief: AI in Marketing"
git push
```

### Example 2: Manual Workflow Trigger

```bash
# Via GitHub CLI
gh workflow run multi-agent-content-workflow.yml \
  -f brief_file=ai-in-marketing.md \
  -f skip_review=false
```

### Example 3: Monitoring Workflow

```bash
# List recent workflow runs
gh run list --workflow=multi-agent-content-workflow.yml

# View specific run details
gh run view <run-id>

# Watch run in real-time
gh run watch <run-id>
```

## 🎯 Best Practices

### For Content Briefs
1. **Be Specific** - Detailed briefs produce better content
2. **Include Examples** - Show what you want, not just describe it
3. **Define Audience** - Clear audience = appropriate tone and depth
4. **Set Expectations** - Specify length, format, and key points
5. **Review Template** - Don't skip any required sections

### For Team Collaboration
1. **Communicate Early** - Discuss ideas before creating briefs
2. **Use Issues** - Track content planning and questions
3. **Review Promptly** - Set and follow SLAs for reviews
4. **Give Feedback** - Be constructive and specific
5. **Share Learnings** - Document what works and what doesn't

### For Workflow Management
1. **Monitor Actions** - Check workflow runs regularly
2. **Keep Context Updated** - Refine style guide and brand guidelines
3. **Archive Outputs** - Don't let outputs folder get cluttered
4. **Iterate on Agents** - Improve agent configurations based on results
5. **Document Changes** - Note modifications to workflow or configs

## 🔍 Troubleshooting

### Workflow Doesn't Trigger
- **Check**: File is in `content-workflow/briefs/` directory
- **Check**: Filename doesn't match template name
- **Check**: Valid markdown file with `.md` extension
- **Check**: Push was to tracked branch
- **Solution**: Review GitHub Actions logs

### Generated Content Missing
- **Check**: Workflow completed successfully
- **Check**: Look in `content-workflow/outputs/` folder
- **Check**: Agent configuration is valid
- **Solution**: Check job logs for errors

### Permission Errors
- **Check**: GitHub Actions has write permissions
- **Check**: User has appropriate repository access
- **Solution**: Update Settings → Actions → Permissions

## 🔄 Customization Options

### Adding New Agents

Create new agent config file:
```yaml
# content-workflow/seo-optimizer.agent.md
---
name: SEO Optimizer
description: Optimizes content for search engines
inputs:
  - name: content_draft
    location: content-workflow/outputs/
outputs:
  - name: optimized_content
    location: content-workflow/outputs/
```

Update workflow to include new agent job.

### Modifying Context Files

Edit style guide or brand guidelines to:
- Adjust tone and voice
- Add new formatting rules
- Include industry-specific guidance
- Update SEO requirements

### Extending the Workflow

Add new jobs to `.github/workflows/multi-agent-content-workflow.yml`:
- SEO optimization step
- Fact-checking step
- Social media generation
- Asset management
- Publishing automation

## 📊 Success Metrics

### Track These Metrics
- **Brief to Draft Time** - How long until first draft?
- **Draft Quality** - How often does it need major revision?
- **Review Cycle Time** - How long for editorial review?
- **Publication Rate** - How many briefs become published articles?
- **Team Satisfaction** - Are team members happy with the process?

### Improvement Areas
- Agent prompt tuning
- Context file refinement
- Workflow optimization
- Team training
- Process documentation

## 🎓 Learning Resources

### Internal Documentation
- Main README: `content-workflow/README.md`
- Collaboration Guide: `content-workflow/COLLABORATION.md`
- Style Guide: `content-workflow/context/style-guide.md`
- Brand Guidelines: `content-workflow/context/brand-guidelines.md`

### External Resources
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Copilot Custom Agents](https://gh.io/customagents)
- [Markdown Guide](https://www.markdownguide.org/)
- [Content Strategy Resources](https://kevinsundstrom.com/articles/)

## 📞 Support and Questions

### Getting Help
1. **Check Documentation** - Start with the relevant README
2. **Search Issues** - See if someone else had the same question
3. **Create Issue** - Ask the team for help
4. **Tag Admin** - For urgent or access-related issues

### Contributing Improvements
1. Identify an improvement
2. Create an issue to discuss
3. Make changes in a branch
4. Submit pull request
5. Collaborate on review

## ✅ Next Steps

### Immediate Actions
- [ ] Read `content-workflow/README.md`
- [ ] Review `content-workflow/COLLABORATION.md`
- [ ] Study the example brief
- [ ] Add team members to repository
- [ ] Configure GitHub Actions permissions

### First Week
- [ ] Create your first test brief
- [ ] Run the workflow
- [ ] Review generated output
- [ ] Gather team feedback
- [ ] Make initial customizations

### First Month
- [ ] Process 3-5 real briefs
- [ ] Refine agent configurations
- [ ] Update context files based on learnings
- [ ] Establish team workflows
- [ ] Document best practices

## 🎉 You're Ready!

You now have a complete, shareable multi-agent content workflow system with:

✅ Organized folder structure  
✅ Example agent configurations  
✅ Automated GitHub Actions workflow  
✅ Comprehensive documentation  
✅ Collaboration guidelines  
✅ Templates and examples  

**Start creating content with AI agents today!**

---

## 📝 Version Information

**Version**: 1.0.0  
**Created**: 2026-02-13  
**Last Updated**: 2026-02-13  
**Maintainer**: Repository admin team

## 📄 License

This workflow structure and documentation is part of the kevinsundstrom.github.io repository. Use and modify as needed for your team's content workflows.

---

_Questions? Open an issue or reach out to the team!_
