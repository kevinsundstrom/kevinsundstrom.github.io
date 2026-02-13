#!/usr/bin/env node

/**
 * Product Section Detector
 * 
 * Scans HTML files for product listing sections similar to those found
 * on GitHub customer story pages.
 * 
 * Usage:
 *   node detect-product-sections.js [path]
 * 
 * If no path is provided, scans all HTML files in the repository.
 */

const fs = require('fs');
const path = require('path');

// Patterns that indicate a product listing section
const PATTERNS = {
  classNames: [
    'product-list',
    'products-used',
    'products-section',
    'tech-stack',
    'technologies',
    'tools-used',
    'featured-tools',
    'related-products',
    'featured-products'
  ],
  headings: [
    'products used',
    'technologies used',
    'tools used',
    'products in this story',
    'featured products',
    'related tools',
    'tech stack'
  ],
  tagPatterns: [
    /class=["'][^"']*product[^"']*["']/gi,
    /class=["'][^"']*tech[^"']*stack[^"']*["']/gi,
    /class=["'][^"']*tools?[^"']*used[^"']*["']/gi
  ]
};

function findProductSections(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const findings = [];

    // Check for class names
    PATTERNS.classNames.forEach(className => {
      const regex = new RegExp(`class=["'][^"']*${className}[^"']*["']`, 'gi');
      if (regex.test(content)) {
        findings.push({
          type: 'class',
          value: className,
          description: `Found class name: "${className}"`
        });
      }
    });

    // Check for headings
    PATTERNS.headings.forEach(heading => {
      const regex = new RegExp(`<h[1-6][^>]*>\\s*${heading}\\s*</h[1-6]>`, 'gi');
      if (regex.test(content)) {
        findings.push({
          type: 'heading',
          value: heading,
          description: `Found heading: "${heading}"`
        });
      }
    });

    // Check for pattern matches
    PATTERNS.tagPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        findings.push({
          type: 'pattern',
          value: matches[0],
          description: `Found pattern match: ${matches[0].substring(0, 50)}...`
        });
      }
    });

    return findings;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return [];
  }
}

function scanDirectory(dirPath, results = []) {
  try {
    const items = fs.readdirSync(dirPath);

    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      // Skip node_modules and .git directories
      if (item === 'node_modules' || item === '.git' || item === '.github') {
        return;
      }

      if (stat.isDirectory()) {
        scanDirectory(fullPath, results);
      } else if (item.endsWith('.html')) {
        const findings = findProductSections(fullPath);
        if (findings.length > 0) {
          results.push({
            file: fullPath,
            findings: findings
          });
        }
      }
    });

    return results;
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error.message);
    return results;
  }
}

function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || process.cwd();

  console.log('🔍 Product Section Detector');
  console.log('='.repeat(50));
  console.log();

  const stat = fs.statSync(targetPath);
  let results = [];

  if (stat.isFile()) {
    console.log(`Scanning file: ${targetPath}\n`);
    const findings = findProductSections(targetPath);
    if (findings.length > 0) {
      results.push({ file: targetPath, findings });
    }
  } else {
    console.log(`Scanning directory: ${targetPath}\n`);
    results = scanDirectory(targetPath);
  }

  if (results.length === 0) {
    console.log('✅ No product sections found!');
    console.log();
    console.log('This is good news - your pages do not have product listing sections.');
  } else {
    console.log(`⚠️  Found product sections in ${results.length} file(s):\n`);
    
    results.forEach(result => {
      console.log(`📄 ${result.file}`);
      result.findings.forEach(finding => {
        console.log(`   • ${finding.description}`);
      });
      console.log();
    });

    console.log('To remove these sections:');
    console.log('1. Manually edit the HTML files and remove the identified sections');
    console.log('2. Or add CSS rules to hide them: .product-list { display: none; }');
    console.log('3. Or use: node remove-product-sections.js <file-path>');
  }

  console.log();
  console.log('For more information, see: REMOVING_PRODUCT_SECTIONS.md');
  console.log();

  process.exit(results.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { findProductSections, scanDirectory };
