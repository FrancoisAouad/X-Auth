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
exports.verifyResetPasswordToken = exports.verifyRefreshToken = exports.verifyAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_errors_1 = __importDefault(require("http-errors"));
const redisCon_1 = __importDefault(require("../db/redisCon"));
const verifyAccessToken = (req, res, next) => {
    if (!req.headers.authorization)
        return new http_errors_1.default.Unauthorized();
    //we split the headers to get the jwt from the bearer token
    const token = req.headers.authorization.split(' ')[1];
    const secret = process.env.SECRET_ACCESS_TOKEN;
    //we verify if the token is valid
    jsonwebtoken_1.default.verify(token, secret, (err, payload) => {
        if (err) {
            const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return next(new http_errors_1.default.Unauthorized(message));
        }
        req.payload = payload;
        //go the next middleware if the token passes
        next();
    });
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        const secret = process.env.SECRET_REFRESH_TOKEN;
        jsonwebtoken_1.default.verify(refreshToken, secret, (err, payload) => {
            if (err)
                return reject(new http_errors_1.default.Unauthorized());
            const userId = payload.aud;
            redisCon_1.default.GET(userId, (err, result) => {
                if (err) {
                    console.log(err);
                    reject(new http_errors_1.default.Unauthorized());
                    return;
                }
                if (refreshToken === result) {
                    resolve(userId);
                    return userId;
                }
                reject(new http_errors_1.default.Unauthorized());
            });
        });
    });
};
exports.verifyRefreshToken = verifyRefreshToken;
const verifyResetPasswordToken = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //verify jwt token
        const token = process.env.SECRET_RESETPASSWORD_TOKEN;
        const payload = jsonwebtoken_1.default.verify(accessToken, token);
        //get user id from payload
        const userId = payload.aud;
        if (!userId) {
            //throw error if user doesnt exist
            throw new http_errors_1.default.Unauthorized();
        }
        else {
            //if user exists return id
            return userId;
        }
    }
    catch (error) {
        throw new http_errors_1.default.Unauthorized();
    }
});
exports.verifyResetPasswordToken = verifyResetPasswordToken;
exports.default = {
    verifyAccessToken: exports.verifyAccessToken,
    verifyRefreshToken: exports.verifyRefreshToken,
    verifyResetPasswordToken: exports.verifyResetPasswordToken,
};
