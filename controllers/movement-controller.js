const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Movement = require("../models/movement");
const dateEntry = new Date();

const addMovement = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const { movement } = req.body;

    let existingMovement;

    try {
        existingMovement = await Movement.findOne({ movement });
    } catch (err) {
        return next(
            new HttpError("Failed to check for existing movement", 500)
        );
    }

    if (existingMovement) {
        return res.status(200).json({ message: "Movement already exists" });
    }

    const newMovement = new Movement({
        movement,
    });

    try {
        await newMovement.save();
    } catch (err) {
        console.log(err);
        return next(
            new HttpError("Failed to add workout to the database", 500)
        );
    }
    res.status(201).json({ movement: newMovement.toObject({ getters: true }) });
};

const getMovementById = async (req, res, next) => {
    const movementId = req.params.mid;
    let movement;
    try {
        movement = await Workout.findById(movementId);
    } catch (err) {
        return next(
            new HttpError("Could not find workout, please try again later", 500)
        );
    }

    if (!movement) {
        return next(
            new HttpError("Could not find workout for the provided id", 404)
        );
    }

    res.json({ movement: movement.toObject({ getters: true }) });
};

const getAllMovements = async (req, res, next) => {
    let allMovements;
    try {
        allMovements = await Movement.find({});
    } catch (err) {
        return res.status(500).json({
            message: "Could not perform search. Please try again later.",
        });
    }
    const sortedMovements = allMovements.sort((a, b) => {
        const nameA = a.movement || ""; 
        const nameB = b.movement || ""; 
        return nameA.localeCompare(nameB);
    });

    res.json({
        movements: sortedMovements.map((m) =>
            m.toObject({ getters: true })
        ),
    });
};

const searchMovements = async (req, res, next) => {
    const searchQuery = req.params.query;

    let movements;
    try {
        movements = await Movement.find({
            movement: { $regex: searchQuery, $options: "i" },
        });
    } catch (err) {
        return next(
            new HttpError(
                "Could not perform search, please try again later",
                500
            )
        );
    }

    if (!movements || movements.length === 0) {
        return next(
            new HttpError("No movements found for the given search query", 404)
        );
    }

    res.json({
        movements: movements.map((movement) =>
            movement.toObject({ getters: true })
        ),
    });
};

const updateMovement = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const movementID = req.params.mid;
    let movement;
    try {
        movement = await Movement.findById(movementID);
    } catch (err) {
        return next(
            new HttpError(
                "Could not update movement, please try again later",
                500
            )
        );
    }

    if (!movement) {
        return next(new HttpError("Could not find movement for this id", 404));
    }
    //update movement fields
    movement.movement = req.body.movement;
    try {
        await movement.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not update movement, please try again later",
                500
            )
        );
    }

    res.status(200).json({ movement: movement.toObject({ getters: true }) });
};

const deleteMovement = async (req, res, next) => {
    const movementID = req.params.mid;
    console.log(movementID)
    let movement;
    try {
        movement = await Movement.findByIdAndRemove(movementID);
    } catch (err) {
        return next(
            new HttpError(
                "Could not delete movement, please try again later",
                500
            )
        );
    }

    if (!movement) {
        return next(new HttpError("Could not find movement for this id", 404));
    }

    res.status(200).json({ message: "Movement deleted." });
};

exports.addMovement = addMovement;
exports.getMovementById = getMovementById;
exports.getAllMovements = getAllMovements;
exports.searchMovements = searchMovements;
exports.updateMovement = updateMovement;
exports.deleteMovement = deleteMovement;
