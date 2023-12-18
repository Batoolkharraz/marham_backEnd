import { Router } from "express";
import * as priceCont from './controller/price.controller.js';


const router = Router();


router.post('/:docId',priceCont.createPrice);
router.get('/:docId',priceCont.getPrice);

export default router;