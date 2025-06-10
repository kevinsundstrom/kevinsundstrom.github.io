const fs = require('fs');
const path = require('path');

// Convert markdown to HTML (basic implementation)
function markdownToHtml(markdown) {
  if (!markdown) return '';
  
  // Split into blocks first
  const blocks = markdown.split('\n\n').map(block => block.trim()).filter(block => block.length > 0);
  
  return blocks.map(block => {
    // Headers
    if (block.startsWith('### ')) {
      return `<h3>${block.substring(4)}</h3>`;
    } else if (block.startsWith('## ')) {
      return `<h2>${block.substring(3)}</h2>`;
    } else if (block.startsWith('# ')) {
      return `<h1>${block.substring(2)}</h1>`;
    }
    
    // Unordered lists
    if (block.includes('\n- ') || block.startsWith('- ')) {
      const listItems = block.split('\n')
        .filter(line => line.trim().startsWith('- '))
        .map(line => {
          let content = line.trim().substring(2);
          // Apply inline formatting
          content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
          content = content.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2">$1</a>');
          return `  <li>${content}</li>`;
        });
      return `<ul>\n${listItems.join('\n')}\n</ul>`;
    }
    
    // Ordered lists
    if (block.includes('\n1. ') || /^\d+\. /.test(block)) {
      const listItems = block.split('\n')
        .filter(line => /^\d+\. /.test(line.trim()))
        .map(line => {
          let content = line.trim().replace(/^\d+\. /, '');
          // Apply inline formatting
          content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
          content = content.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2">$1</a>');
          return `  <li>${content}</li>`;
        });
      return `<ol>\n${listItems.join('\n')}\n</ol>`;
    }
    
    // Regular paragraphs
    let content = block;
    // Apply inline formatting
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, '<a href="$2">$1</a>');
    
    return `<p>${content}</p>`;
  }).join('\n      ');
}

// Generate keywords array for structured data
function generateKeywordsArray(seoKeywords) {
  if (!seoKeywords) return '[]';
  
  const keywords = seoKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
  return JSON.stringify(keywords);
}

// Generate article tags for meta
function generateArticleTags(seoKeywords) {
  if (!seoKeywords) return '';
  
  const keywords = seoKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
  return keywords.slice(0, 5).map(keyword => 
    `  <meta property="article:tag" content="${keyword}" />`
  ).join('\n');
}

