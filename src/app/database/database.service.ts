import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import * as moment from 'moment';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ParamsSearch extends Params {
  ItemID: string;
  SortBy: string;
  Order: string;
  page: string;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private httpClient: HttpClient) { }

  getPopularItems() {
    return this.httpClient.get('https://us.tamrieltradecentre.com/pc/Trade/', { responseType: 'text' }).pipe(
      this.makeDoc(),
      map(htmlObject => {
        const itens = htmlObject.querySelectorAll('.popular-item-row');
        const array = [];
        itens.forEach(item => {
          const ItemID = item.getAttribute('data-on-click-link').match(/ItemID=(\d*)/)[1];
          const name = item.querySelector('.row>.col-xs-5>div').textContent.trim();
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
          });
        });
        return array;
      }),
    );
  }

  autoComplete(text: string) {
    const params = { params: { term: text }};
    return this.httpClient.get('https://us.tamrieltradecentre.com/api/pc/Trade/GetItemAutoComplete', params).pipe(
      map((res: any[]) => res.map(i => ({ ...i, IconName: `https://us.tamrieltradecentre.com/Content/icons/${i.IconName}`}))),
    );
  }

  searchItem(data: Partial<ParamsSearch>) {
    return this.httpClient.get('https://us.tamrieltradecentre.com/pc/Trade/SearchResult',
    { responseType: 'text', params: { ...data } }).pipe(
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
    );
  }

  makeDoc() {
    return pipe(
      map((res: string) => {
        const doc = document.implementation.createHTMLDocument('New Document');
        doc.body.innerHTML = res;
        return doc.body;
      })
    );
  }
}
