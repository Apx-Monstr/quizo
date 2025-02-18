import express, { Request, Response } from 'express';
import { readFile, writeFile } from '../filehandling/handler';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { v4 as uuidv4, v4 } from 'uuid';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const SECRET = process.env.JWT_SECRET as string;
const router = express.Router();

router.post("/signup",(req:Request, res:Response):any=>{
    console.log(req.body)
    const {fname, lname, email, passhash} = req.body;
    const users = readFile("users.json");
    if (users.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: "User already exists, Try logging in" });
    }
    const userid = v4();
    users.push({userid,email,fname, lname, passhash, quizes:[]});
    writeFile('users.json', users);
    const token = jwt.sign({ userid }, SECRET, { expiresIn: '7d' });
    res.json({
        message:`User ${fname} ${lname} Created`,
        userid, token
    })
})

router.post('/login', (req: Request, res: Response):any => {
    const { email, password } = req.body;
    const users = readFile('users.json');
    const user = users.find((u) => u.email === email);
    
    if (!user || password!== user.passhash) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ userid: user.userid }, SECRET, { expiresIn: '1d' });
    res.json({ token, user });
});

export default router;