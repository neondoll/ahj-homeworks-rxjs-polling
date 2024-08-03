import { Observable } from 'rxjs';
import truncateString from './truncateString';

export default class Polling {
  constructor(streams$) {
    this._container = undefined;
    this._element = undefined;
    this._messages = undefined;
    this._streams$ = streams$;
  }

  addMessage(message) {
    this._messages.insertAdjacentHTML('afterbegin', Polling.markupMessage(message));
  }

  bindToDOM(container) {
    if (!(container instanceof HTMLElement)) {
      throw new Error('container is not HTMLElement');
    }

    this._container = container;
  }

  checkBinding() {
    if (this._container === undefined) {
      throw new Error('Polling not bind to DOM');
    }
  }

  checkStreams$() {
    if (!this._streams$ || typeof this._streams$ !== 'object' || Array.isArray(this._streams$)) {
      throw new Error('Streams object not installed');
    }
  }

  checkStreams$Update() {
    if (!('update' in this._streams$ && this._streams$.update instanceof Observable)) {
      throw new Error('Update stream must be an instance of Observable');
    }
  }

  drawUI() {
    this.checkBinding();

    this._container.innerHTML = Polling.markup;
    this._element = this._container.querySelector(Polling.selector);
    this._messages = this._element.querySelector(Polling.selectorMessages);
  }

  subscribeToUpdateStream() {
    this.checkStreams$();
    this.checkStreams$Update();

    this._streams$.update.subscribe((messages) => {
      console.log('messages', messages);

      messages.forEach((message) => {
        this.addMessage(message);
      });
    });
  }

  static dateFormatter(date) {
    const d = new Date(date);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    const second = String(d.getSeconds()).padStart(2, '0');

    return {
      datetime: `${year}-${month}-${day}T${hour}:${minute}:${second}`,
      value: `${hour}:${minute} ${day}.${month}.${year}`,
    };
  }

  static get markup() {
    return `
      <div class="polling">
        <h1 class="polling__title">Incoming</h1>
        <div class="polling__messages"></div>
      </div>
    `;
  }

  static markupMessage(message) {
    const received = Polling.dateFormatter(message.received);

    return `
      <div class="polling__message polling-message" data-id="${message.id}">
        <span class="polling-message__from">${message.from}</span>
        <span class="polling-message__subject" data-value="${message.subject}">
          ${truncateString(message.subject, 15)}
        </span>
        <time class="polling-message__received" datetime="${received.datetime}">
          ${received.value}
        </time>
      </div>
    `;
  }

  static get selector() { return '.polling'; }

  static get selectorMessages() { return '.polling__messages'; }
}
