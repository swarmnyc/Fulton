import { timingSafeEqual } from "./crypto-helper";

describe('Crypto helper', () => {
    it('should do timingSafeEqual with different strings', async () => {
        let input = "_abcdefghijk";
        let secret = "abcdefghijk";
        let result = timingSafeEqual(input, secret);
        expect(result).toBeFalsy;
    });

    it('should do timingSafeEqual with same strings', async () => {
        let input = "abcdefghijk";
        let secret = "abcdefghijk";
        let result = timingSafeEqual(input, secret);
        expect(result).toBeTruthy;
    });
});