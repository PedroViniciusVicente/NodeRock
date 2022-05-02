// DO NOT INSTRUMENT

// node_modules/.bin/lab -m 3000 testcase.js

// Load modules

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');
var Nes = require('./');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;

describe('_reconnect()', function ()
{

    it('aborts reconnect if disconnect is called in between attempts', function (done)
    {

        var server = new Hapi.Server();
        server.connection();
        server.register({register: Nes, options: {auth: false}}, function (err)
        {

            expect(err).to.not.exist();

            server.start(function (err)
            {

                var client = new Nes.Client('http://localhost:' + server.info.port);

                var c = 0;
                client.onConnect = function ()
                {

                    ++c;
                    client._ws.close();

                    if (c === 1)
                    {
                        setTimeout(function ()
                        {

                            client.disconnect();
                        }, 500);

                        setTimeout(function ()
                        {

                            expect(c).to.equal(1);
                            server.stop(done);
                        }, 1500);
                    }
                };

                client.connect({delay: 1000}, function () { });
            });
        });
    });
});