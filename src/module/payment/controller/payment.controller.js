
import doctorModel from "../../../../DB/model/doctor.model.js";
import paymentModel from "../../../../DB/model/payment.model.js";
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
                payMethod:req.body.payMethod
            });

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
