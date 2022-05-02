const ncp = require('../lib/ncp').ncp;
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');
const {EventEmitter} = require('events');

const eventEmitter = new EventEmitter();
let finishCount = 0;

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
// The file first created by A will be truncated by B, may make the file corrupted.

// Async steps:
// 1. if destination exists, delete it
// 2. create destination and truncate it

// 1. both A & B think destination does not exist
// 2. A creates destination and truncates it, writes content to destination
// 3. B truncates destination and writes content to it
// 4. file is corrupted

// operation A
ncp(bigFile1, destination, function (err)
{
    if (err)
    {
        return console.error(err);
    }
    eventEmitter.emit('done');
    console.log('done!');
});

// operation B
ncp(bigFile2, destination, function (err)
{
    if (err)
    {
        return console.error(err);
    }
    eventEmitter.emit('done');
    console.log('done!');
});

eventEmitter.on('done', () =>
{
    finishCount++;
    if (finishCount === 2)
    {
        const hash3 = crypto.createHash('sha1');

        const copiedBigFile = destination;
        const copiedFileContext = fs.readFileSync(copiedBigFile);
        const copiedHash = hash3.update(copiedFileContext).digest();

        assert.ok(copiedHash.equals(original1Hash)
            || copiedHash.equals(original2Hash),
            `Copied file is different from any original files
            originalFile1Hash: ${original1Hash.toString('hex')}
            originalFile2Hash: ${original2Hash.toString('hex')}
            copiedFileHash: ${copiedHash.toString('hex')}
            `);
    }
});