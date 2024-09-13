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
function writeToGoogleSheet(data: any[], sheetName: string) {
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

/**
 * Fetches values from a column, skipping the header row.
 *
 * @param {string} sheetName - The name of the sheet.
 * @param {number} columnIndex - The column to read (1-based index).
 * @returns {any[] | null} An array of values from the specified column, or null
 *   if the sheet is not found.
 */
function readColumnFromSheet(
  sheetName: string,
  columnIndex: number,
): any[] | null {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      Logger.log(`Sheet not found: ${sheetName}`);
      return null;
    }

    const lastRow = sheet.getLastRow();
    // empty sheet
    if (lastRow <= 1) return [];

    // Start from row 2 for header
    const values = sheet.getRange(2, columnIndex, lastRow - 1, 1).getValues();
    return values.map((row) => row[0]);
  } catch (error) {
    Logger.log(
      `Error reading from sheet ${sheetName}, column ${columnIndex}: ${error}`,
    );
    return null;
  }
}

export { writeToGoogleSheet, readColumnFromSheet };