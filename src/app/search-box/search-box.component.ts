import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
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
  form: FormGroup;
  constructor(
    private service: DatabaseService,
    private router: Router,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      stateCtrl: this.stateCtrl
    });
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(''),
      filter(i => i  !== ''),
      filter((i: string) => i.length > 2),
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(state => this.service.autoComplete(state))
    );
  }

  onSubmit(item?: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        SortBy: 'LastSeen',
        Order: 'desc',
        lang: 'en-US',
        page: '1'
      },
    };
    if (item) {
      const { value } = item.option;
      navigationExtras.queryParams.ItemID = value.ItemID;
    } else {
      navigationExtras.queryParams.ItemNamePattern = this.stateCtrl.value;
    }
    this.router.navigate(['/SearchResult'], navigationExtras);
  }

  displayWith(item: any) {
    return item.value;
  }
}
