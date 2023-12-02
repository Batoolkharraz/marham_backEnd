import bookedModel from "../../../../DB/model/booked.model.js";
import doctorModel from "../../../../DB/model/doctor.model.js";
import scheduleModel from "../../../../DB/model/schedule.model.js";
import appointmentModel from "../../../../DB/model/docApp.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import userModel from "../../Authalaa/DB/Usermodel.js";
import mongoose, { Schema, model, Types } from 'mongoose';
import { format } from 'date-fns';
import { startOfDay, endOfDay } from 'date-fns';

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
                timeSlots: timeSlots, // Fixed property name
            });
        }

        await existingSchedule.save();
        return res.status(201).json({ existingSchedule });
    } else {
        const schedule = await scheduleModel.findOne({ writtenBy: req.params.docId });

        if (schedule) {
            // Add the new data to the scheduleByDay
            schedule.scheduleByDay.push({
                duration: duration,
                startTime: startTime,
                endTime: endTime,
                date: date,
                timeSlots: timeSlots, // Fixed property name
            });

            // Save the updated doctor's schedule
            await schedule.save();
            return res.status(201).json({ schedule });
        } else {
            const newSchedule = await scheduleModel.create({
                writtenBy: req.params.docId,
                scheduleByDay: [{
                    duration: duration,
                    startTime: startTime,
                    endTime: endTime,
                    date: date,
                    timeSlots: timeSlots, // Fixed property name
                }]
            });

            return res.status(201).json({ newSchedule });
        }
    }
});

export const getSchedule = asyncHandler(async (req, res, next) => {
    const docId = req.params.docId;

    // Get today's date in the required format
    const today = new Date();
    const formattedToday = format(today, 'yyyy/MM/dd');

    // Find schedules for today and onwards
    const schedules = await scheduleModel.findOneAndUpdate(
        {
            writtenBy: docId
        },
        {
            $pull: {
                'scheduleByDay': { date: { $lt: formattedToday } }
            }
        },
        { new: true } // To get the updated document
    );

    if (!schedules) {
        return next(new Error(`Schedules not found for today and onwards`));
    }

    return res.status(200).json({ schedules });
});

export const getApp = asyncHandler(async (req, res, next) => {
    try {
        const apps = await scheduleModel.aggregate([
            {
                $unwind: '$scheduleByDay'
            },
            {
                $unwind: '$scheduleByDay.timeSlots'
            },
            {
                $match: {
                    'scheduleByDay.timeSlots._id': new mongoose.Types.ObjectId(req.params.bookId)
                }
            }
        ]);

        const doctor = await doctorModel.findById(req.params.docId);
        var docName = doctor.name;
        return res.status(200).json({ apps, docName });
    } catch (error) {
        return next(error);
    }
});

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
        // Check if the bookedId already exists in the bookInfo list
        const isAppointmentExists = existingBooking.bookInfo.some(appointment => appointment.bookId.toString() === bookedId);

        if (!isAppointmentExists) {
            // BookedId doesn't exist, add the new schedule to the bookInfo list
            existingBooking.bookInfo.push({
                bookId: bookedId,
                doctorId: req.params.docId,  // Update with the actual field from the request body
                is_attend: false,
                is_canceled: false,  // Set to the desired initial value
            });

            // Save the updated booking entry
            booked = await existingBooking.save();
        } else {
            return res.status(200).json('Appointment already exists');
        }
    } else {
        // User doesn't have a booking entry, create a new one
        booked = await bookedModel.create({
            bookedBy: req.params.userId,
            bookInfo: [{
                bookId: bookedId,
                doctorId: req.params.docId,  // Update with the actual field from the request body
                is_attend: false,
                is_canceled: false,  // Set to the desired initial value
            }],
        });
    }

    const schedules = await scheduleModel.findOneAndUpdate(
        {
            'scheduleByDay.timeSlots._id': bookedId,
        },
        {
            $set: {
                'scheduleByDay.$[].timeSlots.$[slot].is_booked': true,
            },
        },
        {
            arrayFilters: [
                { 'slot._id': bookedId },
            ],
            new: true
        }
    );

    if (!schedules) {
        return next(new Error('Schedules not found'));
    }

    // Check if the bookedFor already exists in the Appointment model
    const existingAppointment = await appointmentModel.findOne({
        bookedFor: req.params.docId,
        'bookInfo.bookId': bookedId,
    });

    if (existingAppointment) {
        // bookedId already exists for the bookedFor, update the existing entry
        await appointmentModel.findOneAndUpdate(
            {
                bookedFor: req.params.docId,
                'bookInfo.bookId': bookedId,
            },
            {
                $set: {
                    'bookInfo.$.is_attend': false,  // Set to the desired initial value
                    'bookInfo.$.is_canceled': false,  // Set to the desired initial value
                },
            }
        );
    } else {
        // bookedId doesn't exist for the bookedFor, add a new entry
        await appointmentModel.findOneAndUpdate(
            {
                bookedFor: req.params.docId,
            },
            {
                $push: {
                    bookInfo: {
                        bookId: bookedId,
                        userId: req.params.userId,
                        is_attend: false,
                        is_canceled: false,
                    },
                },
            },
            {
                upsert: true,  // Create a new entry if not exists
            }
        );
    }

    return res.status(200).json('success');
});

