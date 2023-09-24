import * as dotenv from 'dotenv';
dotenv.config()
import  express  from 'express';
import initApp from './src/module/app.router.js';
import connectDb from './DB/connection.js';
import  createInvoice  from './src/Services/pdf.js'

const app=express();
const port = process.env.PORT||3001;



initApp(app,express);
connectDb().then(()=>{
    app.listen(port);
})