import priceModel from "../../../../DB/model/price.model.js";
import doctorModel from "../../../../DB/model/doctor.model.js";
import { asyncHandler } from "../../../Services/errorHandling.js";

export const createPrice = asyncHandler(async (req, res, next) => {

    const doctor = await doctorModel.findById(req.params.docId);
    const docId=doctor._id;
    const existingPrice = await priceModel.findOne({
        doctorId: docId
    });

    if (existingPrice) {
        existingPrice.price=req.body.price;
        await existingPrice.save();
        return res.status(201).json({ existingPrice });
    } 
    else {
            const newPrice = await priceModel.create({
                doctorId:docId,
                price:req.body.price
            });

            return res.status(201).json({ newPrice });
    }
    
});

export const getPrice = asyncHandler(async (req, res, next) => {
    const docId = req.params.docId;
    const price = await priceModel.findOne(
        {
            doctorId: docId
        });
    return res.status(200).json(price);
});


// export const Price = asyncHandler(async (req, res, next) => {

//     const doctors = await doctorModel.find();
//     for(const doctor of doctors){
//         const docId=doctor._id;
//         const existingPrice = await priceModel.findOne({
//             doctorId: docId
//         });
    
//         if (existingPrice) {
//             existingPrice.price=req.body.price;
//             await existingPrice.save();
//         } 
//         else {
//                 const newPrice = await priceModel.create({
//                     doctorId:docId,
//                     price:req.body.price
//                 });
    
//         }
//     }
    
//     return res.status(201).json( 'hh' );
    
// });


export const updatePrice = asyncHandler(async (req, res, next) => {
    const docId = req.params.docId;
    const price = await priceModel.findOne(
        {
            doctorId: docId
        });
        price.price=req.body.price;
        await price.save();
        if(!price){
            
            const newPrice = await priceModel.create({
                doctorId:docId,
                price:req.body.price
            });
        }
    return res.status(200).json('success');
});