export const getAppByUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;

    const allApps = await bookedModel.find({ bookedBy: userId });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    const notAttendNotCanceledAppInfoList = allApps.reduce((result, app) => {
        const filteredBookInfo = app.bookInfo.filter(info => !info.is_attend && !info.is_canceled);
        if (filteredBookInfo.length > 0) {
            result.push(filteredBookInfo);
        }
        return result;
    }, []);

    if (notAttendNotCanceledAppInfoList.length === 0) {
        return next(new Error('Appointments where not attended and not canceled not found'));
    }

    return res.status(200).json({ AppsInfo: notAttendNotCanceledAppInfoList });
});

export const getCancelAppByUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;

    const allApps = await bookedModel.find({ bookedBy: userId });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    const canceledAppInfoList = allApps.reduce((result, app) => {
        const filteredBookInfo = app.bookInfo.filter(info => info.is_canceled);
        if (filteredBookInfo.length > 0) {
            result.push(filteredBookInfo);
        }
        return result;
    }, []);

    if (canceledAppInfoList.length === 0) {
        return next(new Error('Canceled appointments not found'));
    }

    return res.status(200).json({ canceledAppInfo: canceledAppInfoList });
});

export const getDoneAppByUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;

    const allApps = await bookedModel.find({ bookedBy: userId });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    const attendAppInfoList = allApps.reduce((result, app) => {
        const filteredBookInfo = app.bookInfo.filter(info => info.is_attend);
        if (filteredBookInfo.length > 0) {
            result.push(filteredBookInfo);
        }
        return result;
    }, []);

    if (attendAppInfoList.length === 0) {
        return next(new Error('Attended appointments not found'));
    }
    return res.status(200).json({ canceledAppInfo: attendAppInfoList });
});

export const getTodayAppByUser = asyncHandler(async (req, res, next) => {
    const docId = req.params.userId;

    const today = new Date(); // Get today's date

    const allApps = await bookedModel.find({
        bookedBy: docId
    });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    let notAttendNotCanceledAppInfoList = [];

    const formattedToday = format(today, 'yyyy/MM/dd');
    await Promise.all(
        allApps.map(async (app) => {
            const filteredBookInfo = app.bookInfo.filter(info => !info.is_attend && !info.is_canceled);
            for (let bookInfo of filteredBookInfo) {
                const schedule = await scheduleModel.findOne({
                    'scheduleByDay.timeSlots._id': bookInfo.bookId,
                });

                if (schedule) {
                    for (const slot of schedule.scheduleByDay) {
                        for (const slotTime of slot.timeSlots) {
                            if (slotTime._id.equals(bookInfo.bookId)) {
                                if (formattedToday.localeCompare(slot.date) === 0) {
                                    notAttendNotCanceledAppInfoList.push(bookInfo);
                                }

                            }
                        }

                    }
                }

            }
        })
    );


    // return the new list
    if (notAttendNotCanceledAppInfoList.length === 0) {
        return next(new Error('Appointments where not attended and not canceled not found for today'));
    }

    return res.status(200).json({ AppsInfo: notAttendNotCanceledAppInfoList });
});

