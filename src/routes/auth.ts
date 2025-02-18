import express, { Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();
const SECRET = process.env.JWT_SECRET as string;
const router = express.Router();

router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  try {
    const { fname, lname, email, passhash } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists, Try logging in" });
    }
    
    const userid = uuidv4();
    
    // Create new user
    const newUser = new User({
      userid,
      email,
      fname,
      lname,
      passhash,
      quizes: []
    });
    
    await newUser.save();
    
    const token = jwt.sign({ userid }, SECRET, { expiresIn: '7d' });
    res.json({
      message: `User ${fname} ${lname} Created`,
      userid,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user || password !== user.passhash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ userid: user.userid }, SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;