const createDayObjectSession = (session) => {
    const transformedSessions = [];
    //helper function to create MovementObjects
    const generateMovementObjects = (session) => ({
        id: session._id,
        movement: session.exercise,
        rounds: session.rounds,
        reps: session.reps,
        weight: session.weight,
        distance: session.distance,
        time: session.time,
    });
    // Helper function to find or create a year object
    const findOrCreateYear = (year) => {
        let yearObj = transformedSessions.find((fSession) => fSession.year === year);
        if (!yearObj) {
            yearObj = { year, months: [] };
            transformedSessions.push(yearObj);
        }
        return yearObj;
    };

    // Helper function to find or create a month object
    const findOrCreateMonth = (yearObj, month) => {
        let monthObj = yearObj.months.find(
            (monthObj) => monthObj.month === month
        );
        if (!monthObj) {
            monthObj = { month, days: [] };
            yearObj.months.push(monthObj);
        }
        return monthObj;
    };

    // Helper function to find or create a day object
    const findOrCreateDay = (monthObj, day, dayOfWeek) => {
        let dayObj = monthObj.days.find((dayObj) => dayObj.day === day);
        if (!dayObj) {
            dayObj = { day, dayOfWeek, sessions: [] };
            monthObj.days.push(dayObj);
        }
        return dayObj;
    };

    // convert Mongoose documents to plain objects
    const sessionsAsObjects = session.map(session => session.toObject({getters: true}));

    sessionsAsObjects.forEach((sess) => {
        const yearObj = findOrCreateYear(sess.year);
        const monthObj = findOrCreateMonth(yearObj, sess.month);
        const dayObj = findOrCreateDay(monthObj, sess.dayOfMonth, sess.dayOfWeek);
        dayObj.sessions.push(generateMovementObjects(sess));
    });

    return transformedSessions;
};

exports.createDayObjectSession = createDayObjectSession;