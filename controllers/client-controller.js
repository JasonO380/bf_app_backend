const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Client = require('../models/client');
const Coach = require('../models/coach');
const Session = require('../models/session');

const addClient = async (req, res, next) => {
    const {clientName, coach} = req.body;
    const errors = validationResult(req);
    //check to see if errors is not empty if there are errors throw new HttpError
    if(!errors.isEmpty()){
        console.log(errors);
        const error = new HttpError('Password must be at least 6 characters, email must contain @, coach name must not be empty', 422)
        return next(error);
    };

    let clientExists;
    let newClient;
    try {
        clientExists = await Client.findOne({clientName})
    } catch (err) {
        return next(new HttpError('Can not find clients try again later', 500))
    }

    if(clientExists){
        return next (new HttpError('Client already exists'))
    } else {
        newClient = new Client ({clientName})
        await newClient.save()
    }
    try {
        await Coach.findByIdAndUpdate(coach , {
            $push: { client: newClient._id },
        })
    } catch (err) {
        return next (new HttpError('Can not find coach please try again later', 500))
    }

    res.json({ client: newClient.toObject({ getters: true }) });
}

const addClientSession = async (req, res, next) => {
    const {clientName, coach, session} = req.body;
    console.log(session);
    const clientID = req.params.cid;
    const errors = validationResult(req);
    //check to see if errors is not empty if there are errors throw new HttpError
    if(!errors.isEmpty()){
        console.log(errors);
        const error = new HttpError('Password must be at least 6 characters, email must contain @, coach name must not be empty', 422)
        return next(error);
    };

    let addClientSession;
    let sessions = [];
    let newSession;
    try {
        addClientSession = await Client.findById(clientID)
        for(let s of session){
            newSession = new Session(s)
            sessions.push(newSession._id)
            await newSession.save();
            await addClientSession.save()
        }
        addClientSession.session = sessions;
        await addClientSession.save()
    } catch (err) {
        return next(new HttpError('Could not add client session please try again later', 500))
    }

    res.json({ 
        clientSession: addClientSession.toObject({ getters: true })
    })
}

const deleteClientSession = async (req, res, next) => {
    const {clientName, coach, session} = req.body;
    const sessionID = req.params.sid;
    const errors = validationResult(req);
    //check to see if errors is not empty if there are errors throw new HttpError
    if(!errors.isEmpty()){
        console.log(errors);
        const error = new HttpError('Password must be at least 6 characters, email must contain @, coach name must not be empty', 422)
        return next(error);
    };

    let deleteSession;
    try {
        deleteSession = await Session.findByIdAndRemove(sessionID)
        await Client.findByIdAndUpdate(clientName, {
            $pull: { session: sessionID },
        })
        res.status(200).json({message:"Successfully deleted client session"})
    } catch (err) {
        return next (new HttpError("Can not delete session right now try again later", 500))
    }
}

exports.addClient = addClient;
exports.addClientSession = addClientSession;
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