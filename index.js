// import * as dotenv from 'dotenv';
// dotenv.config()
import  express  from 'express';
import initApp from './src/module/app.router.js';
import connectDb from './DB/connection.js';
// import  createInvoice  from './src/Services/pdf.js';
import connectDBUser from './src/module/Authalaa/DB/connectionuser.js';
import signuprouter from './src/module/auth/auth.router.js';
import signinsrouter from './src/module/Authalaa/signin/sroute.js';
import sentrouter from './src/module/SentEmail/sentcode.js';

const app=express();

// const port = process.env.PORT||3001;
connectDBUser();
app.use(express.json());
app.use('/signup',signuprouter);
app.use('/signin',signinsrouter);
app.use('/updatePassword',sentrouter);

initApp(app,express);
app.listen(3001, () => {
    console.log('Server is running on port 3001');
  });