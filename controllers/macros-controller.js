const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Macros = require("../models/macros");

const addMacros = async (req, res, next) => {
    const userID = req.params.uid;
    const { carbs, protein, fats, year, month, dayOfMonth, dayOfWeek, athlete } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const macros = new Macros ({
        carbs,
        protein,
        fats,
        year,
        month,
        dayOfMonth,
        dayOfWeek,
        athlete
    });

    try {
        await macros.save();
    } catch (err) {
        console.log(err);
        return next(
            new HttpError("Failed to add macros to the database", 500)
        );
    }

    let user;
    const macroID = macros.id;
    try {
        user = await User.findByIdAndUpdate(userID, {
            $push: { macros: macroID },
        });
        if (!user) {
            return next(new HttpError("User not found", 404));
        }
        res.status(200).json({
            message: "Macors added to athletes history",
            user: user.toObject({ getters: true }),
            macros: macros.toObject({ getters: true }),
        });
    } catch (err) {
        return next(new HttpError("Failed to add macros to user", 500));
    }
}

const getMacros = async (req, res, next) => {
    const userID = req.params.uid;
    let user;
    try {
        user = await User.findById(userID);
    } catch (err) {
        return next(
            new HttpError("Can not search for user right now, try again later", 500)
        );
    }

    if (!user) {
        return next(
            new HttpError("Could not find user for the provided id", 404)
        );
    }

    let macros;
    try {
        macros = await Macros.find({ _id: { $in: user.macros } });
        res.status(200).json({
            macros: macros.map((m) => m.toObject({ getters: true }))
        });
    } catch (err) {
        return next(
            new HttpError("Could not retrieve macros for user", 500)
        );
    }
}

const editMacros = (req, res, next) => {

}

const deleteMacros = (req, res, next) => {

}

exports.addMacros = addMacros;
exports.getMacros = getMacros;
exports.editMacros = editMacros;
exports.deleteMacros = deleteMacros;