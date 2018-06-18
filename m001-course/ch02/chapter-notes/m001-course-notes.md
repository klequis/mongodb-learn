## Connect to classes' Atlas cluster

**correct way of connecting for my config**
mongo "mongodb+srv://cluster0-uelae.mongodb.net/video" --username klequis

**to load data from file**
mongo "mongodb+srv://cluster0-uelae.mongodb.net/video" --username klequis --Sn0wm@n01 loadReviewsDataset.js

**this is for the 3.4 driver or earlier. I'm using the 3.6 driver**
mongo "mongodb://cluster0-shard-00-00-jxeqq.mongodb.net:27017,cluster0-shard-00-01-jxeqq.mongodb.net:27017,cluster0-shard-00-02-jxeqq.mongodb.net:27017/test?replicaSet=Cluster0-shard-0" --authenticationDatabase admin --ssl --username m001-student --password m001-mongodb-basics

**Uses --ssl**

- connects to the primary. Only a primary can accept rights


## Commands
- $ show collections
- $ use video
- $ db.movies.find().pretty // shows documents



- m001-student
- m001-mongod-basics


## "ordered: false"
If you are inserting multiple documents and there is a duplicate id mongo will stop when it hits the first duplicate. If you want it to NOT stop create an additional 'options document':
{
  "ordered": false
}

## Query an Array
- db.movies.find({cast: ["Jeff Bridges", "Tim Robbins"]})

### Query for an array element at specific array index
- {"cast.0": "Jeff Bridges"}
and in the shell
- db.movies.find({"cast.0": "Jeff Bridges"})


## Cursor
- Mongo will return 20 matches on first fetch. In the shell if you want the next 20 type 'it' for 'iterate'
````
> it
````

## Projections
- limit the fields return by a query
- projection will be the second parameter to .find()
````
db.movies.find({genre: "Action, Adventure"}, {title: 1})
````
- \_id is returned for all projections unless explicitly excluded
- the '1' means include. You can also exclude using '0'
````
db.movies.find({genre: "Action, Adventure"}, {title: 1, _id: 0})
````
# Updating Data
- updateOne()
````
db.movieDetails.updateOne({
    title: "The Martian"
  },{
      $set: {
        poster: "http://ia.media ..."
      }
    }
  )
````
## update operators
- https://docs.mongodb.com/manual/reference/operator/update/
### numeric updators
- $inc

## updateMany
````
updateMany() ({
  rated: null
}, {
  $unset: {
    rated: ""
  }
})
````

## Upserts
- updates can create documents

## replaceOne
updateOne({
    "imbd.id": detailDoc.imbd.id
  },
    detailDoc
);
