
import doctorModel from "../../../../DB/model/doctor.model.js";
import paymentModel from "../../../../DB/model/payment.model.js";
import pointModel from "../../../../DB/model/point.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createPayment = asyncHandler(async (req, res, next) => {

    const payment = await paymentModel.findOne({
        bookId: req.params.bookId
    });

    if (payment) {
        return res.status(201).json('you already paied for this appointment');
    } 
    else {
            const newpayment = await paymentModel.create({
                userId: req.params.userId,
                bookId: req.params.bookId,
                is_paied:true,
                payMethod:req.body.payMethod,
                price:req.body.price
            });

            const point =await pointModel.findOne({userId:req.params.userId});
            if(point){
                point.point+=50;
                await point.save();
            }
            if(!point){
            const newPoint = await pointModel.create({
                userId: req.params.userId,
                point:50
            });
            }
            return res.status(201).json({ newpayment });
    }
    
});

export const getPayment = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;
    const payment = await paymentModel.findOne(
        {
            userId: userId,
            bookId:req.params.bookId
        });
    return res.status(200).json(payment);
});

export const getPoint = asyncHandler(async (req, res, next) => {
    const userId = req.params.userId;
    const point = await pointModel.findOne(
        {
            userId: userId
        });
    return res.status(200).json(point);
});