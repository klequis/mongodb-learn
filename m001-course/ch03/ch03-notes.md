[query operators doc](https://docs.mongodb.com/manual/reference/operator/query)

````
  db.movieDetails.find({runtime: {$gt: 90}})
  db.movieDetails.find({runtime: {$gt: 90, $lt: 120}}, {_id: 0, title: 1, runtime: 1})
  db.movieDetails.find({runtime: {$gte: 90, $lte: 120}}, {_id: 0, title: 1, runtime: 1})

  db.movieDetails.find({runtime: {$gte: 180}, "tomato.meter": {$gte: 95}}, {_id: 0, title: 1, runtime: 1})

  db.movieDetails.find({rated: {$ne: "UNRATED"}}, {_id: 0, title: 1, runtime: 1})
  db.movieDetails.find({rated: {$in: ["G", "PG"]}}, {_id: 0, title: 1, runtime: 1})
````

## Lecture: Comparison Operators Quiz

db.movieDetails.find({writers: {$in: ["Ethan Coen", "Joel Coen"]}})

## Lecture: Element operators
- $exists
- $type



{$or [{watlev: {$eq: "always dry"}}, {depth: {$eq: 0}}]}
{$or}






{ $and: [{"metacritic": null}, {"metacritic": {$exists: true}}]}
{ $and: [{"usertype": {$ne: "Suscriber"}}, {usertype: {$ne: "Customer"}}]}

{ $and: [ { price: { $ne: 1.99 } }, { price: { $exists: true } } ] } )


db.movieDetails.find({$and: [{"metacritic": null}, {"metacritic": {$exists: true}}]},
                     {_id: 0, title: 1, "metacritic": 1})


{$and [{tripduration: {$exists: true}}, {tripduration: null}]}


{$and [{tripduration: {$exists: true}}, {tripduration: {$eq: null}}]}



{tripduration: {$exists: true}}
{tripduration: {$eq: null}}




{cast: {$exists: true}}
