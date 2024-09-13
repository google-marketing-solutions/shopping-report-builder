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

import {
  exportMerchantCenterReport,
  getSheetColumnData,
  previewMerchantCenterReport,
} from '../api';
import {readColumnFromSheet, writeToGoogleSheet} from '../google-sheets';
import {MerchantCenterAPI} from '../merchant-center';
import {APIResponse} from '../models';
import {getOAuthToken} from '../utils';

jest.mock('../merchant-center');
jest.mock('../models');
jest.mock('../utils');
jest.mock('../google-sheets');

global.Logger = {
  log: jest.fn(),
} as any;

describe('API functions', () => {
  const mockMerchantCenterAPI = MerchantCenterAPI as jest.MockedClass<
    typeof MerchantCenterAPI
  >;
  const mockToken = 'mock_oauth_token';

  beforeEach(() => {
    mockMerchantCenterAPI.mockClear();
    (getOAuthToken as jest.Mock).mockReturnValue(mockToken);
  });

  it('previewMerchantCenterReport() should fetch and flatten preview data', () => {
    const mockQuery = 'SELECT product_view.title FROM ProductView';
    const mockMerchantId = 123456789;
    const mockResponse = [
      {
        productView: {
          title: 'Product 1',
        },
      },
      {
        productView: {
          title: 'Product 2',
        },
      },
    ];
    const mockFlattenedResponse = [
      {
        'productView.title': 'Product 1',
      },
      {
        'productView.title': 'Product 2',
      },
    ];

    mockMerchantCenterAPI.prototype.getReport.mockReturnValue(mockResponse);
    mockMerchantCenterAPI.prototype.flatten.mockReturnValue(
      mockFlattenedResponse,
    );

    const result: APIResponse = previewMerchantCenterReport(
      mockQuery,
      mockMerchantId,
    );

    expect(result).toEqual({
      success: true,
      data: mockFlattenedResponse,
    });
  });

  it('previewMerchantCenterReport() should handle errors and return an APIResponse with an error message', () => {
    const mockQuery = 'SELECT product_view.title FROM ProductView';
    const mockMerchantId = 123456789;
    const mockError = new Error('Some API error');

    mockMerchantCenterAPI.prototype.getReport.mockImplementation(() => {
      throw mockError;
    });

    const result: APIResponse = previewMerchantCenterReport(
      mockQuery,
      mockMerchantId,
    );

    expect(Logger.log).toHaveBeenCalledWith(
      `Error fetching preview data: ${mockError}`,
    );
    expect(result).toEqual({
      success: false,
      message: `Error fetching preview data: ${mockError}`,
    });
  });

  it('exportMerchantCenterReport() should fetch, flatten, and export data to Google Sheet', () => {
    const mockQuery = 'SELECT offer_view.title FROM OfferView';
    const mockMerchantId = 987654321;
    const mockSheetName = 'Export Sheet';
    const mockResponse = [
      {
        offerView: {
          title: 'Offer 1',
        },
      },
    ];
    const mockFlattenedResponse = [
      {
        'offerView.title': 'Offer 1',
      },
    ];

    mockMerchantCenterAPI.prototype.getReport.mockReturnValue(mockResponse);
    mockMerchantCenterAPI.prototype.flatten.mockReturnValue(
      mockFlattenedResponse,
    );

    const result: APIResponse = exportMerchantCenterReport(
      mockQuery,
      mockMerchantId,
      mockSheetName,
    );

    expect(mockMerchantCenterAPI.prototype.getReport).toHaveBeenCalledWith({
      merchantId: mockMerchantId,
      fetchAll: true,
      payload: {
        query: mockQuery,
        pageSize: 1000,
      },
    });
    expect(mockMerchantCenterAPI.prototype.flatten).toHaveBeenCalledWith(
      mockResponse,
    );
    expect(writeToGoogleSheet).toHaveBeenCalledWith(
      mockFlattenedResponse,
      mockSheetName,
    );
    expect(result).toEqual({success: true});
  });

  it('exportMerchantCenterReport() should handle errors and return an APIResponse with an error message', () => {
    const mockQuery = 'SELECT offer_view.title FROM OfferView';
    const mockMerchantId = 987654321;
    const mockSheetName = 'Export Sheet';
    const mockError = new Error('Some API error');

    mockMerchantCenterAPI.prototype.getReport.mockImplementation(() => {
      throw mockError;
    });

    const result: APIResponse = exportMerchantCenterReport(
      mockQuery,
      mockMerchantId,
      mockSheetName,
    );

    expect(Logger.log).toHaveBeenCalledWith(
      `Error exporting data: ${mockError}`,
    );
    expect(result).toEqual({
      success: false,
      message: `Error exporting data: ${mockError}`,
    });
  });

  it('getSheetColumnData() should fetch data from a sheet and return it in the APIResponse', () => {
    const mockSheetName = 'Test Sheet';
    const mockColumnIndex = 2;
    const mockColumnData = ['value1', 'value2', 'value3'];

    (readColumnFromSheet as jest.Mock).mockReturnValue(mockColumnData);

    const result: APIResponse = getSheetColumnData(
      mockSheetName,
      mockColumnIndex,
    );

    expect(readColumnFromSheet).toHaveBeenCalledWith(
      mockSheetName,
      mockColumnIndex,
    );
    expect(result).toEqual({
      success: true,
      data: mockColumnData,
    });
  });
});
