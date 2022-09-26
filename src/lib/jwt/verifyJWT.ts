import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import client from '../db/redisCon';
import { Response, NextFunction } from 'express';

export const verifyAccessToken = (
    req: any,
    res: Response,
    next: NextFunction
) => {
    if (!req.headers.authorization) return new createError.Unauthorized();

    //we split the headers to get the jwt from the bearer token
    const token = req.headers.authorization.split(' ')[1];
    const secret: any = process.env.SECRET_ACCESS_TOKEN;
    //we verify if the token is valid
    jwt.verify(token, secret, (err: any, payload: any) => {
        if (err) {
            const message =
                err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
            return next(new createError.Unauthorized(message));
        }
        req.payload = payload;
        //go the next middleware if the token passes
        next();
    });
};
export const verifyRefreshToken = (refreshToken: string) => {
    return new Promise((resolve, reject) => {
        const secret: any = process.env.SECRET_REFRESH_TOKEN;

        jwt.verify(refreshToken, secret, (err: any, payload: any) => {
            if (err) return reject(new createError.Unauthorized());
            const userId: string = payload.aud;
            client.GET(userId, (err: any, result: string) => {
                if (err) {
                    console.log(err);
                    reject(new createError.Unauthorized());
                    return;
                }
                if (refreshToken === result) {
                    resolve(userId);
                    return userId;
                }
                reject(new createError.Unauthorized());
            });
        });
    });
};
export const verifyResetPasswordToken = async (accessToken: string) => {
    try {
        //verify jwt token
        const token: any = process.env.SECRET_RESETPASSWORD_TOKEN;
        const payload: any = jwt.verify(accessToken, token);
        //get user id from payload
        const userId = payload.aud;
        if (!userId) {
            //throw error if user doesnt exist
            throw new createError.Unauthorized();
        } else {
            //if user exists return id
            return userId;
        }
    } catch (error) {
        throw new createError.Unauthorized();
    }
};
export default {
    verifyAccessToken,
    verifyRefreshToken,
    verifyResetPasswordToken,
};
