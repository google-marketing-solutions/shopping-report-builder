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

import {MerchantCenterAPI} from '../merchant-center';
import {
  MerchantCenterAPIReportRequest,
  MerchantCenterAPIRequest,
  MerchantCenterAPIResponse,
} from '../models';

global.UrlFetchApp = {
  fetch: jest.fn(),
} as any;

global.Logger = {
  log: jest.fn(),
} as any;

global.Utilities = {
  sleep: jest.fn(),
} as any;

describe('MerchantCenterAPI', () => {
  let api: MerchantCenterAPI;
  let mockMerchantCenterAPIRequest: MerchantCenterAPIRequest;
  let mockMerchantCenterAPIResponse: MerchantCenterAPIResponse;
  let mockMerchantCenterAPIReportRequest: MerchantCenterAPIReportRequest;

  beforeEach(() => {
    api = new MerchantCenterAPI('mock_token');
    mockMerchantCenterAPIRequest = {
      url: 'https://shoppingcontent.googleapis.com/content/v2.1/1234/reports/search',
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer mock_token',
      },
      muteHttpExceptions: true,
    };
    mockMerchantCenterAPIReportRequest = {
      merchantId: 123456789,
      fetchAll: false,
      payload: {
        query:
          'SELECT ' +
          'product_view.id, ' +
          'product_view.title, ' +
          'price_competitiveness.country_code ' +
          'FROM PriceCompetitivenessProductView',
        pageSize: 10,
      },
    };
    mockMerchantCenterAPIResponse = {
      results: [
        {
          productView: {
            title: 'Generic Product A (XXXXX1)',
            id: 'XXXXX1',
          },
          priceCompetitiveness: {
            countryCode: 'GBP',
          },
        },
      ],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('buildMerchantCenterAPIRequest() should build a MerchantCenterAPIRequest object with no payload', () => {
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

  it('buildMerchantCenterAPIRequest() should build a MerchantCenterAPIRequest object with a payload', () => {
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
      payload: payload,
    };

    const request = api.buildMerchantCenterAPIRequest(service, method, payload);
    expect(request).toEqual(expectedRequest);
  });

  it('call() should handle API errors and throw an error with the error message', () => {
    const mockErrorResponse = {
      error: {
        code: 400,
        message: '[query] Error in query',
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
      api.call(mockMerchantCenterAPIRequest);
    }).toThrowError(mockErrorResponse.error.message);
  });

  it('call() should make a call to the Merchant Center API', () => {
    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getContentText: () => JSON.stringify(mockMerchantCenterAPIResponse),
    });

    mockMerchantCenterAPIRequest.payload = {
      query: 'SELECT 1 FROM 2',
      pageSize: 10,
    };

    const response = api.call(mockMerchantCenterAPIRequest);

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      mockMerchantCenterAPIRequest.url,
      {
        method: mockMerchantCenterAPIRequest.method,
        contentType: mockMerchantCenterAPIRequest.contentType,
        headers: mockMerchantCenterAPIRequest.headers,
        muteHttpExceptions: mockMerchantCenterAPIRequest.muteHttpExceptions,
        payload: JSON.stringify(mockMerchantCenterAPIRequest.payload),
      },
    );
    expect(response).toEqual(mockMerchantCenterAPIResponse);
  });

  it('call() should retry with exponential backoff on failure', () => {
    const mockErrorResponse = {
      error: {
        code: 500,
        message: 'Internal server error',
      },
    };

    // Simulate API error for the first 3 calls, then success
    (UrlFetchApp.fetch as jest.Mock)
      .mockReturnValueOnce({
        getContentText: () => JSON.stringify(mockErrorResponse),
      })
      .mockReturnValueOnce({
        getContentText: () => JSON.stringify(mockErrorResponse),
      })
      .mockReturnValueOnce({
        getContentText: () => JSON.stringify(mockErrorResponse),
      })
      .mockReturnValue({
        getContentText: () => JSON.stringify(mockMerchantCenterAPIResponse),
      });

    const response = api.call(mockMerchantCenterAPIRequest);

    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
    expect(Utilities.sleep).toHaveBeenCalledWith(1000);
    expect(Utilities.sleep).toHaveBeenCalledWith(2000);
    expect(Utilities.sleep).toHaveBeenCalledWith(4000);
    expect(response).toEqual(mockMerchantCenterAPIResponse);
  });

  it('call() should throw an error after max retries', () => {
    const mockErrorResponse = {
      error: {
        code: 500,
        message: 'Internal server error',
      },
    };

    // Simulate API error for all calls
    (UrlFetchApp.fetch as jest.Mock).mockReturnValue({
      getContentText: () => JSON.stringify(mockErrorResponse),
    });

    expect(() => {
      api.call(mockMerchantCenterAPIRequest, 3);
    }).toThrowError('Internal server error');

    expect(UrlFetchApp.fetch).toHaveBeenCalledTimes(4);
  });

  it('getReport() should retrieve a report from the Merchant Center', () => {
    jest.spyOn(api, 'call').mockReturnValue(mockMerchantCenterAPIResponse);
    jest
      .spyOn(api, 'buildMerchantCenterAPIRequest')
      .mockReturnValue(mockMerchantCenterAPIRequest);

    const report = api.getReport(mockMerchantCenterAPIReportRequest);

    expect(api.call).toHaveBeenCalled();
    expect(report).toEqual(mockMerchantCenterAPIResponse.results);
  });

  it('callAllPages() should retrieve all pages of a report from the Merchant Center when fetchAll is true', () => {
    mockMerchantCenterAPIReportRequest.fetchAll = true;

    jest
      .spyOn(api, 'callAllPages')
      .mockReturnValue(mockMerchantCenterAPIResponse.results || []);
    jest
      .spyOn(api, 'buildMerchantCenterAPIRequest')
      .mockReturnValue(mockMerchantCenterAPIRequest);

    const report = api.getReport(mockMerchantCenterAPIReportRequest);

    expect(api.callAllPages).toHaveBeenCalled();
    expect(report).toEqual(mockMerchantCenterAPIResponse.results);
  });

  it('callAllPages() should retrieve all pages of a report', () => {
    mockMerchantCenterAPIRequest.payload = {
      query:
        'SELECT ' +
        'product_view.id, ' +
        'product_view.title, ' +
        'FROM ProductView',
      pageSize: 10,
    };

    const mockResponses: MerchantCenterAPIResponse[] = [
      {
        results: [
          {
            productView: {
              title: 'Product 1',
              id: '123',
            },
          },
        ],
        nextPageToken: 'token1',
      },
      {
        results: [
          {
            productView: {
              title: 'Product 2',
              id: '456',
            },
          },
        ],
        nextPageToken: null,
      },
    ];

    const callSpy = jest.spyOn(api, 'call');
    mockResponses.forEach((response) => callSpy.mockReturnValueOnce(response));

    const allResults = api.callAllPages(mockMerchantCenterAPIRequest);

    expect(api.call).toHaveBeenCalledTimes(2);
    expect(api.call).toHaveBeenNthCalledWith(1, mockMerchantCenterAPIRequest);
    expect(api.call).toHaveBeenNthCalledWith(2, {
      ...mockMerchantCenterAPIRequest,
      payload: {
        ...mockMerchantCenterAPIRequest.payload,
        pageToken: 'token1',
      },
    });

    const expectedResults = mockResponses.reduce((acc, response) => {
      return acc.concat(response.results || []);
    }, [] as any[]);
    expect(allResults).toEqual(expectedResults);
  });
});
