const fs = require('fs');
const path = require('path');

// Scan for actual articles in the file system
function scanActualArticles() {
  const articlesDir = path.join(process.cwd(), 'articles');
  const actualArticles = [];
  const categoryData = new Map();

  // Recursive function to find article files
  function scanDirectory(dir, depth = 0) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip the main articles directory itself
        if (depth > 0) {
          scanDirectory(itemPath, depth + 1);
        } else {
          scanDirectory(itemPath, depth + 1);
        }
      } else if (item === 'index.html' && depth >= 2) {
        // This could be an article file (at least 2 levels deep: category/article/index.html)
        const relativePath = path.relative(articlesDir, itemPath);
        const pathParts = relativePath.split(path.sep);
        
        if (pathParts.length >= 3) {
          // This is likely an actual article (not a category index)
          try {
            const htmlContent = fs.readFileSync(itemPath, 'utf8');
            
            // Check if this is actually an article or a category/subcategory index
            // Articles should have article-specific content structure
            const isArticle = htmlContent.includes('<article>') && 
                             (htmlContent.includes('class="article-content"') ||
                              htmlContent.includes('class="meta"')) &&
                             !htmlContent.includes('class="categories-grid"') &&
                             !htmlContent.includes('class="article-list"');
            
            if (isArticle) {
              const articleData = extractArticleDataFromHtml(htmlContent, pathParts);
              
              if (articleData) {
                actualArticles.push(articleData);
                
                // Track category data - use the first level as main category
                const categoryKey = pathParts[0];
                if (!categoryData.has(categoryKey)) {
                  categoryData.set(categoryKey, {
                    name: articleData.category,
                    slug: categoryKey,
                    articles: []
                  });
                }
                categoryData.get(categoryKey).articles.push(articleData);
              }
            }
          } catch (error) {
            console.error(`Error processing article ${itemPath}:`, error.message);
          }
        }
      }
    }
  }

  scanDirectory(articlesDir);
  
  return {
    articles: actualArticles,
    categories: Array.from(categoryData.values())
  };
}

// Extract article metadata from HTML content
function extractArticleDataFromHtml(htmlContent, pathParts) {
  try {
    // Extract title from <title> tag or <h1>
    const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/) || 
                       htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/);
    const title = titleMatch ? titleMatch[1].replace(/ - Kevin Sundstrom$/, '').trim() : 'Unknown Title';
    
    // Extract author from meta tag or content
    const authorMatch = htmlContent.match(/<meta name="author" content="([^"]+)"/) ||
                       htmlContent.match(/By ([^|]+)\|/);
    const author = authorMatch ? authorMatch[1].trim() : 'Kevin Sundstrom';
    
    // Extract description from meta tag
    const descMatch = htmlContent.match(/<meta name="description" content="([^"]+)"/);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract publish date from structured data or meta
    const dateMatch = htmlContent.match(/"datePublished":\s*"([^"]+)"/) ||
                     htmlContent.match(/<meta property="article:published_time" content="([^"]+)"/);
    const publishDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString().split('T')[0];
    
    // Build URL and category info from path
    const categorySlug = pathParts[0];
    let articleSlug = pathParts[pathParts.length - 2]; // Get the directory name
    
    // Handle nested categories (e.g., content-strategy/ai/article-name)
    let fullPath = '/' + pathParts.slice(0, -1).join('/') + '/';
    let url = '/articles' + fullPath;
    
    // Extract category name from HTML or infer from slug
    const categoryMatch = htmlContent.match(/<div class="category-topic">.*?<a[^>]*>([^<]+)<\/a>/) ||
                         htmlContent.match(/"articleSection":\s*"([^"]+)"/) ||
                         htmlContent.match(/<meta property="article:section" content="([^"]+)"/);
    
    // For determining the main category, use the first part of the path
    const mainCategorySlug = pathParts[0];
    const category = categoryMatch ? categoryMatch[1].trim() : 
                    mainCategorySlug.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ');
    
    return {
      title,
      author,
      description,
      publishDate,
      url,
      category,
      categorySlug: mainCategorySlug, // Use the main category slug
      articleSlug,
      fullPath: pathParts.join('/'),
      exists: true
    };
    
  } catch (error) {
    console.error('Error extracting article data:', error);
    return null;
  }
}

