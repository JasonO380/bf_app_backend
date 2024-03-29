const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Session = require("../models/session");
const User = require("../models/user");
const Movement = require("../models/movement");
const Client = require("../models/client");
const { findOne } = require("../models/movement");

const createSession = async (req, res, next) => {
    const {
        exercise,
        client,
        cardio,
        distance,
        time,
        weight,
        reps,
        workouts,
        rounds,
        athlete,
        programming,
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    let movementExists;
    try {
        movementExists = await Movement.findOne({ movement: exercise });
    } catch (err) {
        return next(new HttpError("Failed to find movement", 500));
    }

    let movement;
    if (!movementExists) {
        movement = new Movement({
            movement: exercise,
            date: new Date(),
        });

        try {
            await movement.save();
        } catch (err) {
            return next(new HttpError("Failed to save movement", 402));
        }
    } else {
        movement = movementExists;
    }

    const session = new Session({
        exercise,
        date: new Date(),
        reps,
        rounds,
        weight,
        distance,
        time,
        client,
        athlete,
        programming,
    });

    try {
        await session.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Failed to add session", 500));
    }

    const athleteID = req.body.athlete;
    const sessionID = session.id;
    const clientID = client;
    if (athleteID) {
        try {
            const user = await User.findByIdAndUpdate(athleteID, {
                $push: { workouts: sessionID },
            });
            if (!user) {
                return next(new HttpError("User not found", 404));
            }
            res.status(200).json({
                message: "Workout added to user's workouts",
                user: user.toObject({ getters: true }),
                session: session.toObject({ getters: true }),
            });
        } catch (err) {
            return next(new HttpError("Failed to add workout to user", 500));
        }
    }

    if (clientID) {
        try {
            const client = await Client.findByIdAndUpdate(clientID, {
                $push: { session: sessionID },
            });
            if (!client) {
                return next(new HttpError("Client not found", 404));
            }
            res.status(200).json({
                message: "Workout added to user's workouts",
                client: client.toObject({ getters: true }),
                session: session.toObject({ getters: true }),
            });
        } catch (err) {
            return next(new HttpError("Failed to add session to client", 500));
        }
    }
};

const getSessionByID = async (req, res, next) => {
    const sessionID = req.params.sid;
    let session;
    try {
        session = await Session.findById(sessionID);
    } catch (err) {
        const error = new HttpError(
            "Could not perform search please try again later",
            500
        );
        return next(error);
    }

    res.json({ session: session.toObject({ getters: true }) });
};

const updateSession = async (req, res, next) => {
    const sessionID = req.params.sid;
    const { exercise, weight, reps, rounds, distance, time } = req.body;

    let movementExists;
    let movement;
    try {
        movementExists = await Movement.findOne({ movement: exercise });
        if (!movementExists) {
            movement = new Movement({ movement: exercise });
            await movement.save();
        }
    } catch (err) {
        console.log(err);
    }

    let updateSession;
    try {
        updateSession = await Session.findById(sessionID);
    } catch (err) {
        console.log(err);
    }

    if (!updateSession) {
        return next(new HttpError("No session with that ID exists", 404));
    }

    updateSession.exercise = exercise;
    updateSession.distance = distance;
    updateSession.time = time;
    updateSession.weight = weight;
    updateSession.rounds = rounds;
    updateSession.reps = reps;

    try {
        console.log(updateSession);
        await updateSession.save();
        res.status(200).json({
            session: updateSession.toObject({ getters: true }),
        });
    } catch (err) {
        return next(
            new HttpError(
                "Could not update session, please try again later",
                500
            )
        );
    }

    // res.status(200).json({
    //     session: updateSession.toObject({ getters: true }),
    // });
};

const deleteSession = async (req, res, next) => {
    const sessionID = req.params.sid;

    let deleteSession;
    try {
        deleteSession = await Session.findByIdAndRemove(sessionID);
    } catch (err) {
        return next(
            new HttpError(
                "Could not delete session, please try again later",
                500
            )
        );
    }

    if (!deleteSession) {
        return next(new HttpError("Could not find session for this id", 404));
    }

    res.status(200).json({ message: "Session deleted." });
};

exports.createSession = createSession;
exports.getSessionByID = getSessionByID;
exports.updateSession = updateSession;
exports.deleteSession = deleteSession;
