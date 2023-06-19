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

let tokenSecret = process.env.TOKEN;

const createUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);
    //check to see if errors is not empty if there are errors throw new HttpError
    if (!errors.isEmpty()) {
        console.log(errors);
        let errorMessages = errors
            .array()
            .map((error) => `${error.param}: ${error.msg}`);
        let errorMessage = errorMessages.join(", ");
        const error = new HttpError(errorMessage, 422);
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
        username: newUser.username,
        userID: newUser.id,
        token: token,
    });
};

const getAllUsers = async (req, res, next) => {
    let allUsers;

    try {
        allUsers = await User.find({});
    } catch (err) {
        return res.status(500).json({
            message: "Could not perform search. Please try again later.",
        });
    }

    res.status(200).json({
        users: allUsers.map((user) => user.toObject({ getters: true })),
    });
};

const searchUsers = async (req, res, next) => {
    const searchQuery = req.params.query;
    let foundUser;

    try {
        foundUser = await User.find({
            username: { $regex: "^" + searchQuery, $options: "i" },
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

const checkUsername = async (req, res, next) => {
    const { username } = req.params;
    console.log(username);
    let existingUser;

    try {
        existingUser = await User.findOne({
            username: new RegExp(`^${username}$`, "i"),
        });
    } catch (err) {
        const error = new HttpError("Error when checking username", 500);
        return next(error);
    }

    if (existingUser) {
        return res.status(400).json({ message: "Username is already taken" });
    }

    return res.status(200).json({ message: "Username is available" });
};

const loginUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    let verifiedUser;
    try {
        verifiedUser = await User.findOne({ username: username });
    } catch (err) {
        const error = new HttpError("user not found", 500);
        return next(error);
    }

    if (!verifiedUser) {
        const error = new HttpError("User not found", 401);
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
        token = jwt.sign({ userID: verifiedUser._id }, tokenSecret, {
            expiresIn: "24h",
        });
    } catch (err) {
        const error = new HttpError("Something went wrong with JWT login", 401);
        return next(error);
    }

    res.json({
        message: "Success",
        userID: verifiedUser._id,
        token: token,
        userName: verifiedUser.username,
    });
};

exports.createUser = createUser;
exports.getAllUsers = getAllUsers;
exports.searchUsers = searchUsers;
exports.checkUsername = checkUsername;
exports.loginUser = loginUser;
