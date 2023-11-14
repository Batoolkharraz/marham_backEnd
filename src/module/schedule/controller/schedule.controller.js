import bookedModel from "../../../../DB/model/booked.model.js";
import scheduleModel from "../../../../DB/model/schedule.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import userModel from "../../Authalaa/DB/Usermodel.js";


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
        timeSlots.push({ time: formattedTime, is_booked: false });


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
            timeSlotstime: timeSlots,
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


export const getSchedule = asyncHandler(async (req, res, next) => {
    const schedules = await scheduleModel.find({ writtenBy: req.params.docId });
    if (!schedules) {
        return next(new Error(`schedules not found `));
    }
    return res.status(200).json({ schedules });
})

export const booking = asyncHandler(async (req, res, next) => {
    const bookedId = req.params.bookedId;

    const user = await userModel.findById(req.params.userId);

    if (!user) {
        return next(new Error('User not found'));
    }

    let booked;

    // Check if the user already has a booking entry
    const existingBooking = await bookedModel.findOne({ bookedBy: req.params.userId });

    if (existingBooking) {
        // User already has a booking entry, add the new schedule to the bookInfo list
        existingBooking.bookInfo.push({
            bookId: bookedId,
            doctorId: req.params.docId,  // Update with the actual field from the request body
            is_attend: false,  // Set to the desired initial value
        });

        // Save the updated booking entry
        booked = await existingBooking.save();
    } else {
        // User doesn't have a booking entry, create a new one
        booked = await bookedModel.create({
            bookedBy: req.params.userId,
            bookInfo: [{
                bookId: bookedId,
                doctorId: req.params.docId,  // Update with the actual field from the request body
                is_attend: false,  // Set to the desired initial value
            }],
        });
    }

    try {
        const schedules = await scheduleModel.findOneAndUpdate(
            {
                'scheduleByDay.timeSlots._id': bookedId,
            },
            {
                $set: {
                    'scheduleByDay.$[day].timeSlots.$[slot].is_booked': true,
                },
            },
            {
                arrayFilters: [
                    { 'day._id': bookedId },  // Update with the actual field in scheduleByDay
                    { 'slot._id': bookedId },
                ],
                new: true,
            }
        );

        if (!schedules) {
            return next(new Error('Schedules not found'));
        }

        return res.status(200).json('success');
    } catch (error) {
        return next(error);
    }
});


export const getScheduleById = asyncHandler(async (req, res, next) => {
    const apps = await bookedModel.find({ bookedBy: req.params.userId });
    if (!apps) {
        return next(new Error(`schedules not found `));
    }
    return res.status(200).json({ apps });
})

export const getAppByUser = asyncHandler(async (req, res, next) => {
    const apps = await bookedModel.find({ bookedBy: req.params.userId });
    if (!apps) {
        return next(new Error(`schedules not found `));
    }
    return res.status(200).json({ apps });
})
