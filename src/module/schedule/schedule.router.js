import { Router } from "express";
import * as scheduleCont from './controller/schedule.controller.js';


const router = Router();


router.post('/',scheduleCont.createSchedule);

export default router;