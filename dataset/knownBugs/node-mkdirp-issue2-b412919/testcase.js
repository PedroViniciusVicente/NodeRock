// DO NOT INSTRUMENT

const {mkdirp} = require('./');
const fs = require('fs');

fs.rmSync('/tmp/hello', {recursive: true, force: true});

mkdirp('/tmp/hello/world1', undefined, (err) =>
{
    if (err)
    {
        console.error(err);
    }
});

mkdirp('/tmp/hello/world2', undefined, (err) =>
{
    if (err)
    {
        console.error(err);
    }
});