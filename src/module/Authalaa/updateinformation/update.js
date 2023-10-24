import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../DB/Usermodel.js';

export const upinfo = async (req, res) => {
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
        const user = await userModel.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update user data based on the request
        if (req.body.username) {
            user.username = req.body.username;
        }
        if (req.body.email) {
            user.email = req.body.email;
        }
        if (req.body.phone) {
            user.phone = req.body.phone;
        }
        if (req.body.password) {
            const { password } = req.body;
            let hashvalue = await bcrypt.hash(password, 8);
            user.password = hashvalue;
        }

        // Save the user to update the document
        const result = await user.save();

        if (result) {
            return res.json({ message: "User information updated successfully." });
        } else {
            return res.status(500).json({ message: 'Failed to update user information.' });
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else {
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};
