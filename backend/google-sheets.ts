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
 * @fileoverview Helper functions for working with Google Sheets.
 */

/**
 * Writes data to a Google Sheet.
 *
 * @param {any[]} data - An array of objects representing the data.
 * @param {string} sheetName - The name of the sheet.
 */
export function writeToGoogleSheet(data: any[], sheetName: string) {
  Logger.log(`writeToGoogleSheet() in ${sheetName}`);
  if (data.length === 0) {
    Logger.log('No data to write.');
    return;
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  const headers = Object.keys(data[0]);
  sheet.appendRow(headers);
  const values = data.map((row) => headers.map((header) => row[header]));
  sheet
    .getRange(sheet.getLastRow() + 1, 1, values.length, values[0].length)
    .setValues(values);
}
