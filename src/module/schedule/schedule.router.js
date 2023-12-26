import { Router } from "express";
import * as scheduleCont from './controller/schedule.controller.js';


const router = Router();


router.post('/:docId',scheduleCont.createSchedule);
router.get('/:docId',scheduleCont.getSchedule);

router.get('/appointment/:bookId/:docId',scheduleCont.getApp);

router.post('/:userId/:bookedId/:docId',scheduleCont.booking);

router.get('/byUser/all/:userId',scheduleCont.getAppByUser);
router.get('/byUser/cancel/:userId',scheduleCont.getCancelAppByUser);
router.get('/byUser/done/:userId',scheduleCont.getDoneAppByUser);
router.get('/byUser/today/:userId',scheduleCont.getTodayAppByUser);

router.patch('/cancel/:userId/:bookId/:docId',scheduleCont.appCancel);
router.patch('/cancelByDoc/:userId/:bookId/:docId',scheduleCont.appCancelByDoctor);
router.patch('/done/:userId/:bookId/:docId',scheduleCont.appDone);
router.get('/byDoctor/all/:docId',scheduleCont.getAppByDoctor);
router.get('/byDoctor/cancel/:docId',scheduleCont.getCancelAppByDoctor);
router.get('/byDoctor/done/:docId',scheduleCont.getDoneAppByDoctor);
router.get('/doctorAppointment/:bookId/:userId',scheduleCont.getDocAppInfo);

router.get('/byDoctor/today/:docId',scheduleCont.getTodayAppByDoctor);
export default router;