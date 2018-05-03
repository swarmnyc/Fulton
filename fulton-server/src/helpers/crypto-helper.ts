import * as crypto from 'crypto';

export function numberCodeGenerate(length: number = 6) {
    let max = (Math.pow(10, length) - 1)
    let code = Math.round(Math.random() * max)

    return code.toString().padStart(length, "0")
}

export function codeGenerate(length: number = 32) {
    return crypto.randomBytes(length).toString("hex")
}