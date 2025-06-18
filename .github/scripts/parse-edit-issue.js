const fs = require('fs');
const path = require('path');
const slugify = require('slugify');

// Parse the edit issue body to extract form data
function parseEditIssueBody(issueBody) {
  const data = {};
  
  // Parse the GitHub issue form format
  const sections = issueBody.split('###');
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length < 2) continue;
    
    const header = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Skip empty responses
    if (!content || content === '_No response_' || content === '') continue;
    
    // Map form field IDs to our data structure
    if (header.includes('Article URL')) {
      data.articleUrl = content;
    } else if (header.includes('New Article Title')) {
      data.newTitle = content;
    } else if (header.includes('New Article Content')) {
      data.newContent = content;
    } else if (header.includes('New Author Name')) {
      data.newAuthor = content;
    } else if (header.includes('New SEO Title')) {
      data.newSeoTitle = content;
    } else if (header.includes('New SEO Description')) {
      data.newSeoDescription = content;
    } else if (header.includes('New SEO Keywords')) {
      data.newSeoKeywords = content;
    } else if (header.includes('New Category/Topic')) {
      data.newCategory = content;
    } else if (header.includes('Edit Notes')) {
      data.editNotes = content;
    }
  }
  
  return data;
}

// Find the existing article by URL or slug
function findExistingArticle(articleUrl) {
  // Clean up the URL - remove leading/trailing slashes and normalize
  let cleanUrl = articleUrl.trim().replace(/^\/+|\/+$/g, '');
  
  // Handle full URLs (e.g., https://kevinsundstrom.com/articles/...)
  if (cleanUrl.includes('kevinsundstrom.com/')) {
    cleanUrl = cleanUrl.split('kevinsundstrom.com/')[1];
    if (cleanUrl) {
      cleanUrl = cleanUrl.replace(/^\/+|\/+$/g, '');
    }
  }
  
  // If it's just a slug, we need to search for it
  if (!cleanUrl.includes('/')) {
    // It's just a slug, search all articles
    const articlesDir = path.join(process.cwd(), 'articles');
    if (!fs.existsSync(articlesDir)) return null;
    
    // Search recursively for the slug
    function searchForSlug(dir, slug) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          if (item === slug) {
            // Found the slug directory
            const indexPath = path.join(itemPath, 'index.html');
            if (fs.existsSync(indexPath)) {
              return {
                fullPath: path.relative(process.cwd(), itemPath),
                htmlPath: indexPath,
                slug: item
              };
            }
          } else {
            // Recursively search subdirectories
            const found = searchForSlug(itemPath, slug);
            if (found) return found;
          }
        }
      }
      return null;
    }
    
    return searchForSlug(articlesDir, cleanUrl);
  } else {
    // It's a full path, construct the expected path
    if (!cleanUrl.startsWith('articles/')) {
      cleanUrl = 'articles/' + cleanUrl;
    }
    
    const fullPath = path.join(process.cwd(), cleanUrl);
    const htmlPath = path.join(fullPath, 'index.html');
    
    if (fs.existsSync(htmlPath)) {
      return {
        fullPath: cleanUrl,
        htmlPath: htmlPath,
        slug: path.basename(cleanUrl)
      };
    }
  }
  
  return null;
}

// Extract existing article metadata from HTML
function extractArticleMetadata(htmlPath) {
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  const metadata = {};
  
  // Extract title
  const titleMatch = htmlContent.match(/<title>(.*?) - Kevin Sundstrom<\/title>/);
  if (titleMatch) {
    metadata.seoTitle = titleMatch[1];
  }
  
  // Extract main article title from h1
  const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/);
  if (h1Match) {
    metadata.title = h1Match[1];
  }
  
  // Extract meta description
  const descMatch = htmlContent.match(/<meta name="description" content="(.*?)" \/>/);
  if (descMatch) {
    metadata.seoDescription = descMatch[1];
  }
  
  // Extract keywords
  const keywordsMatch = htmlContent.match(/<meta name="keywords" content="(.*?)" \/>/);
  if (keywordsMatch) {
    metadata.seoKeywords = keywordsMatch[1];
  }
  
  // Extract author
  const authorMatch = htmlContent.match(/<meta name="author" content="(.*?)" \/>/);
  if (authorMatch) {
    metadata.author = authorMatch[1];
  }
  
  // Extract canonical URL to determine category and slug
  const canonicalMatch = htmlContent.match(/<link rel="canonical" href="https:\/\/kevinsundstrom\.com(.*?)" \/>/);
  if (canonicalMatch) {
    const url = canonicalMatch[1];
    const urlParts = url.split('/').filter(part => part.length > 0);
    if (urlParts.length >= 3 && urlParts[0] === 'articles') {
      metadata.category = urlParts[1];
      metadata.slug = urlParts[2];
      metadata.url = url;
    }
  }
  
  // Extract category from the category topic div
  const categoryMatch = htmlContent.match(/<div class="category-topic">\s*<a href="[^"]*">(.*?)<\/a>/);
  if (categoryMatch) {
    metadata.category = categoryMatch[1];
  }
  
  // Extract publication date from meta
  const metaMatch = htmlContent.match(/<div class="meta">By .* \| (.*?)<\/div>/);
  if (metaMatch) {
    metadata.publishDate = metaMatch[1];
  }
  
  // Extract content (this is trickier - we need to get the content between article tags)
  const articleMatch = htmlContent.match(/<article[^>]*>\s*(?:<div class="category-topic">.*?<\/div>\s*)?(?:<h1[^>]*>.*?<\/h1>\s*)?(?:<div class="meta">.*?<\/div>\s*)?(.*?)\s*<\/article>/s);
  if (articleMatch) {
    metadata.contentHtml = articleMatch[1].trim();
    // Basic HTML to markdown conversion (simplified)
    metadata.content = htmlToMarkdown(metadata.contentHtml);
  }
  
  return metadata;
}

