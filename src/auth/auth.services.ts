import userModel from './auth.model';
import error from 'http-errors';
import client from '../lib/db/redisCon';
import globalService from '../utils/globalService';
import bcrypt from 'bcryptjs';
import crypto from 'crypto-js';
import sendMail from '../utils/mailer';
import configJWT from '../lib/jwt/configJWT';
import verifyJWT from '../lib/jwt/verifyJWT';
const GlobalService = new globalService();

export const signup = async (body: any, header: any) => {
    const exists = await userModel.findOne({ email: body.email });
    if (exists)
        throw new error.Conflict(`${body.email} has already been registered.`);
    //generate  a base 64 data string to be used to verify user acc
    const verificationToken = crypto.lib.WordArray.random(64).toString();

    //invoke hash pass method to return the encrypted pass
    const hashedPassword = await hashPassword(body.password);
    //create user
    const addedUser = await userModel.create({
        fullname: body.fullname,
        username: body.username,
        email: body.email,
        emailToken: verificationToken,
        password: hashedPassword,
    });
    //create accesss and refresh tokens
    const accessToken = configJWT.setAccessToken(addedUser._id.toString());
    const refreshToken = await configJWT.setRefreshToken(
        addedUser._id.toString()
    );
    //send registartion email
    sendMail({
        from: process.env.NODEMAILER_USER,
        to: body.email,
        subject: 'Email Verification',
        html: `<h2> Welcome, ${body.name}!</h2>
          <br/>
              <p>Thank you for registering, you are almost done. Please read the below message to continue.</p>
              <br/>
             <p>In order to confirm your email, kindly click the verification link below.</p>
              <br/>
            <a href="http://${header.host}/api/v1/auth/verify?token=${verificationToken}">Click here to verify</a>`,
    });
    //return object containing both tokens
    return { accessToken, refreshToken };
};
export const login = async (body: any) => {
    //check if user exists in db
    const user = await userModel.findOne({ email: body.email });
    if (!user) throw new error.NotFound('Incorrect email/pass');
    //check if hashed password matches with user input
    const isMatch = await isValidPassword(body.password, user.password);
    //throw error if pass doesnt match
    if (isMatch === false) throw new error.Unauthorized('Incorrect email/pass');
    //set tokens to be sent to client side
    const accessToken = configJWT.setAccessToken(user._id.toString());
    const refreshToken = await configJWT.setRefreshToken(user._id.toString());

    return { accessToken, refreshToken };
};
export const refreshToken = async (body: any) => {
    if (!body) throw new error.BadRequest('Bad Request');
    //verify refresh token
    const userId: any = await verifyJWT.verifyRefreshToken(body);
    //set new access token
    const accessToken = configJWT.setAccessToken(userId);
    //set new refresh token
    const refToken = await configJWT.setRefreshToken(userId);
    //send tokens to client side
    return { accessToken: accessToken, refreshToken: refToken };
};
export const logout = async (body: any) => {
    //check refresh token
    const { refreshToken } = body;
    //return error if not found
    if (!refreshToken) throw new error.BadRequest('Bad Request');
    //verify the refresh token if found
    const userId = await verifyJWT.verifyRefreshToken(refreshToken);
    //delete refresh token to logout
    client.DEL(userId, (err: any, val: any) => {
        if (err) throw new error.Unauthorized('Unauthorizeed');
    });
    return true;
};
export const forgotPassword = async (header: any) => {
    //get logged in user
    const id = GlobalService.getUser(header.authorization);
    //check if user exists
    const user: any = await userModel.findOne({ _id: id });
    //return error if user not found
    if (!user) throw new error.Unauthorized('unauthorized');
    //create unique token valid for 10min to verify email
    const passwordToken = await configJWT.setResetPasswordToken(user.id);

    sendMail({
        from: process.env.NODEMAILER_USER,
        to: user.email,
        subject: 'Reset Password',
        html: `<h2> Dear, ${user.name}.</h2>
        <br/>
            <p>Your reset password link is available below.</p>
            <br/>
            <a href="http://${header.host}/api/v1/auth/resetPassword/${passwordToken}">Reset</a>`,
    });

    //send message that email was sent
    return user;
};
export const resetPassword = async (params: any, body: any, header: any) => {
    const { token } = params;
    //validate new pass
    //get user id
    const id = GlobalService.getUser(header);
    //check if user found
    const user = await userModel.findOne({ _id: id });
    if (!user) throw new error.NotFound('user not found..');
    //verify that the password token is valid
    //salt and hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    //replace the old password with the new one
    user.password = hashedPassword;
    //update password in database
    return await user.save();
};
export const verifyEmail = async (query: any) => {
    //check mongodb for token for this specific user
    const token = query.token;
    const user = await userModel.findOne({ emailToken: token });

    if (!user) throw new error.Unauthorized('unauthorized');
    //replace these values to show that a user is verified
    user.emailToken = 'null';
    user.isVerified = true;

    return await user.save();
};
export const isValidPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
export const hashPassword = async (password: string) => {
    //add salt and encrypt password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //return the hashed password
    return hashedPassword;
};
export default {
    login,
    signup,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    isValidPassword,
    hashPassword,
};