// Clean up the main articles index
function cleanupMainArticlesIndex(scanResult) {
  const indexPath = path.join(process.cwd(), 'articles', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('Main articles index not found');
    return;
  }
  
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Remove all existing articles from the latest articles section
  const latestSectionMatch = content.match(/(<div class="article-list">)(.*?)(<\/div>\s*<\/section>)/s);
  if (latestSectionMatch) {
    const beforeList = latestSectionMatch[1];
    const afterList = latestSectionMatch[3];
    
    // Rebuild article list from actual articles
    let newArticleList = '\n        <!-- Showing most recent articles -->';
    
    // Sort articles by publish date (newest first)
    const sortedArticles = scanResult.articles.sort((a, b) => 
      new Date(b.publishDate) - new Date(a.publishDate)
    );
    
    for (const article of sortedArticles.slice(0, 5)) { // Show only 5 most recent
      newArticleList += '\n' + generateArticleListItem(article);
    }
    
    if (sortedArticles.length === 0) {
      newArticleList += '\n        <div class="no-articles">No articles available.</div>';
    }
    
    newArticleList += '\n      ';
    
    const updatedList = beforeList + newArticleList + afterList;
    content = content.replace(latestSectionMatch[0], updatedList);
    console.log(`Updated main articles list with ${sortedArticles.length} articles`);
  }
  
  // Clean up categories section
  const categoriesGridMatch = content.match(/(<div class="categories-grid">)(.*?)(<\/div>\s*<\/section>)/s);
  if (categoriesGridMatch) {
    const beforeGrid = categoriesGridMatch[1];
    const afterGrid = categoriesGridMatch[3];
    
    let newCategoriesGrid = '';
    
    for (const category of scanResult.categories) {
      const articleCount = category.articles.length;
      const plural = articleCount === 1 ? 'article' : 'articles';
      
      newCategoriesGrid += `
        <div class="category-card">
          <h3><a href="/articles/${category.slug}/">${category.name}</a></h3>
          <p>Articles in the ${category.name} category.</p>
          <div class="article-count">${articleCount} ${plural}</div>
        </div>`;
    }
    
    if (scanResult.categories.length === 0) {
      newCategoriesGrid = '\n        <div class="no-categories">No categories available.</div>';
    }
    
    newCategoriesGrid += '\n      ';
    
    const updatedGrid = beforeGrid + newCategoriesGrid + afterGrid;
    content = content.replace(categoriesGridMatch[0], updatedGrid);
    console.log(`Updated categories section with ${scanResult.categories.length} categories`);
  }
  
  fs.writeFileSync(indexPath, content);
  console.log('Main articles index cleaned up successfully');
}

// Generate article HTML for listing (matching the existing format)
function generateArticleListItem(articleData) {
  const publishDate = new Date(articleData.publishDate);
  const formattedDate = publishDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `        <article class="article-item">
          <div class="article-category">
            <a href="/articles/${articleData.categorySlug}/">${articleData.category}</a>
          </div>
          <h3 class="article-title">
            <a href="${articleData.url}">${articleData.title}</a>
          </h3>
          <div class="article-meta">By ${articleData.author} | ${formattedDate}</div>
          <div class="article-excerpt">
            ${articleData.description}
          </div>
          <a href="${articleData.url}" class="read-more">Read more →</a>
        </article>`;
}

// Clean up category index pages
function cleanupCategoryIndexes(scanResult) {
  const articlesDir = path.join(process.cwd(), 'articles');
  
  // Remove category directories that have no articles
  const existingCategoryDirs = fs.readdirSync(articlesDir).filter(item => {
    const itemPath = path.join(articlesDir, item);
    return fs.statSync(itemPath).isDirectory() && item !== 'index.html';
  });
  
  const activeCategorySlugs = new Set(scanResult.categories.map(cat => cat.slug));
  
  for (const dirName of existingCategoryDirs) {
    const categoryIndexPath = path.join(articlesDir, dirName, 'index.html');
    
    if (activeCategorySlugs.has(dirName)) {
      // Update existing category page or create if missing
      const category = scanResult.categories.find(cat => cat.slug === dirName);
      
      if (fs.existsSync(categoryIndexPath)) {
        updateCategoryIndexPage(categoryIndexPath, category);
      } else {
        createCategoryIndexPage(categoryIndexPath, category);
      }
    } else {
      // This is a category with no articles - remove if it only contains index.html
      const categoryDir = path.join(articlesDir, dirName);
      const categoryContents = fs.readdirSync(categoryDir);
      
      if (categoryContents.length === 1 && categoryContents[0] === 'index.html') {
        console.log(`Removing empty category directory: ${dirName}`);
        fs.rmSync(categoryDir, { recursive: true });
      } else {
        console.log(`Category ${dirName} has no articles but contains other files, skipping removal`);
      }
    }
  }
}

