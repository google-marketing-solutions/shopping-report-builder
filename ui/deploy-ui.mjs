/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed    under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs-extra';
import path from 'path';

const cwd = process.cwd();
const uiDist = path.join(cwd, '../dist/ui');
const distDir = path.join(cwd, '../dist');

// Helper function to process and write file content
async function processAndWriteFile(filename, newPath, processContent) {
  try {
    const oldPath = path.join(uiDist, filename);
    const fileContent = fs.readFileSync(oldPath).toString();
    const processedContent = processContent(fileContent);
    fs.writeFileSync(newPath, processedContent);
  } catch (err) {
    console.error(`Error processing ${filename}:`, err);
  }
}

async function main() {
  try {
    console.log('Processing and moving UI files...');
    const files = fs
      .readdirSync(uiDist)
      .filter(
        (f) => f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.css'),
      );

    for (const filename of files) {
      const fileExt = path.extname(filename);
      const baseName = path.basename(filename, fileExt);
      let newName, newPath, processContent;

      switch (fileExt) {
        case '.html':
          newName = 'ui.html';
          newPath = path.join(distDir, newName);
          processContent = (content) => {
            const scriptRegex =
              /<script src="([^"]*).js" type="module"><\/script>/g;
            const cssRegex =
              /<link rel="stylesheet" href="([^"]*).css".*(?=<\/head>)/g;
            return content
              .replaceAll(scriptRegex, "<?!= include('$1'); ?>\n")
              .replaceAll(cssRegex, "\n<?!= include('$1'); ?>\n");
          };
          break;
        case '.js':
        case '.css':
          newName = `${baseName}.html`;
          newPath = path.join(distDir, newName);
          processContent = (content) =>
            fileExt === '.js'
              ? `<script type="text/javascript">\n${content}\n</script>`
              : `<style>\n${content}\n</style>`;
          break;
        default:
          console.warn(`Skipping unsupported file type: ${filename}`);
          continue;
      }

      await processAndWriteFile(filename, newPath, processContent);
      console.log(`Processed and moved: ${filename} to ${newName}`);
    }

    console.log('UI files processed and moved successfully!');
  } catch (err) {
    console.error('Error during deployment:', err);
  }
}

main();
