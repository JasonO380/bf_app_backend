const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Workout = require('../models/workouts');
//add User schema to link users to workouts
// const User = require('../models/users');
const dateEntry = new Date();


const addWorkouts = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { movement, weight, reps, rounds, dayOfWeek, day, month, year, timeOfDayStarted, timeOfDayFinished } = req.body;

    const workout = new Workout({
        movement,
        weight,
        reps,
        rounds,
        dayOfWeek,
        day,
        month,
        year,
        timeOfDayStarted,
        timeOfDayFinished
    });

    try {
        await workout.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError('Failed to add workout to the database', 500));
    }
    res.status(201).json({ workout: workout.toObject({ getters: true }) });
};

const getWorkoutById = async (req, res, next) => {
    const workoutId = req.params.wid;
    let workout;
    try {
        workout = await Workout.findById(workoutId);
    } catch (err) {
        return next(new HttpError('Could not find workout, please try again later', 500));
    }

    if (!workout) {
        return next(new HttpError('Could not find workout for the provided id', 404));
    }

    res.json({ workout: workout.toObject({ getters: true }) });
};

const searchWorkouts = async (req, res, next) => {
    const searchQuery = req.query.search;

    let workouts;
    try {
        workouts = await Workout.find({ $text: { $search: searchQuery } }).limit(5);
    } catch (err) {
        return next(new HttpError('Could not perform search, please try again later', 500));
    }

    if (!workouts || workouts.length === 0) {
        return next(new HttpError('No workouts found for the given search query', 404));
    }

    res.json({ workouts: workouts.map(workout => workout.toObject({ getters: true })) });
};

const updateWorkout = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const workoutID = req.params.wid;
    let workout;
    try {
        workout = await Workout.findById(workoutID);
    } catch (err) {
        return next(new HttpError('Could not update workout, please try again later', 500));
    }

    if (!workout) {
        return next(new HttpError('Could not find workout for this id', 404));
    }
    //update workout fields
    workout.movement = req.body.movement;
    workout.weight = req.body.weight;
    workout.reps = req.body.reps;
    workout.rounds = req.body.rounds;
    try {
        await workout.save();
    } catch (err) {
        return next(new HttpError('Could not update workout, please try again later', 500));
    }

    res.status(200).json({ workout: workout.toObject({ getters: true }) });
};

const deleteWorkout = async (req, res, next) => {
    const workoutID = req.params.wid;
    let workout;
    try {
        workout = await Workout.findByIdAndRemove(workoutID);
    } catch (err) {
        return next(new HttpError('Could not delete workout, please try again later', 500));
    }

    if (!workout) {
        return next(new HttpError('Could not find workout for this id', 404));
    }

    res.status(200).json({ message: 'Workout deleted.' });
};

exports.addWorkouts = addWorkouts;
exports.getWorkoutById = getWorkoutById;
exports.searchWorkouts = searchWorkouts;
exports.updateWorkout = updateWorkout;
exports.deleteWorkout = deleteWorkout;