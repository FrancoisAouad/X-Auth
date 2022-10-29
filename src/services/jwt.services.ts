import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { Response, NextFunction } from 'express';
// import client from '../db/redisCon';

export const setAccessToken = (userId: string) => {
    //access token body
    const payload = {};
    // const secret: any = process.env.SECRET_ACCESS_TOKEN;
    const options = {
        expiresIn: `${process.env.ACCESS_TOKEN_EXPIRY_DATE}`,
        issuer: `${process.env.ACCESS_TOKEN_ISSUER}`,
        audience: userId,
    };
    //we sign and create the token and return its value
    const token = jwt.sign(
        payload,
        `${process.env.SECRET_ACCESS_TOKEN}`,
        options
    );
    return token;
};
export const setRefreshToken = (userId: string) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        // const secret: any = process.env.SECRET_REFRESH_TOKEN;
        const options = {
            expiresIn: `${process.env.REFRESH_TOKEN_EXPIRY_DATE}`,
            issuer: `${process.env.REFRESH_TOKEN_ISSUER}`,
            audience: userId,
        };
        jwt.sign(
            payload,
            `${process.env.SECRET_REFRESH_TOKEN}`,
            options,
            (error, token) => {
                if (error) {
                    console.log(error);
                }
                client.SET(
                    userId,
                    token,
                    'EX',
                    365 * 24 * 60 * 60,
                    (err: any, reply: any) => {
                        if (err) {
                            console.log(err);
                        }
                        resolve(token);
                    }
                );
            }
        );
    });
};
export const setResetPasswordToken = async (userId: string) => {
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
        const token = jwt.sign(
            payload,
            `${process.env.SECRET_RESETPASSWORD_TOKEN}`,
            options
        );
        //we return its value
        return token;
    } catch (error: any) {
        return new createError.InternalServerError(error);
    }
};

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
