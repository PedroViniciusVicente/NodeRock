// DO NOT INSTRUMENT

const childProcess = require('child_process');

childProcess.execFileSync('node_modules/.bin/tsc');

const {Adapter} = require(".");

const adapter = new Adapter({server: {encoder: null}});

adapter.on('create-room', () =>
{
    adapter.del('s1', 'r1');
});

adapter.addAll('s1', new Set(['r1']));