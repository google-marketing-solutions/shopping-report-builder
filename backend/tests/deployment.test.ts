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
import {doGet, include} from '../deployment';

global.HtmlService = {
  createTemplateFromFile: (filename: string) => ({
    evaluate: () =>
      ({
        getContent: () => 'Mocked HTML content',
      }) as GoogleAppsScript.HTML.HtmlOutput,
  }),
  createHtmlOutputFromFile: (filename: string) =>
    ({
      getContent: () => `Mocked content of ${filename}`,
    }) as GoogleAppsScript.HTML.HtmlOutput,
} as any;

describe('doGet', () => {
  it('should return an HtmlOutput object with the evaluated template', () => {
    const output = doGet();
    expect(output.getContent()).toBe('Mocked HTML content');
  });
});

describe('include', () => {
  it('should return the content of the specified HTML file', () => {
    const filename = 'test.html';
    const expectedContent = `Mocked content of ${filename}`;
    const content = include(filename);
    expect(content).toBe(expectedContent);
  });
});
