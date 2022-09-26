"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_services_1 = __importDefault(require("./auth/auth.services"));
const configJWT_1 = __importDefault(require("./lib/jwt/configJWT"));
const verifyJWT_1 = __importDefault(require("./lib/jwt/verifyJWT"));
exports.default = { authService: auth_services_1.default, setTokens: configJWT_1.default, verifyTokens: verifyJWT_1.default };
