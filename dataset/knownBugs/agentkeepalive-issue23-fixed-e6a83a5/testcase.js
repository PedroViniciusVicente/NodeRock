var Agent = require('.');
var http = require('http');

var _keepaliveAgent = new Agent({
    maxSockets: 1,
    maxFreeSockets: 1,
    keepAliveTimeout: 1000
});

var options = {
    hostname: 'cn.bing.com',
    port: 80,
    path: '/',
    method: 'GET',
    agent: _keepaliveAgent
};

var getRequest = function ()
{
    var req = http.request(options, function (res)
    {
        res.on('data', function (chunk)
        {
            //console.log('BODY: ' + chunk);
        });
        res.on('end', function ()
        {
            console.log('END REQ');
        });
    });
    req.on('error', function (e)
    {
        console.log('problem with request: ', e);
    });
    return req;
};

let timeout = false;
var req = getRequest();
// Get a reference to the socket.
req.on('socket', function (sock)
{
    // Listen to timeout and send another request immediately.
    sock.on('timeout', function ()
    {
        timeout = true;
    });
});

const interval = setInterval(() =>
{
    // We need to send another request with a timing *very close* to 'timeout' event emitting.
    // But if we put the request inside the 'timeout' event listener, there will be a solid happens-before
    // relation between 'timeout' event and the request, which should not exist in real world scenario.
    // So we use intense setInterval to watch the value of variable timeout and send another request.
    if (timeout)
    {
        getRequest().end();
        clearInterval(interval);
    }
}, 0);

req.end();

setTimeout(function ()
{
    // Just keep the process hanging because listening to 'timeout' is not enough to keep the process spinning.
}, 2500);