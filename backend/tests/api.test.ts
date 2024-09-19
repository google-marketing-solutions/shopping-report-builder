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

import {previewMerchantCenterReport} from '../api';
import {MerchantCenterAPI} from '../merchant-center';
import {getOAuthToken} from '../utils';

jest.mock('../merchant-center');
jest.mock('../utils');

global.Logger = {
  log: jest.fn(),
} as any;

describe('API functions', () => {
  const mockMerchantCenterAPI = jest.mocked(MerchantCenterAPI, {
    shallow: false,
  });
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

    const previewData = previewMerchantCenterReport(mockQuery, mockMerchantId);

    expect(getOAuthToken).toHaveBeenCalled();
    expect(MerchantCenterAPI).toHaveBeenCalledWith(mockToken);
    expect(mockMerchantCenterAPI.prototype.getReport).toHaveBeenCalledWith({
      merchantId: mockMerchantId,
      fetchAll: false,
      payload: {
        query: mockQuery,
        pageSize: 10,
      },
    });
    expect(mockMerchantCenterAPI.prototype.flatten).toHaveBeenCalledWith(
      mockResponse,
    );
    expect(previewData).toEqual(mockFlattenedResponse);
  });
});
