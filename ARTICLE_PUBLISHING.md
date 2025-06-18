# Article Publishing Automation

This repository includes a GitHub Actions workflow that automatically publishes and edits articles from GitHub issues using the article issue templates.

## How It Works

1. **Create an Issue**: Use the "Publish Article" issue template to submit a new article OR use the "Edit Article" template to update an existing one
2. **Automatic Processing**: GitHub Actions will automatically:
   - Parse the issue content and metadata
   - Generate a properly formatted HTML article page (for new articles) or update an existing one (for edits)
   - Create the necessary directory structure
   - Update the articles index pages
   - Commit and push the changes to the repository

## Usage Instructions

### Creating an Article Issue

1. Go to the GitHub repository's Issues tab
2. Click "New issue"
3. Select the "Publish Article" template
4. Fill in the required fields:
   - **Article Title** (required): The main title of your article
   - **Article Content** (required): Full article content in Markdown format

5. Fill in optional fields as needed:
   - **SEO Title**: Custom title for search engines
   - **SEO Description**: Meta description for search engines
   - **SEO Keywords**: Comma-separated keywords
   - **Category/Topic**: Main category (e.g., "Content Strategy", "Marketing")
   - **Author Name**: Article author (defaults to "Kevin Sundstrom")
   - **Publish Date**: Target publication date (YYYY-MM-DD format)
   - **Additional Notes**: Any extra information

6. Make sure the issue has the "article" label
7. Submit the issue

### What Happens Next

Once you submit the issue, the GitHub Action will:

1. **Parse the Issue**: Extract all the article data from the issue body
2. **Generate Slug**: Create a URL-friendly slug from the article title
3. **Create Article**: Generate a complete HTML article page with:
   - Proper SEO meta tags
   - Open Graph tags for social sharing
   - Schema.org structured data
   - Responsive design matching the site theme
   - Navigation and footer elements

4. **Update Indexes**: Automatically update:
   - Main articles index (`/articles/`)
   - Category index page (creates if needed)
   - Article counts and listings

5. **Commit Changes**: Push all changes to the repository
6. **Comment on Issue**: Add a comment with the published article URL

### Article Structure

Articles are organized in a hierarchical structure:
```
/articles/
  ├── index.html (main articles page)
  ├── [category-slug]/
  │   ├── index.html (category page)
  │   └── [article-slug]/
  │       └── index.html (article page)
```

### Supported Markdown Features

The system supports basic Markdown formatting:
- Headers (`#`, `##`, `###`)
- **Bold text** (`**bold**`)
- *Italic text* (`*italic*`)
- [Links](url) (`[text](url)`)
- Unordered lists (`- item`)
- Ordered lists (`1. item`)
- Paragraphs (separated by blank lines)

### Categories

Categories are automatically created based on the category field in the issue. The system:
- Creates URL-friendly slugs for categories
- Generates category index pages
- Updates the main articles index with category information
- Tracks article counts per category

### SEO Optimization

All generated articles include:
- Meta tags for title, description, keywords, and author
- Open Graph tags for social media sharing
- Schema.org Article structured data
- Canonical URLs
- Proper HTML semantic structure

## Technical Details

### GitHub Action Workflow

The workflow (`.github/workflows/publish-article.yml`) triggers on:
- Issue creation (`opened`)
- Issue editing (`edited`)

It processes issues with either the "article" label (for new articles) or "article-edit" label (for editing existing articles).

### Scripts

Four main scripts handle the automation:

1. **parse-issue.js**: Parses the GitHub issue template format and extracts article data for new articles
2. **parse-edit-issue.js**: Parses edit requests and extracts changes for existing articles
3. **generate-article.js**: Creates the HTML article file with proper structure and SEO for new articles
4. **update-article.js**: Updates existing articles with new content and metadata
5. **update-indexes.js**: Updates the main articles index and category pages

### Dependencies

The workflow uses Node.js with these packages:
- `js-yaml`: For YAML parsing
- `slugify`: For creating URL-friendly slugs

## Troubleshooting

### Issue Not Processing

- Ensure the issue has the "article" label
- Check that required fields (title and content) are filled
- Verify the issue template format is correct

### Article Not Appearing

- Check the GitHub Actions tab for workflow status
- Ensure the repository has proper write permissions
- Verify the article was committed to the repository

### Formatting Issues

- Check that Markdown syntax is correct
- Ensure proper spacing between sections
- Use supported Markdown features only

## Manual Editing

### Easy Article Editing via GitHub Issues

The easiest way to edit published articles is using the "Edit Article" issue template:

1. Go to the GitHub repository's Issues tab
2. Click "New issue"
3. Select the "Edit Article" template
4. Fill in the required fields:
   - **Article URL** (required): The URL path or just the slug of the article you want to edit
     - Full URL: `/articles/content-strategy/article-title/`
     - Just the slug: `article-title`
     - You can find this from the article's web URL or by browsing the `/articles/` directory structure
5. Fill in only the fields you want to change:
   - **New Article Title**: Update the main title
   - **New Article Content**: Replace the entire article content with new Markdown
   - **New Author Name**: Change the author
   - **New SEO Title, Description, Keywords**: Update SEO metadata
   - **New Category**: Move the article to a different category
   - **Edit Notes**: Describe what changes you're making

6. Make sure the issue has the "article-edit" label
7. Submit the issue

The system will automatically:
- Find the existing article
- Update only the fields you specified
- Preserve all existing metadata for unchanged fields
- Handle URL changes if the title or category changes
- Update article indexes
- Comment back with the updated article URL

#### Example Editing Scenarios

**Simple Content Update:**
- Article URL: `content-strategy-is-collaboration-not-control`
- New Article Content: `[your updated markdown content]`
- Edit Notes: `Updated content to include new insights`

**Title and Author Change:**
- Article URL: `/articles/marketing/marketing-article-title/`
- New Article Title: `Updated Marketing Article Title`
- New Author Name: `Jane Smith`
- Edit Notes: `Updated title for clarity and corrected author`

**SEO Optimization:**
- Article URL: `ai-article-slug`
- New SEO Description: `Improved description for better search visibility`
- New SEO Keywords: `ai, machine learning, automation, content`
- Edit Notes: `Optimized SEO metadata`

**Category Move:**
- Article URL: `/articles/general/article-title/`
- New Category: `Content Strategy`
- Edit Notes: `Moved to more appropriate category`

### Advanced Manual Editing

After publication, articles can also be manually edited by:
1. Navigating to the generated HTML file
2. Making changes directly in the repository
3. Committing the changes

The automated system won't overwrite manual changes unless the original issue is edited.

## Cleanup After Article Deletion

When articles are manually deleted, use the cleanup script to remove stale references:

### Running the Cleanup Script

Option 1 - Using the convenience script:
```bash
.github/scripts/cleanup-articles.sh
```

Option 2 - Direct execution:
```bash
node .github/scripts/cleanup-indexes.js
```

### What the Cleanup Does

The cleanup script:
- Scans the actual file system for existing articles
- Removes stale article references from the main articles index  
- Updates category article counts to reflect actual articles
- Fixes category pages to show correct article listings
- Creates missing category index pages
- Removes empty category directories (if they only contain index.html)

### When to Run Cleanup

Run the cleanup script whenever you:
- Delete articles manually from the repository
- Notice 404 errors on category pages  
- See incorrect article counts on the main articles page
- Want to ensure index pages are synchronized with actual content

After running the cleanup, commit the changes to fix any 404 issues.