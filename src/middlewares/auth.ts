import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request {
    user?: { userid: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');
    if (!token) {
        res.status(401).json({ error: "Access denied" });
        return;
    }

    jwt.verify(token, SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
        console.log('Decoded token:', user);
        req.user = user as { userid: string };
        console.log('Assigned req.user:', req.user);
        next();
    });
};
