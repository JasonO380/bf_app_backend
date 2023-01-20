const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const axios = require("axios");
const workoutRoutes = require('./routes/workout-routes')
app.use(bodyparser.json());

app.use('/api/workouts',workoutRoutes);


const mongo =
    "mongodb+srv://JMO380:nosaj380!@barbellapp.wp1vz99.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err);
    });

app.listen(5000, () => {
    console.log("Server started on port 5000");
});