export const appCancel = asyncHandler(async (req, res, next) => {
    const apps = await bookedModel.find({ bookedBy: req.params.userId });

    if (!apps || apps.length === 0) {
        return next(new Error('Schedules not found'));
    }

    // Extract appInfo from each document in the apps array
    const appInfoList = apps.map(app => app.bookInfo);

    // Loop through each appInfo to find and update the specified bookId
    for (const appInfo of appInfoList) {
        const indexToUpdate = appInfo.findIndex(app => app.bookId.toString() === req.params.bookId);

        if (indexToUpdate !== -1) {
            // Update the is_canceled field to true
            appInfo[indexToUpdate].is_canceled = true;

            // Save the updated bookedModel
            await bookedModel.updateOne({ bookedBy: req.params.userId }, { bookInfo: appInfo });

            // Find the corresponding schedule and update is_booked to false
            const schedule = await scheduleModel.findOneAndUpdate(
                {
                    'scheduleByDay.timeSlots._id': req.params.bookId,
                },
                {
                    $set: {
                        'scheduleByDay.$[].timeSlots.$[slot].is_booked': false,
                    },
                },
                {
                    arrayFilters: [
                        { 'slot._id': req.params.bookId },
                    ],
                    new: true,
                }
            );

            if (!schedule) {
                return next(new Error('Schedule not found'));
            }
            // Find the corresponding appointment and update is_canceled to true
            const appsDoc = await appointmentModel.find({ bookedFor: req.params.docId });

            if (!appsDoc || appsDoc.length === 0) {
                return next(new Error('Schedules not found'));
            }

            // Extract appInfo from each document in the apps array
            const DocappInfoList = appsDoc.map(Docapp => Docapp.bookInfo);

            // Loop through each appInfo to find and update the specified bookId
            for (const DocappInfo of DocappInfoList) {
                const DocindexToUpdate = DocappInfo.findIndex(Docapp => Docapp.bookId.toString() === req.params.bookId);

                if (DocindexToUpdate !== -1) {
                    // Update the is_canceled field to true
                    DocappInfo[DocindexToUpdate].is_canceled = true;

                    // Save the updated bookedModel
                    await appointmentModel.updateOne({ bookedFor: req.params.docId }, { bookInfo: DocappInfo });

                    return res.status(200).json('success');
                }
            }

            return next(new Error('Appointment not found'));
        }
    }

    return next(new Error('Appointment not found'));
});

export const appDone = asyncHandler(async (req, res, next) => {
    const docApps = await appointmentModel.find({ bookedFor: req.params.docId });

    if (!docApps || docApps.length === 0) {
        return next(new Error('Schedules not found'));
    }

    // Extract appInfo from each document in the apps array
    const docappInfoList = docApps.map(docapp => docapp.bookInfo);

    // Loop through each appInfo to find and update the specified bookId
    for (const docappInfo of docappInfoList) {
        const docindexToUpdate = docappInfo.findIndex(docapp => docapp.bookId.toString() === req.params.bookId);

        if (docindexToUpdate !== -1) {
            // Check if the appointment is already canceled
            if (docappInfo[docindexToUpdate].is_canceled) {
                return res.status(200).json('Appointment is already canceled');
            }

            // Update the is_attend field to true
            docappInfo[docindexToUpdate].is_attend = true;

            // Save the updated bookedModel
            await appointmentModel.updateOne({ bookedFor: req.params.docId }, { bookInfo: docappInfo });
        }
    }

    const apps = await bookedModel.find({ bookedBy: req.params.userId });

    if (!apps || apps.length === 0) {
        return next(new Error('Schedules not found'));
    }

    // Extract appInfo from each document in the apps array
    const appInfoList = apps.map(app => app.bookInfo);

    // Loop through each appInfo to find and update the specified bookId
    for (const appInfo of appInfoList) {
        const indexToUpdate = appInfo.findIndex(app => app.bookId.toString() === req.params.bookId);

        if (indexToUpdate !== -1) {
            // Check if the appointment is already canceled
            if (appInfo[indexToUpdate].is_canceled) {
                return res.status(200).json('Appointment is already canceled');
            }

            // Update the is_attend field to true
            appInfo[indexToUpdate].is_attend = true;

            // Save the updated bookedModel
            await bookedModel.updateOne({ bookedBy: req.params.userId }, { bookInfo: appInfo });
        }
    }

    return res.status(200).json('success');
});

