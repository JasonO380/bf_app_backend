const express = require('express');
const workoutControllers = require('../controllers/workout-controller');
const { check } = require('express-validator');
// const checkAuth = require('../middleware/check-auth');
const router = express.Router();

router.post('/',
[
    check('movement').isLength({min:3}),
    check('rounds').not().isEmpty(),
    check('reps').not().isEmpty(),
    check('weight').not().isEmpty()
], workoutControllers.addWorkouts);

router.patch('/:wid', 
    [
    check('movement').isLength({min:3}),
    check('rounds').not().isEmpty(),
    check('reps').not().isEmpty(),
    check('weight').not().isEmpty()
    ],
    workoutControllers.updateWorkout);

router.delete('/:wid', workoutControllers.deleteWorkout);

module.exports = router;