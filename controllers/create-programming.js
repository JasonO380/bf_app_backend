const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Programming = require("../models/programming");
const Session = require("../models/session");
const User = require("../models/user");
const Coach = require("../models/coach");
const WeekDays = require("../models/week-days");

const createProgramming = async (req, res, next) => {
    const {
        cycleName,
        weeks,
        weekNumber,
        day,
        trainer,
        athlete,
        workouts,
        exercise,
        conditioning,
        weight,
        reps,
        rounds,
        distance,
        time,
    } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    let doesProgrammingExist;
    try {
        doesProgrammingExist = await Programming.findOne({
            cycleName: cycleName,
        });
    } catch (err) {
        return next(
            new HttpError(
                "Can not create programming. Please try again later",
                500
            )
        );
    }

    if (doesProgrammingExist) {
        return next(new HttpError("Program already exists", 402));
    }

    const programming = new Programming({
        cycleName,
        trainer,
        athlete,
    });

    let weekDays = [];
    let session = [];
    try {
        weeks.map(async(week) => {
            const days = new WeekDays(week); 
            weekDays.push(days)
            days.programming = programming._id;
            week.workouts.map(async(sess) => {
                const activities = new Session(sess);
                activities.programming = programming._id;
                session.push(activities);
                days.session = activities._id
            });
        });
        await Promise.all(weekDays.map(d => d.save()))
        await Promise.all(session.map(s => s.save()));
        programming.weeks = weekDays.map(weekday => weekday._id);
    } catch (err) {
        return next (new HttpError('Can not save session, try again later', 500))
    }

    try {
        await User.findByIdAndUpdate(athlete, {
            $push: {
                programming: programming._id,
            },
        });
    } catch (err) {
        return next(new HttpError("No user found please try again later", 500));
    }

    try {
        await Coach.findByIdAndUpdate(trainer, {
            $push: {
                programming: programming._id,
            },
        });
    } catch (err) {
        return next(
            new HttpError("No coach found please try again later", 500)
        );
    }

    try {
        await programming.save();
    } catch (err) {
        return next(new HttpError("Failed to save program", 500));
    }
    res.status(201).json({
        programming,
    });
};

exports.createProgramming = createProgramming;
