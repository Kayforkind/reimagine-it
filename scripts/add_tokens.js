const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'generate.js');
let content = fs.readFileSync(filePath, 'utf8');

// Read the new functions from a separate file
const newFunctions = fs.readFileSync(path.join(__dirname, 'new_tokens.js'), 'utf8');

content = content.replace(
  'var generateApi = { generate: generate, TOKENS: TOKENS, TOKEN_DESCRIPTIONS: TOKEN_DESCRIPTIONS };',
  newFunctions + '\n\nvar generateApi = { generate: generate, TOKENS: TOKENS, TOKEN_DESCRIPTIONS: TOKEN_DESCRIPTIONS };'
);

fs.writeFileSync(filePath, content);
console.log('New generator functions added successfully');
