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
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Helper functions for the deployment of the HTML UI.
 * @see {@link https://developers.google.com/apps-script/guides/html/templates}
 */

/**
 * Serves the main HTML template for the web app.
 *
 * This function is the entry point for GET requests to the web app.
 *
 * @return {HtmlOutput} The evaluated HTML output.
 */
function doGet() {
  // @ts-ignore
  return HtmlService.createTemplateFromFile('ui').evaluate();
}

/**
 * Includes the content of a HTML file.
 *
 * This function facilitates the inclusion of external HTML files within the
 * main template. It reads the content of the specified file and returns it as a
 * string.
 *
 * @param {string} filename - The name of the HTML file to be included.
 * @return {string} The content of the specified HTML file.
 */
function include(filename: string) {
  // @ts-ignore
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