// Create a new category index page
function createCategoryIndexPage(categoryIndexPath, category) {
  const template = generateCategoryIndexTemplate(category);
  
  // Make sure the directory exists
  const categoryDir = path.dirname(categoryIndexPath);
  fs.mkdirSync(categoryDir, { recursive: true });
  
  // Write the initial template
  fs.writeFileSync(categoryIndexPath, template);
  console.log(`Created category index for ${category.name}`);
  
  // Now update it with the articles
  updateCategoryIndexPage(categoryIndexPath, category);
}

// Generate category index template
function generateCategoryIndexTemplate(category) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0366d6" />
  <title>${category.name} Articles - Kevin Sundstrom</title>
  <meta name="description" content="Explore comprehensive articles on ${category.name.toLowerCase()}, including expert insights and analysis from Kevin Sundstrom." />
  <meta name="keywords" content="${category.name.toLowerCase()}, articles, kevin sundstrom" />
  <meta name="author" content="Kevin Sundstrom" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://kevinsundstrom.com/articles/${category.slug}/" />
  
  <!-- Open Graph meta tags -->
  <meta property="og:title" content="${category.name} Articles - Kevin Sundstrom" />
  <meta property="og:description" content="Explore comprehensive articles on ${category.name.toLowerCase()}, including expert insights and analysis from Kevin Sundstrom." />
  <meta property="og:url" content="https://kevinsundstrom.com/articles/${category.slug}/" />
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
      <a href="/articles/">Articles</a> > ${category.name}
    </nav>
    
    <h1>${category.name}</h1>
    <p class="category-description">
      Articles and insights in the ${category.name} category.
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
function updateCategoryIndexPage(categoryIndexPath, category) {
  if (!fs.existsSync(categoryIndexPath)) {
    console.log(`Category index not found: ${categoryIndexPath}`);
    return;
  }
  
  let content = fs.readFileSync(categoryIndexPath, 'utf8');
  
  // Update the article list section
  const articleListMatch = content.match(/(<div class="article-list">)(.*?)(<\/div>\s*<\/section>)/s);
  if (articleListMatch) {
    const beforeList = articleListMatch[1];
    const afterList = articleListMatch[3];
    
    let newArticleList = '';
    
    if (category.articles.length > 0) {
      // Sort articles by publish date (newest first)
      const sortedArticles = category.articles.sort((a, b) => 
        new Date(b.publishDate) - new Date(a.publishDate)
      );
      
      for (const article of sortedArticles) {
        newArticleList += '\n' + generateArticleListItem(article);
      }
    } else {
      newArticleList = '\n        <div class="no-articles">No articles available in this category.</div>';
    }
    
    newArticleList += '\n      ';
    
    const updatedList = beforeList + newArticleList + afterList;
    content = content.replace(articleListMatch[0], updatedList);
    
    fs.writeFileSync(categoryIndexPath, content);
    console.log(`Updated category index for ${category.name} with ${category.articles.length} articles`);
  }
}

// Main execution
function main() {
  console.log('Starting article indexes cleanup...');
  
  try {
    // Scan for actual articles
    console.log('Scanning for actual articles...');
    const scanResult = scanActualArticles();
    
    console.log(`Found ${scanResult.articles.length} articles in ${scanResult.categories.length} categories:`);
    for (const category of scanResult.categories) {
      console.log(`  - ${category.name} (${category.articles.length} articles)`);
      for (const article of category.articles) {
        console.log(`    * ${article.title} (${article.url})`);
      }
    }
    
    // Clean up main articles index
    console.log('\nCleaning up main articles index...');
    cleanupMainArticlesIndex(scanResult);
    
    // Clean up category indexes
    console.log('\nCleaning up category indexes...');
    cleanupCategoryIndexes(scanResult);
    
    console.log('\nCleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  scanActualArticles,
  cleanupMainArticlesIndex,
  cleanupCategoryIndexes,
  main
};