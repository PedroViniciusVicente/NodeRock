var Store = require("..");
var db = new Store("data");

// The result is not determined
// The bug is caused by Store.es6.js:81
// Two renames overwrite each other

// A
db.save("id", {number: 1}, function (err)
{
    if (err)
    {
        console.error(err);
    }
});

// B
db.save("id", {number: 2}, function (err)
{
    if (err)
    {
        console.error(err);
    }
});