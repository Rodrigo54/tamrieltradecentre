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
}
