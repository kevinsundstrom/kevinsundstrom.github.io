# How to Remove Product Listing Sections from Pages

## Overview

This guide explains how to identify and remove "Products used" or similar product listing sections from web pages, similar to those found on GitHub customer story pages.

## What Are Product Listing Sections?

Product listing sections typically appear at the end of case studies or customer stories. They usually include:
- A heading like "Products used in this story" or "Technologies used"
- A list of product names with links
- Product logos or icons
- Brief descriptions of each product

Example from GitHub customer stories:
```html
<div class="product-list">
  <h2>Products used in this story</h2>
  <ul>
    <li><a href="/features/actions">GitHub Actions</a></li>
    <li><a href="/features/copilot">GitHub Copilot</a></li>
    <li><a href="/enterprise">GitHub Enterprise</a></li>
  </ul>
</div>
```

## Methods to Remove Product Sections

### Method 1: CSS-Based Hiding

If you want to keep the HTML but hide the section visually:

```css
/* Hide product listing sections */
.product-list,
.products-used,
.technologies-used,
[class*="product-section"] {
  display: none !important;
}
```

### Method 2: Remove from HTML

To completely remove these sections from your HTML files:

1. **Identify the section** - Look for common patterns:
   - Class names containing "product", "tool", "technology"
   - Sections near the end of articles
   - Lists with external product links

2. **Delete the HTML** - Remove the entire section block:
   ```html
   <!-- DELETE THIS ENTIRE BLOCK -->
   <section class="products-used">
     <h2>Products used</h2>
     <ul>...</ul>
   </section>
   ```

### Method 3: Template-Based Prevention

If you're using templates to generate pages, modify the template:

```javascript
// Don't include product sections in article generation
function generateArticle(data) {
  return `
    <article>
      <h1>${data.title}</h1>
      <div class="content">${data.content}</div>
      <!-- Do NOT add product listings here -->
    </article>
  `;
}
```

## Automated Detection Script

Use the provided utility script to scan for and optionally remove product sections:

```bash
# Scan all HTML files for product sections
node .github/scripts/detect-product-sections.js

# Remove product sections from specific file
node .github/scripts/remove-product-sections.js path/to/file.html

# Preview changes without modifying (recommended first step)
node .github/scripts/remove-product-sections.js path/to/file.html --dry-run
```

**Note**: The removal script uses regex patterns which work well for most cases but may have limitations with deeply nested or complex HTML. Always use `--dry-run` first to preview changes, and backups are automatically created for safety.

## Common Patterns to Look For

### HTML Patterns
- `<div class="product-*">` or `<section class="product-*">`
- Headings containing: "Products", "Tools", "Technologies", "Used in"
- Lists of links near the end of content
- Divs with class names like: `featured-products`, `tech-stack`, `tools-used`

### CSS Class Names
- `.product-list`, `.products-used`, `.products-section`
- `.tech-stack`, `.technologies`, `.tools-used`
- `.featured-tools`, `.related-products`

## Site-Specific Implementation

For **kevinsundstrom.github.io**:

This site currently does not have product listing sections. To prevent them from being added:

1. **Article Template** - The article generation script (`generate-article.js`) does not include product sections
2. **CSS Protection** - Add defensive CSS rules to `styles.css`:
   ```css
   /* Prevent accidental product sections */
   .product-list, .products-used { display: none; }
   ```

3. **Template Validation** - Update `generate-article.js` to ensure no product sections are added

## Best Practices

1. **Content Strategy**: Decide whether product sections add value to your content
2. **Consistency**: If removing, remove from all pages or none
3. **SEO Impact**: Consider that removing product links may affect internal linking
4. **User Experience**: Ensure alternative navigation exists if products were linked elsewhere

## Why Remove Product Sections?

Reasons to remove product listing sections:
- **Content Focus**: Keep readers focused on the story/article content
- **Clean Design**: Maintain a minimal, distraction-free layout
- **Simplicity**: Reduce page complexity
- **Brand Control**: Avoid promoting specific products/tools

## Related Files

- `/styles.css` - Site-wide CSS where hiding rules can be added
- `.github/scripts/generate-article.js` - Article generation template
- `/articles/*/index.html` - Individual article pages

## Testing

After removing product sections:

1. **Visual Check**: Browse all affected pages
2. **Link Check**: Ensure no broken internal links
3. **Mobile Test**: Verify layout on mobile devices
4. **SEO Validation**: Check that removal doesn't hurt SEO

## Examples

### Before (with product section):
```html
<article>
  <h1>My Article</h1>
  <p>Content here...</p>
  
  <section class="products-used">
    <h2>Products used in this story</h2>
    <ul>
      <li><a href="/product1">Product 1</a></li>
      <li><a href="/product2">Product 2</a></li>
    </ul>
  </section>
</article>
```

### After (product section removed):
```html
<article>
  <h1>My Article</h1>
  <p>Content here...</p>
</article>
```

## Need Help?

If you encounter product sections in unexpected places or need help identifying them, use the detection script or manually search for common keywords in your HTML files.
