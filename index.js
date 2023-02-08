const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const axios = require("axios");
const workoutRoutes = require("./routes/movement-routes");
const cardioRoutes = require("./routes/cardio-routes");
const userRoutes = require("./routes/user-routes");
const programmingRoutes = require("./routes/programming-routes");
const coachRoutes = require("./routes/trainer-routes");
const sessionRoutes = require("./routes/session-routes");
const weekDayRoutes = require("./routes/week-day-routes");
const clientRoutes = require("./routes/client-routes");
const Cardio = require("./models/cardio");
app.use(bodyparser.json());

app.use((req, res, next)=> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
});

app.use("/api/users", userRoutes);

app.use("/api/coach", coachRoutes);

app.use("/api/session", sessionRoutes);

app.use("/api/workouts", workoutRoutes);

app.use("/api/cardio", cardioRoutes);

app.use("/api/programming", programmingRoutes);

app.use("/api/week", weekDayRoutes);

app.use("/api/client", clientRoutes);

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
