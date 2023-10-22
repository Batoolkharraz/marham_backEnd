import usermodel from '../DB/Usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await usermodel.findOne({ username });

    if (!user) {
      // User not found
      return res.json(false);
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      // Password doesn't match
      return res.json(false);
    }

    // If both conditions are met, generate and return the token
    const token = jwt.sign(
      { id:user._id, isLoggedIn: true },
      'blogNode3123',
      { expiresIn: '1h' }
    );

    return res.json({ message: 'success', token });
  } catch (error) {
    console.error('Error during sign-in:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
