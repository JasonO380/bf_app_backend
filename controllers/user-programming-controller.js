const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Programming = require("../models/programming");

const getUsersProgramming = async (req, res, next) => {
    const userID = req.params.uid;
    console.log(userID);
    let user;
    try {
        user = await User.findById(userID);
        console.log(user);
    } catch (err) {
        return next(
            new HttpError("Cannot search for user right now, try again later", 500)
        );
    }

    if (!user) {
        return next(
            new HttpError("Could not find user for the provided id", 404)
        );
    }

    let programmingData;
    try {
        programmingData = await Programming.find({ _id: { $in: user.programming } });
        res.status(200).json({
            programmingData: programmingData.map((data) => data.toObject({ getters: true }))
        });
    } catch (err) {
        return next(
            new HttpError("Could not retrieve programming data for user", 500)
        );
    }
};

const deleteUserProgramming = async (req, res, next) => {
    const { program, userID } = req.body;

    let deleteProgramming;
    try {
        deleteProgramming = await Programming.findByIdAndRemove(program);
        await User.findByIdAndUpdate(userID, {
            $pull: { programming: program },
        });
        res.status(200).json({
            message: "Successfully deleted user program",
        });
    } catch (err) {
        return next(
            new HttpError(
                "Can not delete program right now try again later",
                500
            )
        );
    }
};

exports.getUsersProgramming = getUsersProgramming;
exports.deleteUserProgramming = deleteUserProgramming;






