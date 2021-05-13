import express from "express"
import cors from "cors"
import restaurants from "./api/restaurants.route.js"

const app = express()

app.use(cors())
app.use(express.json()) // express now includes body parsing by default which is why this is included here.

app.use("/api/v1/restaurants", restaurants)
// If person goes to an unrecognized route, respond with 404
app.use("*", (req, res) => res.status(404).json({ error: "not found"}))

export default app