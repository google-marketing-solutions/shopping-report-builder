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

import {MerchantCenterAPI} from '../merchant-center';
import {MerchantCenterAPIRequest, MerchantCenterAPIResponse} from '../models';

global.UrlFetchApp = {
  fetch: jest.fn(),
} as any;

global.Logger = {
  log: jest.fn(),
} as any;

describe('MerchantCenterAPI', () => {
  let api: MerchantCenterAPI;

  beforeEach(() => {
    api = new MerchantCenterAPI('mock_token');
  });

  it('should build a MerchantCenterAPIRequest object with no payload', () => {
    const service = 'products';
    const method = 'get';
    const expectedRequest: MerchantCenterAPIRequest = {
      url: api.url + service,
      method,
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + api.token,
      },
      muteHttpExceptions: true,
    };

    const request = api.buildMerchantCenterAPIRequest(service, method);
    expect(request).toEqual(expectedRequest);
  });

  it('should build a MerchantCenterAPIRequest object with a payload', () => {
    const service = 'products/insert';
    const method = 'post';
    const payload = {
      offerId: '12345',
      title: 'Test Product',
    };
    const expectedRequest: MerchantCenterAPIRequest = {
      url: api.url + service,
      method,
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + api.token,
      },
      muteHttpExceptions: true,
      payload: JSON.stringify(payload),
    };

    const request = api.buildMerchantCenterAPIRequest(service, method, payload);
    expect(request).toEqual(expectedRequest);
  });

  it('should handle API errors and throw an error with the error message', () => {
    const mockRequest: MerchantCenterAPIRequest = {
      url: 'https://shoppingcontent.googleapis.com/content/v2.1/1234/reports/search',
      method: 'get',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer mock_token',
      },
      muteHttpExceptions: true,
    };

    const mockErrorResponse = {
      error: {
        code: 400,
        message:
          "[query] Error in query",
        status: 'INVALID_ARGUMENT',
        details: [
          {
            '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
            reason: 'invalid',
            domain: 'global',
          },
        ],
      },
    };

    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getContentText: () => JSON.stringify(mockErrorResponse),
    });

    expect(() => {
      api.call(mockRequest);
    }).toThrowError(mockErrorResponse.error.message);
  });

  it('should make a call to the Merchant Center API', () => {
    const mockRequest: MerchantCenterAPIRequest = {
      url: 'https://shoppingcontent.googleapis.com/content/v2.1/1234/reports/search',
      method: 'get',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer mock_token',
      },
      muteHttpExceptions: true,
    };

    const mockResponse: MerchantCenterAPIResponse = {
      results: [
        {
          'productView': {
            'offerId': '10000',
            'clickPotentialRank': '100',
            'id': 'local:en:GB:10000',
          },
        },
      ],
    };

    // Mock the UrlFetchApp.fetch method
    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getContentText: () => JSON.stringify(mockResponse),
    });

    const response = api.call(mockRequest);

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(mockRequest.url, {
      method: mockRequest.method,
      contentType: mockRequest.contentType,
      headers: mockRequest.headers,
      muteHttpExceptions: mockRequest.muteHttpExceptions,
    });
    expect(response).toEqual(mockResponse);
  });
});
