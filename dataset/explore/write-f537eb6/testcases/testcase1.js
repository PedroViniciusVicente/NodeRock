const write = require('..');
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const os = require('os');
const crypto = require('crypto');


// This bug locates from index.js:58 to index.js:61
// A & B will both create write streams for targetFile
// createWriteStream() will truncate targetFile and end() will write all content into targetFile
// It's a not determined that the end() of A will finish writing before the end() of B, and the file may be corrupted with content  different from both content1 & content2

const targetFile = path.join(os.tmpdir(), 'test.txt');

fs.rmSync(targetFile, {force: true});

const content1 = Buffer.alloc(100 * 1024 * 1024); // makes A.end() finishing writing later
const content2 = Buffer.alloc(50 * 1024 * 1024);

crypto.randomFillSync(content1);
crypto.randomFillSync(content2);

process.on('uncaughtException', (e) =>
{
    console.error(e);
});

process.on('beforeExit', () =>
{
    fs.rmSync(targetFile, {force: true});
});

// A
write(targetFile, content1, {overwrite: true}, err =>
{
    if (err)
    {
        console.error(err);
    }
    else
    {
        const targetContent = fs.readFileSync(targetFile);
        assert.ok(targetContent.equals(content1), `The content of targetFile is not content1!`);
    }
});


// B
write(targetFile, content2, {overwrite: true}, err =>
{
    if (err)
    {
        console.error(err);
    }
    else
    {
        const targetContent = fs.readFileSync(targetFile);
        assert.ok(targetContent.equals(content2), `The content of targetFile is not content2!`);
    }
});

