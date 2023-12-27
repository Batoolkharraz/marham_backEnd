import { Router } from "express";
import * as paymentCont from './controller/payment.controller.js';


const router = Router();


router.post('/:userId/:bookId',paymentCont.createPayment);
router.get('/:userId/:bookId',paymentCont.getPayment);
router.get('/points/:userId/:bookId',paymentCont.getPoint);

export default router;