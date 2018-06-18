# Week 3

## mongoimport
- while mongorestore imports BSON
- mongoimport will import JSON

When importing a JSON you need the --jsonArray flag.
- For a data structure like
{
    { "first": 'joe' }
    { "first": 'jim' }
}
- you do not need the --jsonArray flag. But for a structure like below, you do
[
    { "first": 'joe' }
    { "first": 'jim' }
]

## $regex
- $options specifies things like case sensitivity, allow dot character and other