export const getAppByDoctor = asyncHandler(async (req, res, next) => {
    const docId = req.params.docId;

    const today = new Date(); // Get today's date

    const allApps = await appointmentModel.find({
        bookedFor: docId
    });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    let notAttendNotCanceledAppInfoList = [];

    const formattedToday = format(today, 'yyyy/MM/dd');
    await Promise.all(
        allApps.map(async (app) => {
            const filteredBookInfo = app.bookInfo.filter(info => !info.is_attend && !info.is_canceled);
            for (let bookInfo of filteredBookInfo) {
                const schedule = await scheduleModel.findOne({
                    'scheduleByDay.timeSlots._id': bookInfo.bookId,
                });

                if (schedule) {
                    for (const slot of schedule.scheduleByDay) {
                        for (const slotTime of slot.timeSlots) {
                            if (slotTime._id.equals(bookInfo.bookId)) {
                                if (formattedToday.localeCompare(slot.date) === -1 ) {
                                    notAttendNotCanceledAppInfoList.push(bookInfo);
                                }

                            }
                        }

                    }
                }

            }
        })
    );


    // return the new list
    if (notAttendNotCanceledAppInfoList.length === 0) {
        return next(new Error('Appointments where not attended and not canceled not found '));
    }

    return res.status(200).json({ AppsInfo: notAttendNotCanceledAppInfoList });
});

export const getCancelAppByDoctor = asyncHandler(async (req, res, next) => {
    const docId = req.params.docId;

    const allApps = await appointmentModel.find({ bookedFor: docId });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    const canceledAppInfoList = allApps.reduce((result, app) => {
        const filteredBookInfo = app.bookInfo.filter(info => info.is_canceled);
        if (filteredBookInfo.length > 0) {
            result.push(filteredBookInfo);
        }
        return result;
    }, []);

    if (canceledAppInfoList.length === 0) {
        return next(new Error('Canceled appointments not found'));
    }

    return res.status(200).json({ canceledAppInfo: canceledAppInfoList });
});

export const getDoneAppByDoctor = asyncHandler(async (req, res, next) => {
    const docId = req.params.docId;

    const allApps = await appointmentModel.find({ bookedFor: docId });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    const attendAppInfoList = allApps.reduce((result, app) => {
        const filteredBookInfo = app.bookInfo.filter(info => info.is_attend);
        if (filteredBookInfo.length > 0) {
            result.push(filteredBookInfo);
        }
        return result;
    }, []);

    if (attendAppInfoList.length === 0) {
        return next(new Error('Attended appointments not found'));
    }
    return res.status(200).json({ canceledAppInfo: attendAppInfoList });
});

export const getTodayAppByDoctor = asyncHandler(async (req, res, next) => {
    const docId = req.params.docId;

    const today = new Date(); // Get today's date

    const allApps = await appointmentModel.find({
        bookedFor: docId
    });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    let notAttendNotCanceledAppInfoList = [];

    const formattedToday = format(today, 'yyyy/MM/dd');
    await Promise.all(
        allApps.map(async (app) => {
            const filteredBookInfo = app.bookInfo.filter(info => !info.is_attend && !info.is_canceled);
            for (let bookInfo of filteredBookInfo) {
                const schedule = await scheduleModel.findOne({
                    'scheduleByDay.timeSlots._id': bookInfo.bookId,
                });

                if (schedule) {
                    for (const slot of schedule.scheduleByDay) {
                        for (const slotTime of slot.timeSlots) {
                            if (slotTime._id.equals(bookInfo.bookId)) {
                                if (formattedToday.localeCompare(slot.date) === 0) {
                                    notAttendNotCanceledAppInfoList.push(bookInfo);
                                }

                            }
                        }

                    }
                }

            }
        })
    );


    // return the new list
    if (notAttendNotCanceledAppInfoList.length === 0) {
        return next(new Error('Appointments where not attended and not canceled not found for today'));
    }

    return res.status(200).json({ AppsInfo: notAttendNotCanceledAppInfoList });
});

export const getDocAppInfo = asyncHandler(async (req, res, next) => {
    try {
        const apps = await scheduleModel.aggregate([
            {
                $unwind: '$scheduleByDay'
            },
            {
                $unwind: '$scheduleByDay.timeSlots'
            },
            {
                $match: {
                    'scheduleByDay.timeSlots._id': new mongoose.Types.ObjectId(req.params.bookId)
                }
            }
        ]);

        const user = await userModel.findById(req.params.userId);
        var userName = user.username;
        return res.status(200).json({ apps, userName });
    } catch (error) {
        return next(error);
    }
});
