import usermodel from '../Authalaa/DB/Usermodel.js';
import jwt from 'jsonwebtoken';

export const sent = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await usermodel.findOne({ email: email });
        return res.json(user._id);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getUser = async (req, res) => {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith('Alaa__')) {
        return res.status(401).json({ message: "Authorization is required" });
    }

    const token = authorization.split('Alaa__')[1];

    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }

    try {
        const decode = jwt.verify(token, 'blogNode3123');
        const id = decode.id;
        const user = await usermodel.findOne({ _id:id });
        return res.json(user);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: error });
    }
}