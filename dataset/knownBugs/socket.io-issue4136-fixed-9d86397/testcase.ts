// DO NOT INSTRUMENT

"use strict";

// node_modules/.bin/_mocha --require ts-node/register --timeout 3000 testcase.ts

import expect from "expect.js";
import {createServer} from "http";
import {io as ioc, Socket as ClientSocket} from "socket.io-client";
import {Server} from "./dist";
import "./test/support/util";
import "./test/utility-methods";


type callback = (err: Error | null, success: boolean) => void;

// Creates a socket.io client for the given server
function client(srv, nsp?: string | object, opts?: object): ClientSocket
{
    if ("object" == typeof nsp)
    {
        opts = nsp;
        nsp = undefined;
    }
    let addr = srv.address();
    if (!addr) addr = srv.listen().address();
    const url = "ws://localhost:" + addr.port + (nsp || "");
    return ioc(url, opts);
}

it("should handle race conditions with dynamic namespaces (#4136)", (done) =>
{
    const srv = createServer();
    const sio = new Server(srv);
    const counters = {
        connected: 0,
        created: 0,
        events: 0,
    };

    sio.on("new_namespace", (namespace) =>
    {
        counters.created++;
    });

    srv.listen(() =>
    {
        const handler = () =>
        {
            if (++counters.events === 2)
            {
                expect(counters.created).to.equal(1);
                done();
            }
        };


        const requestDelay = 500;   // ms
        let requestCounter = 0;

        sio
            .of((name, query, next) =>
            {
                requestCounter++;
                if (requestCounter === 1)
                {
                    // Make the next() execution of connection1 close to connection2 by delaying it.
                    setTimeout(() =>
                    {
                        next(null, true);
                    }, requestDelay);
                }
                else
                {
                    // Immediately executes the next() of connection2
                    next(null, true);
                }
            })
            .on("connection", (socket) =>
            {
                if (++counters.connected === 2)
                {
                    sio.of("/dynamic-101").emit("message");
                }
            });

        let one = client(srv, "/dynamic-101");
        one.on("message", handler);

        // Delay connection2
        setTimeout(() =>
        {
            let two = client(srv, "/dynamic-101");
            two.on("message", handler);
        }, requestDelay);
    });
});