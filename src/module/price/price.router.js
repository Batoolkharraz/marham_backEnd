import { Router } from "express";
import * as priceCont from './controller/price.controller.js';


const router = Router();


router.post('/:docId',priceCont.createPrice);
router.get('/:docId',priceCont.getPrice);
router.patch('/updates/:docId',priceCont.updatePrice);

export default router;