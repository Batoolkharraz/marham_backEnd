import bookedModel from "../../../../DB/model/booked.model.js";
import doctorModel from "../../../../DB/model/doctor.model.js";
import scheduleModel from "../../../../DB/model/schedule.model.js";
import appointmentModel from "../../../../DB/model/docApp.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";
import userModel from "../../Authalaa/DB/Usermodel.js";
import mongoose, { Schema, model, Types } from 'mongoose';
import { format, parse } from 'date-fns';
import { sendEmailCancelAppDoctor, sendEmailCancelAppUser } from "../../SentEmail/sentmail.js";

export const createSchedule = asyncHandler(async (req, res, next) => {
    const { date, startTime, endTime, duration } = req.body;


    const user = await userModel.findById(req.params.docId);
    const email = user.email;
    const doctor = await doctorModel.findOne({ email });
    const docId = doctor._id;
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
        writtenBy: docId,
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
        const schedule = await scheduleModel.findOne({ writtenBy: docId });

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
                writtenBy: docId,
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

    // Find schedules with 'scheduleByDay' where the date is greater than or equal to today
    const schedules = await scheduleModel.findOne(
        {
            writtenBy: docId,
            'scheduleByDay.date': { $gte: formattedToday }
        },
        // Exclude schedules with 'scheduleByDay' where the date is less than today
    );

    if (schedules) {
        schedules.scheduleByDay = schedules.scheduleByDay.filter((slot) => {
            slot.date = format(parse(slot.date, 'yyyy/MM/dd', new Date()), 'yyyy/MM/dd').replace(/\/(\d)\b/g, '/0$1');
            return formattedToday.localeCompare(slot.date) !== 1;
        });

    }


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

    // Find the user based on userId
    const user = await userModel.findById(req.params.userId);

    // If user not found, return an error
    if (!user) {
        return next(new Error('User not found'));
    }

    let booked;

    // Check if the user already has a booking entry
    const existingBooking = await bookedModel.findOne({ bookedBy: req.params.userId });
    if (existingBooking) {
        // Check if the bookedId already exists in the bookInfo list
        const isAppointmentExists = existingBooking.bookInfo.some(appointment =>
            appointment.bookId.toString() === bookedId && !appointment.is_canceled);
        const isAppExistsCanceled = existingBooking.bookInfo.some(appointment =>
            appointment.bookId.toString() === bookedId && appointment.is_canceled);
        const isAppExists = existingBooking.bookInfo.some(appointment =>
            appointment.bookId.toString() === bookedId);

        if (isAppointmentExists) {
            // If the appointment already exists and is not canceled, return a message
            return res.status(200).json('Appointment already exists');
        }
        if (isAppExistsCanceled) {
            for (const app of existingBooking.bookInfo) {
                if (app.bookId == bookedId) {
                    app.is_canceled = false;
                }
            }
            // Save the updated booking entry
            booked = await existingBooking.save();
        }
        if (!isAppExists) {
            existingBooking.bookInfo.push({
                bookId: bookedId,
                doctorId: req.params.docId,
                is_attend: false,
                is_canceled: false,
            });

            // Save the updated booking entry
            booked = await existingBooking.save();
        }
    } else {
        // User doesn't have a booking entry, create a new one
        booked = await bookedModel.create({
            bookedBy: req.params.userId,
            bookInfo: [{
                bookId: bookedId,
                doctorId: req.params.docId,
                is_attend: false,
                is_canceled: false,
            }],
        });
    }

    // Find and update the schedule to mark the time slot as booked
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
                { 'day.timeSlots._id': bookedId },
                { 'slot._id': bookedId },
            ],
            new: true,
        }
    );

    // If schedules not found, return an error
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
                    'bookInfo.$.is_attend': false,
                    'bookInfo.$.is_canceled': false,
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
                upsert: true,
            }
        );
    }

    // Return success message
    return res.status(200).json('success');
});

