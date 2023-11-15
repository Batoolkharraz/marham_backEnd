import { Router } from "express";
import * as scheduleCont from './controller/schedule.controller.js';


const router = Router();


router.post('/:docId',scheduleCont.createSchedule);
router.get('/:docId',scheduleCont.getSchedule);
router.get('/appointment/:bookId',scheduleCont.getApp);
router.post('/:userId/:bookedId/:docId',scheduleCont.booking);
router.get('/byUser/all/:userId',scheduleCont.getAppByUser);
router.get('/byUser/cancel/:userId',scheduleCont.getCancelAppByUser);
router.get('/byUser/done/:userId',scheduleCont.getDoneAppByUser);
router.patch('/cancel/:userId/:bookId',scheduleCont.appCancel);
router.patch('/done/:userId/:bookId',scheduleCont.appDone);

export default router;