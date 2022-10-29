"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = exports.isValidPassword = exports.verifyEmail = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refreshToken = exports.login = exports.signup = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const globalService_1 = require("../utils/globalService");
const jwt_services_1 = require("./jwt.services");
const signup = (body, header) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield userModel.findOne({ email: body.email });
    if (exists)
        throw new http_errors_1.default.Conflict(`${body.email} has already been registered.`);
    //generate  a base 64 data string to be used to verify user acc
    const verificationToken = crypto_js_1.default.lib.WordArray.random(64).toString();
    //invoke hash pass method to return the encrypted pass
    const hashedPassword = yield (0, exports.hashPassword)(body.password);
    //create user
    const addedUser = yield userModel.create({
        fullname: body.fullname,
        username: body.username,
        email: body.email,
        emailToken: verificationToken,
        password: hashedPassword,
    });
    //create accesss and refresh tokens
    const accessToken = (0, jwt_services_1.setAccessToken)(addedUser._id.toString());
    const refreshToken = yield (0, jwt_services_1.setRefreshToken)(addedUser._id.toString());
    //send registartion email
    (0, globalService_1.sendMail)({
        from: process.env.NODEMAILER_USER,
        to: body.email,
        subject: 'Email Verification',
        html: `<h2> Welcome, ${body.fullname}!</h2>
          <br/>
              <p>Thank you for registering, you are almost done. Please read the below message to continue.</p>
              <br/>
             <p>In order to confirm your email, kindly click the verification link below.</p>
              <br/>
            <a href="http://${header.host}/api/v1/auth/verify?token=${verificationToken}">Click here to verify</a>`,
    });
    //return object containing both tokens
    return { accessToken, refreshToken };
});
exports.signup = signup;
const login = (body) => __awaiter(void 0, void 0, void 0, function* () {
    //check if user exists in db
    const user = yield userModel.findOne({ email: body.email });
    if (!user)
        throw new http_errors_1.default.NotFound('Incorrect email/pass');
    //check if hashed password matches with user input
    const isMatch = yield (0, exports.isValidPassword)(body.password, user.password);
    //throw error if pass doesnt match
    if (isMatch === false)
        throw new http_errors_1.default.Unauthorized('Incorrect email/pass');
    //set tokens to be sent to client side
    const accessToken = (0, jwt_services_1.setAccessToken)(user._id.toString());
    const refreshToken = yield (0, jwt_services_1.setRefreshToken)(user._id.toString());
    return { accessToken, refreshToken };
});
exports.login = login;
const refreshToken = (body) => __awaiter(void 0, void 0, void 0, function* () {
    if (!body)
        throw new http_errors_1.default.BadRequest('Bad Request');
    //verify refresh token
    const userId = yield (0, jwt_services_1.verifyRefreshToken)(body);
    //set new access token
    const accessToken = (0, jwt_services_1.setAccessToken)(userId);
    //set new refresh token
    const refToken = yield (0, jwt_services_1.setRefreshToken)(userId);
    //send tokens to client side
    return { accessToken: accessToken, refreshToken: refToken };
});
exports.refreshToken = refreshToken;
const logout = (body) => __awaiter(void 0, void 0, void 0, function* () {
    //check refresh token
    const { refreshToken } = body;
    //return error if not found
    if (!refreshToken)
        throw new http_errors_1.default.BadRequest('Bad Request');
    //verify the refresh token if found
    const userId = yield (0, jwt_services_1.verifyRefreshToken)(refreshToken);
    //delete refresh token to logout
    client.DEL(userId, (err, val) => {
        if (err)
            throw new http_errors_1.default.Unauthorized('Unauthorizeed');
    });
    return true;
});
exports.logout = logout;
const forgotPassword = (header) => __awaiter(void 0, void 0, void 0, function* () {
    //get logged in user
    const id = (0, globalService_1.getUser)(header.authorization);
    //check if user exists
    const user = yield userModel.findOne({ _id: id });
    //return error if user not found
    if (!user)
        throw new http_errors_1.default.Unauthorized('unauthorized');
    //create unique token valid for 10min to verify email
    const passwordToken = yield (0, jwt_services_1.setResetPasswordToken)(user.id);
    (0, globalService_1.sendMail)({
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
});
exports.forgotPassword = forgotPassword;
const resetPassword = (params, body, header) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = params;
    //validate new pass
    //get user id
    const id = (0, globalService_1.getUser)(header);
    //check if user found
    const user = yield userModel.findOne({ _id: id });
    if (!user)
        throw new http_errors_1.default.NotFound('user not found..');
    //verify that the password token is valid
    //salt and hash new password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(body.password, salt);
    //replace the old password with the new one
    user.password = hashedPassword;
    //update password in database
    return yield user.save();
});
exports.resetPassword = resetPassword;
const verifyEmail = (query) => __awaiter(void 0, void 0, void 0, function* () {
    //check mongodb for token for this specific user
    const token = query.token;
    const user = yield userModel.findOne({ emailToken: token });
    if (!user)
        throw new http_errors_1.default.Unauthorized('unauthorized');
    //replace these values to show that a user is verified
    user.emailToken = 'null';
    user.isVerified = true;
    return yield user.save();
});
exports.verifyEmail = verifyEmail;
const isValidPassword = (password, hash) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcryptjs_1.default.compare(password, hash);
});
exports.isValidPassword = isValidPassword;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    //add salt and encrypt password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    //return the hashed password
    return hashedPassword;
});
exports.hashPassword = hashPassword;
