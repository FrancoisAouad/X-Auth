import userModel from '../auth/auth.model';
import error from 'http-errors';
import { Request, Response, NextFunction } from 'express';
import globalService from '../utils/globalService';
const GlobalService = new globalService();

export const isEmailVerified = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        //get access token from headers
        const id = GlobalService.getUser(req.headers.authorization);
        const user = await userModel.findOne({ _id: id });
        if (!user) throw new error.Unauthorized('invalid email/pass');
        //give access if token is valid
        if (user.isVerified === false) {
            throw new error.Forbidden('Email not verified..');
        } else if (user.isVerified === true) {
            next();
        }
    } catch (e: any) {
        next(e);
    }
};
