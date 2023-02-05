const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Coach = require("../models/coach");

let tokenSecret = "myapprules";

const createCoach = async (req, res, next) => {
    const { coachName, email, password } = req.body;
    const errors = validationResult(req);
    //check to see if errors is not empty if there are errors throw new HttpError
    if (!errors.isEmpty()) {
        console.log(errors);
        const error = new HttpError(
            "Password must be at least 6 characters, email must contain @, coach name must not be empty",
            422
        );
        return next(error);
    }

    //make sure mutliple email addresses can not be used
    let emailExists;
    let coachNameExists;
    try {
        emailExists = await Coach.findOne({ email: email });
    } catch (err) {
        const error = new HttpError("Error on email exists logic", 500);
        return next(error);
    }
    if (emailExists) {
        const error = new HttpError("Email already in use", 422);
        return next(error);
    }
    try {
        coachNameExists = await Coach.findOne({ coachName: coachName });
    } catch (err) {
        const error = new HttpError("Error on coach name exists logic", 500);
        return next(error);
    }
    if (coachNameExists) {
        const error = new HttpError("Coach name has been taken", 422);
        return next(error);
    }

    let hashedpassword;
    try {
        hashedpassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError("Bcrypt logic failed", 500);
        return next(error);
    }

    const newCoach = new Coach({
        coachName,
        email,
        password: hashedpassword,
        programming: [],
        workouts: [],
        athlete: [],
    });
    try {
        await newCoach.save();
    } catch (err) {
        const error = new HttpError(
            "Something went wrong creating the coach",
            500
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ coachID: newCoach.id }, tokenSecret, {
            expiresIn: "24h",
        });
    } catch (err) {
        const error = new HttpError(
            "Something went wrong with JWT registration",
            401
        );
        return next(error);
    }
    res.status(201).json({
        message: "Success",
        coachName: newCoach.coachName,
        coachID: newCoach.id,
        token: token,
    });
};

const searchCoaches = async (req, res, next) => {
    const searchQuery = req.params.query;
    let foundCoach;

    try {
        foundCoach = await Coach.find({
            type: { $regex: "^" + searchQuery, $options: "i" },
        });
    } catch (err) {
        return next(
            new HttpError(
                "Could not perform search please try again later",
                500
            )
        );
    }

    res.json({
        users: foundCoach.map((coach) => coach.toObject({ getters: true })),
    });
};

const loginCoach = async (req, res, next) => {
    const { email, coachName, password } = req.body;
    let verifiedCoach;
    try {
        verifiedCoach = await Coach.findOne(coachName);
    } catch (err) {
        const error = new HttpError(
            "Error with finding coach please try again later",
            500
        );
        return next(error);
    }

    if (!verifiedCoach) {
        const error = new HttpError("Coach name does not exist", 401);
        return next(error);
    }

    let token;
    try {
        token =
            ({ coachID: verifiedCoach.id }, tokenSecret, { expiresIn: "24h" });
    } catch (err) {
        const error = new HttpError("Error in JWT code block");
        return next(error);
    }

    res.json({
        message: "Coach login successful",
        coachID: verifiedCoach.id,
        token: token,
    });
};

const addClient = async (req, res, next) => {
    const { coachName, client } = req.body;
    const errors = validationResult(req);
    //check to see if errors is not empty if there are errors throw new HttpError
    if (!errors.isEmpty()) {
        console.log(errors);
        const error = new HttpError(
            "Password must be at least 6 characters, email must contain @, coach name must not be empty",
            422
        );
        return next(error);
    }
};

exports.createCoach = createCoach;
exports.searchCoaches = searchCoaches;
exports.loginCoach = loginCoach;