export const getAppByUser = asyncHandler(async (req, res, next) => {
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
                                slot.date = format(parse(slot.date, 'yyyy/MM/dd', new Date()), 'yyyy/MM/dd').replace(/\/(\d)\b/g, '/0$1');
                                if (formattedToday.localeCompare(slot.date) === -1) {
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

export const getCancelAppByUser = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;

    const allApps = await bookedModel.find({ bookedBy: userId });

    if (!allApps || allApps.length === 0) {
        return next(new Error('Appointments not found'));
    }

    let notAttendNotCanceledAppInfoList = [];
    const today = new Date(); // Get today's date
    const formattedToday = format(today, 'yyyy/MM/dd');

    for (const app of allApps) {
        const filteredBookInfo = app.bookInfo.filter(info => info.is_canceled);
        for (const bookInfo of filteredBookInfo) {
            const schedule = await scheduleModel.findOne({
                'scheduleByDay.timeSlots._id': bookInfo.bookId,
            });

            if (schedule) {
                for (const slot of schedule.scheduleByDay) {
                    for (const slotTime of slot.timeSlots) {
                        if (slotTime._id.equals(bookInfo.bookId)) {
                            slot.date = format(parse(slot.date, 'yyyy/MM/dd', new Date()), 'yyyy/MM/dd').replace(/\/(\d)\b/g, '/0$1');

                            if (formattedToday.localeCompare(slot.date) === 0 || formattedToday.localeCompare(slot.date) === -1) {
                                notAttendNotCanceledAppInfoList.push(bookInfo);
                            }
                        }
                    }
                }
            }
        }
    }

    if (notAttendNotCanceledAppInfoList.length === 0) {
        return next(new Error('Canceled appointments not found'));
    }

    return res.status(200).json({ canceledAppInfo: notAttendNotCanceledAppInfoList });
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
                                slot.date = format(parse(slot.date, 'yyyy/MM/dd', new Date()), 'yyyy/MM/dd').replace(/\/(\d)\b/g, '/0$1');
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
    const doctor = await doctorModel.findById(req.params.docId);
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

                    sendEmailCancelAppUser(doctor.name, doctor.email);

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
                                slot.date = format(parse(slot.date, 'yyyy/MM/dd', new Date()), 'yyyy/MM/dd').replace(/\/(\d)\b/g, '/0$1');
                                if (formattedToday.localeCompare(slot.date) === -1) {
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

    const notAttendNotCanceledAppInfoList = [];

    for (const app of allApps) {
        const filteredBookInfo = app.bookInfo.filter(info => info.is_canceled);

        for (const bookInfo of filteredBookInfo) {
            const schedule = await scheduleModel.findOne({
                'scheduleByDay.timeSlots._id': bookInfo.bookId,
            });

            if (schedule) {
                const formattedToday = format(new Date(), 'yyyy/MM/dd');

                for (const slot of schedule.scheduleByDay) {
                    for (const slotTime of slot.timeSlots) {
                        if (slotTime._id.equals(bookInfo.bookId)) {
                            slot.date = format(parse(slot.date, 'yyyy/MM/dd', new Date()), 'yyyy/MM/dd').replace(/\/(\d)\b/g, '/0$1');
                            if (formattedToday.localeCompare(slot.date) === -1 || formattedToday.localeCompare(slot.date) === 0) {
                                notAttendNotCanceledAppInfoList.push(bookInfo);
                            }
                        }
                    }
                }
            }
        }
    }

    if (notAttendNotCanceledAppInfoList.length === 0) {
        return next(new Error('Canceled appointments not found'));
    }

    return res.status(200).json({ canceledAppInfo: notAttendNotCanceledAppInfoList });
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

    const docId = req.params.docId

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
                                slot.date = format(parse(slot.date, 'yyyy/MM/dd', new Date()), 'yyyy/MM/dd').replace(/\/(\d)\b/g, '/0$1');
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

export const appCancelByDoctor = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.params.userId);
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

                    sendEmailCancelAppDoctor(user.username, user.email);

                    return res.status(200).json('success');
                }
            }

            return next(new Error('Appointment not found'));

        }
    }

    return next(new Error('Appointment not found'));
});

export const getNumApp = asyncHandler(async (req, res, next) => {
    let num = 0;  // Move the declaration outside the if block

    const schedule = await scheduleModel.findOne({ writtenBy: req.params.docId });
    if (schedule) {
        for (const s of schedule.scheduleByDay) {
            for (const t of s.timeSlots) {
                if (t.is_booked) {
                    console.log(t);
                    num++;
                }
            }
        }
    }
    return res.status(200).json(num);
});

export const getNumAppMonth = asyncHandler(async (req, res, next) => {
    let num = 0;

    const schedule = await scheduleModel.findOne({ writtenBy: req.params.docId });
    if (schedule) {
        const currentDate = new Date();
        const lastMonthDate = new Date();
        lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

        for (const s of schedule.scheduleByDay) {
            for (const t of s.timeSlots) {
                const slotDate = new Date(s.date);
                // Check if the slot is booked and falls within the last month
                if (t.is_booked && slotDate >= lastMonthDate && slotDate <= currentDate) {
                    console.log(t);
                    num++;
                }
            }
        }
    }
    return res.status(200).json(num);
});

export const getNumPatient = asyncHandler(async (req, res, next) => {
    const app = await appointmentModel.findOne({ bookedFor: req.params.docId });
    let uniqueUserIds = [];
    if (app) {
        for (const a of app.bookInfo) {
            // Assuming 'userId' is the key for the user identifier
            const userId = a.userId.toString();

            // Check if the userId is not already in the array before adding it
            if (!uniqueUserIds.includes(userId)) {
                uniqueUserIds.push(userId);
            }
        }
    }
    const num = uniqueUserIds.length;

    return res.status(200).json(num);
});

export const getNumAppAll = asyncHandler(async (req, res, next) => {
    let num = 0;

    const schedules = await scheduleModel.find();

    if (schedules && schedules.length > 0) {
        for (const schedule of schedules) {
            for (const s of schedule.scheduleByDay) {
                for (const t of s.timeSlots) {
                    if (t.is_booked) {
                        num++;
                    }
                }
            }
        }
    }

    return res.status(200).json(num);
});
