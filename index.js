const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const axios = require("axios");
const workoutRoutes = require('./routes/movement-routes');
const cardioRoutes = require('./routes/cardio-routes');
const programmingRoutes = require('./routes/programming-routes');
const Cardio = require('./models/cardio');
app.use(bodyparser.json());

// app.use('/api/users',);

// app.use('/api/coach',);

app.use('/api/workouts',workoutRoutes);

app.use('/api/cardio',cardioRoutes);

app.use('/api/programming', programmingRoutes);


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
    // Cardio.collection.getIndexes(function(err, indexes) {
    //     console.log(indexes);
    // });
});
