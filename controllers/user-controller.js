const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Movement = require("../models/movement");
const Programming = require("../models/programming");
const Session = require("../models/session");
const User = require("../models/user");
const { findOne } = require("../models/user");

let tokenSecret = "myapprules";

const createUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);
    //check to see if errors is not empty if there are errors throw new HttpError
    if (!errors.isEmpty()) {
        console.log(errors);
        const error = new HttpError(
            "Password must be at least 6 characters, email must contain @, username must not be empty",
            422
        );
        return next(error);
    }
    //make sure mutliple email addresses can not be used
    let emailExists;
    let userNameExists;
    try {
        emailExists = await User.findOne({ email: email });
    } catch (err) {
        const error = new HttpError("Error on email exists logic", 500);
        return next(error);
    }
    if (emailExists) {
        const error = new HttpError("Email already in use", 422);
        return next(error);
    }
    try {
        userNameExists = await User.findOne({ username: username });
    } catch (err) {
        const error = new HttpError("Error on username exists logic", 500);
        return next(error);
    }
    if (userNameExists) {
        const error = new HttpError("Username has been taken", 422);
        return next(error);
    }

    let hashedpassword;
    try {
        hashedpassword = await bcrypt.hash(password, 12);
    } catch (err) {
        const error = new HttpError("Bcrypt logic failed", 500);
        return next(error);
    }

    const newUser = new User({
        username,
        email,
        password: hashedpassword,
        programming: [],
        workouts: [],
        trainer: [],
    });
    try {
        await newUser.save();
    } catch (err) {
        const error = new HttpError(
            "Something went wrong creating the user",
            500
        );
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userID: newUser.id }, tokenSecret, {
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
        userName: newUser.username,
        userID: newUser.id,
        token: token,
    });
};

const searchUsers = async (req, res, next) => {
    const searchQuery = req.params.query;
    let foundUser;

    try {
        foundUser = await User.find({
            type: { $regex: "^" + searchQuery, $options: "i" },
        });
    } catch (err) {
        return next(
            new HttpError("Could not perfomr search please try again later")
        );
    }

    res.json({
        users: foundUser.map((user) => user.toObject({ getters: true })),
    });
};

const loginUser = async (req, res, next) => {
    const { userName, email, password } = req.body;
    let verifiedUser;
    try {
        verifiedUser = await User.findOne({ userName: userName });
    } catch (err) {
        const error = new HttpError("user not found", 500);
        return next(error);
    }

    if (!verifiedUser) {
        const error = new HttpError("Email not found", 401);
        return next(error);
    }

    let passwordIsValid;
    try {
        passwordIsValid = await bcrypt.compare(password, verifiedUser.password);
    } catch (err) {
        const error = new HttpError("Login logic with bcrypt error", 500);
        return next(error);
    }

    if (!passwordIsValid) {
        const error = new HttpError("Email and password do not match", 401);
        return next(error);
    }

    let token;
    try {
        token = jwt.sign({ userID: verifiedUser.id }, tokenSecret, {
            expiresIn: "24h",
        });
    } catch (err) {
        const error = new HttpError("Something went wrong with JWT login", 401);
        return next(error);
    }

    res.json({ message: "Success", userID: verifiedUser.id, token: token });
};

const createUserSession = async (req, res, next) => {
    const {
        exercise,
        conditioning,
        weight,
        reps,
        rounds,
        distance,
        time,
        athlete,
    } = req.body;
    const userID = req.body.athlete;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    let movementExists;
    try {
        movementExists = await Movement.findOne({ movement: exercise });
    } catch (err) {
        // return next(new HttpError("Failed to find movement", 500));
    }

    let movement;
    if (!movementExists) {
        movement = new Movement({
            movement: exercise,
            date: new Date(),
        });

        try {
            await movement.save();
        } catch (err) {
            return next(new HttpError("Failed to save movement", 402));
        }
    } else {
        movement = movementExists;
    }

    sessionData = {
        exercise,
        conditioning,
        weight,
        reps,
        rounds,
        distance,
        time,
    };

    try {
        await User.findByIdAndUpdate(
            userID,
            { $push: { session: { ...sessionData } } },
            { new: true }
        );
    } catch (err) {
        return next(new HttpError("Failed to add session to user", 500));
    }

    res.status(201).json({ message: "Session added to user." });
};

const updateUserSession = async (req, res, next) => {
    const {
        exercise,
        conditioning,
        weight,
        rounds,
        reps,
        distance,
        time,
        athlete,
    } = req.body;
    const userID = req.body.athlete;
    const sessionID = req.params.sid;
    const updateData = {
        exercise,
        conditioning,
        weight,
        rounds,
        reps,
        distance,
        time,
    };

    try {
        const user = await User.findById(userID);
        if (!user) {
            return next(new HttpError("Could not find user for this id", 404));
        }

        const session = user.session.id(sessionID);
        if (!session) {
            return next(
                new HttpError("Could not find session for this id", 404)
            );
        }

        Object.assign(session, updateData);

        await user.save();

        res.status(200).json({ message: "Session updated.", session });
    } catch (err) {
        return next(
            new HttpError(
                "Could not update session, please try again later",
                500
            )
        );
    }
};

const deleteUserSession = async (req, res, next) => {
    const { exercise, conditioning, weight, reps, rounds, distance, time } =
        req.body;
    const userID = req.body.athlete;
    sessionData = {
        exercise,
        conditioning,
        weight,
        reps,
        rounds,
        distance,
        time,
    };

    try {
        await User.findByIdAndUpdate(
            userID,
            { $pull: { session: { ...sessionData } } },
            { new: true }
        );
    } catch (err) {
        return next(new HttpError("Failed to delete session from user", 500));
    }

    res.status(201).json({ message: "Session deleted from user." });
};

exports.createUser = createUser;
exports.searchUsers = searchUsers;
exports.loginUser = loginUser;
exports.createUserSession = createUserSession;
exports.updateUserSession = updateUserSession;
exports.deleteUserSession = deleteUserSession;
