"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var socket_io_adapter_1 = require("socket.io-adapter");
require("./support/util");
var SOCKETS_COUNT = 3;
var createPartialDone = function (count, done, callback) {
    var i = 0;
    return function () {
        i++;
        if (i === count) {
            done();
            if (callback) {
                callback();
            }
        }
    };
};
var DummyAdapter = /** @class */ (function (_super) {
    __extends(DummyAdapter, _super);
    function DummyAdapter() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DummyAdapter.prototype.fetchSockets = function (opts) {
        return Promise.resolve([
            {
                id: "42",
                handshake: {
                    headers: {
                        accept: "*/*"
                    },
                    query: {
                        transport: "polling",
                        EIO: "4"
                    }
                },
                rooms: ["42", "room1"],
                data: {
                    username: "john"
                }
            },
        ]);
    };
    return DummyAdapter;
}(socket_io_adapter_1.Adapter));
