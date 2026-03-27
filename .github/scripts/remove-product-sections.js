#!/usr/bin/env node

/**
 * Product Section Remover
 * 
 * Removes product listing sections from HTML files.
 * 
 * LIMITATIONS:
 * - Uses regex patterns which may not handle deeply nested or complex HTML perfectly
 * - For complex HTML structures, consider using a proper HTML parser
 * - Always use --dry-run first to preview changes
 * - Automatic backups are created for safety
 * 
 * Usage:
 *   node remove-product-sections.js <file-path> [--dry-run]
 * 
 * Options:
 *   --dry-run    Show what would be removed without actually modifying files
 */

const fs = require('fs');
const path = require('path');

// Patterns to match and remove
const REMOVAL_PATTERNS = [
  // Match entire sections/divs with product-related classes
  {
    name: 'Section with product class',
    regex: /<(section|div|aside)[^>]*class=["'][^"']*(?:product|tech-stack|tools-used)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi
  },
  // Match headings followed by lists that contain product keywords
  {
    name: 'Product heading with list',
    regex: /<h[1-6][^>]*>\s*(?:products?|technologies|tools)\s+(?:used|in|featured)[^<]*<\/h[1-6]>\s*<(?:ul|ol)[^>]*>[\s\S]*?<\/(?:ul|ol)>/gi
  },
  // Match divs that wrap product lists
  {
    name: 'Product wrapper div',
    regex: /<div[^>]*>\s*<h[1-6][^>]*>\s*(?:products?|technologies|tools)[^<]*<\/h[1-6]>[\s\S]*?<\/div>/gi
  }
];

function removeProductSections(content, dryRun = false) {
  let modified = content;
  const removals = [];

  REMOVAL_PATTERNS.forEach(pattern => {
    const matches = modified.match(pattern.regex);
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        removals.push({
          pattern: pattern.name,
          content: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
          length: match.length
        });
      });

      if (!dryRun) {
        modified = modified.replace(pattern.regex, '');
      }
    }
  });

  return {
    modified,
    removals,
    changed: removals.length > 0
  };
}

function processFile(filePath, dryRun = false) {
  console.log(`\n📄 Processing: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = removeProductSections(content, dryRun);

    if (!result.changed) {
      console.log('   ✅ No product sections found - file is clean');
      return { success: true, changed: false };
    }

    console.log(`   ⚠️  Found ${result.removals.length} product section(s) to remove:`);
    result.removals.forEach((removal, index) => {
      console.log(`      ${index + 1}. ${removal.pattern} (${removal.length} characters)`);
      console.log(`         Preview: ${removal.content}`);
    });

    if (dryRun) {
      console.log('   🔍 DRY RUN - No changes made');
      return { success: true, changed: true, dryRun: true };
    }

    // Create backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`   💾 Backup created: ${backupPath}`);

    // Write modified content
    fs.writeFileSync(filePath, result.modified, 'utf8');
    console.log('   ✅ Product sections removed successfully');

    return { success: true, changed: true, backup: backupPath };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('Product Section Remover');
    console.log('='.repeat(50));
    console.log();
    console.log('Usage:');
    console.log('  node remove-product-sections.js <file-path> [--dry-run]');
    console.log();
    console.log('Options:');
    console.log('  --dry-run    Show what would be removed without modifying files');
    console.log('  --help, -h   Show this help message');
    console.log();
    console.log('Examples:');
    console.log('  node remove-product-sections.js article/index.html');
    console.log('  node remove-product-sections.js article/index.html --dry-run');
    console.log();
    return;
  }

  const dryRun = args.includes('--dry-run');
  const filePath = args.find(arg => !arg.startsWith('--'));

  if (!filePath) {
    console.error('❌ Error: No file path provided');
    console.error('Usage: node remove-product-sections.js <file-path> [--dry-run]');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  console.log('🗑️  Product Section Remover');
  console.log('='.repeat(50));
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
  }

  const result = processFile(filePath, dryRun);

  console.log();
  console.log('='.repeat(50));
  
  if (result.success && result.changed) {
    if (dryRun) {
      console.log('✅ Analysis complete - product sections were found');
      console.log('   Remove --dry-run flag to actually remove them');
    } else {
      console.log('✅ Product sections removed successfully');
      console.log(`   Original file backed up to: ${result.backup}`);
      console.log('   You can restore it if needed by renaming the backup file');
    }
  } else if (result.success && !result.changed) {
    console.log('✅ File is clean - no product sections found');
  } else {
    console.log('❌ Operation failed');
    process.exit(1);
  }

  console.log();
}

if (require.main === module) {
  main();
}

module.exports = { removeProductSections, processFile };
