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
exports.setResetPasswordToken = exports.setRefreshToken = exports.setAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const redisCon_1 = __importDefault(require("../db/redisCon"));
const setAccessToken = (userId) => {
    //access token body
    const payload = {};
    // const secret: any = process.env.SECRET_ACCESS_TOKEN;
    const options = {
        expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY_DATE}`,
        issuer: `${process.env.ACCESS_TOKEN_ISSUER}`,
        audience: userId,
    };
    //we sign and create the token and return its value
    const token = jsonwebtoken_1.default.sign(payload, `${process.env.SECRET_ACCESS_TOKEN}`, options);
    return token;
};
exports.setAccessToken = setAccessToken;
const setRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        // const secret: any = process.env.SECRET_REFRESH_TOKEN;
        const options = {
            expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY_DATE}`,
            issuer: `${process.env.REFRESH_TOKEN_ISSUER}`,
            audience: userId,
        };
        jsonwebtoken_1.default.sign(payload, `${process.env.SECRET_REFRESH_TOKEN}`, options, (error, token) => {
            if (error) {
                console.log(error);
            }
            redisCon_1.default.SET(userId, token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
                if (err) {
                    console.log(err);
                }
                resolve(token);
            });
        });
    });
};
exports.setRefreshToken = setRefreshToken;
const setResetPasswordToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //reset password token body and payload
        const payload = {};
        // const secret: any = process.env.SECRET_RESETPASSWORD_TOKEN;
        const options = {
            expiresIn: `${process.env.RESETPASSWORD_TOKEN_EXPIRY_DATE}`,
            issuer: `${process.env.RESETPASSWORD_TOKEN_ISSUER}`,
            audience: userId,
        };
        //we sign the token
        const token = jsonwebtoken_1.default.sign(payload, `${process.env.SECRET_RESETPASSWORD_TOKEN}`, options);
        //we return its value
        return token;
    }
    catch (error) {
        return new http_errors_1.default.InternalServerError(error);
    }
});
exports.setResetPasswordToken = setResetPasswordToken;
exports.default = {
    setAccessToken: exports.setAccessToken,
    setResetPasswordToken: exports.setResetPasswordToken,
    setRefreshToken: exports.setRefreshToken,
};
