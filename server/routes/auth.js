"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const handler_1 = require("../filehandling/handler");
const uuid_1 = require("uuid");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SECRET = process.env.JWT_SECRET;
const router = express_1.default.Router();
router.post("/signup", (req, res) => {
    console.log(req.body);
    const { fname, lname, email, passhash } = req.body;
    const users = (0, handler_1.readFile)("users.json");
    if (users.find((u) => u.email === email)) {
        return res.status(400).json({ error: "User already exists, Try logging in" });
    }
    const userid = (0, uuid_1.v4)();
    users.push({ userid, email, fname, lname, passhash, quizes: [] });
    (0, handler_1.writeFile)('users.json', users);
    const token = jsonwebtoken_1.default.sign({ userid }, SECRET, { expiresIn: '7d' });
    res.json({
        message: `User ${fname} ${lname} Created`,
        userid, token
    });
});
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const users = (0, handler_1.readFile)('users.json');
    const user = users.find((u) => u.email === email);
    if (!user || password !== user.passhash) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jsonwebtoken_1.default.sign({ userid: user.userid }, SECRET, { expiresIn: '1d' });
    res.json({ token, user });
});
exports.default = router;
