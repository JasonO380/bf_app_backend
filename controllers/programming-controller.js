const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const redis = require("redis");
const client = redis.createClient();
const { validationResult } = require("express-validator");
const Programming = require("../models/programming");
const Coach = require("../models/coach");
const User = require("../models/user");
const WeekDays = require("../models/week-days");
const Session = require("../models/session");
const Exercise = require("../models/movement");
const Cardio = require("../models/cardio");

const getAllProgramming = async (req, res, next) => {
    //Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }
    let programming;
    try {
        programming = await Programming.find({});
    } catch (err) {
        return next(
            new HttpError(
                "Can not find programming please try again later",
                500
            )
        );
    }

    res.json({
        programming: programming.map((p) => ({
            cycleName: p.cycleName,
            id: p._id,
        })),
    });
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
        programming: programming.map((p) => ({
            cycleName: p.cycleName,
            id: p._id,
        })),
    });
};

const updateProgramming = async (req, res, next) => {
    const errors = validationResult(req);
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
        console.log(err);
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
    program.cycleAPI = req.body.cycleAPI;
    program.athlete = req.body.athlete;

    try {
        await program.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not save the updated program, please try again later",
                500
            )
        );
    }
    res.status(200).json({ program: program.toObject({ getters: true }) });
};

const deleteProgramming = async (req, res, next) => {
    const { athlete, trainer } = req.body;
    const programID = req.params.pid;
    let program;
    try {
        // Find the program
        program = await Programming.findById(programID);
        //Delete all weekDays related to program
        await WeekDays.deleteMany({ programming: programID });
        // Delete all sessions related to the program
        await Session.deleteMany({ programming: programID });
        // Delete the program
        await Programming.findByIdAndRemove(programID);
        // Also remove the programming id from the user's document
        await User.findByIdAndUpdate(req.body.athlete, {
            $pull: { programming: programID },
        });
        // Also remove the programming id from the trainer's document
        await Coach.findByIdAndUpdate(req.body.trainer, {
            $pull: { programming: programID },
        });
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

exports.getAllProgramming = getAllProgramming;
exports.getProgramById = getProgramById;
exports.searchProgramming = searchProgramming;
exports.updateProgramming = updateProgramming;
exports.deleteProgramming = deleteProgramming;
