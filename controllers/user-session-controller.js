const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Movement = require("../models/movement");
const User = require("../models/user");
const Session = require("../models/session");

const createUserSession = async (req, res, next) => {
    const { session, athlete } = req.body;
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
        // return next(new HttpError("Failed to find movement", 500));
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
            });
            sessions.push(newSession._id);
            console.log(newSession);
            await newSession.save();
        }
        addUserSession.session = sessions;
        await addUserSession.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not add client session please try again later",
                500
            )
        );
    }

    res.status(201).json({
        userSession: addUserSession.toObject({ getters: true }),
    });
};

const getUserSessions = async (req, res, next) => {
    const userID = req.params.uid;
    let userSessions;
    try {
        userSessions = await User.find({ _id: userID }, "session");
    } catch (err) {
        return next(
            HttpError("Can not search for user right now try again later", 500)
        );
    }
    res.status(200).json({
        message: userSessions.map((session) =>
            session.toObject({ getters: true })
        ),
    });
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

    res.status(201).json({ message: "Session deleted from user." });
};

exports.createUserSession = createUserSession;
exports.getUserSessions = getUserSessions;
exports.deleteUserSession = deleteUserSession;

// {
//     "session":[
//         {
//             "exercise":"Sled pull",
//             "weight": 110,
//             "rounds": 5,
//             "reps": 2
//         },
//         {
//             "exercise":"Seated box jumps",
//             "distance": "24 inches",
//             "reps": 3
//         }
//     ]
// }
