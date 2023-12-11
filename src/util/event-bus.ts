import EventEmitter from 'node:events';

export enum Events {
  NewIBayItem = 'new-ibay-item',
}

export const eventBus = new EventEmitter();
