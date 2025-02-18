"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET = process.env.JWT_SECRET;
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        res.status(401).json({ error: "Access denied" });
        return;
    }
    jsonwebtoken_1.default.verify(token, SECRET, (err, user) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
            return;
        }
        console.log('Decoded token:', user);
        req.user = user;
        console.log('Assigned req.user:', req.user);
        next();
    });
};
exports.authenticateToken = authenticateToken;
