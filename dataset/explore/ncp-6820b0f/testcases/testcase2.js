const ncp = require('../lib/ncp').ncp;
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmpDir = path.join(os.tmpdir(), 'testFolder');

fs.rmSync(tmpDir, {recursive: true, force: true});
fs.mkdirSync(tmpDir);

ncp('./test', tmpDir, function (err)
{
    if (err)
    {
        return console.error(err);
    }
    console.log('done!');

    // ncp copies file /A/B by:
    // 1. Check if /A/B already exists;
    // 2. If /A/B exists, delete it
    // 3. Copy the source file to /A/B
    // Because of the race condition, one file may be tried to be deleted twice,
    // and one of them will fail.

    ncp('./test', tmpDir, function (err)
    {
        if (err)
        {
            return console.error(err);
        }
        console.log('done!');
    });

    ncp('./test', tmpDir, function (err)
    {
        if (err)
        {
            return console.error(err);
        }
        console.log('done!');
    });
});

