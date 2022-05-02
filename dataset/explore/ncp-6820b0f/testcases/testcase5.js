const ncp = require('../lib/ncp').ncp;
const fs = require('fs');
const os = require('os');
const path = require('path');

const destination = path.join(os.tmpdir(), 'bigFile');
const bigFile1 = path.join(__dirname, 'bigFiles', 'bigFile1');
const bigFile2 = path.join(__dirname, 'bigFiles', 'bigFile2');

fs.rmSync(destination, {recursive: true, force: true});

// This is not a race condition bug, but can be clarified by analyzing trace.
// The bug is caused by function onFile() at ncp.js:94.
// Before the rmFile() asynchronously calls copyFile(), the callback is called at line 109, at which point the target file is deleted.
// If the callback read the target file, failure occurs.

ncp(bigFile1, destination, function (err)
{
    if (err)
    {
        return console.error(err);
    }
    ncp(bigFile2, destination, function (err)
    {
        if (err)
        {
            return console.error(err);
        }
        fs.readFileSync(destination)
    });
});