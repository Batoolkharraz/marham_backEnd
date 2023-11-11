import { Router } from "express";
import * as scheduleCont from './controller/schedule.controller.js';


const router = Router();


router.post('/:docId',scheduleCont.createSchedule);
router.get('/:docId',scheduleCont.getSchedule);
router.post('/:userId/:bookedId/:docId',scheduleCont.booking);
router.get('byUser/:userId',scheduleCont.getScheduleById);

export default router;