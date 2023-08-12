
const transformToWorkoutWeeks = (data) => {
    return data.map((yearData) => {
        const monthsWithWeeks = yearData.months.map((monthData) => {
            const weeks = [];
            let currentWeek = [];
            let previousDay = null;
            let weekStartDay = null;

            // Define the acceptable range for each day of the week
            const dayRanges = {
                Sunday: 6,
                Monday: 5,
                Tuesday: 4,
                Wednesday: 3,
                Thursday: 2,
                Friday: 1,
                Saturday: 0,
            };

            const dayOfWeek = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];

            const dayOfWeekValue = {
                Sunday:6,
                Monday:5,
                Tuesday:4,
                Wednesday:3,
                Thursday:2,
                Friday:1,
                Saturday:0
            }

            monthData.days.forEach((day, index) => {
                // If this is the first day we're processing and it's not Sunday,
                // we add null entries to currentWeek for the missing days
                if (index === 0 && day.dayOfWeek !== "Sunday") {
                    console.log('first null check')
                    const missingDays = dayOfWeekValue[day.dayOfWeek];
                    for (let i = 0; i < missingDays; i++) {
                        currentWeek.push(null);
                    }
                } 

                if (currentWeek.length === 7) {
                    weeks.push(currentWeek);
                    currentWeek = []; // Reset the current week
                }
                // Check if we should start a new week
                if (dayOfWeek.includes(day.dayOfWeek)) {
                    // Run the check with the previous day's data
                    if (
                        previousDay &&
                        previousDay.day - day.day > dayRanges[day.dayOfWeek]
                    ) {
                        // Set remaining values in currentWeek to null
                        const remainingDays = 7 - currentWeek.length;
                        for (let i = 0; i < remainingDays; i++) {
                            currentWeek.push(null);
                        }
                        weeks.push(currentWeek);
                        currentWeek = []; // Reset the current week
                    }

                    currentWeek.push(day);
                    weekStartDay = day.dayOfWeek; // Update the starting day of the current week
                }

                previousDay = day; // Update the previous day's data
            });

            // Push the remaining days of the last week
            if (currentWeek.length > 0) {
                weeks.push(currentWeek);
            }
            console.log(weeks)
            return {
                ...monthData,
                weeks: weeks,
            };
        });

        return {
            ...yearData,
            months: monthsWithWeeks,
        };
    });
};

exports.transformToWorkoutWeeks = transformToWorkoutWeeks