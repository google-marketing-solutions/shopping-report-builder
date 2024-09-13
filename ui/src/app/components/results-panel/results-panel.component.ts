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
import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {Observable} from 'rxjs';
import {ApiService} from '../../services/api.service';

/**
 * Displays the results of a merchant report in a table.
 */
@Component({
  selector: 'app-results-panel',
  imports: [CommonModule, MatCardModule, MatTableModule],
  templateUrl: './results-panel.component.html',
  styleUrl: './results-panel.component.scss',
})
export class ResultsPanelComponent implements OnInit {
  /**
   * An observable that emits the results data from the `ApiService`.
   */
  dataSource$: Observable<any[]>;

  /**
   * The displayed columns for the results table.
   */
  displayedColumns: string[] = [];

  /**
   * Flag indicating if the results table should be shown.
   */
  showTable = false;

  /**
   * Injects the `ApiService` dependency in the constructor.
   * @param apiService An instance of the `ApiService`.
   */
  constructor(private apiService: ApiService) {
    this.dataSource$ = this.apiService.merchantReportResults;
  }

  /**
   * Subscribes to the `dataSource$` observable and updates the `displayedColumns`
   * and `showTable` properties based on the received data.
   */
  ngOnInit() {
    this.dataSource$.subscribe((data: any[]) => {
      if (data.length > 0) {
        this.showTable = true;
        this.displayedColumns = Object.keys(data[0]);
      }
    });
  }
}
