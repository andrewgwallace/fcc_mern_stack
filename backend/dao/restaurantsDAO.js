// Data Access Objects (DAO)

import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID
let restaurants

export default class RestaurantsDAO {
  static async injectDB(conn) { // initally connect to db. Provides a reference to the db.
    if(restaurants) {
      return // if there is already a connection reference to restaurants, just return
    }
    try {
      restaurants = await conn.db(process.env.RESTREVIEWS_NS).collection("restaurants")
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in restaurantsDAO: ${e}`,
      )
    }
  }

  static async getRestaurants({
    filters = null,
    page = 0,
    restaurantsPerPage = 20,
  } = {}) {
    let query
    if (filters) {
      if ("name" in filters) {
        query = { $text: { $search: filters["name"] } }
      } else if ("cuisine" in filters) {
        query = { "cuisine": { $eq: filters["cuisine"] } }
      } else if ("zipcode" in filters) {
        query = { "address.zipcode": { $eq: filters["zipcode"] } }
      }
    }

    let cursor
    
    try {
      cursor = await restaurants
        .find(query)
    } catch (e) {
      console.error(`Unable to issue find command, ${e}`)
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }

    const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage * page)

    try {
      const restaurantsList = await displayCursor.toArray()
      const totalNumRestaurants = await restaurants.countDocuments(query)

      return { restaurantsList, totalNumRestaurants }
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`,
      )
      return { restaurantsList: [], totalNumRestaurants: 0 }
    }
  }
  static async getRestaurantByID(id) {
    try {
      // Used to help match certain collections together, it's data aggregation. 
      // Transforms data into aggregated results.
      // Use Compass or Data Explorer to assist in pipeline creation if necessary
      const pipeline = [
        {
            $match: {
                _id: new ObjectId(id),
            },
        },
              {
                  $lookup: { // from reviews collection...
                      from: "reviews",
                      let: {
                          id: "$_id",
                      },
                      // create a pipeline...
                      pipeline: [
                          {
                            // that matches...
                              $match: {
                                // the aggregation expression equal to...
                                  $expr: {
                                    // The restaurant id ...
                                      $eq: ["$restaurant_id", "$$id"],
                                  },
                              },
                          },
                          {
                            // sorted by date in reverse order...
                              $sort: {
                                  date: -1,
                              },
                          },
                      ],
                      // and setting the result as "reviews" which will then...
                      as: "reviews",
                  },
              },
              {
                // be added as a field called "reviews".
                  $addFields: {
                      reviews: "$reviews",
                  },
              },
          ]
          // Now, collect everything together and return the 'next' item
          // which is the restaurant with all the reviews connected. 
      return await restaurants.aggregate(pipeline).next()
    } catch (e) {
      console.error(`Something went wrong in getRestaurantByID: ${e}`)
      throw e
    }
  }
  static async getCuisines() {
    let cuisines = []
    try {
      // 'distinct' means only return one result of each quisine to avoid duplicates.
      cuisines = await restaurants.distinct("cuisine")
      return cuisines
    } catch (e) {
      console.error(`Unable to get cuisines, ${e}`)
      return cuisines
    }
  }
}
