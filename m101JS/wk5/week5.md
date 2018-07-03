# Indexing & Sharding

## Storage Engines?
- interface between persistant storage (disks) and the database itself (mongodb server)
- 'the mongodb server talks to the persistant storage through a storage engine.
- all data written to disk is done so by the storage engine
- the storage engine my use memory to optimize the process
- MongoDB ships with 2 storage engines
  - MMAP: default, 
  - Wired Tiger
- What a storage engine IS NOT
  - does not effect communication between mongodb servers in a cluster
  - does not effect the API that is presented to the programmer

## MMAPv1
- **collection level currency** (locking)
- each collection is its own file
  - therefore - multiple writes to the same collection have two wait for each other 
  - does in-place writes if possible and if not moves it as a whole.
  - **note:** - the operating system determins what is in memory and what is on disk - mongodb can't control
  - **power of 2 sizes** - space allocated is > needed to leave room for growth
    - 3 byte doc gets 4 bytes
    - 7 byte doc gets 8 bytes
    - 19 byte doc gets 32 bytes

## Wired Tiger
- **Document level concurrency** (lock free) with optimistic currency model
  - Assumes two writes will not be to the same document and if they are one of them needs to be unwound and needs to try again.
  - **compression** - both up of documents and indexes
  - hum ... wiretiger manages the memory that is used to manage a file. It decides which blocks to keep in memory and which to send back to disk
  - data in memory is not compressed but data to, from and on disk is - __'saves a tramendous amout of space for certain types of data'__
  - is 'append only updates' i.e., no inplace updates. This is what allows it to operate without locks

> Start mongodb with wiretiger use flag -storageengine wireTiger (or something like that his handwritting was sloppy) so here it is good
> ```
> $ mongod -dbpath WT -storageengine wiredTiger
> ```
> **you must tell it what directory to use if you have already used MMAP because it wiredTiger c/n write to the same file as MMAP**

To see what engine you are using
```js
$ db.foo.stats()
```
will show lots of stuff about db including the storage engine

## Indexes
- With no index data c/b scattered around disk (table scan in relational world)
- an index is anordered set of things
- if you index is on 'name' the index will hold a pointer from each name to the location of dadt on disk (I think this means the whole record/doc?)
- since an index is ordered it is fast to search it
- structured with a Btree
### What about an index on 2 fields
(name, hair_color) - with be how the data is represented in db so you get
andrew,blond
andrew, red
barry, brown
barry, red
(so these people have dyed thier hair with 2 colors :) )
- this also makes range queries possible.
**But** what if i had this index and wanted to search on hair_color only - see the video
in short if you have index (a, b, c) you can search on
- a
- a,b
- a,b,c
but not any other combination of a, b & c such as b,c

> Indexing shows down writes bec the index nec to be updated (reads are faster)


## Explain
```
db.students.explain().find({student_id:5})
```
### Add Index
```
db.students.createIndex({student_id:1})
```
- creating indexes takes time, need to scan all of collection and write index to disk

### Explain with (true)
```
db.students.explain(true).find({student_id:5})
```
will actually run the query and then can give you additional information such as number of documents looked at

## Compound index
```
db.students.createIndex({student_id:1, class_id:-1})
```

db.students.createIndex({class: 1, student_name: 1})

## Discover and Delete Indexes
```
db.students.getIndexes()
```
db.students.dropIndex({student_id:1})

## Multikey Indexes = indexes on arrays
{
  name: 'karl',
  tags: ['photography', 'bicycling', 'golf'],
  color: 'green',
  location: ['NY', 'CA']
}
Can
- create index on (tags)
- create index on (tags, color)
  - creates: ('photography, red'), ('bicycling', red), ('golf', 'red')
Cannot create
- (tags, location) as only one field in the index can be an array


## Notation & MultiKey
- use dot notation


## Unique Index
```js
$ db.collection.createIndex({"field":1||-1}, {uniquie: true})
```
db.students.createIndex({"student_id": 1, "class_id":1}, {unique: true})

## Sparse Indexes
A type of index that can be used when some of the documents are missing the indexed key
Leaves out of the index documents that are missing the indexed key

> **using a sparse index in a sort will omitt docs that don't have the indexed key**

## Foreground vs BackGround Index Creation
- Foreground
  - faster
  - blocks all read and writes in the same db (all collections)
- Background
  - shower
  - don't block
  - can only have one running at a time
  - still high load

## Explain (again)
- cannot run insert on .explain()
- there is a explain().help()

```
db.members.explain().remove({firstName: 'First-0'})
var ee = db.example.explain(); ee.find({firstName: 'First-1'})
```

## Explain Modes
- query Planner default
- execution stats
- all plans execution

## Covered Query
- query can be satisfied entirely by an index (doesn't need to look at any documents
)
- in explain
  - totalKeysExamined will be > 0
  - totalDocsExamined will be = 0
- It will only work if you project exactly what in the index or a subset thereof. If you don't project, it will need to look if there is some other key in the db.

## Choosing an Index
- look at query shape (fields & sort, more?)
- select possible indexes
- on parrallel threads and see which is fastest
- query plan for queries of given shape are cached and reused
- there are criteria for when it/they is flushed

## Index Size
- Working Set - portion of data clients are frequently accessing - want all of that in data
- Indexes will go in working set
- how to estimate amount of memory needed
  - uses stats() method to see size ofindexes or just .totalIndexSize()
- with WiredTiger -indexPrefixCmpression, indexes will be smaller
- compression uses CPU

## Index Cardinality
How many index points are there for each type of index
Regular index
  - one to one for documents, therefore propotional to document size
Sparse
  - some docs are not in doc so <= num of docs
Multikey
  - Can have multiple index points for each document so > num of docs


> When a document moves on disk, every single index point related to that document needs to be updated.

## Geospacial Indexes
### 2D
E.e., find business of particular type closest to a given person at a specific x,y location
- x, y
Index
- use db.stores.ensureIndex{'location', '2d', type: 1} (location is not a key word)
- find({location: {$near
Query
- find({location:{$near:[x,y]}}).limit(20) - data is returned in order of increasing distance
- e.g., db.places.find({location:{$near:[74,140]}}).limit(3)
### 3D 'Geospacial Spherical'
Use longitude & latitude
- latitiude is distance from equator and goes from -90 to +90
- longitude
- uses GeoJSON - mongo implements only part of it

Make an index
```
db.places.ensureIndex({'location':'2dsphere'})
```

Use a query
```js
db.places.find({
  location:{
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-122.166641, 37.4278925],
      }
      $maxDistance: 2000
    }
  }
})
```
Example
```
db.stores.find({
  loc:{
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [-130, 39],
      },
      $maxDistance: 1000000
    }
  }
})
```

## Full Text Search Index
Example
```
db.sentences.ensureIndex({'words':'text'})
db.sentences.find({$text:{$search:'dog'}})
```

Return in the order of significance.
```
db.sentences.find({$text:{$search:'dog tree obsidian'}}, {score:{$meta: 'textScore'}}).sort({score:{$meta:'textScore'}})
```

## Efficiency of Index Use
Goal
- Efficient read/write operations
- selectivity: minimize records scanned
- other ops: how are sorts handled

Force db to use a given index
.hint()

## Logging and Profiling
- mongo by default logs queries > 100ms to the regular log

## Profiling
- writes to system.profile for any query that takes longer than the specified period
- has 3 levels
  - 0 = off
  - 1 = log slow queries (performance feature)
  - 2 = log all queries (dev feature)

```js
db.system.profile.find().pretty()
```

## Mongotop
## Mongostat

## Sharding