// Generate HTML template
function generateArticleHtml(articleData) {
  const contentHtml = markdownToHtml(articleData.content);
  const keywordsArray = generateKeywordsArray(articleData.seoKeywords);
  const articleTags = generateArticleTags(articleData.seoKeywords);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0366d6" />
  <title>${articleData.seoTitle} - Kevin Sundstrom</title>
  <meta name="description" content="${articleData.seoDescription || 'Expert insights and analysis from Kevin Sundstrom'}" />
  <meta name="keywords" content="${articleData.seoKeywords || ''}" />
  <meta name="author" content="${articleData.author}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://kevinsundstrom.com${articleData.url}" />
  
  <!-- Open Graph meta tags -->
  <meta property="og:title" content="${articleData.seoTitle}" />
  <meta property="og:description" content="${articleData.seoDescription || 'Expert insights and analysis from Kevin Sundstrom'}" />
  <meta property="og:url" content="https://kevinsundstrom.com${articleData.url}" />
  <meta property="og:type" content="article" />
  <meta property="article:author" content="${articleData.author}" />
  <meta property="article:published_time" content="${articleData.publishDate}" />
  <meta property="article:section" content="${articleData.category}" />
${articleTags}
  
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap" rel="stylesheet">
  
  <!-- Schema.org structured data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${articleData.title}",
    "description": "${articleData.seoDescription || 'Expert insights and analysis from Kevin Sundstrom'}",
    "author": {
      "@type": "Person",
      "name": "${articleData.author}",
      "url": "https://kevinsundstrom.com"
    },
    "publisher": {
      "@type": "Person",
      "name": "${articleData.author}",
      "url": "https://kevinsundstrom.com"
    },
    "datePublished": "${articleData.publishDate}",
    "dateModified": "${articleData.dateModified.split('T')[0]}",
    "mainEntityOfPage": "https://kevinsundstrom.com${articleData.url}",
    "url": "https://kevinsundstrom.com${articleData.url}",
    "articleSection": "${articleData.category}",
    "keywords": ${keywordsArray}
  }
  </script>
  
  <style>
    /* Page-specific styles for article - Substack-inspired design */
    body {
      font-family: 'Merriweather', Georgia, 'Times New Roman', serif;
      font-size: 18px;
      line-height: 1.6;
      color: #444444;
      background: #ffffff;
      margin: 0;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .article-content {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      padding-top: 4rem; /* Account for fixed navbar */
      flex: 1;
    }
    
    article {
      background: transparent;
      padding: 0;
      margin: 0;
    }
    
    .category-topic {
      color: #666;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .category-topic a {
      color: #0366d6;
      text-decoration: none;
    }
    
    .category-topic a:hover {
      text-decoration: underline;
    }
    
    h1 {
      font-size: 36px;
      font-weight: 700;
      text-align: left;
      margin: 1rem 0;
      line-height: 1.2;
      color: #333333;
    }
    
    h2 {
      font-size: 28px;
      font-weight: 700;
      margin: 2.5rem 0 1rem 0;
      line-height: 1.3;
      color: #333333;
    }
    
    h3 {
      font-size: 22px;
      font-weight: 700;
      margin: 2rem 0 1rem 0;
      line-height: 1.3;
      color: #333333;
    }
    
    p {
      margin-bottom: 1.5rem;
      color: #444444;
    }
    
    .meta {
      color: #666;
      font-size: 16px;
      text-align: left;
      margin-bottom: 3rem;
      font-style: italic;
    }
    
    ul, ol {
      margin: 1.5rem 0;
      padding-left: 2rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
    
    img {
      max-width: 100%;
      height: auto;
      margin: 2rem 0;
      display: block;
    }
    
    /* Navbar font override - maintain sans-serif as on other pages */
    .slim-navbar,
    .slim-navbar .nav-link,
    .slim-navbar .nav-name {
      font-family: system-ui, sans-serif !important;
    }
    
    /* Navbar hiding behavior */
    .slim-navbar {
      transition: transform 0.3s ease-in-out;
      will-change: transform;
    }
    
    .slim-navbar.hidden {
      transform: translateY(-100%);
    }
    
    @media (max-width: 768px) {
      .article-content {
        padding: 1.5rem;
        padding-top: 3.5rem; /* Account for fixed navbar on mobile */
        max-width: 100%;
      }
      
      h1 {
        font-size: 28px;
        margin: 2rem 0 1rem 0;
      }
      
      h2 {
        font-size: 24px;
      }
      
      h3 {
        font-size: 20px;
      }
      
      body {
        font-size: 16px;
      }
    }
  </style>
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
  <main class="article-content">
    <article>
      <div class="category-topic">
        <a href="/articles/${articleData.categorySlug}/">${articleData.category}</a>
      </div>
      <h1>${articleData.title}</h1>
      <div class="meta">By ${articleData.author} | ${new Date(articleData.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      ${contentHtml}
    </article>
  </main>
  
  <footer class="site-footer">
    <div class="copyright">© Kevin Sundstrom <span id="current-year"></span></div>
  </footer>
  
  <script>
    // Update copyright year
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Navbar hide/show on scroll behavior
    let lastScrollTop = 0;
    const navbar = document.querySelector('.slim-navbar');
    
    window.addEventListener('scroll', function() {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down and past 100px - hide navbar
        navbar.classList.add('hidden');
      } else {
        // Scrolling up - show navbar
        navbar.classList.remove('hidden');
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
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
  
  console.log('Generating article for:', articleData.title);
  console.log('Path:', articleData.fullPath);
  
  // Create directory structure
  const fullDir = path.join(process.cwd(), articleData.fullPath);
  fs.mkdirSync(fullDir, { recursive: true });
  
  // Generate and save HTML file
  const htmlContent = generateArticleHtml(articleData);
  const htmlPath = path.join(fullDir, 'index.html');
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log('Article generated successfully at:', htmlPath);
  
} catch (error) {
  console.error('Error generating article:', error);
  process.exit(1);
}