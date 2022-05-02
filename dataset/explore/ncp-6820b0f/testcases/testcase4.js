const ncp = require('../lib/ncp').ncp;
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');

const hash1 = crypto.createHash('sha1');
const hash2 = crypto.createHash('sha1');

const destination = path.join(os.tmpdir(), 'bigFile');
const bigFile1 = path.join(__dirname, 'bigFiles', 'bigFile1');
const bigFile2 = path.join(__dirname, 'bigFiles', 'bigFile2');

const file1Content = fs.readFileSync(bigFile1);
const original1Hash = hash1.update(file1Content).digest();
const file2Content = fs.readFileSync(bigFile2);
const original2Hash = hash2.update(file2Content).digest();

fs.rmSync(destination, {recursive: true, force: true});

// Both operation A & B will create a write stream to destination and write through the stream,
// The file first created by A will be deleted by B, may make the file corrupted.

// Async steps:
// 1. if destination exists, delete it
// 2. create destination and truncate it

// 1. A thinks destination does not exist
// 2. A creates destination and truncates it, writes content to destination
// 3. B thinks destination exists
// 4. B deletes destination
// 5. B creates destination and truncates it, writes content to destination
// 6. file *maybe* successfully copied by B, depends on how OS handles a writable stream of a deleted file


// operation A
ncp(bigFile1, destination, function (err)
{
    if (err)
    {
        return console.error(err);
    }
    const hash = crypto.createHash('sha1');
    const copiedBigFile = destination;
    const copiedFileContext = fs.readFileSync(copiedBigFile);
    const copiedHash = hash.update(copiedFileContext).digest();

    assert.ok(original1Hash.equals(copiedHash));    // WTF, destination is not bigFile1!
});

setTimeout(() =>
{
    ncp(bigFile2, destination, function (err)
    {
        if (err)
        {
            return console.error(err);
        }

        // deal with the bug in testcase5
        setTimeout(() =>
        {
            const hash = crypto.createHash('sha1');
            const copiedBigFile = destination;
            const copiedFileContext = fs.readFileSync(copiedBigFile);
            const copiedHash = hash.update(copiedFileContext).digest();

            assert.ok(original2Hash.equals(copiedHash));
        }, 1000)
    });
}, 100);