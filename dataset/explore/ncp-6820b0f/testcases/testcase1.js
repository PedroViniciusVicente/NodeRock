const ncp = require('../lib/ncp').ncp;
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmpDir = path.join(os.tmpdir(), 'testFolder');

fs.rmSync(tmpDir, {recursive: true, force: true});

// Both operation A & B checks the existence of `tmpDir` and thought `tmpDir` does not exist.
// Then both of them will try to create it.
// One of A & B will success and another one will fail.

// operation A
ncp('./bin', tmpDir, function (err)
{
    if (err)
    {
        return console.error(err);
    }
    console.log('done!');
});

// operation B
ncp('./lib', tmpDir, function (err)
{
    if (err)
    {
        return console.error(err);
    }
    console.log('done!');
});