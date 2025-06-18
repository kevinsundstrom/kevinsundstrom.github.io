const fs = require('fs');
const path = require('path');

// Issue 66 content as recorded in GitHub
const issue66Content = `Content strategy is a lot more nuanced than people believe. It's psychology and poetry, mixed with a tiny dash of calculus. If all that weren't complicated enough, it can't be executed in a silo—it's collaborative in nature. So consensus building is vital: you need other people to believe in your strategy so deeply that it influences the words that land on the page. When done well, you arrive at a draft that feels whole and connected.

But then, as always, stakeholders arrive. They operate on feeling and a sense of entitlement. Their gut is more powerful than your mind. Oh well, let's ship to learn, and then trust their gut next time anyway.`;

// Extract current article content from HTML
function extractCurrentArticleContent() {
  const articlePath = path.join(process.cwd(), 'articles/content-strategy/content-strategy-is-collaboration-not-control/index.html');
  
  if (!fs.existsSync(articlePath)) {
    throw new Error('Article not found at expected path');
  }
  
  const htmlContent = fs.readFileSync(articlePath, 'utf8');
  
  // Extract content from within the article tags, after the meta div
  const articleMatch = htmlContent.match(/<article[^>]*>\s*(?:<div class="category-topic">.*?<\/div>\s*)?(?:<h1[^>]*>.*?<\/h1>\s*)?(?:<div class="meta">.*?<\/div>\s*)?(.*?)\s*<\/article>/s);
  
  if (!articleMatch) {
    throw new Error('Could not extract article content from HTML');
  }
  
  let contentHtml = articleMatch[1].trim();
  
  // Convert HTML back to plain text for comparison
  let plainText = contentHtml;
  
  // Remove HTML tags but preserve paragraph breaks
  plainText = plainText.replace(/<p[^>]*>/g, '');
  plainText = plainText.replace(/<\/p>/g, '\n\n');
  plainText = plainText.replace(/<[^>]+>/g, '');
  
  // Clean up extra whitespace
  plainText = plainText.replace(/\n\s*\n\s*\n+/g, '\n\n');
  plainText = plainText.trim();
  
  return plainText;
}

// Compare the content
function compareContent() {
  console.log('='.repeat(80));
  console.log('ISSUE 66 CONTENT ANALYSIS');
  console.log('='.repeat(80));
  
  const currentContent = extractCurrentArticleContent();
  
  console.log('\n1. CONTENT REQUESTED IN ISSUE 66:');
  console.log('-'.repeat(50));
  console.log(issue66Content);
  
  console.log('\n2. CURRENT ARTICLE CONTENT:');
  console.log('-'.repeat(50));
  console.log(currentContent);
  
  console.log('\n3. ANALYSIS:');
  console.log('-'.repeat(50));
  
  // Normalize whitespace for comparison
  const issue66Normalized = issue66Content.trim().replace(/\s+/g, ' ');
  const currentNormalized = currentContent.trim().replace(/\s+/g, ' ');
  
  if (currentNormalized === issue66Normalized) {
    console.log('✅ EXACT MATCH: Current content exactly matches issue 66 request');
  } else if (currentNormalized.includes(issue66Normalized)) {
    console.log('⚠️  PARTIAL MATCH: Issue 66 content is present but there is additional content');
    
    // Find the additional content
    const additionalContent = currentNormalized.replace(issue66Normalized, '').trim();
    if (additionalContent) {
      console.log('\nADDITIONAL CONTENT FOUND:');
      console.log('------------------------');
      console.log(additionalContent);
    }
  } else {
    console.log('❌ NO MATCH: Current content does not match issue 66 request');
    
    // Try to find common parts
    const issue66Lines = issue66Normalized.split('\n\n');
    const currentLines = currentNormalized.split('\n\n');
    
    console.log('\nPARAGRAPH-BY-PARAGRAPH COMPARISON:');
    console.log('----------------------------------');
    
    issue66Lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (currentLines.some(currentLine => currentLine.trim() === trimmedLine)) {
        console.log(`✅ Paragraph ${index + 1}: PRESENT`);
      } else {
        console.log(`❌ Paragraph ${index + 1}: MISSING or MODIFIED`);
        console.log(`   Requested: "${trimmedLine.substring(0, 100)}..."`);
      }
    });
  }
  
  console.log('\n4. CONCLUSION:');
  console.log('-'.repeat(50));
  
  const issue66NormalizedForCheck = issue66Content.trim().replace(/\s+/g, ' ');
  const currentNormalizedForCheck = currentContent.trim().replace(/\s+/g, ' ');
  
  if (currentNormalizedForCheck.includes(issue66NormalizedForCheck)) {
    console.log('✅ YES - Issue 66 DID change the article body text.');
    console.log('The content specified in issue 66 is present in the current article.');
    if (currentNormalizedForCheck !== issue66NormalizedForCheck) {
      console.log('\n⚠️  However, there is additional content beyond what was specified in issue 66.');
      console.log('This suggests either:');
      console.log('  a) The automation preserved some original content that wasn\'t replaced');
      console.log('  b) Additional content was added manually after issue 66 processing');  
      console.log('  c) The edit was designed to add to existing content, not replace it entirely');
    } else {
      console.log('The content matches exactly what was requested in issue 66.');
    }
  } else {
    console.log('❌ NO - Issue 66 may have attempted to change the article body text, but the current');
    console.log('content does not match what was requested in the issue.');
  }
  
  console.log('\n' + '='.repeat(80));
}

// Run the analysis
try {
  compareContent();
} catch (error) {
  console.error('Error analyzing issue 66:', error.message);
  process.exit(1);
}