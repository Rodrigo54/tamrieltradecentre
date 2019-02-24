import { Router, NavigationExtras } from '@angular/router';
import { DatabaseService } from './../database/database.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  itens: any;
  constructor(
    private service: DatabaseService,
    private router: Router
  ) { }
  ngOnInit() {
    this.itens = this.service.getPopularItems();
  }

  onClick(ItemID: string) {
    console.log(ItemID);
    const navigationExtras: NavigationExtras = {
      queryParams: {
        ItemID,
        SortBy: 'LastSeen',
        Order: 'desc',
        lang: 'en-US',
        page: '1'
      },
    };
    this.router.navigate(['/SearchResult'], navigationExtras);
  }
}
