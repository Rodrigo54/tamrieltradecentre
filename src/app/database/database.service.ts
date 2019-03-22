import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import * as moment from 'moment';
import { of, pipe } from 'rxjs';
import { catchError, delay, finalize, first, map, switchMap } from 'rxjs/operators';

import { LoadingService } from '../shared/loading/loading.service';

export interface ParamsSearch extends Params {
  ItemID: string;
  SortBy: string;
  Order: string;
  page: string;
}

const httpOptions = {
  headers: new HttpHeaders({
    'x-requested-with': 'https://us.tamrieltradecentre.com',
    'Content-Type':  'text/html',
  }),
};

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  proxy = 'https://cors-anywhere.herokuapp.com/';

  constructor(
    private httpClient: HttpClient,
    private loading: LoadingService,
  ) { }

  getPopularItems() {
    this.loading.open();
    return this.httpClient.get(
      `${this.proxy}https://us.tamrieltradecentre.com/pc/Trade/`,
      { ...httpOptions, responseType: 'text' }
    ).pipe(
      first(),
      this.makeDoc(),
      map(htmlObject => {
        const itens = htmlObject.querySelectorAll('.popular-item-row');
        const array = [];
        itens.forEach(item => {
          const ItemID = item.getAttribute('data-on-click-link').match(/ItemID=(\d*)/)[1];
          const name = item.querySelector('.row>.col-xs-5>div').textContent.trim();
          const quality = item.querySelector('.row>.col-xs-5').className.match(/col-xs-5 item-quality-(\w*)/)[1];
          const img = item.querySelector('.row>.col-xs-5>img').getAttribute('src');
          const gold = item.querySelector('.row>.col-xs-3>.gold-amount').textContent.trim();
          const entries = item.querySelectorAll('.row>.col-xs-4>div')[0].textContent.trim();
          const amount = item.querySelectorAll('.row>.col-xs-4>div')[1].textContent.trim();
          array.push({
            ItemID,
            name,
            img: `https://us.tamrieltradecentre.com${img}`,
            gold,
            amount,
            entries,
            quality
          });
        });
        return array;
      }),
      finalize(() => { this.loading.close(); })
    );
  }

  autoComplete(text: string) {
    return this.httpClient.get(
      `${this.proxy}https://us.tamrieltradecentre.com/api/pc/Trade/GetItemAutoComplete`,
      { ...httpOptions, params: { term: text } }
    ).pipe(
      map((res: any[]) => res.map(i => {
        let quality: string;
        switch (i.DefaultQualityID) {
          case 0:
          default:
            quality = 'normal';
            break;
          case 1:
            quality = 'fine';
            break;
          case 2:
            quality = 'superior';
            break;
          case 3:
            quality = 'epic';
            break;
          case 4:
            quality = 'legendary';
            break;
        }
        return {
          ...i,
          quality,
          IconName: `https://us.tamrieltradecentre.com/Content/icons/${i.IconName}`
        };
      })),
    );
  }

  searchItem(data: Partial<ParamsSearch>) {
    const proxy = 'https://thingproxy.freeboard.io/fetch/';
    this.loading.open();
    return of(proxy).pipe(
      delay(3000),
      switchMap(proxxy =>  this.httpClient.get(
        `${proxxy}https://us.tamrieltradecentre.com/pc/Trade/SearchResult`,
        { ...httpOptions, responseType: 'text', params: { ...data } }
      )),
      first(),
      this.makeDoc(),
      map(htmlObject => {
        const arrayItens = [];
        const arrayPagination = [];
        const itens = htmlObject.querySelectorAll('tr.cursor-pointer');
        const pagination = htmlObject.querySelector('ul.pagination');
        pagination.childNodes.forEach((pagina: Element) => {
          let numberPage: string;
          try {
            numberPage = pagina.children[0].getAttribute('href').match(/page=(\d*)/)[1];
          } catch (error) {
            numberPage = '';
          }
          if (pagina.nodeName === 'LI') {
            arrayPagination.push({
              status: pagina.className ? pagina.className : 'default',
              value:  pagina.children[0].textContent.trim(),
              number: numberPage,
            });
          }
        });
        itens.forEach(item => {
          let location: string;
          let guild: string;
          const td = item.querySelectorAll('td');
          const name = td[0].querySelectorAll('div')[0].textContent.trim();
          const quality = item.querySelector('img').className.match(/trade-item-icon item-quality-(\w*)/)[1];
          const level = td[0].querySelectorAll('div')[1].textContent.replace(/[\r\n]\s*/gm, ' ').trim();
          const img = td[0].querySelector('img').getAttribute('src');
          const trader = td[1].querySelector('div').textContent.trim();
          try {
            location = td[2].querySelectorAll('div')[0].textContent.trim();
            guild = td[2].querySelectorAll('div')[1].textContent.trim();
          } catch (error) {
            location = 'unknown';
            guild =  'unknown';
          }
          const [ gold, amount, total ] = td[3].innerText.replace(/[\r\n]\s*/gm, ' ').trim().split(/\sX\s|\s=\s/);
          const lastSeen = td[4].getAttribute('data-mins-elapsed');
          arrayItens.push({
            name,
            quality,
            img: `https://us.tamrieltradecentre.com${img}`,
            level: level.substr(7),
            trader,
            location,
            guild,
            value: { gold, amount, total },
            lastSeen: moment().from(moment().add(lastSeen, 'minutes'))
          });
        });
        return { itens: arrayItens, pagination: arrayPagination };
      }),
      catchError(error => of([])),
      finalize(() => { this.loading.close(); })
    );
  }

  makeDoc() {
    return pipe(
      map((res: string) => {
        const doc = document.implementation.createHTMLDocument('New Document');
        doc.body.innerHTML = res;
        return doc.body;
      }),
    );
  }
}
