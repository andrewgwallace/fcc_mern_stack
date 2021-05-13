import http from "../helpers/http.js";

class RestaurantDataService {
  getAll(page = 0) {
    return http.get(`restaurants?page=${page}`);
  }

  get(id) {
    // return http.get(`/id/${id}`); // works for node/express only.
    return http.get(`/restaurant?id=${id}`); // required for Realm. Realm does not support path parameters, only query ('?') parameters.
  }

  find(query, by = "name", page = 0) {
    return http.get(`restaurants?${by}=${query}&page=${page}`);
  } 

  createReview(data) {
    return http.post("/review-new", data);
  }

  updateReview(data) {
    return http.put("/review-edit", data);
  }

  deleteReview(id, userId) {
    return http.delete(`/review-delete?id=${id}`, {data:{user_id: userId}});
  }

  getCuisines(id) {
    return http.get(`/cuisines`);
  }

}

export default new RestaurantDataService();