import usermodel from '../Authalaa/DB/Usermodel.js';
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