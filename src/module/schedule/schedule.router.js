import { Router } from "express";
import * as scheduleCont from './controller/schedule.controller.js';


const router = Router();


router.post('/:docId',scheduleCont.createSchedule);
router.get('/:docId',scheduleCont.getSchedule);

export default router;