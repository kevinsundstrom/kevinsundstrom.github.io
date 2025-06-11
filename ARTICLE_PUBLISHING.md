# Article Publishing Automation

This repository includes a GitHub Actions workflow that automatically publishes articles from GitHub issues using the article issue template.

## How It Works

1. **Create an Issue**: Use the "Publish Article" issue template to submit a new article
2. **Automatic Processing**: GitHub Actions will automatically:
   - Parse the issue content and metadata
   - Generate a properly formatted HTML article page
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

It only processes issues with the "article" label.

### Scripts

Three main scripts handle the automation:

1. **parse-issue.js**: Parses the GitHub issue template format and extracts article data
2. **generate-article.js**: Creates the HTML article file with proper structure and SEO
3. **update-indexes.js**: Updates the main articles index and category pages

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

After publication, articles can be manually edited by:
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