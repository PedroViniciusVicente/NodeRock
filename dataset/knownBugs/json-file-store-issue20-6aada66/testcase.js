// DO NOT INSTRUMENT

// Multiple async operations on one single file will be problematic 

const fs = require('fs');
fs.rmSync('data.json', {force: true});

const Store = require("./Store");
const db = new Store("data", {type: 'single'});

// save with custom ID
db.save("id", {data: `1`}, function (err)
{
    if (err)
    {
        console.error(err);
    }
});

db.delete("id", function (err)
{
    if (err)
    {
        console.error(err);
    }
});