# Schema Design

- Single most import consideration in schema design is to match the data access patterns of your application because it yields the best performance as well as convience in programming the application.

## Considerations
__think of employee db with resume__
- **frequency of access** - you don't want to pull data that is infrequently used into memory. So if you access the resume infrequently, you may want to put it in a separate collection.
- **which set of data is growing frequently (or not)** - sounds like 'frequency of update' to me. You don't want to incur the overhead of loading an embedded doc into memory if the parent document is updated frequently but the embedded doc is updated infrequently.
- **absolute size** - if a document is larger than 16MB you may not be able to embed it.
- **atomicity of data** - if you cannot tolereate any inconsistency then embedding is the best choice, and vice versa.

## Example - one to many
Db contains all people for each city. So there is a 1:many relationship. NY has 8 million people
- you cannot embed 8 million people (duplication of data is a concern when size is large)
- in this case use __true linking__: link from the many (people) to the one (city).

## Example - one to few
This is still a 'one to many' but
E.g., blog posts : comments
- "is easier to model inside of MongoDb" - interesting statement
- "comments are not very many" (I guess that is true for most blogs)
- so in this case you can have a single collection

## Example - many to many (aka few : few)
Db contains books and authors. Each author can have > 1 book and each book can have > 1 author. **OR** students : teachers.
- in both cases it is many : many but from a MongoDb perspective, both sides of the relationship are 'few'.
- "there are many of these relationships in the real world"
- **Schema**: 'link them right in the document' using an array. 
  - have 2 collections 'books' & 'authors'
  - books has an 'authors' array which contains author _ids
  - authors has a a books array which contains book _ids
  - so they are **linked in both directions**
- having 2 collections is better for data cleanliness but if for performance needs you could embed books in authors
### students : teachers
- you likely want to insert a teacher before they are associated with any students and to insert a student before they are assigned to any teachers.
- so in this case, embedding would not work. 


## "Multikey Indexes"
Using students : teachers
- considering to typical queries
  - find all teachers a given student has had & find all students a given teacher has had

> to see a query plan
> append .explain()
> to the end of the query

## Benefits of Embedding
- Performance
- improved read performance by avoiding disk latency
- avoid round-trips to the db
### Caution
- if the document is growing a lot and is likely to need to be moved on the disk, then embedding my hurt performance.

## Representing Trees
E.g., products * category
- list the anstors in a array on the categoy collection

## When to denormalize
- **1:1** - go ahead & embed
- **1:many** - go ahead & embed **but** do so from the many to 1
- **many:many** - linking with arrays of _ids is likely the best choice
