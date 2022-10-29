"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.sendMail = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});
const sendMail = (mailOptions) => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error.message);
        }
    });
};
exports.sendMail = sendMail;
const getUser = (authHeader) => {
    const secret = process.env.SECRET_ACCESS_TOKEN;
    //split auth header to get bearer token
    const token = authHeader.split(' ')[1];
    //verify the token and decoded it using
    const decoded = jsonwebtoken_1.default.verify(token, secret);
    //get the id field from the decoded token
    const id = decoded.aud;
    //return the id value
    return id;
};
exports.getUser = getUser;
