const fs = require('fs');
const path = require('path');

// Parse existing HTML to extract article data
function parseExistingArticles(htmlContent) {
  const articles = [];
  
  // Extract article items from HTML
  const articlePattern = /<article class="article-item">(.*?)<\/article>/gs;
  const matches = htmlContent.matchAll(articlePattern);
  
  for (const match of matches) {
    const articleHtml = match[1];
    
    // Extract title and link
    const titleMatch = articleHtml.match(/<h3 class="article-title">.*?<a href="([^"]*)"[^>]*>([^<]*)<\/a>/s);
    const metaMatch = articleHtml.match(/<div class="article-meta">([^<]*)<\/div>/);
    const excerptMatch = articleHtml.match(/<div class="article-excerpt">([^<]*)<\/div>/);
    const categoryMatch = articleHtml.match(/<div class="article-category">.*?<a href="[^"]*">([^<]*)<\/a>/);
    
    if (titleMatch && metaMatch) {
      articles.push({
        url: titleMatch[1],
        title: titleMatch[2].trim(),
        meta: metaMatch[1].trim(),
        excerpt: excerptMatch ? excerptMatch[1].trim() : '',
        category: categoryMatch ? categoryMatch[1].trim() : '',
        html: match[0]
      });
    }
  }
  
  return articles;
}

// Generate article HTML for listing
function generateArticleListItem(articleData) {
  const publishDate = new Date(articleData.publishDate);
  const formattedDate = publishDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const excerpt = articleData.seoDescription || 
    (articleData.content && articleData.content.substring(0, 150) + '...') || 
    'Read more about this article.';
  
  return `        <article class="article-item">
          <div class="article-category">
            <a href="/articles/${articleData.categorySlug}/">${articleData.category}</a>
          </div>
          <h3 class="article-title">
            <a href="${articleData.url}">${articleData.title}</a>
          </h3>
          <div class="article-meta">By ${articleData.author} | ${formattedDate}</div>
          <div class="article-excerpt">
            ${excerpt}
          </div>
          <a href="${articleData.url}" class="read-more">Read more →</a>
        </article>`;
}

