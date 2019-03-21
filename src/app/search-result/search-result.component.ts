import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { DatabaseService } from './../database/database.service';

@Component({
  selector: 'app-search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.scss']
})
export class SearchResultComponent implements OnInit {
  data: any;
  constructor(
    private service: DatabaseService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.data = this.route.queryParams.pipe(
      switchMap(params => this.service.searchItem(params))
    );
  }

  pageClick(page: string) {
    const value = this.route.snapshot.queryParams;
    if (page !== '') {
      const navigationExtras = {
        queryParams: Object.assign({}, value, { page })
      };
      this.router.navigate(['/SearchResult'], navigationExtras);
    }
  }

  iconSort(type: string) {
    const { queryParams } = this.route.snapshot;
    if (queryParams.SortBy === type) {
      if (queryParams.Order === 'asc') {
        return 'keyboard_arrow_up';
      }
      if (queryParams.Order === 'desc') {
        return 'keyboard_arrow_down';
      }
    }
  }

  sortClick(type: string) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams.SortBy !== type) {
      const Order = type === 'Price' ? 'asc' : 'desc';
      const navigationExtras = {
        queryParams: Object.assign({}, queryParams, { SortBy: type, Order })
      };
      this.router.navigate(['/SearchResult'], navigationExtras);
    } else {
      let { Order } = queryParams;
      Order = Order === 'desc' ? 'asc' : 'desc';
      const navigationExtras = {
        queryParams: Object.assign({}, queryParams, { Order })
      };
      this.router.navigate(['/SearchResult'], navigationExtras);
    }
  }
}
