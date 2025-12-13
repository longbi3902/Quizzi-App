"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Script để generate password hash cho fake users
// Chạy: npx ts-node scripts/generate-password-hash.ts
const password = '123456';
bcryptjs_1.default.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Password:', password);
    console.log('Hash:', hash);
});
