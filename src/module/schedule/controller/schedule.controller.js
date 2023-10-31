import scheduleModel from "../../../../DB/model/schedule.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";


export const createSchedule = asyncHandler(async (req, res, next) => {

    const { date, startTime, endTime, duration } = req.body; 
    // Parse startTime and endTime to Date objects
  // Combine date and time to create Date objects
  const startDate = new Date(date + ' ' + startTime);
  const endDate = new Date(date + ' ' + endTime);

  console.log(startDate);
  console.log(endDate);

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
  }


    return res.status(201).json({ timeSlots});
  });


