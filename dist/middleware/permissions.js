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
exports.isEmailVerified = void 0;
const auth_model_1 = __importDefault(require("../auth/auth.model"));
const http_errors_1 = __importDefault(require("http-errors"));
const globalService_1 = __importDefault(require("../utils/globalService"));
const GlobalService = new globalService_1.default();
const isEmailVerified = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //get access token from headers
        const id = GlobalService.getUser(req.headers.authorization);
        const user = yield auth_model_1.default.findOne({ _id: id });
        if (!user)
            throw new http_errors_1.default.Unauthorized('invalid email/pass');
        //give access if token is valid
        if (user.isVerified === false) {
            throw new http_errors_1.default.Forbidden('Email not verified..');
        }
        else if (user.isVerified === true) {
            next();
        }
    }
    catch (e) {
        next(e);
    }
});
exports.isEmailVerified = isEmailVerified;
