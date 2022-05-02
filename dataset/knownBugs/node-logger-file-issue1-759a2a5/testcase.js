// DO NOT INSTRUMENT

const logger = require("cinovo-logger");
const endpoint = require("./");
const {execSync} = require('child_process');
const os = require('os');
const path = require('path');

const tmpdir = os.tmpdir();
const prefix = 'NodeRAL-test';

console.log(`log files are created at ${tmpdir}`);

execSync(`rm -f ${path.join(tmpdir, `${prefix}*.log`)}`);

endpoint(true, true, true, true, tmpdir, prefix, ".log", 1, 60, 10, (err, endpoint) =>
{
    if (err)
    {
        console.error(err);
    }
    logger.append(endpoint);
    let done = false;
    for (let i = 0; i < 2; i++)
    {
        logger.debug("all values are ok", () =>
        {
            if (i === 1)
            {
                done = true;
            }
        });
    }
    setInterval(() =>
    {
        if (done)
        {
            process.exit(0);
        }
    }, 100);
});