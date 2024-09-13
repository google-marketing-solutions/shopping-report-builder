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

export const mockPreviewMerchantCenterReportResponse = {
  success: true,
  data: [
    {
      'productView.priceMicros': '8750000',
      'productView.id': 'online:en:GB:XXXXX1',
      'productView.title': 'Generic Product A (XXXXX1)',
      'productView.currencyCode': 'GBP',
      'productView.brand': 'generic_brand_a',
      'priceCompetitiveness.benchmarkPriceCurrencyCode': 'GBP',
      'priceCompetitiveness.countryCode': 'GB',
      'priceCompetitiveness.benchmarkPriceMicros': '8125000',
    },
    {
      'productView.priceMicros': '54990000',
      'productView.id': 'online:en:GB:XXXXX2',
      'productView.title': 'Another Generic Product (XXXXX2)',
      'productView.brand': 'generic_brand_b',
      'productView.currencyCode': 'GBP',
      'priceCompetitiveness.benchmarkPriceCurrencyCode': 'GBP',
      'priceCompetitiveness.countryCode': 'GB',
      'priceCompetitiveness.benchmarkPriceMicros': '52000000',
    },
    {
      'productView.priceMicros': '12345000',
      'productView.id': 'online:en:GB:XXXXX3',
      'productView.title': 'Yet Another Product (XXXXX3)',
      'productView.currencyCode': 'GBP',
      'productView.brand': 'generic_brand_c',
      'priceCompetitiveness.benchmarkPriceCurrencyCode': 'GBP',
      'priceCompetitiveness.countryCode': 'GB',
      'priceCompetitiveness.benchmarkPriceMicros': '11999000',
    },
    {
      'productView.priceMicros': '29999000',
      'productView.id': 'online:en:GB:XXXXX4',
      'productView.title': 'Sample Product D (XXXXX4)',
      'productView.brand': 'generic_brand_d',
      'productView.currencyCode': 'GBP',
      'priceCompetitiveness.benchmarkPriceCurrencyCode': 'GBP',
      'priceCompetitiveness.countryCode': 'GB',
      'priceCompetitiveness.benchmarkPriceMicros': '28500000',
    },
    {
      'productView.priceMicros': '65432100',
      'productView.id': 'online:en:GB:XXXXX5',
      'productView.title': 'Example Product E (XXXXX5)',
      'productView.currencyCode': 'GBP',
      'productView.brand': 'generic_brand_e',
      'priceCompetitiveness.benchmarkPriceCurrencyCode': 'GBP',
      'priceCompetitiveness.countryCode': 'GB',
      'priceCompetitiveness.benchmarkPriceMicros': '60000000',
    },
  ],
};
