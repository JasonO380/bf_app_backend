const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Exercise = require('../models/movement');
//add User schema to link users to workouts
// const User = require('../models/users');
const dateEntry = new Date();


const addMovement = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { movement, timeOfDayStarted, timeOfDayFinished } = req.body;

    let existingMovement;
    
    try {
        existingMovement = await Exercise.findOne({ movement });
    } catch (err) {
        return next(new HttpError('Failed to check for existing movement', 500));
    }

    if (existingMovement) {
        return res.status(200).json({ message: 'Movement already exists' });
    }

    const exercise = new Exercise({
        movement,
        timeOfDayStarted,
        timeOfDayFinished
    });

    try {
        await exercise.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError('Failed to add workout to the database', 500));
    }
    res.status(201).json({ movement: exercise.toObject({ getters: true }) });
};

const getMovementById = async (req, res, next) => {
    const movementId = req.params.mid;
    let movement;
    try {
        movement = await Workout.findById(movementId);
    } catch (err) {
        return next(new HttpError('Could not find workout, please try again later', 500));
    }

    if (!movement) {
        return next(new HttpError('Could not find workout for the provided id', 404));
    }

    res.json({ movement: movement.toObject({ getters: true }) });
};

const searchMovements = async (req, res, next) => {
    const searchQuery = req.query.query;

    let movements;
    try {
        movements = await Exercise.find({ type: { $regex: '^' + searchQuery, $options: 'i' } });
    } catch (err) {
        return next(new HttpError('Could not perform search, please try again later', 500));
    }

    if (!movements || movements.length === 0) {
        return next(new HttpError('No workouts found for the given search query', 404));
    }

    res.json({ movements: movements.map(movement => movement.toObject({ getters: true })) });
};

const updateMovement = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const movementID = req.params.mid;
    let movement;
    try {
        movement = await Exercise.findById(movementID);
    } catch (err) {
        return next(new HttpError('Could not update movement, please try again later', 500));
    }

    if (!movement) {
        return next(new HttpError('Could not find movement for this id', 404));
    }
    //update movement fields
    movement.movement = req.body.movement;
    try {
        await movement.save();
    } catch (err) {
        return next(new HttpError('Could not update movement, please try again later', 500));
    }

    res.status(200).json({ movement: movement.toObject({ getters: true }) });
};

const deleteMovement = async (req, res, next) => {
    const movementID = req.params.mid;
    let movement;
    try {
        movement = await Exercise.findByIdAndRemove(movementID);
    } catch (err) {
        return next(new HttpError('Could not delete movement, please try again later', 500));
    }

    if (!movement) {
        return next(new HttpError('Could not find movement for this id', 404));
    }

    res.status(200).json({ message: 'Movement deleted.' });
};

exports.addMovement = addMovement;
exports.getMovementById = getMovementById;
exports.searchMovements = searchMovements;
exports.updateMovement = updateMovement;
exports.deleteMovement = deleteMovement;