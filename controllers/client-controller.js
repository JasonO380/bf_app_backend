const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Client = require("../models/client");
const Coach = require("../models/coach");
const Session = require("../models/session");

const addClient = async (req, res, next) => {
    const coachID = req.params.cid;
    const { clientName, year, month, dayOfMonth, dayOfWeek, coach } = req.body;
    const errors = validationResult(req);

    let clientExists;
    try {
        clientExists = await Client.findOne({ clientName: clientName });
    } catch (err) {
        return next(new HttpError("Can not find client try again later", 500));
    }

    if (clientExists) {
        return next(new HttpError("Client already exists"));
    }

    const newClient = new Client({
        clientName,
        programming: [],
        session: [],
        coach: [],
        year,
        month,
        dayOfMonth,
        dayOfWeek,
    });

    try {
        await newClient.save();
        await Client.findByIdAndUpdate(newClient._id, {
            $push: { coach: coachID },
        });
        await Coach.findByIdAndUpdate(coachID, {
            $push: { client: newClient._id },
        });
        res.json({ client: newClient.toObject({ getters: true }) });
    } catch (err) {
        return next(
            new HttpError("Can not find coach please try again later", 500)
        );
    }
};

const addClientSession = async (req, res, next) => {
    const { clientName, coach, session } = req.body;
    console.log(session);
    const clientID = req.params.cid;

    let addClientSession;
    let sessions = [];
    let newSession;
    try {
        addClientSession = await Client.findById(clientID);
        for (let s of session) {
            newSession = new Session(s);
            sessions.push(newSession._id);
            await newSession.save();
            await addClientSession.save();
        }
        await Client.findByIdAndUpdate(clientID, {
            $push: { session: sessions },
        });
        await addClientSession.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not add client session please try again later",
                500
            )
        );
    }

    res.json({
        clientSession: addClientSession.toObject({ getters: true }),
    });
};

const getClientSessions = async (req, res, next) => {
    const clientID = req.params.cid;
    console.log(clientID);
    let client;
    let sessions;
    try {
        client = await Client.findById(clientID);
        sessions = await Session.find({ _id: { $in: client.session } });
        res.status(200).json({
            sessions: sessions.map((session) =>
                session.toObject({ getters: true })
            ),
        });
    } catch (err) {
        return next(new HttpError("Error finding client", 500));
    }

    if (!client) {
        return next(new HttpError("Client does not exist", 500));
    }
};

const deleteClientSession = async (req, res, next) => {
    const { clientName, coach, session } = req.body;
    const sessionID = req.params.sid;
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

    let deleteSession;
    try {
        deleteSession = await Session.findByIdAndRemove(sessionID);
        await Client.findByIdAndUpdate(clientName, {
            $pull: { session: sessionID },
        });
        res.status(200).json({
            message: "Successfully deleted client session",
        });
    } catch (err) {
        return next(
            new HttpError(
                "Can not delete session right now try again later",
                500
            )
        );
    }
};

exports.addClient = addClient;
exports.addClientSession = addClientSession;
exports.getClientSessions = getClientSessions;
exports.deleteClientSession = deleteClientSession;

// {
//     "session":[
//         {
//             "exercise":"Snatch",
//             "weight": 55,
//             "rounds": 10,
//             "reps": 2
//         },
//         {
//             "exercise":"Snatch Pulls",
//             "weight": 95,
//             "rounds": 5,
//             "reps": 3
//         }
//     ],
//     "client":"63dc19bf15ebe951c8252407"
// }
