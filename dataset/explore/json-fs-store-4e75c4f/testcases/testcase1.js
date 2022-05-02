// DO NOT INSTRUMENT

const store = require('..')();

const id = '12345';

const buffer = Buffer.alloc(1024);

buffer.fill(0);

const donkey1 = {
    id,
    name: 'samuel',
    color: 'brown',
};

// take some time to save
const donkey2 = {
    id,
    name: 'samuel',
    color: 'brown',
    otherInfo: buffer,
};

store.add(donkey1, function (err)
{
    if (err)
    {
        console.error(err);
    }
    else
    {
        store.add(donkey2, function (err)
        {
            if (err)
            {
                console.error(err);
            }
        });

        // SyntaxError: Unexpected end of JSON input
        // At least we should get donkey1?
        store.load(id, function (err, object)
        {
            if (err)
            {
                console.error(err);
            }
            else
            {
                console.log(object);
            }
        });
    }
});