import Polling from './polling';
import { API_ROOT } from './constants/envrionment';
import { catchError, interval, map, mergeMap, of } from 'rxjs';
import { ajax } from 'rxjs/internal/ajax/ajax';

const updateStream$ = interval(5000).pipe(
  mergeMap(() => {
    return ajax.getJSON(API_ROOT + '/messages/unread').pipe(
      catchError(() => of({ messages: [] })),
      map(data => data.messages),
    );
  }),
);

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#app');

  const polling = new Polling({ update: updateStream$ });
  polling.bindToDOM(container);
  polling.drawUI();
  polling.subscribeToUpdateStream();
});
