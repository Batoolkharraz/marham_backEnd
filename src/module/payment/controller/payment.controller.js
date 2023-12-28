
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
            is_paied: true,
            payMethod: req.body.payMethod,
            price: req.body.price
        });

        const point = await pointModel.findOne({ userId: req.params.userId });
        if (point) {
            if (point.point >= 500) {
                point.point = 0;
                await point.save();
            }
            else {
                point.point += 50;
                await point.save();
            }
        }
        if (!point) {
            const newPoint = await pointModel.create({
                userId: req.params.userId,
                point: 50
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
            bookId: req.params.bookId
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

export const buyPoint = asyncHandler(async (req, res, next) => {
    var p = 0;
    if (req.body.price == 5) {
        p += 250;
    }
    if (req.body.price == 10) {
        p += 500;
    }
    if (req.body.price == 20) {
        p += 1000;
    }
    if (req.body.price == 50) {
        p += 2500;
    }
    const point = await pointModel.findOne({ userId: req.params.userId });
    if (point) {

        point.point += p;
        await point.save();
    }

    if (!point) {
        const newPoint = await pointModel.create({
            userId: req.params.userId,
            point: p
        });
    }
    return res.status(201).json("success");

});