// Update main articles index
function updateMainArticlesIndex(articleData) {
  const indexPath = path.join(process.cwd(), 'articles', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('Main articles index not found, skipping update');
    return;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Parse existing articles
  const existingArticles = parseExistingArticles(content);
  
  // Check if this article already exists
  const existingIndex = existingArticles.findIndex(article => article.url === articleData.url);
  
  const newArticleHtml = generateArticleListItem(articleData);
  
  if (existingIndex >= 0) {
    // Replace existing article
    content = content.replace(existingArticles[existingIndex].html, newArticleHtml);
    console.log('Updated existing article in main index');
  } else {
    // Add new article at the top of the list
    const latestSectionMatch = content.match(/(<div class="article-list">)(.*?)(<\/div>)/s);
    if (latestSectionMatch) {
      const beforeList = latestSectionMatch[1];
      const existingList = latestSectionMatch[2];
      const afterList = latestSectionMatch[3];
      
      // Add comment for the first article and insert new article
      const updatedList = beforeList + '\n        <!-- Showing most recent 5 articles -->\n' + 
                         newArticleHtml + 
                         existingList + 
                         afterList;
      
      content = content.replace(latestSectionMatch[0], updatedList);
      console.log('Added new article to main index');
    }
  }
  
  // Update category count if needed
  const categoryPattern = new RegExp(`(<div class="category-card">.*?<h3><a href="/articles/${articleData.categorySlug}/">${articleData.category}</a></h3>.*?<div class="article-count">)(\\d+)( article(?:s)?)(</div>)`, 's');
  const categoryMatch = content.match(categoryPattern);
  
  if (categoryMatch) {
    const currentCount = parseInt(categoryMatch[2]);
    const newCount = existingIndex >= 0 ? currentCount : currentCount + 1;
    const plural = newCount === 1 ? 'article' : 'articles';
    content = content.replace(categoryPattern, `$1${newCount} ${plural}$4`);
    console.log(`Updated category count to ${newCount}`);
  } else {
    // Add new category if it doesn't exist
    const categoriesGridMatch = content.match(/(<div class="categories-grid">)(.*?)(<\/div>\s*<\/section>)/s);
    if (categoriesGridMatch) {
      const newCategoryCard = `
        <div class="category-card">
          <h3><a href="/articles/${articleData.categorySlug}/">${articleData.category}</a></h3>
          <p>Articles in the ${articleData.category} category.</p>
          <div class="article-count">1 article</div>
        </div>`;
      
      const updatedGrid = categoriesGridMatch[1] + categoriesGridMatch[2] + newCategoryCard + categoriesGridMatch[3];
      content = content.replace(categoriesGridMatch[0], updatedGrid);
      console.log('Added new category to main index');
    }
  }
  
  fs.writeFileSync(indexPath, content);
  console.log('Updated main articles index');
}

// Create or update category index
function updateCategoryIndex(articleData) {
  const categoryDir = path.join(process.cwd(), 'articles', articleData.categorySlug);
  const categoryIndexPath = path.join(categoryDir, 'index.html');
  
  // Create category directory if it doesn't exist
  fs.mkdirSync(categoryDir, { recursive: true });
  
  let content = '';
  let existingArticles = [];
  
  if (fs.existsSync(categoryIndexPath)) {
    content = fs.readFileSync(categoryIndexPath, 'utf8');
    existingArticles = parseExistingArticles(content);
  } else {
    // Create new category index
    content = generateCategoryIndexTemplate(articleData);
  }
  
  // Check if this article already exists
  const existingIndex = existingArticles.findIndex(article => article.url === articleData.url);
  
  const newArticleHtml = generateArticleListItem(articleData);
  
  if (existingIndex >= 0) {
    // Replace existing article
    content = content.replace(existingArticles[existingIndex].html, newArticleHtml);
    console.log('Updated existing article in category index');
  } else {
    // Add new article to the list
    const articleListMatch = content.match(/(<div class="article-list">)(.*?)(<\/div>\s*<\/section>)/s);
    if (articleListMatch) {
      const beforeList = articleListMatch[1];
      const existingList = articleListMatch[2];
      const afterList = articleListMatch[3];
      
      const updatedList = beforeList + '\n' + newArticleHtml + existingList + afterList;
      content = content.replace(articleListMatch[0], updatedList);
      console.log('Added new article to category index');
    }
  }
  
  fs.writeFileSync(categoryIndexPath, content);
  console.log('Updated category index');
}

// Generate category index template
function generateCategoryIndexTemplate(articleData) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0366d6" />
  <title>${articleData.category} Articles - Kevin Sundstrom</title>
  <meta name="description" content="Explore comprehensive articles on ${articleData.category.toLowerCase()}, including expert insights and analysis from Kevin Sundstrom." />
  <meta name="keywords" content="${articleData.category.toLowerCase()}, articles, kevin sundstrom" />
  <meta name="author" content="Kevin Sundstrom" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://kevinsundstrom.com/articles/${articleData.categorySlug}/" />
  
  <!-- Open Graph meta tags -->
  <meta property="og:title" content="${articleData.category} Articles - Kevin Sundstrom" />
  <meta property="og:description" content="Explore comprehensive articles on ${articleData.category.toLowerCase()}, including expert insights and analysis from Kevin Sundstrom." />
  <meta property="og:url" content="https://kevinsundstrom.com/articles/${articleData.categorySlug}/" />
  <meta property="og:type" content="website" />
  
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <nav class="slim-navbar">
    <div style="display: flex; gap: 0.5rem;">
      <a href="/" class="nav-link" aria-label="Home">Home</a>
      <a href="/contact" class="nav-link" aria-label="Contact Me">Contact Me</a>
      <a href="/articles/" class="nav-link" aria-label="Articles">Articles</a>
    </div>
    <span class="nav-name">Kevin Sundstrom</span>
  </nav>
  
  <main class="main-content">
    <nav class="breadcrumb">
      <a href="/articles/">Articles</a> > ${articleData.category}
    </nav>
    
    <h1>${articleData.category}</h1>
    <p class="category-description">
      Articles and insights in the ${articleData.category} category.
    </p>
    
    <section>
      <h2>Latest Articles</h2>
      <div class="article-list">
      </div>
    </section>
  </main>
  
  <footer class="site-footer">
    <div class="copyright">© Kevin Sundstrom <span id="current-year"></span></div>
  </footer>
  
  <script>
    document.getElementById('current-year').textContent = new Date().getFullYear();
  </script>
</body>
</html>`;
}

// Main execution
try {
  const articleData = JSON.parse(process.env.ARTICLE_DATA || '{}');
  
  if (!articleData.title) {
    throw new Error('No article data provided');
  }
  
  console.log('Updating indexes for article:', articleData.title);
  
  // Update main articles index
  updateMainArticlesIndex(articleData);
  
  // Update category index
  updateCategoryIndex(articleData);
  
  console.log('Successfully updated all indexes');
  
} catch (error) {
  console.error('Error updating indexes:', error);
  process.exit(1);
}