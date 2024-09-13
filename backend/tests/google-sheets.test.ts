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

import {readColumnFromSheet, writeToGoogleSheet} from '../google-sheets';

global.SpreadsheetApp = {
  getActiveSpreadsheet: jest.fn().mockReturnValue({
    getSheetByName: jest.fn(),
    insertSheet: jest.fn(),
  }),
} as any;

global.Logger = {
  log: jest.fn(),
} as any;

describe('Google Sheets functions', () => {
  const mockSpreadsheet = {
    getSheetByName: jest.fn(),
    insertSheet: jest.fn().mockReturnValue({
      appendRow: jest.fn(),
      getLastRow: jest.fn().mockReturnValue(1),
      getRange: jest.fn().mockReturnValue({
        setValues: jest.fn(),
      }),
    }),
  };
  (SpreadsheetApp.getActiveSpreadsheet as jest.Mock).mockReturnValue(
    mockSpreadsheet,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writeToGoogleSheet() should write data to an existing sheet', () => {
    const mockData = [
      {'Column 1': 'Value 1', 'Column 2': 'Value 2'},
      {'Column 1': 'Value 3', 'Column 2': 'Value 4'},
    ];
    const mockSheetName = 'Existing Sheet';
    const mockSheet = {
      appendRow: jest.fn(),
      getLastRow: jest.fn().mockReturnValue(1),
      getRange: jest.fn().mockReturnValue({
        setValues: jest.fn(),
      }),
    };
    mockSpreadsheet.getSheetByName.mockReturnValue(mockSheet);

    writeToGoogleSheet(mockData, mockSheetName);

    expect(SpreadsheetApp.getActiveSpreadsheet).toHaveBeenCalled();
    expect(mockSpreadsheet.getSheetByName).toHaveBeenCalledWith(mockSheetName);
    expect(mockSpreadsheet.insertSheet).not.toHaveBeenCalled();
    expect(mockSheet.appendRow).toHaveBeenCalledWith(['Column 1', 'Column 2']);
    expect(mockSheet.getRange(2, 1, 2, 2).setValues).toHaveBeenCalledWith([
      ['Value 1', 'Value 2'],
      ['Value 3', 'Value 4'],
    ]);
  });

  it('writeToGoogleSheet() should create a new sheet if it doesnt exist', () => {
    const mockData = [
      {'Column A': 'Value A', 'Column B': 'Value B'},
      {'Column A': 'Value C', 'Column B': 'Value D'},
    ];
    const mockSheetName = 'New Sheet';
    mockSpreadsheet.getSheetByName.mockReturnValue(null);

    writeToGoogleSheet(mockData, mockSheetName);

    expect(SpreadsheetApp.getActiveSpreadsheet).toHaveBeenCalled();
    expect(mockSpreadsheet.insertSheet).toHaveBeenCalledWith(mockSheetName);
    expect(
      mockSpreadsheet.insertSheet(mockSheetName).appendRow,
    ).toHaveBeenCalledWith(['Column A', 'Column B']);
    expect(
      mockSpreadsheet.insertSheet(mockSheetName).getRange(2, 1, 2, 2).setValues,
    ).toHaveBeenCalledWith([
      ['Value A', 'Value B'],
      ['Value C', 'Value D'],
    ]);
  });

  it('writeToGoogleSheet() should handle empty data', () => {
    const mockData: any[] = [];
    const mockSheetName = 'Some Sheet';

    writeToGoogleSheet(mockData, mockSheetName);
    expect(Logger.log).toHaveBeenCalledWith('No data to write.');
  });

  it('readColumnFromSheet() should read data from a sheet and skip the header row', () => {
    const mockSheetName = 'Data Sheet';
    const mockSheet = {
      getLastRow: jest.fn().mockReturnValue(3),
      getRange: jest.fn().mockReturnValue({
        getValues: jest.fn().mockReturnValue([
          ['value1', 'value2'],
          ['value3', 'value4'],
        ]),
      }),
    };
    const columnIndex = 1;
    mockSpreadsheet.getSheetByName.mockReturnValue(mockSheet);

    const data = readColumnFromSheet(mockSheetName, columnIndex);

    expect(SpreadsheetApp.getActiveSpreadsheet).toHaveBeenCalled();
    expect(mockSpreadsheet.getSheetByName).toHaveBeenCalledWith(mockSheetName);
    expect(data).toEqual(['value1', 'value3']);
  });
});
