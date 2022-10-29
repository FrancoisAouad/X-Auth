import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASS,
    },
});

export const sendMail = (mailOptions: any) => {
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error.message);
        }
    });
};

export const getUser = (authHeader: any) => {
    const secret: any = process.env.SECRET_ACCESS_TOKEN;
    //split auth header to get bearer token
    const token = authHeader.split(' ')[1];
    //verify the token and decoded it using
    const decoded: any = jwt.verify(token, secret);
    //get the id field from the decoded token
    const id = decoded.aud;
    //return the id value
    return id;
};
