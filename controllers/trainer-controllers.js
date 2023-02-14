const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Coach = require("../models/coach");
const Client = require("../models/client");

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

const getCoach = async (req, res, next) => {
    const coachID = req.params.cid;
    if (!mongoose.Types.ObjectId.isValid(coachID)) {
        return next(new HttpError("Invalid coach ID", 400));
    }
    let foundCoach;
    try {
        // foundCoach = await Coach.findOne({coachName: coachID})
        foundCoach = await Coach.findOne({_id: coachID});
        // res.json({coach: foundCoach.map((coach)=> coach.toObject({getters: true}))})
        if(!foundCoach){
            return next(new HttpError("Coach not found", 404));
        } else {
            res.json({coach: foundCoach.toObject({getters: true})})
        }
    } catch (err) {
        console.log(err)
        // return next (new HttpError("Can not find coach, please try again later", 500))
    }
};

const getCoachClients = async (req, res, next) => {
    const coachID = req.params.cid;
    let coach;
    try {
        coach = await Coach.findById(coachID);
    } catch (err) {
        return next(
            new HttpError("Can not search for coach right now, try again later", 500)
        );
    }

    if (!coach) {
        return next(
            new HttpError("Could not find coach for the provided id", 404)
        );
    }

    let client;
    try {
        client = await Client.find({ _id: { $in: coach.client } });
        console.log(client);
        res.status(200).json({
            clients: client.map((c) => c.toObject({ getters: true }))
        });
    } catch (err) {
        return next(
            new HttpError("Could not retrieve clients for coach", 500)
        );
    }
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
        coaches: foundCoach.map((coach) => coach.toObject({ getters: true })),
    });
};

const loginCoach = async (req, res, next) => {
    const { email, coachname, password } = req.body;
    let verifiedCoach;
    try {
        verifiedCoach = await Coach.findOne({coachname:coachname});
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
            jwt.sign({ userID: verifiedCoach.id }, tokenSecret, { expiresIn: "24h" });
    } catch (err) {
        const error = new HttpError("Error in JWT code block");
        return next(error);
    }

    res.json({
        message: "Coach login successful",
        coachID: verifiedCoach.id,
        token: token,
        name:verifiedCoach.coachname
    });
};

//DO NOT THINK I NEED THIS FUNCTION
const addClient = async (req, res, next) => {
    const { client } = req.body;
    const coachID = req.params.cid;
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

    let coach
    try {
        coach = await Coach.findOne({coachName:coachID});
    } catch (err) {
        return next(new HttpError("No coach exists with that ID", 500))
    }

};

exports.createCoach = createCoach;
exports.getCoachClients = getCoachClients;
exports.getCoach = getCoach;
exports.searchCoaches = searchCoaches;
exports.loginCoach = loginCoach;
exports.addClient = addClient;
