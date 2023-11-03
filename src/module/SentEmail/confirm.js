import usermodel from '../Authalaa/DB/Usermodel.js';
import bcrypt from 'bcrypt';
import { sendEmail } from './sentmail.js';
let sharedEmail = ''; // Shared variable to store the email

export const sentmail = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await usermodel.findOne({ email: email });
        
        if (user) {
            sharedEmail = email; // Store the email in the shared variable

            console.log(sharedEmail);
            const random = Math.floor(Math.random() * 9000 + 1000);
            res.json(random);
            sendEmail(email, random);
        } else {
            return ("false");
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updatepass = async (req, res) => {
    console.log("up:"+sharedEmail);
    const { password } = req.body;
        const hashpass = await bcrypt.hash(password, 8);
        const result = await usermodel.updateOne({ email: sharedEmail }, { $set: { password: hashpass } });

        if (result.modifiedCount > 0) {
            return res.json({ message: "Password updated successfully." });
        } else {
            return res.status(404).json({ message: "User not found." });
        }
    
    }
