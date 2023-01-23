const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Cardio = require('../models/cardio')

const addCardio = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { type, distance, time } = req.body;
    const cardio = new Cardio ({
        type,
        distance,
        time
    })
    try {
        await cardio.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError('Failed to create cardio', 500));
    }
    res.status(201).json({ cardio: cardio.toObject({ getters: true }) });

}

const searchCardio = async (req, res, next) => {
    const searchQuery = req.query.query;

    let cardio;
    try {
        cardio = await Cardio.find({ type: { $regex: '^' + searchQuery, $options: 'i' } });
    } catch (err) {
        return next(new HttpError('Could not perform search, please try again later', 500));
    }

    if (!cardio || cardio.length === 0) {
        return next(new HttpError('No cardio found for the given search query', 404));
    }

    res.json({ cardio: cardio.map(cardio => cardio.toObject({ getters: true })) });
}

const getCardioById = async (req, res, next) => {
    const cardioId = req.params.cid;
    let cardio;
    try {
        cardio = await Cardio.findById(cardioId);
    } catch (err) {
        return next(new HttpError('Could not find cardio, please try again later', 500));
    }

    if (!cardio) {
        return next(new HttpError('Could not find cardio for the provided id', 404));
    }

    res.json({ cardio: cardio.toObject({ getters: true }) });
}

const updateCardio = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const cardioID = req.params.cid;
    let cardio;
    try {
        cardio = await Cardio.findById(cardioID);
    } catch (err) {
        return next(new HttpError('Could not update cardio, please try again later', 500));
    }

    if (!cardio) {
        return next(new HttpError('Could not find cardio for this id', 404));
    }
    //update workout fields
    cardio.type = req.body.type;
    cardio.distance = req.body.distance;
    cardio.time = req.body.time;
    try {
        await cardio.save();
    } catch (err) {
        return next(new HttpError('Could not update cardio, please try again later', 500));
    }

    res.status(200).json({ cardio: cardio.toObject({ getters: true }) });
}

const deleteCardio = async (req, res, next) => {}

exports.addCardio = addCardio;
exports.getCardioById = getCardioById;
exports.searchCardio = searchCardio;
exports.updateCardio = updateCardio;
exports.deleteCardio = deleteCardio;