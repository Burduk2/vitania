
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { UnvalidatedClientMessage } from '$lib/types';

export const isTouch = writable(false);
if (browser) {
  isTouch.set(matchMedia('(pointer: coarse)').matches);
}


export function createWS(url: string) {
  const ws = new WebSocket(url);

  return {
    ws,

    send(text: string) {
      const msg: UnvalidatedClientMessage = {
        text: text,
      };
      ws.send(JSON.stringify(msg));
    },

    onMessage(cb: any) {
      ws.onmessage = e => {
        cb(JSON.parse(e.data));
      };
    }
  };
}

