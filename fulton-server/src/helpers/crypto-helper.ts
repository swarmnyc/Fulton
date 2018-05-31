import * as crypto from 'crypto';

export function numberCodeGenerate(length: number = 6) {
    let max = (Math.pow(10, length) - 1)
    let code = Math.round(Math.random() * max)

    return code.toString().padStart(length, "0")
}

export function codeGenerate(length: number = 32) {
    return crypto.randomBytes(length).toString("hex")
}

/**
* string, buffer comparison in length-constant time
* @see https://codahale.com/a-lesson-in-timing-attacks/
*
* @param {String} input - string coming from user.
* @param {String} secret - secret string to compare with `input`
* @return {Boolean} true if strings match
*/
export function timingSafeEqual (input: String, secret: String): boolean {
    const a = input.split('')
    const b = secret.split('')
    let same = (a.length === b.length) ? 1 : 0
    // only compare by the size of input, which wouldn't expose the length of secret.
    for (let i = 0; i < a.length; i++) {
        same *= ((a[i] === b[i]) ? 1 : 0)
    }
    return (same === 1)
}