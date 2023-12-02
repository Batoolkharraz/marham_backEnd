
import categoryRouter from './category/category.router.js';
import doctorRouter from './doctor/doctor.router.js';
import medicineRouter from './medicine/medicine.router.js';
import prescriptionRouter from './prescription/prescription.router.js';
import scheduleRouter from './schedule/schedule.router.js';
import searchRouter from './search/search.router.js';
import { globalErrorHandel } from '../Services/errorHandling.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const fullPath = path.join(__dirname,'../../upload');

const initApp=(app,express)=>{
    app.use(cors());
    //connectDb();
    app.use(express.json());
    app.get('/',(req,res)=>{
        return res.send("hii!!");
    })
    app.use('/upload',express.static(fullPath));
    app.use('/category',categoryRouter);
    app.use('/doctor',doctorRouter);
    app.use('/medicine',medicineRouter);
    app.use('/prescription',prescriptionRouter);
    app.use('/schedule',scheduleRouter);
    app.use('/search',searchRouter);
    app.use('*',(req,res)=>{
        return res.json({message:"page not found"});
    })

    app.use(globalErrorHandel);
    
}

export default initApp;