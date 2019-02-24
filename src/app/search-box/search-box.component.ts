import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap, filter } from 'rxjs/operators';

import { DatabaseService } from './../database/database.service';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-search-box',
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit {
  stateCtrl = new FormControl('', { updateOn: 'change' });
  filteredStates: Observable<any[]>;
  constructor(
    private service: DatabaseService,
    private router: Router
  ) {
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      filter(i => i  !== ''),
      filter((i: string) => i.length > 3),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(state => this.service.autoComplete(state))
    );
  }

  ngOnInit() {}
  onSubmit(item) {
    const { value } = item.option;
    const navigationExtras: NavigationExtras = {
      queryParams: {
        ItemID: value.ItemID,
        SortBy: 'LastSeen',
        Order: 'desc',
        lang: 'en-US',
        page: '1'
      },
    };
    this.router.navigate(['/SearchResult'], navigationExtras);
  }

  displayWith(item: any) {
    return item.value;
  }
}
