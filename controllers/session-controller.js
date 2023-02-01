const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Session = require("../models/session");
const User = require("../models/user");
const Movement = require("../models/movement");
const { findOne } = require("../models/movement");

const createSession = async (req, res, next) => {
    const {
        exercise,
        cardio,
        distance,
        time,
        weight,
        reps,
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
        conditioning: cardio,
        date: new Date(),
        reps,
        rounds,
        weight,
        distance,
        time,
        athlete,
        programming,
        movement: movement,
    });

    try {
        await session.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Failed to add session", 500));
    }

    const athleteID = req.body.athlete;
    const sessionID = session.id;

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

    let updateSession;
    try {
        updateSession = await Session.findById(sessionID);
    } catch (err) {
        return next(
            new HttpError(
                "Could not update session, please try again later",
                500
            )
        );
    }

    if (!updateSession) {
        return next(new HttpError("No session with that ID exists", 404));
    }

    updateSession.exercise = req.body.exercise;
    updateSession.cardio = req.body.cardio;
    updateSession.distance = req.body.distance;
    updateSession.time = req.body.time;
    updateSession.weight = req.body.weight;
    updateSession.rounds = req.body.rounds;
    updateSession.reps = req.body.reps;

    try {
        await updateSession.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not update session, please try again later",
                500
            )
        );
    }

    res.status(200).json({
        session: updateSession.toObject({ getters: true }),
    });
};

const deleteSession = async (req, res, next) => {
    const sessionID = req.params.sid;
    const userID = req.body.athlete;

    let deleteUserSession;
    try {
        deleteUserSession = await User.findByIdAndUpdate(
            userID,
            { workouts: sessionID },
            { $pull: { workouts: sessionID } },
            { new: true }
        );
    } catch (err) {
        return next(new HttpError("Could not delete user session", 500));
    }

    if (!deleteUserSession.nModified) {
        return next(
            new HttpError("Could not find user session for this id", 404)
        );
    }

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
