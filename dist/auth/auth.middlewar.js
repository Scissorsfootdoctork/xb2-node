"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accessControl = exports.authGuard = exports.validateLoginDate = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userService = __importStar(require("../user/user.service"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../app/app.config");
const auth_service_1 = require("./auth.service");
const validateLoginDate = async (request, response, next) => {
    console.log('👮‍ 验证登录数据');
    const { name, password } = request.body;
    if (!name)
        return next(new Error('NAME_IS_REQUIRED'));
    if (!password)
        return next(new Error('PASSWORD_IS_REQUIRED'));
    const user = await userService.getUsersByName(name, { password: true });
    if (!user)
        return next(new Error('USER_DOES_NOT_EXIT'));
    const matched = await bcrypt_1.default.compare(password, user.password);
    if (!matched)
        return next(new Error('PASSWORD_DOES_NOT_MATCH'));
    request.body.user = user;
    next();
};
exports.validateLoginDate = validateLoginDate;
const authGuard = (request, response, next) => {
    console.log('👮‍ 验证用户身份');
    try {
        const authorization = request.header('Authorization');
        if (!authorization)
            throw new Error();
        const token = authorization.replace('Bearer ', '');
        if (!token)
            throw new Error();
        const decoded = jsonwebtoken_1.default.verify(token, app_config_1.PUBLIC_KEY, { algorithms: ['RS256'] });
        request.user = decoded;
        next();
    }
    catch (e) {
        next(new Error('UNAUTHORIZED'));
    }
};
exports.authGuard = authGuard;
const accessControl = (options) => {
    return async (request, response, next) => {
        const { possession } = options;
        const { id: userId } = request.user;
        if (userId === 1)
            return next();
        const resourceIdParam = Object.keys(request.params)[0];
        const resourceType = resourceIdParam.replace('Id', '');
        const resourceId = parseInt(request.params[resourceIdParam], 10);
        if (possession) {
            try {
                const ownResource = await (0, auth_service_1.possess)({ resourceType, resourceId, userId });
                if (!ownResource) {
                    return next(new Error('USER_DOES_NOT_OWN_RESOURCE'));
                }
                next();
            }
            catch (e) {
                next(e);
            }
        }
    };
};
exports.accessControl = accessControl;
//# sourceMappingURL=auth.middlewar.js.map