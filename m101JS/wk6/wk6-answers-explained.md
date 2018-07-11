Homework 6.1
The problem presented was to return the 'unique' companies for which "eric-di-benedetto" ( by the matching permalink value given ) was actually associated with.

The question presents an existing aggregation pipeline as a sample to begin with. That sample actually does a number of things that are not necessary for the solution as all you really need to obtain a result is:

Match the "documents" which contain "eric-di-benedetto" as at least one member of the relationships array within the document. It does not matter if they appear more than once or how many other people are in the array. A "document" in this case is actually a "company" as mentioned in the question.

Obtain the "unique" detail of that "company/document", which is probably best summarized in the name field.

So the very first thing to do is simply apply the $match:

{ "$match": {
  "relationships.person.permalink": "eric-di-benedetto"
}}
Then from the "documents" returned, simply $group using the "name" property to obtain the unique values:

{ "$group": { "_id": "$name" } }
Alternately to feeding the values to the _id grouping key, you could also use $addToSet as an accumulator:

{ "$group": { "_id": null, "companies": { "$addToSet": "$name" } } }
That alone should give you enough where you can simply judge how many companies are returned by eyeball. If you really want, you could then either simply apply a "counter" with the first case and $group by null. i.e:

{ "$group": { "_id": null, "companies": { "$push": "$_id" }, "count": { "$sum": 1 } } }
Or if you already made the "set" into a single document grouping by null, then just apply the $size aggregation operator instead:

{ "$project": { "companies": 1, "count": { "$size": "$companies" } } }
The main point is what the question actually asked does not require $unwind or any more pipeline stages than the three outlined above.

The alternate case could be that you attempt to return ALL of the specified names ( or just the example counts given ) with the unique company count for each. This does require you to $unwind the array first as you are grouping on values contained "within" the array as part of the the grouping key ( being by person and unique companies within them ). This case is given by example in the code at the end of this post along with the other two possible approaches already mentioned.

Homework 6.2
Again this is another question dealing with items inside an array, but this time you are being asked to "exclude" those items which have a "type" which is equal to "quiz" from the calculated result. There are a couple of "traps" here, and again this is another problem where it is not actually required to use $unwind to work with the array items.

The first "trap" ( though optional ) involves following the "good practice" of ensuring that a $match stage would usually be the very first stage in any aggregation pipeline. So the problem here is anyone who attempted this:

{ "$match": { "scores.type": { "$ne": "quiz" } } }
Where that is applied as the very first stage you will actually get no results. The basic reasoning here is that every document actually contains "at least one" item which is of "type" equal to "quiz", and therefore no document matches the condition here which is actually asking that "no array element matches".

So it is "optional" and not required, and all documents actually have "quiz" anyway so there is no need to filter any "document" from the working set. Following "best practice" though, the correct statement matching "contains array elements other than 'quiz'" would actually be presented using $elemMatch:

