const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const Programming = require("../models/programming");
const WeekDays = require("../models/week-days");
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

    let weekDays = req.body.weeks;
    let sessions = req.body.workouts;

    if (weekDays) {
        for (const weekDay of weekDays) {
            let existingWeekDay = await WeekDays.findOne({ _id: weekDay._id });

            if (existingWeekDay) {
                for (const session of weekDay.workouts) {
                    let existingSession = await Session.findOne({
                        _id: session._id,
                    });
                    if (!existingSession) {
                        let newSession = new Session(session);
                        await newSession.save();
                        await WeekDays.findByIdAndUpdate(existingWeekDay._id , {
                            $push: { session: newSession._id },
                        })
                        await existingWeekDay.save();
                        await Programming.findByIdAndUpdate(programID, {
                            $push: { session: newSession._id },
                        });
                    }
                }
            } else {
                let newWeekDay = new WeekDays(weekDay);
                await newWeekDay.save();
                await Programming.findByIdAndUpdate(programID, {
                    $push: { weeks: newWeekDay._id },
                });
                for (const session of weekDay.workouts) {
                    let newSession = new Session(session);
                    newSession.weekDays = newWeekDay._id;
                    await newSession.save();
                    await WeekDays.findByIdAndUpdate(newWeekDay._id , {
                        $push: { session: newSession._id },
                    })
                    await newWeekDay.save();
                    await Programming.findByIdAndUpdate(programID, {
                        $push: { session: newSession._id },
                    });
                }
            }
        }
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
