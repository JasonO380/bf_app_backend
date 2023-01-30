const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Programming = require("../models/programming");
const Session = require("../models/session");

const updateProgramming = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422)
        );
    }

    const programID = req.params.pid;
    let program;
    try {
        program = await Programming.findById(programID);
    } catch (err) {
        console.log(err);
        return next(
            new HttpError(
                "Could not update program, please try again later",
                500
            )
        );
    }

    if (!program) {
        return next(new HttpError("Could not find program for this id", 404));
    }
    //update program fields
    program.cycleName = req.body.cycleName;
    program.athlete = req.body.athlete;

    // Find the index of the week
    const weekIndex = program.weeks.findIndex(
        (week) => week.weekNumber === req.body.week
    );
    if (weekIndex >= 0) {
        // Find the index of the day
        const dayIndex = program.weeks[weekIndex].days.findIndex(
            (day) => day.dayNumber === req.body.day
        );
        if (dayIndex >= 0) {
            // Add the session to the existing day
            program.weeks[weekIndex].days[dayIndex].session.push({
                exercise: req.body.exercise,
                conditioning: req.body.conditioning,
                date: req.body.date,
                reps: req.body.reps,
                rounds: req.body.rounds,
                weight: req.body.weight,
                distance: req.body.distance,
                time: req.body.time,
            });
        } else {
            // Add the day and session if it doesn't exist
            program.weeks[weekIndex].days.push({
                dayNumber: req.body.day,
                session: [
                    {
                        exercise: req.body.exercise,
                        conditioning: req.body.conditioning,
                        date: req.body.date,
                        reps: req.body.reps,
                        rounds: req.body.rounds,
                        weight: req.body.weight,
                        distance: req.body.distance,
                        time: req.body.time,
                    },
                ],
            });
        }
    } else {
        // Add the week, day, and session if it doesn't exist
        program.weeks.push({
            weekNumber: req.body.week,
            days: [
                {
                    dayNumber: req.body.day,
                    session: [
                        {
                            exercise: req.body.exercise,
                            conditioning: req.body.conditioning,
                            date: req.body.date,
                            reps: req.body.reps,
                            rounds: req.body.rounds,
                            weight: req.body.weight,
                            distance: req.body.distance,
                            time: req.body.time,
                        },
                    ],
                },
            ],
        });
    }

    try {
        await program.save();
    } catch (err) {
        return next(
            new HttpError(
                "Could not save the updated program, please try again later",
                500
            )
        );
    }
    res.status(200).json({ program: program.toObject({ getters: true }) });
};

exports.updateProgramming = updateProgramming;


//front end possibility for grid layout when entering programming 
// import ReactGridLayout from 'react-grid-layout';

// const CreateProgramming = () => {
//     const layout = [
//         {i: 'a', x: 0, y: 0, w: 1, h: 2},
//         {i: 'b', x: 1, y: 0, w: 3, h: 2},
//         {i: 'c', x: 4, y: 0, w: 1, h: 2},
//     ];

//     return (
//         <ReactGridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
//             <div key="a">Exercise Input</div>
//             <div key="b">Sets and Reps Input</div>
//             <div key="c">Save Button</div>
//         </ReactGridLayout>
//     );
// }

// export default CreateProgramming;