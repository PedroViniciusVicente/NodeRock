// DO NOT INSTRUMENT

'use strict';

var express = require('express');
var app     = express();
var path    = require('path');
var compression = require('compression');

var SLEEP_TIME = 3000;

app.use(compression({threshold: 0}));

app.get('/',function(req,res){
    setTimeout(function () {
        res.sendFile(path.join(__dirname + '/index.html'))
    }, SLEEP_TIME);
});

app.get('/p1',function(req,res){
    res.sendFile(path.join(__dirname + '/p1.html'));
});

app.get('/p2',function(req,res){
    res.sendFile(path.join(__dirname + '/p2.html'));
});

app.listen(32714);

console.log('Server is running');