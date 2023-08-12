const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Movement = require("../models/movement");
const User = require("../models/user");
const Session = require("../models/session");
const { createDayObjectSession } = require("../utilities/create-day-object-sessions");
const { transformToWorkoutWeeks } = require("../utilities/transform-to-workout-weeks");

const createUserSession = async (req, res, next) => {
    const { session } = req.body;
    const userID = req.params.uid;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    let movementExists;
    let movement;
    try {
        for (let s of session) {
            movementExists = await Movement.findOne({ movement: s.exercise });
            if (!movementExists) {
                movement = new Movement({ movement: s.exercise });
                console.log(movement);
                await movement.save();
            }
        }
    } catch (err) {
        console.log(err);
    }

    let addUserSession;
    let sessions = [];
    let newSession;
    try {
        addUserSession = await User.findById(userID);
        console.log(addUserSession);
        for (let s of session) {
            newSession = new Session({
                exercise: s.exercise,
                weight: s.weight,
                reps: s.reps,
                rounds: s.rounds,
                distance: s.distance,
                time: s.time,
                year: s.year,
                month: s.month,
                dayOfMonth: s.dayOfMonth,
                dayOfWeek: s.dayOfWeek,
                athlete: s.athlete,
            });
            sessions.push(newSession._id);
            console.log(newSession);
            await newSession.save();
        }
        await User.findByIdAndUpdate(userID, {
            $push: { session: sessions },
        });
    } catch (err) {
        console.log(newSession);
        console.log(err);
        return next(
            new HttpError(
                "Could not add client session please try again later",
                500
            )
        );
    }

    res.status(201).json({
        userSession: addUserSession.toObject({ getters: true }),
        sessionID: sessions,
    });
};

const getUserSessions = async (req, res, next) => {
    const userID = req.params.uid;
    let user;
    try {
        user = await User.findById(userID);
        console.log(user);
    } catch (err) {
        return next(
            new HttpError(
                "Can not search for user right now, try again later",
                500
            )
        );
    }

    if (!user) {
        return next(
            new HttpError("Could not find user for the provided id", 404)
        );
    }

    let sessions;
    try {
        sessions = await Session.find({ _id: { $in: user.session } });
        // res.status(200).json({
        //     sessions: sessions.map((session) => session.toObject({ getters: true }))
        // });
        res.status(200).json({
            sessions: createDaySessionObjects(sessions),
        });
    } catch (err) {
        return next(new HttpError("Could not retrieve sessions for user", 500));
    }
};

const getUserSessionsInWeeklyFormat = async (req, res, next) => {
    const userID = req.params.uid;
    let user;
    try {
        user = await User.findById(userID);
        console.log(user);
    } catch (err) {
        return next(
            new HttpError(
                "Can not search for user right now, try again later",
                500
            )
        );
    }

    if (!user) {
        return next(
            new HttpError("Could not find user for the provided id", 404)
        );
    }

    let sessions;
    try {
        sessions = await Session.find({ _id: { $in: user.session } });
    } catch (err) {
        return next(
            new HttpError(
                "Could not retrieve sessions in weekly format function for user",
                500
            )
        );
    }

    let sessionsByDays;
    let sessionsByWeek;
    try {
        sessions.reverse();
        sessionsByDays = createDayObjectSession(sessions);
        sessionsByWeek = transformToWorkoutWeeks(sessionsByDays);
        sessionsByWeek
        res.status(200).json({ sessions: sessionsByWeek });
    } catch (err) {
        console.error("Error during data transformation:", err);
        return next(new HttpError("Error processing session data", 500));
    }
};

const deleteUserSession = async (req, res, next) => {
    const { session } = req.body;
    const userID = req.params.uid;

    let deleteSession;
    try {
        deleteSession = await Session.findByIdAndRemove(session);
        await User.findByIdAndUpdate(userID, {
            $pull: { session: session },
        });
        res.status(200).json({
            message: "Successfully deleted user session",
        });
    } catch (err) {
        return next(
            new HttpError(
                "Can not delete session right now try again later",
                500
            )
        );
    }
};

exports.createUserSession = createUserSession;
exports.getUserSessions = getUserSessions;
exports.getUserSessionsInWeeklyFormat = getUserSessionsInWeeklyFormat;
exports.deleteUserSession = deleteUserSession;
