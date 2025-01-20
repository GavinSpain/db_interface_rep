"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.logger = {
    error: (message, error) => {
        console.error(chalk_1.default.red(`[ERROR] ${message}`), error);
    },
    warn: (message, data) => {
        console.log(chalk_1.default.yellow(`[WARN] ${message}`), data ? data : '');
    },
    info: (message, data) => {
        console.log(chalk_1.default.blue(`[INFO] ${message}`), data ? data : '');
    },
    debug: (message, data) => {
        console.log(chalk_1.default.gray(`[DEBUG] ${message}`), data ? data : '');
    },
    success: (message, data) => {
        console.log(chalk_1.default.green(`[SUCCESS] ${message}`), data ? data : '');
    },
    request: (req) => {
        console.log(chalk_1.default.yellow('\n=== Incoming Request ==='));
        console.log(chalk_1.default.yellow('Timestamp:'), new Date().toISOString());
        console.log(chalk_1.default.yellow('Method:'), req.method);
        console.log(chalk_1.default.yellow('URL:'), req.url);
        console.log(chalk_1.default.yellow('Protocol:'), req.protocol);
        console.log(chalk_1.default.yellow('SSL/TLS:'), req.secure ? 'Yes' : 'No');
        console.log(chalk_1.default.yellow('Headers:'), JSON.stringify(req.headers, null, 2));
        if (req.body && Object.keys(req.body).length > 0) {
            console.log(chalk_1.default.yellow('Body:'), JSON.stringify(req.body, null, 2));
        }
    },
    response: (res, body) => {
        console.log(chalk_1.default.cyan('\n=== Outgoing Response ==='));
        console.log(chalk_1.default.cyan('Timestamp:'), new Date().toISOString());
        console.log(chalk_1.default.cyan('Status:'), res.statusCode);
        console.log(chalk_1.default.cyan('Headers:'), JSON.stringify(res.getHeaders(), null, 2));
        console.log(chalk_1.default.cyan('Body:'), JSON.stringify(body, null, 2));
    }
};
