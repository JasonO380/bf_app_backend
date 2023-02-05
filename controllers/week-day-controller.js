const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Programming = require("../models/programming");
const WeekDays = require("../models/week-days");
const Session = require("../models/session");

const updateWeekDay = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }
    const { weeks, weekNumber, day, session } = req.body;
    const weekDayID = req.params.wid;
    let weekDay;
    try {
        weekDay = WeekDays.findById(weekDayID);
    } catch (err) {
        return next(
            new HttpError("Can not find the week try again later", 500)
        );
    }

    weekDay.weekNumber = weekNumber;
    weekDay.day = day;
};

const addSessionToWeekDay = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }
    const { weeks, weekNumber, day, session } = req.body;
    console.log(session);
    const weekDayID = req.params.wid;

    let weekDay;
    try {
        weekDay = WeekDays.findById(weekDayID);
    } catch (err) {
        return next(
            new HttpError("Can not find the week try again later", 500)
        );
    }

    let newSession;
    let program;
    try {
        newSession = new Session(session);
        newSession.weekDays = weekDayID;
        program = await Programming.findOne({ weeks: weekDayID });
        newSession.programming = program._id;
        await newSession.save();
    } catch (err) {
        return next(
            new HttpError("Can not save new session try again later", 500)
        );
    }

    try {
        await WeekDays.findByIdAndUpdate(weekDayID, {
            $push: { session: newSession._id },
        });
    } catch (err) {
        return next(
            new HttpError("Can not add new session id to week days", 500)
        );
    }

    res.status(200).json({
        session: newSession.toObject({ getters: true }),
    });
};

exports.updateWeekDay = updateWeekDay;
exports.addSessionToWeekDay = addSessionToWeekDay;

// {
//     "cycleName": "Lev 1 Oly",
//     "weeks":[
//         {
//             "weekNumber":1,
//             "day":"1",
//             "workouts": [
//         {
//             "exercise": "Front Squat",
//             "rounds":6,
//             "weight": 125,
//             "reps": 3
//         },
//         {
//             "exercise": "Power Snatch",
//             "rounds":6,
//             "weight": 75,
//             "reps": 3
//         },
//         {
//             "exercise": "Overhead Squat",
//             "rounds":5,
//             "weight": 75,
//             "reps": 5
//         }
//     ]
//         },
//         {
//             "weekNumber":"2",
//             "day":"1",
//             "workouts": [
//                 {
//                     "exercise":"Back Squat",
//                     "weight":143,
//                     "rounds": 5,
//                     "reps": 3
//                 },
//                 {
//                     "exercise":"Power Clean",
//                     "weight":95,
//                     "rounds":5,
//                     "reps":3
//                 },
//                 {
//                     "exercise":"Strict Press",
//                     "weight":55,
//                     "rounds":5,
//                     "reps":6
//                 }
//             ]
//         }
//     ],
//     "athlete": "63d0787e567642846f5d2876",
//     "trainer": "63d08898e0055975dd9d036b"
// }
