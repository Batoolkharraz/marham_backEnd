import usermodel from '../DB/Usermodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signin = async (req, res) => {
  const { username, password } = req.body;
let role;
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
      { id: user._id, isLoggedIn: true },
      'blogNode3123',
      { expiresIn: '1h' }
    );
    if(user.role == 'doctor')
  {
    role='doctor;'
    return res.json({ message:'success ', token ,role});
  }
  else if(user.role == 'user')
  {
    role='user';
    return res.json({ message:'success ', token,role });
  }
  else if(user.role=='admin')
  {
    role='admin';
    return res.json({ message:'success ', token,role });
  }
    
  } catch (err) { // Change 'error' to 'err' for consistency
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' }); // Fixed the typo in 'message'
    } else {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
};
