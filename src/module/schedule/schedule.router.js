import { Router } from "express";
import * as scheduleCont from './controller/schedule.controller.js';


const router = Router();


router.post('/:docId',scheduleCont.createSchedule);
router.get('/:docId',scheduleCont.getSchedule);
router.post('/:userId/:bookedId/:docId',scheduleCont.booking);
router.get('/byUser/:userId',scheduleCont.getAppByUser);
router.patch('/cancel/:userId/:bookId',scheduleCont.appCancel);
router.patch('/done/:userId/:bookId',scheduleCont.appDone);

export default router;