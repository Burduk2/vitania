import { WebSocketServer, WebSocket } from 'ws';
import maxmind from 'maxmind';
import type { IncomingMessage } from 'http';
import type { CountryResponse } from 'maxmind';
import { MSG_MAX_LEN, WsPayload, type UnvalidatedClientMessage } from '../src/lib/types';
import { supabase } from '../src/lib/supabase';


const wss = new WebSocketServer({ port: 8080 });

const clients = new Set<WebSocket>();

const lookup = await maxmind.open('./server/GeoLite2-Country.mmdb');

wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
  clients.add(ws);
  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0] ??
    req.socket.remoteAddress;
  console.log({ ip });
  const isoCode = ip ? (lookup.get(ip) as CountryResponse)?.country?.iso_code : undefined;

  ws.on('message', async (data: any) => {
    const msg = JSON.parse(data.toString()) as UnvalidatedClientMessage;
    if (!msg.text || !msg.text.trim()) return;

    const payload: WsPayload = {
      text: msg.text.slice(0, MSG_MAX_LEN).trim().replace(/\n/g, ' '),
      isoCode,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase.from('messages').insert([{
      text: payload.text,
      ip,
      iso_code: isoCode,
    }])
    if (error) console.error(error);

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(payload));
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

console.log('ws://localhost:8080');
