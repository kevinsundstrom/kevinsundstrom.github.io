# kevinsundstrom.github.io
My Copilot coding agent tinkering exposed publicly. 

I'll also be publishing my thought on using AI in large-scale marketing organizations.

## Utilities

### Product Section Management
Tools to identify and remove product listing sections from pages:

- **Detect Product Sections**: `node .github/scripts/detect-product-sections.js`
- **Remove Product Sections**: `node .github/scripts/remove-product-sections.js <file>`
- **Documentation**: See [REMOVING_PRODUCT_SECTIONS.md](REMOVING_PRODUCT_SECTIONS.md)

The site includes defensive CSS rules that automatically hide any product listing sections, even if they're accidentally added to HTML. 
