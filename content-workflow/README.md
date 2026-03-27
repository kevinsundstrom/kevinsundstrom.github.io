# Multi-Agent Content Workflow

This directory contains a complete multi-agent content workflow system that automates content creation using AI agents, style guides, and GitHub Actions.

## 📁 Structure

```
content-workflow/
├── context/                          # Reference materials for agents
│   ├── style-guide.md               # Writing style and formatting standards
│   └── brand-guidelines.md          # Brand voice, tone, and messaging
├── briefs/                          # Content briefs (input)
│   └── TEMPLATE-content-brief.md    # Template for creating new briefs
├── outputs/                         # Generated content (output)
│   ├── {slug}-draft-{date}.md      # Initial drafts from writer agent
│   ├── {slug}-metadata-{date}.yml  # SEO and metadata
│   ├── {slug}-final-{date}.md      # Reviewed final content
│   └── {slug}-review-notes-{date}.md # Editorial review notes
├── content-writer.agent.md          # Writer agent configuration
├── content-editor.agent.md          # Editor agent configuration
└── README.md                        # This file
```

## 🚀 How It Works

### Workflow Overview

1. **Create a Brief**: Author creates a content brief using the template
2. **Automatic Trigger**: GitHub Actions detects the new brief
3. **Writer Agent**: Generates initial content draft following guidelines
4. **Editor Agent**: Reviews and refines the content
5. **Output**: Polished content ready for publication

### Agent Roles

#### Content Writer Agent
- **Purpose**: Generate initial content drafts from briefs
- **Inputs**: Brief, style guide, brand guidelines
- **Outputs**: Draft markdown, metadata YAML
- **Focus**: Structure, substance, adherence to guidelines

#### Content Editor Agent
- **Purpose**: Review and refine content for quality
- **Inputs**: Draft, brief, style guide, brand guidelines
- **Outputs**: Final content, review notes
- **Focus**: Quality, consistency, polish, optimization

## 📝 Usage Instructions

### For Content Creators

#### Step 1: Create a Content Brief

1. Copy the template: `content-workflow/briefs/TEMPLATE-content-brief.md`
2. Rename it: `my-article-topic.md`
3. Fill in all sections:
   - Content goals and audience
   - Key messages and scope
   - Required sections
   - SEO requirements
   - Metadata

#### Step 2: Submit the Brief

1. Add the brief file to `content-workflow/briefs/`
2. Commit and push to the repository:
   ```bash
   git add content-workflow/briefs/my-article-topic.md
   git commit -m "Add content brief: My Article Topic"
   git push
   ```

#### Step 3: Automatic Processing

The GitHub Actions workflow will automatically:
1. Detect your new brief
2. Invoke the Content Writer agent
3. Generate a draft with metadata
4. Run editorial review
5. Produce final content
6. Commit outputs to the repository

#### Step 4: Review and Publish

1. Check the `content-workflow/outputs/` folder for:
   - `{slug}-final-{date}.md` - Final content
   - `{slug}-review-notes-{date}.md` - Editorial notes
2. Review the content
3. Make any final adjustments if needed
4. Publish using your preferred method

### For Agents and Automation

#### Manual Workflow Trigger

You can manually trigger the workflow for a specific brief:

```bash
# Via GitHub CLI
gh workflow run multi-agent-content-workflow.yml \
  -f brief_file=my-article-topic.md \
  -f skip_review=false
```

Or use the GitHub Actions UI:
1. Go to Actions tab
2. Select "Multi-Agent Content Workflow"
3. Click "Run workflow"
4. Enter the brief filename

#### Customizing Agents

Both agent configuration files can be customized:

**content-writer.agent.md**
- Adjust tone and style preferences
- Modify output formats
- Add/remove quality checks
- Change model or parameters

**content-editor.agent.md**
- Customize review criteria
- Adjust editing principles
- Modify checklist items
- Configure review depth

#### Context Files

Update the context files to refine agent behavior:

**style-guide.md**
- Writing conventions
- Formatting standards
- Voice and tone
- Common patterns

**brand-guidelines.md**
- Brand values and personality
- Key messages
- Content themes
- Audience definitions

## 🤝 Collaboration Setup

### Making the Repository Collaborative

#### 1. Add Team Members

**Repository Settings:**
1. Go to Settings → Collaborators and teams
2. Click "Add people" or "Add teams"
3. Enter GitHub usernames or team names
4. Set appropriate permissions:
   - **Write**: Can create briefs and view outputs
   - **Maintain**: Can also manage workflows
   - **Admin**: Full repository access

#### 2. Set Up Branch Protection

**Protect main branch:**
1. Go to Settings → Branches
2. Add rule for `main` branch
3. Recommended settings:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

#### 3. Configure Permissions

**GitHub Actions permissions:**
1. Go to Settings → Actions → General
2. Set "Workflow permissions" to:
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create pull requests

