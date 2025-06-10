const fs = require('fs');
const slugify = require('slugify');

// Parse the issue body to extract form data
function parseIssueBody(issueBody) {
  const data = {};
  
  // Parse the GitHub issue form format
  const sections = issueBody.split('###');
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length < 2) continue;
    
    const header = lines[0].trim();
    const content = lines.slice(1).join('\n').trim();
    
    // Map form field IDs to our data structure
    if (header.includes('Article Title')) {
      data.title = content;
    } else if (header.includes('Article Content')) {
      data.content = content;
    } else if (header.includes('SEO Title')) {
      data.seoTitle = content || data.title;
    } else if (header.includes('SEO Description')) {
      data.seoDescription = content;
    } else if (header.includes('SEO Keywords')) {
      data.seoKeywords = content;
    } else if (header.includes('Category/Topic')) {
      data.category = content || 'General';
    } else if (header.includes('Author Name')) {
      data.author = content || 'Kevin Sundstrom';
    } else if (header.includes('Publish Date')) {
      data.publishDate = content || new Date().toISOString().split('T')[0];
    } else if (header.includes('Additional Notes')) {
      data.notes = content;
    }
  }
  
  // Set defaults if not provided
  data.title = data.title || 'Untitled Article';
  data.seoTitle = data.seoTitle || data.title;
  data.author = data.author || 'Kevin Sundstrom';
  data.publishDate = data.publishDate || new Date().toISOString().split('T')[0];
  data.category = data.category || 'General';
  
  return data;
}

// Generate URL-friendly slug and paths
function generatePaths(title, category) {
  const slug = slugify(title, { 
    lower: true, 
    strict: true, 
    remove: /[*+~.()'"!:@]/g 
  });
  
  // Normalize category for URL
  const categorySlug = slugify(category, { 
    lower: true, 
    strict: true 
  });
  
  // Create nested path structure
  const pathParts = [categorySlug];
  
  // For now, put everything under the main category
  // Could be extended to support subcategories later
  const relativePath = `/articles/${pathParts.join('/')}/${slug}/`;
  const fullPath = `articles/${pathParts.join('/')}/${slug}`;
  
  return {
    slug,
    categorySlug,
    relativePath,
    fullPath,
    url: relativePath
  };
}

// Main execution
try {
  const issueBody = process.env.ISSUE_BODY || '';
  const issueTitle = process.env.ISSUE_TITLE || '';
  const issueNumber = process.env.ISSUE_NUMBER || '';
  
  console.log('Parsing issue:', issueNumber);
  console.log('Issue title:', issueTitle);
  
  const parsedData = parseIssueBody(issueBody);
  const paths = generatePaths(parsedData.title, parsedData.category);
  
  const articleData = {
    ...parsedData,
    ...paths,
    issueNumber,
    dateCreated: new Date().toISOString(),
    dateModified: new Date().toISOString()
  };
  
  console.log('Parsed article data:', JSON.stringify(articleData, null, 2));
  
  // Output for GitHub Actions
  const output = JSON.stringify(articleData);
  fs.writeFileSync(process.env.GITHUB_OUTPUT || '/dev/stdout', `article-data=${output}\n`);
  
} catch (error) {
  console.error('Error parsing issue:', error);
  process.exit(1);
}