// Basic HTML to Markdown conversion (simplified)
function htmlToMarkdown(html) {
  if (!html) return '';
  
  let markdown = html;
  
  // Convert headers
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/g, '### $1');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/g, '## $1');
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/g, '# $1');
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/g, '$1\n');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gs, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gs) || [];
    return items.map(item => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/s, '$1').trim();
      return `- ${text}`;
    }).join('\n') + '\n';
  });
  
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gs, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gs) || [];
    return items.map((item, index) => {
      const text = item.replace(/<li[^>]*>(.*?)<\/li>/s, '$1').trim();
      return `${index + 1}. ${text}`;
    }).join('\n') + '\n';
  });
  
  // Convert inline formatting
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/g, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/g, '*$1*');
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, '[$2]($1)');
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
}

// Generate updated article data
function generateUpdatedArticleData(existingMetadata, editData) {
  const updatedData = { ...existingMetadata };
  
  // Apply updates only for fields that were provided
  if (editData.newTitle) {
    updatedData.title = editData.newTitle;
    // If no new SEO title provided, use the new title
    if (!editData.newSeoTitle) {
      updatedData.seoTitle = editData.newTitle;
    }
  }
  
  if (editData.newContent) {
    updatedData.content = editData.newContent;
  }
  
  if (editData.newAuthor) {
    updatedData.author = editData.newAuthor;
  }
  
  if (editData.newSeoTitle) {
    updatedData.seoTitle = editData.newSeoTitle;
  }
  
  if (editData.newSeoDescription) {
    updatedData.seoDescription = editData.newSeoDescription;
  }
  
  if (editData.newSeoKeywords) {
    updatedData.seoKeywords = editData.newSeoKeywords;
  }
  
  if (editData.newCategory) {
    updatedData.category = editData.newCategory;
    updatedData.primaryCategory = editData.newCategory;
  }
  
  // Update modification date
  updatedData.dateModified = new Date().toISOString();
  
  // If title changed, we might need to update the slug and paths
  if (editData.newTitle && editData.newTitle !== existingMetadata.title) {
    const newSlug = slugify(editData.newTitle, { 
      lower: true, 
      strict: true, 
      remove: /[*+~.()'"!:@]/g 
    });
    
    // Only update paths if slug actually changed
    if (newSlug !== updatedData.slug) {
      const categorySlug = slugify(updatedData.category || updatedData.primaryCategory || 'general', { 
        lower: true, 
        strict: true 
      });
      
      updatedData.slug = newSlug;
      updatedData.categorySlug = categorySlug;
      updatedData.relativePath = `/articles/${categorySlug}/${newSlug}/`;
      updatedData.fullPath = `articles/${categorySlug}/${newSlug}`;
      updatedData.url = updatedData.relativePath;
      updatedData.pathChanged = true;
    }
  }
  
  return updatedData;
}

// Main execution
try {
  const issueBody = process.env.ISSUE_BODY || '';
  const issueTitle = process.env.ISSUE_TITLE || '';
  const issueNumber = process.env.ISSUE_NUMBER || '';
  
  console.log('Parsing edit issue:', issueNumber);
  console.log('Issue title:', issueTitle);
  
  const editData = parseEditIssueBody(issueBody);
  
  if (!editData.articleUrl) {
    throw new Error('No article URL provided in edit request');
  }
  
  console.log('Looking for article:', editData.articleUrl);
  
  // Find the existing article
  const existingArticle = findExistingArticle(editData.articleUrl);
  if (!existingArticle) {
    throw new Error(`Article not found: ${editData.articleUrl}`);
  }
  
  console.log('Found article at:', existingArticle.htmlPath);
  
  // Extract existing metadata
  const existingMetadata = extractArticleMetadata(existingArticle.htmlPath);
  console.log('Extracted metadata:', JSON.stringify(existingMetadata, null, 2));
  
  // Generate updated article data
  const updatedData = generateUpdatedArticleData(existingMetadata, editData);
  
  // Add edit tracking info
  updatedData.issueNumber = issueNumber;
  updatedData.editNotes = editData.editNotes;
  updatedData.originalPath = existingArticle.fullPath;
  
  console.log('Updated article data:', JSON.stringify(updatedData, null, 2));
  
  // Output for GitHub Actions
  const output = JSON.stringify(updatedData);
  fs.writeFileSync(process.env.GITHUB_OUTPUT || '/dev/stdout', `article-data=${output}\n`);
  
} catch (error) {
  console.error('Error parsing edit issue:', error);
  process.exit(1);
}