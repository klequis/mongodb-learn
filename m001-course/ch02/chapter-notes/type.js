db.moviesScratch.insertOne({title: "Star Trek II: The Wrath of Khan", year: 1982, imdb: "tt0084726"})

db.moviesScratch.insertOne({_id: "tt0084726", title: "Star Trek II: The Wrath of Khan", year: 1982, imdb: "tt0084726"})

                     {"awards.wins": 4}
db.movieDetails.find({"awards.wins": 4}).count()
db.collection.find(<query>).count()
