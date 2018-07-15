var MongoClient = require('mongodb').MongoClient
var assert = require('assert')


function ItemDAO(database) {
  "use strict";

  this.db = database;

  this.getCategories = function(callback) {
    "use strict";
    ////////////////////////////////////

    // var categories = [];
    var category = {
        _id: "All",
        num: 9999
    };

    // categories.push(category)
    var categories =  [ 
      { _id: 'All', num: 23 },
      { _id: 'Apparel', num: 6 },
      { _id: 'Books', num: 3 },
      { _id: 'Electronics', num: 3 },
      { _id: 'Kitchen', num: 3 },
      { _id: 'Office', num: 2 },
      { _id: 'Stickers', num: 2 },
      { _id: 'Swag', num: 2 },
      { _id: 'Umbrellas', num: 2 } 
    ]
    callback(categories);
  }

  this.getItems = function(category, page, itemsPerPage, callback) {
      "use strict";

    let queryDoc = { "category": category }
      if (category == "All") {
          queryDoc = {};
      }
      this.db.collection('item').find(queryDoc)
                                  .limit(itemsPerPage)
                                  .skip(page * itemsPerPage)
                                  .toArray(function(err, items) {
          assert.equal(err, null);
          callback(items);
      });
  }


  this.getNumItems = function(category, callback) {
      "use strict";

      let queryDoc = { category: category };
      if (category === "All") {
          queryDoc = {};          // Don't filter on "All"
      }
      this.db.collection('item').find(queryDoc).count(function(err, count) {
          if (err) throw err;
          callback(count);
      });
  }


  this.searchItems = function(query, page, itemsPerPage, callback) {
      "use strict";

      var item = this.createDummyItem();
      var items = [];
      for (var i=0; i<5; i++) {
          items.push(item);
      }

      callback(items);
  }


  this.getNumSearchItems = function(query, callback) {
      "use strict";

      var numItems = 0;

      callback(numItems);
  }


  this.getItem = function(itemId, callback) {
      "use strict";


      var item = this.createDummyItem();

      callback(item);
  }


  this.getRelatedItems = function(callback) {
      "use strict";

      this.db.collection("item").find({})
          .limit(4)
          .toArray(function(err, relatedItems) {
              assert.equal(null, err);
              callback(relatedItems);
          });
  };


  this.addReview = function(itemId, comment, name, stars, callback) {
      "use strict";

      var reviewDoc = {
          name: name,
          comment: comment,
          stars: stars,
          date: Date.now()
      }

      var doc = this.createDummyItem();
      doc.reviews = [reviewDoc];

      callback(doc);
  }


  this.createDummyItem = function() {
      "use strict";

      var item = {
          _id: 1,
          title: "Gray Hooded Sweatshirt",
          description: "The top hooded sweatshirt we offer",
          slogan: "Made of 100% cotton",
          stars: 0,
          category: "Apparel",
          img_url: "/img/products/hoodie.jpg",
          price: 29.99,
          reviews: []
      };

      return item;
  }
}


module.exports.ItemDAO = ItemDAO;
