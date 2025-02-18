"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFile = exports.readFile = void 0;
const fs_1 = __importDefault(require("fs"));
const readFile = (file) => JSON.parse(fs_1.default.readFileSync(`./data/${file}`, 'utf-8'));
exports.readFile = readFile;
const writeFile = (file, data) => fs_1.default.writeFileSync(`./data/${file}`, JSON.stringify(data, null, 2));
exports.writeFile = writeFile;