{ "$match": {
  "scores": { "$elemMatch": { "type": { "$ne": "quiz" } }
}}
As this actually looks at "each element individually", this is actually what you would want as an initial stage, given of course the case where there were indeed documents which may not contain any other element other than "quiz" types at all. But there isn't, so $match is not really "needed" to obtain a result. You should get in practice of using it or another valid "filter" stage for real world usage though.

The reason why $unwind is not really required here is twofold. The first and most applicable reason is that $avg can both apply to an "array of values" as well as being an "accumulator" during grouping. Since we can actually access the "scores" array values as they are already presented in the document and indeed "filter" those to remove the "quiz" values, then you should be able to see that by reading the documentation for $avg.

The other reason is to look carefully at the documents, where the question implies "grouping" by both class_id and student_id, take a good look at what actually makes a "document" in the collection:

db.grades.count();   // 280

db.grades.aggregate([
  { "$group": { "_id": { "class": "$class_id", "student": "$student_id" } } },
  { "$group": { "_id": null, "count": { "$sum": 1 } } }
])
// Also 280 results
So class_id and student_id in combination already makes a unique combination, and this means it's what the "documents" already contain. So student_id in combination here does not really add any value, since you can simply get the "average" of the filtered array from "within the document" without any further deconstruction via $unwind or additional grouping on the compound key.

This makes obtaining the "average" a case of applying one stage only:

{ "$group": {
  "_id": { "class": "$class_id" },
  "avg_score": {
    "$avg": {
      "$avg": {
        "$map": {
          "input": {
            "$filter": {
              "input": "$scores",
              "cond": { "$ne": [ "$$this.type", "quiz" ] }
            }
          },
          "in": "$$this.score"
        }
      }
    }
  }
}}
To break that down ( and from the "inside" to "outer" ), the $filter operator is used in order to return only the array items which actually match the condition ( not "quiz" ) as they are presented "per student". This "filtered" array is used as input for the $map operator, which allows the extraction of just the "score" value from each array element. Whilst we can notate things like "$scores.score" to return just the "score" values of each array element, you cannot really do that with the output of $filter within a "single" pipeline stage. And doing this all in a "single" stage is the most optimal performance version of doing this. More pipeline stages adds more processing time.

Once $map has extracted the "score" values only as an "array", this is fed to $avg ( the inner one ) which returns the "student average" for that document, from the already filtered items. Since we actually want those "averages" per "class_id", we use the "accumulator" form of $avg to "wrap" the output. Since MongoDB 3.2 this is actually a common way to work with values inside an array "without" applying $unwind with this "double barreled" form of invoking both the "array" function and the "accumulator" function to "reduce" the totals in such a grouping.

The alternate case is of course to $unwind the items and then apply a simple $ne with $match much like the first example case was given. This is perfectly valid, but the general case and in particular with large datasets is using the "inline" processing with operations like $filter, $map and the "double barreled" accumulator usage is much more efficient than producing a new document for every array member and working with those "unwound" results.

The resulting "average" is of course then "sorted" on using the $sort stage so that the "largest" value is on top of the results.

{ "$sort": { "avg_score": - 1 } }
This is all that is really needed. You can "optionally" $limit the results returned, but particularly through the mongo shell the "largest" result should be easily visible.

If you thought you would use $max or another accumulator here, then this would not obtain the correct result. The purpose of something like $max would be to find the "largest within a grouping boundary" as opposed to what is really asked which is the "boundary with the largest value", and that means "ordering" or "sorting" the results by that value.

As a quick note, for anyone who used $unwind but did not $group by "both" the student_id and class_id first and then summarized the average by class, you actually would still get the same "largest" result as the answer. The ranking of other "classes" would come out different as the "averages" would be slightly different, but the "largest" is not actually changed.

Homework 6.3
Following on from the previous problem, this one not only does not require usage of $unwind but also does not even require $group to return a solution at all. Again we really only need work with the "document" and do not need to dissect the array to get at inner values or even "group" any detail of the document. The $avg operator is all that is needed along with $project in order to "reduce" that value for each document.

The first "tricky" part though is actually in the document selection. Presuming that by this stage no-one should really have trouble with selection of the matching "founded_year" for 2004, the real question is "how to select an array by the number of items it has?".

Whilst this can be solved in a number of ways, the simplest to write and actually the most efficient query is simply:

{ "$match": { "founded_year": 2004, "funding_rounds.4": { "$exists": true } } }
This actually has been covered very early in the course if you go back and look, though it was never presented with both concepts put together.

The case for "funding_rounds.4" is using "dot notation" to identify the "fifth" array position ( n minus 1 ) with common array index notation, which means you can query for matches of "values" at that specific position. The $exists operator has already been presented as a way of determining "is this property present within the document?", but as you can also see this does additionally apply to looking for the presence of a specified array index.

How does that work exactly? Consider the following:

{ "a": 1, "b": [1, 2, 3] },       // false
{ "a": 2, "b": [1, 2, 3, 4] },    // true
{ "a": 3, "b": [1, 2, 3, 4, 5] }, // true
{ "a": 4, "b": [1, 2] },          // false
{ "a": 5 }                        // false
If I were to ask { "b.3": { "$exists": true } } here, this means the "4th" array position which is indicated that only the documents 2 and 3 above actually have. So it's worth noting here that the match is obtained for "both" because the "4th" position is present whether the array contains either "four" or "five" items or more. This is in essence what the question asked by greater than.

Whilst there is a $size (query) operator, this is only capable of matching an "exact size" and cannot apply to a "range", or "greater than" as the question asks, and it's not practical to specify every possible value within an $or. The documentation on that operator does suggest though that:

... To select documents based on fields with different numbers of elements, create a counter field that you increment when you add elements to a field.

In actual practice this is "very good advice" as such a value always present in the document and not as a "calculated value" ( which is still "technically" what is applied with $exists even ) can actually be "indexed", which will ultimately lead to a very fast selection. So anyone who went through those steps of permanently updating each document with the array length and even indexing the field actually took a very valid approach.

Of course the other common option is people opting for the $size (aggregation) operator, and including a $project stage in order to return the array size and then "filtering" those documents with arrays under the required length by using $match. This is valid, but it's not very efficient. It is probably what most people actually did if you did not find the $exists method by searching or of course updating the documents as already mentioned.

There is an additional wrinkle to that which MongoDB 3.6 adds using the newly added $expr operator, which means there would be no need to separate that projection from the initial query, or even apply with $redact for those who found that one. So you could in fact now do:

{ "$match": {
  "founded_year": 2004,
  "$expr": { "$gte": [{ "$size": "$funding_rounds" }, 5] }
}}
Which makes it simpler as a single stage rather than separate stages. This really does not do anything for overall efficiency though, and whilst "better" than separate stages, it really doesn't offer anything that the first form with $exists does not already do in terms of performance, and is notably more terse to write. Though the "intent" of the code "may" be slightly clearer to interpret.

Notable mention goes to $where for those who might have found examples of that being used as another solution:

.find({ "founded_year": 2004, "$where": "this.funding_rounds.length >= 5" })
However this was never actually an option for usage with the aggregation pipeline itself, which is actually needed to perform the next part of the query operations, which is obtaining the "average". So it's something you cannot really use, and you should not need to as the other "native" ways already shown are much more efficient than JavaScript interpretation.

Getting the "average" is simply "per document". Therefore we don't need to $group and most importantly no $unwind, since we can work with the array values directly to $avg:

{ "$project": {
    "name": 1,
    "raised_avg": { "$avg": "$funding_rounds.raised_amount" }
}}
So "$funding_rounds.raised_amount" returns an array of simply those "values" from within each nested document of the array members. This is directly applied to $avg just as you can from MongoDB 3.2 onwards. And a "company" is actually identified as a "document", so we already know there is no need to $group anywhere here at all.

All that remains is to work out the "smallest" value from the averages, which following on from what we already know from the preceding questions we just reverse the sort order to "ascending" as opposed to "descending" which we used in previous questions:

{ "$sort": { "raised_avg": 1 } }
Again, you only really need return one result, so optionally $limit in order to restrict what you see even though the shell will limit the cursor batch displayed for you.

All Examples
For convenience, all example solutions are contained in a singular listing. The code is written in expectation of running in a modern NodeJS LTS release ( version 8 or greater, or 7 dev release or greater ) with async/await support and using the latest 3.x driver series for NodeJS. In fact, consider the package.json accompanying this to be:

{
  "dependencies": {
    "mongodb": "^3.0.2"
  }
}
Though written with a latest driver release in mind, the actual server version does not matter to the listing other than expecting to connect to "at least" a MongoDB 3.2 instance, as was the prerequisite for the course in general. In fact the code will actually change what is executed depending on the server version to which it is attached.

Anything beyond that, feel free to alter code to your own environment choices, or simply just read it for the different example listings.

const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost/';
const minVersion = "3.2";

function getQueries(version) {

  version = version || minVersion;

  const people = [
    "eric-di-benedetto",
    "roger-ehrenberg",
    "josh-stein",
    "tim-hanlon"
  ];

  return [
    // HW 6.1 - Unique companies as grouping key
    {
      "dbname": "crunchbase",
      "colname": "companies",
      "comment": "HW 6.1 - Unique companies as grouping key",
      "pipeline": [
        { "$match": {
          "relationships.person.permalink": people[0]
        }},
        { "$group": { "_id": "$name" } },
        { "$group": {
          "_id": null,
          "companies": { "$push": "$_id" },
          "count": { "$sum": 1 }
        }}
      ]
    },
    // HW 6.1 - Unique companies via $addToSet
    {
      "dbname": "crunchbase",
      "colname": "companies",
      "comment": "HW 6.1 - Unique companies via $addToSet",
      "pipeline": [
        { "$match": {
          "relationships.person.permalink": people[0]
        }},
        { "$group": {
          "_id": null,
          "companies": { "$addToSet": "$name" }
        }},
        { "$project": {
          "_id": 0,
          "companies": 1,
          "count": { "$size": "$companies" }
        }}
      ]
    },
    // HW 6.1 - Unique companies per multiple people
    {
      "dbname": "crunchbase",
      "colname": "companies",
      "comment": "HW 6.1 - Unique companies per multiple people",
      "pipeline": [
        { "$match": {
          "relationships.person.permalink": { "$in": people }
        }},
        { "$project": {
          "_id": 0,
          "name": 1,
          "person": {
            "$filter": {
              "input": "$relationships.person",
              "cond": (version >= "3.4")
                ? { "$in": [ "$$this.permalink", people ] }
                : { "$or": people.map(p => ({ "$eq": [ "$$this.permalink", p ] })) }
            }
          }
        }},
        { "$unwind": "$person" },
        { "$group": {
          "_id": { "person": "$person", "company": "$name" }
        }},
        { "$group": {
          "_id": "$_id.person",
          "companies":  { "$push": "$_id.company" },
          "count": { "$sum": 1 }
        }}
      ]
    },
    // HW 6.2 - Avg student scores inline and aggregate per class
    {
      "dbname": "test",
      "colname": "grades",
      "comment": "HW 6.2 - Avg student scores inline and aggregate per class",
      "pipeline": [
        { "$match": {
          "scores": {
            "$elemMatch": { "type": { "$ne": "quiz" } }
          }
        }},
        { "$group": {
          "_id": { "class": "$class_id" },
          "avg_score": {
            "$avg": {
              "$avg": {
                "$map": {
                  "input": {
                    "$filter": {
                      "input": "$scores",
                      "cond": { "$ne": [ "$$this.type", "quiz" ] }
                    }
                  },
                  "in": "$$this.score"
                }
              }
            }
          }
        }},
        { "$sort": { "avg_score": -1 } },
        { "$limit": 5 }
      ]
    },
    // HW 6.2 - Filter after $unwind and aggregate
    {
      "dbname": "test",
      "colname": "grades",
      "comment": "HW 6.2 - Filter after $unwind and aggregate",
      "pipeline": [
        { "$match": {
          "scores": {
            "$elemMatch": { "type": { "$ne": "quiz" } }
          }
        }},
        { "$unwind": "$scores" },
        { "$match": { "scores.type": { "$ne": "quiz" } } },
        { "$group": {
          "_id": { "student": "$student_id", "class": "$class_id" },
          "avg_score": { "$avg": "$scores.score" }
        }},
        { "$group": {
          "_id": { "class": "$_id.class" },
          "avg_score": { "$avg": "$avg_score" }
        }},
        { "$sort": { "avg_score": -1 } },
        { "$limit": 5 }
      ]
    },
    // HW 6.3 - $match by present array elements and $avg as projection
    {
      "dbname": "crunchbase",
      "colname": "companies",
      "comment": "HW 6.3 - $match by present array elements and $avg as projection",
      "pipeline": [
        { "$match": {
          "founded_year": 2004,
          "funding_rounds.4": { "$exists": true }
        }},
        { "$project": {
          "_id": 0,
          "name": 1,
          "raised_avg": { "$avg": "$funding_rounds.raised_amount" }
        }},
        { "$sort": { "raised_avg": 1 } },
        { "$limit": 5 }
      ]
    },
    // HW 6.3 - $project the $size and filter
    {
      "dbname": "crunchbase",
      "colname": "companies",
      "comment": "HW 6.3 - $project the $size and filter after $unwind",
      "pipeline": [
        { "$match": { "founded_year": 2004 } },
        { "$project": {
          "_id": 0,
          "name": 1,
          "funding_rounds": 1,
          "size": { "$size": "$funding_rounds" }
        }},
        { "$match": { "size": { "$gte": 5 } } },
        { "$unwind": "$funding_rounds" },
        { "$group": {
          "_id": { "name": "$name" },
          "raised_avg": { "$avg": "$funding_rounds.raised_amount" }
        }},
        { "$sort": { "raised_avg": 1 } },
        { "$limit": 5 }
      ]
    },
    // HW 6.3 - MongoDB 3.6 inline the $size to $expr
    ...((version >= "3.6") ?
    [{
      "dbname": "crunchbase",
      "colname": "companies",
      "comment": "HW 6.3 - MongoDB 3.6 inline the $size to $expr",
      "pipeline": [
        { "$match": {
          "founded_year": 2004,
          "$expr": { "$gte": [{ "$size": "$funding_rounds" }, 5] }
        }},
        { "$project": {
          "_id": 0,
          "name": 1,
          "raised_avg": { "$avg": "$funding_rounds.raised_amount" }
        }},
        { "$sort": { "raised_avg": 1 } },
        { "$limit": 5 }
      ]
    }] : [])
  ];

}

function log(data) {
  console.log(JSON.stringify(data, undefined, 2))
}

(async function() {

  try {

    const conn = await MongoClient.connect(uri);
    let { version } = await conn.db('test').command({ buildInfo: 1 });

    if ( version < minVersion )
      throw new Error(
        `You are supposed to be running MongoDB ${minVersion} at least`);

    for ( let { dbname, colname, comment, pipeline } of getQueries(version) ) {
      let db = conn.db(dbname);
      let collection = db.collection(colname);

      let results = await collection.aggregate(pipeline).toArray();
      log({ comment, pipeline, results });
    }

    conn.close();

  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }

})();
