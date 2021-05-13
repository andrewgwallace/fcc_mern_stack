/* Review Data Access Object
  This coorelates to the reviews controller.
*/

import mongodb from "mongodb"
const ObjectId = mongodb.ObjectID

let reviews

export default class ReviewsDAO {
  // initally connect to db. Provides a reference to the db.
  static async injectDB(conn) {
    if (reviews) { // If reviews, return
      return
    }
    try { // otherwise await the connection the the database and the creation of reviews collection
      reviews = await conn.db(process.env.RESTREVIEWS_NS).collection("reviews") // If the collection does not exist, it is automatically created.
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`)
    }
  }
  // Add a review to the reviews database with the passed values. Provided to apiPostReview controller.
  static async addReview(restaurantId, user, review, date) {
    try {
      const reviewDoc = { 
          name: user.name,
          user_id: user._id,
          date: date,
          text: review,
          restaurant_id: ObjectId(restaurantId), }

      return await reviews.insertOne(reviewDoc)
    } catch (e) {
      console.error(`Unable to post review: ${e}`)
      return { error: e }
    }
  }

  static async updateReview(reviewId, userId, text, date) {
    try {
      const updateResponse = await reviews.updateOne(
        { user_id: userId, _id: ObjectId(reviewId)},
        { $set: { text: text, date: date  } },
      )

      return updateResponse
    } catch (e) {
      console.error(`Unable to update review: ${e}`)
      return { error: e }
    }
  }

  static async deleteReview(reviewId, userId) {

    try {
      const deleteResponse = await reviews.deleteOne({
        _id: ObjectId(reviewId),
        user_id: userId,
      })

      return deleteResponse
    } catch (e) {
      console.error(`Unable to delete review: ${e}`)
      return { error: e }
    }
  }

}