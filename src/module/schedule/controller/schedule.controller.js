import scheduleModel from "../../../../DB/model/schedule.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";


export const createSchedule = asyncHandler(async (req, res, next) => {

    const { date, startTime, endTime, duration } = req.body;
    // Parse startTime and endTime to Date objects
    // Combine date and time to create Date objects
    const startDate = new Date(date + ' ' + startTime);
    const endDate = new Date(date + ' ' + endTime);

    // Initialize an array to store time slots
    const timeSlots = [];

    // Calculate time slots
    let currentTime = startDate;
    while (currentTime <= endDate) {
        // Format the current time as HH:MM
        const formattedTime = currentTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        // Add the formatted time to the time slots array
        timeSlots.push(formattedTime);

        // Increment the current time by the duration in minutes
        currentTime.setMinutes(currentTime.getMinutes() + duration);

        // Add a break time after each time slot (e.g., 15 minutes)
        currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    const existingSchedule = await scheduleModel.findOne({
        writtenBy: req.params.docId,
        'scheduleByDay.date': date,
    });

    if (existingSchedule) {
        // Schedule already exists for this date, add the new data to the existing schedule
        const scheduleDay = existingSchedule.scheduleByDay.find(
            (day) => day.date === date
        );

        if (scheduleDay) {
            scheduleDay.duration = duration;
            scheduleDay.startTime = startTime;
            scheduleDay.endTime = endTime;
            scheduleDay.timeSlots = timeSlots;
        } else {
            existingSchedule.scheduleByDay.push({
                duration: duration,
                startTime: startTime,
                endTime: endTime,
                date: date,
                timeSlots: timeSlots,
            });
        }

        // Save the updated doctor's schedule
        await existingSchedule.save();
        return res.status(201).json({ existingSchedule });

    }
    const schedule = await scheduleModel.findOne({ writtenBy: req.params.docId });
    if (schedule) {
        //add the new data to the scheduleByDay
        schedule.scheduleByDay.push({
            duration: duration,
            startTime: startTime,
            endTime: endTime,
            date: date,
            timeSlots: timeSlots
        });

        // Save the updated doctor's schedule
        await schedule.save();
        
    return res.status(201).json({ schedule });

    }
    else {
        const newSchedule = await scheduleModel.create({
            writtenBy: req.params.docId,
            scheduleByDay: [{
                duration: duration,
                startTime: startTime,
                endTime: endTime,
                date: date,
                timeSlots: timeSlots
            }]
        })
        
    return res.status(201).json({ newSchedule });
    }

});

