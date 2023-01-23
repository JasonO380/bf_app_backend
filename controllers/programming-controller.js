const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Programming = require("../models/programming");
const Session = require("../models/session");
const Exercise = require("../models/movement");
const Cardio = require("../models/cardio");

const createProgramming = async (req, res, next) => {
    //Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    //Retrieve necessary data from req.body
    const {
        cycleName,
        day,
        week,
        exercise,
        conditioning,
        date,
        reps,
        rounds,
        weight,
        distance,
        time,
    } = req.body;

    const session = new Session({
        exercise,
        conditioning,
        date,
        session: [{ reps, rounds, weight, distance, time }],
    });

    try {
        await session.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError("Failed to add session", 500));
    }

    let existingProgramming;

    try {
        existingProgramming = await Programming.findOne({ cycleName });
    } catch (err) {
        return next(new HttpError("Failed to check for existing program", 500));
    }

    let weekExists = false;
    let dayExists = false;

    if (existingProgramming) {
        existingProgramming.weeks.forEach((weekObj) => {
            if (weekObj.weekNumber === week) {
                weekExists = true;
                weekObj.days.forEach((dayObj) => {
                    if (dayObj.dayNumber === day) {
                        dayExists = true;
                        dayObj.session.push(session);
                    }
                });
                if (!dayExists) {
                    weekObj.days.push({ dayNumber: day, session: [session] });
                }
            }
        });
        if (!weekExists) {
            existingProgramming.weeks.push({
                weekNumber: week,
                days: [{ dayNumber: day, session: [session] }],
            });
        }
        try {
            await existingProgramming.save();
        } catch (err) {
            console.log(err);
            return next(
                new HttpError("Failed to add session to existing program", 500)
            );
        }
        res.status(201).json({
            program: existingProgramming.toObject({ getters: true }),
        });
    } else {
        const programming = new Programming({
            cycleName,
            weeks: [
                {
                    weekNumber: week,
                    days: [{ dayNumber: day, session: [session] }],
                },
            ],
        });
        try {
            await programming.save();
        } catch (err) {
            console.log(err);
            return next(
                new HttpError(
                    "Failed to create programming and add session",
                    500
                )
            );
        }
        res.status(201).json({
            program: programming.toObject({ getters: true }),
            session: session.toObject({ getters: true }),
        });
    }
};

const getProgramById = async (req, res, next) => {
    const programID = req.params.pid;
    let program;
    try {
        program = await Programming.findById(programID);
    } catch (err) {
        return next(
            new HttpError("Could not find program, please try again later", 500)
        );
    }

    if (!program) {
        return next(
            new HttpError("Could not find program for the provided id", 404)
        );
    }

    res.json({ program: program.toObject({ getters: true }) });
};

const searchProgramming = async (req, res, next) => {
    const searchQuery = req.params.query;

    let programming;
    try {
        programming = await Programming.find({
            type: { $regex: "^" + searchQuery, $options: "i" },
        });
    } catch (err) {
        return next(
            new HttpError(
                "Could not perform search, please try again later",
                500
            )
        );
    }

    if (!programming || programming.length === 0) {
        return next(
            new HttpError("No workouts found for the given search query", 404)
        );
    }

    res.json({
        programming: programming.map((p) => p.toObject({ getters: true })),
    });
};

const updateProgramming = async (req, res, next) => {
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const programID = req.params.pid;
    let program;
    try {
        program = await Programming.findById(programID);
    } catch (err) {
        return next(
            new HttpError(
                "Could not update program, please try again later",
                500
            )
        );
    }

    if (!program) {
        return next(new HttpError("Could not find program for this id", 404));
    }
    //update program fields
    program.cycleName = req.body.cycleName;
    program.athlete = req.body.athlete;

    let weekExists = false;
    let dayExists = false;
    program.weeks.forEach((week) => {
        if (week.weekNumber === req.body.week) {
            weekExists = true;
            week.days.forEach((day) => {
                if (day.dayNumber === req.body.day) {
                    dayExists = true;
                    day.session.push({
                        exercise: req.body.exercise,
                        conditioning: req.body.conditioning,
                        date: req.body.date,
                        reps: req.body.reps,
                        rounds: req.body.rounds,
                        weight: req.body.weight,
                        distance: req.body.distance,
                        time: req.body.time,
                    });
                }
            });
            if (!dayExists) {
                week.days.push({
                    dayNumber: req.body.day,
                    session: [
                        {
                            exercise: req.body.exercise,
                            conditioning: req.body.conditioning,
                            date: req.body.date,
                            reps: req.body.reps,
                            rounds: req.body.rounds,
                            weight: req.body.weight,
                            distance: req.body.distance,
                            time: req.body.time,
                        },
                    ],
                });
            }
        }
    });
    if (!weekExists) {
        program.weeks.push({
            weekNumber: req.body.week,
            days: [
                {
                    dayNumber: req.body.day,
                    session: [
                        {
                            exercise: req.body.exercise,
                            conditioning: req.body.conditioning,
                            date: req.body.date,
                            reps: req.body.reps,
                            rounds: req.body.rounds,
                            weight: req.body.weight,
                            distance: req.body.distance,
                            time: req.body.time,
                        },
                    ],
                },
            ],
        });
    }

    try {
        await program.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not update program, please try again later",
                500
            )
        );
    }
    res.status(200).json({ program: program.toObject({ getters: true }) });
};

const deleteProgramming = async (req, res, next) => {
    const programID = req.params.pid;
    let program;
    try {
        program = await Programming.findByIdAndRemove(programID);
    } catch (err) {
        return next(
            new HttpError(
                "Could not delete program, please try again later",
                500
            )
        );
    }

    if (!program) {
        return next(new HttpError("Could not find program for this id", 404));
    }

    res.status(200).json({ message: "Program deleted." });
};

exports.createProgramming = createProgramming;
exports.getProgramById = getProgramById;
exports.searchProgramming = searchProgramming;
exports.updateProgramming = updateProgramming;
exports.deleteProgramming = deleteProgramming;