#### 4. Set Up Teams (Optional)

Create teams for different roles:

**Content Team**
- Permission: Write
- Can create briefs and review outputs

**Editorial Team**
- Permission: Maintain
- Can manage workflows and approve content

**Admin Team**
- Permission: Admin
- Can configure everything

### Collaboration Best Practices

#### Branch Strategy

**Option 1: Direct to main (simpler)**
- Create briefs directly on main branch
- Workflow runs automatically
- Review outputs and publish

**Option 2: PR workflow (more control)**
- Create feature branches for new briefs
- Submit PR with brief
- Workflow runs on PR merge
- Review before merging

#### Communication

**Use GitHub Issues for:**
- Discussing content ideas
- Requesting new briefs
- Reporting workflow problems
- Suggesting improvements

**Use GitHub Projects for:**
- Content calendar planning
- Tracking brief status
- Managing publication schedule

#### Workflow Tips

1. **One brief per file**: Each brief should be its own markdown file
2. **Clear naming**: Use descriptive slugs for brief filenames
3. **Complete briefs**: Fill in all required fields before submitting
4. **Review outputs**: Always review generated content before publishing
5. **Archive old content**: Move published content out of outputs folder

## 🔧 Customization

### Workflow Modifications

Edit `.github/workflows/multi-agent-content-workflow.yml` to:

- Change trigger conditions
- Add approval steps
- Integrate with other systems
- Add notification channels
- Customize agent invocation

### Agent Extensions

Extend the workflow with additional agents:

**SEO Optimizer Agent**
- Reviews for search optimization
- Suggests keyword improvements
- Checks technical SEO

**Fact Checker Agent**
- Verifies claims and statistics
- Checks source citations
- Flags unsupported statements

**Social Media Agent**
- Generates social posts
- Creates promotional copy
- Suggests hashtags and mentions

### Integration Points

The workflow can integrate with:

- **Slack**: Notifications for new drafts
- **Email**: Alert stakeholders about reviews
- **CMS**: Auto-publish approved content
- **Analytics**: Track content performance
- **Asset management**: Pull in images and media

## 📊 Monitoring and Maintenance

### Check Workflow Status

1. Go to Actions tab in repository
2. View workflow runs and their status
3. Click on a run to see detailed logs
4. Check each job for success/failure

### Common Issues

**Brief not processing:**
- Verify file is in `briefs/` directory
- Check filename doesn't match template
- Ensure file is valid markdown
- Check workflow permissions

**Draft not generated:**
- Review workflow logs
- Verify agent configuration
- Check context files exist
- Ensure brief has required fields

**Review not running:**
- Check if `skip_review` was set to true
- Verify draft was created successfully
- Check workflow permissions

### Maintenance Tasks

**Weekly:**
- Review outputs folder
- Archive published content
- Check for failed workflows

**Monthly:**
- Update style guide if needed
- Review agent performance
- Gather team feedback
- Update documentation

**Quarterly:**
- Review agent configurations
- Update brand guidelines
- Analyze content metrics
- Optimize workflow

## 🎓 Training and Onboarding

### For New Team Members

1. **Read this README**: Understand the workflow
2. **Review context files**: Learn style and brand guidelines
3. **Study the template**: Understand brief structure
4. **Create a test brief**: Practice the process
5. **Review example outputs**: See what agents produce

### Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Markdown Guide](https://www.markdownguide.org/)
- [Content Strategy Resources](https://kevinsundstrom.com/articles/)

### Getting Help

**Questions about:**
- **The workflow**: Create a GitHub issue
- **Writing guidelines**: Refer to style-guide.md
- **Brand voice**: Refer to brand-guidelines.md
- **Technical issues**: Check workflow logs first

## 🚀 Quick Start Example

Here's a complete example workflow:

```bash
# 1. Clone the repository
git clone https://github.com/kevinsundstrom/kevinsundstrom.github.io.git
cd kevinsundstrom.github.io

# 2. Create a new brief from template
cp content-workflow/briefs/TEMPLATE-content-brief.md \
   content-workflow/briefs/ai-marketing-automation.md

# 3. Edit the brief
# Fill in all sections with your content requirements

# 4. Commit and push
git add content-workflow/briefs/ai-marketing-automation.md
git commit -m "Add brief: AI Marketing Automation"
git push

# 5. Monitor the workflow
# Go to GitHub Actions tab and watch it run

# 6. Review the output
# Check content-workflow/outputs/ for generated files
```

## 📄 License and Attribution

This workflow structure and documentation is part of kevinsundstrom.github.io and is available for the team to use and modify as needed.

## 🔄 Version History

- **v1.0.0** (2026-02-13): Initial multi-agent workflow setup
  - Content Writer and Editor agents
  - Style guide and brand guidelines
  - Automated GitHub Actions workflow
  - Comprehensive documentation

---

**Questions or feedback?** Open an issue or reach out to the team!
