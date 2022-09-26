import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import createError from 'http-errors';

export const sendError = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    next(new createError.NotFound());
};

export const errorHandler: ErrorRequestHandler = (
    error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(error.status || 500);
    res.send({
        error: {
            status: error.status || 500,
            message: error.message,
        },
    });
};
