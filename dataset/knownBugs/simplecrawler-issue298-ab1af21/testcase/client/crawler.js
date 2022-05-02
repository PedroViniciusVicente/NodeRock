// DO NOT INSTRUMENT

'use strict';

var Crawler = require('../..');

var crawler = new Crawler('http://127.0.0.1:32714/');

crawler.interval = 1;
crawler.maxConcurrency = 1;

let order = [];

crawler.on('queueadd', function (queueItem)
{
    order.push('queueadd ' + queueItem.url);
    console.log('Added %s to queue', queueItem.url);
});

crawler.on('fetchcomplete', function (queueItem, responseBuffer, response)
{
    order.push('fetchcomplete ' + queueItem.url);
    console.log('Received %s', queueItem.url);
});

crawler.on('complete', function ()
{
    console.log('Crawl complete');
    //expect  events of 'queueadd' and 'fetchcomplete' before event 'complete'
    if (order.length !== 5)
    {
        console.log('Error: no enough events performed before');
    }
    process.exit();
});

crawler.start();

console.log('Crawler has started');
