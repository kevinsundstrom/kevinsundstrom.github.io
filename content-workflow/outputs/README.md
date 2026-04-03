# Content Workflow Outputs

This directory contains generated content from the multi-agent workflow.

## Files Generated Here

- `{slug}-draft-{date}.md` - Initial content drafts from the Writer agent
- `{slug}-metadata-{date}.yml` - SEO metadata and article information
- `{slug}-final-{date}.md` - Reviewed and polished content ready for publication
- `{slug}-review-notes-{date}.md` - Editorial review notes and changes

## Workflow

1. **Draft Generation**: Writer agent creates initial draft and metadata
2. **Editorial Review**: Editor agent reviews and produces final version
3. **Publication**: Final content is ready to be published
4. **Archive**: After publication, move files to archive or delete

## File Naming

- `{slug}`: Brief filename without extension (e.g., "ai-marketing-guide")
- `{date}`: Generation date in YYYYMMDD format (e.g., "20260213")

## Managing This Directory

### Keep It Clean
- Archive or delete files after publication
- Don't commit large binary files
- Use descriptive slugs in brief filenames

### Archive Strategy
You may want to:
- Move published content to an archive folder
- Keep only recent outputs (last 30 days)
- Store final versions in a separate docs/published folder

### Git Tracking
This directory is tracked by git to capture workflow outputs. If you prefer not to track outputs in version control, add this directory to `.gitignore`.

---

**Note**: This directory will be populated automatically by the GitHub Actions workflow when new content briefs are added.
