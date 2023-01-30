const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Movement = require("../models/movement");
const User = require("../models/user");
const { findOne } = require("../models/user");


const createUserSession = async (req, res, next) => {
    const {
        exercise,
        conditioning,
        weight,
        reps,
        rounds,
        distance,
        time,
        athlete,
    } = req.body;
    const userID = req.body.athlete;
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
        // return next(new HttpError("Failed to find movement", 500));
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

    sessionData = {
        exercise,
        conditioning,
        weight,
        reps,
        rounds,
        distance,
        time,
    };

    try {
        await User.findByIdAndUpdate(
            userID,
            { $push: { session: { ...sessionData } } },
            { new: true }
        );
    } catch (err) {
        return next(new HttpError("Failed to add session to user", 500));
    }

    res.status(201).json({ message: "Session added to user." });
};

const getUserSessions = async (req, res, next) => {
    const userID = req.params.uid;
    let userSessions;
    try {
        userSessions = await User.find({ _id: userID }, 'session');
    } catch (err) {
        return next(HttpError('Can not search for user right now try again later', 500))
    }
    res.status(200).json({message: userSessions.map((session)=> session.toObject({getters : true}))})
}

const updateUserSession = async (req, res, next) => {
    const {
        exercise,
        conditioning,
        weight,
        rounds,
        reps,
        distance,
        time,
        athlete,
    } = req.body;
    const userID = req.body.athlete;
    const sessionID = req.params.sid;
    const updateData = {
        exercise,
        conditioning,
        weight,
        rounds,
        reps,
        distance,
        time,
    };

    try {
        const user = await User.findById(userID);
        if (!user) {
            return next(new HttpError("Could not find user for this id", 404));
        }

        const session = user.session.id(sessionID);
        if (!session) {
            return next(
                new HttpError("Could not find session for this id", 404)
            );
        }

        Object.assign(session, updateData);

        await user.save();

        res.status(200).json({ message: "Session updated.", session });
    } catch (err) {
        return next(
            new HttpError(
                "Could not update session, please try again later",
                500
            )
        );
    }
};

const deleteUserSession = async (req, res, next) => {
    const { athlete } = req.body;
    const sessionID = req.params.sid;
    let user;

    try {
        user = await User.findById(athlete)
    } catch (err) {
        return next(new HttpError('Can not find user please try again later', 500))
    }

    if (!user){
        return next(new HttpError('User does not exist', 404))
    }

    let sessionToDelete;
    try {
        sessionToDelete = await User.findByIdAndUpdate(
            athlete,
            { $pull: { session: {_id: sessionID} } },
            { new: true }
        );
    } catch (err) {
        return next (new HttpError('Can not delete session right now try again later', 500))
    }

    if(!sessionToDelete){
        return next(new HttpError('No session with this id exists', 422))
    }
    

    res.status(201).json({ message: "Session deleted from user." });
};

exports.createUserSession = createUserSession;
exports.getUserSessions = getUserSessions;
exports.updateUserSession = updateUserSession;
exports.deleteUserSession = deleteUserSession;