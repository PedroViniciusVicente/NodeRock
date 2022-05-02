import { createServer } from "http";
import { Server, Socket } from "..";
import { io as ioc, Socket as ClientSocket } from "socket.io-client";
import { Adapter, BroadcastOptions } from "socket.io-adapter";
import expect from "expect.js";
import type { AddressInfo } from "net";

import "./support/util";

const SOCKETS_COUNT = 3;

const createPartialDone = (
  count: number,
  done: () => void,
  callback?: () => void
) => {
  let i = 0;
  return () => {
    i++;
    if (i === count) {
      done();
      if (callback) {
        callback();
      }
    }
  };
};

class DummyAdapter extends Adapter {
  fetchSockets(opts: BroadcastOptions): Promise<any[]> {
    return Promise.resolve([
      {
        id: "42",
        handshake: {
          headers: {
            accept: "*/*",
          },
          query: {
            transport: "polling",
            EIO: "4",
          },
        },
        rooms: ["42", "room1"],
        data: {
          username: "john",
        },
      },
    ]);
  }
}
