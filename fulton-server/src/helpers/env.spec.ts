import Env from "./env";

describe('env', () => {
    let env = process.env;

    it('should load string', async () => {
        expect(Env.get("test.none", "default")).toEqual("default");
        expect(Env.get("test.none")).toBeUndefined();

        env["test.value1"] = "value1"
        env["test.value1value"] = "value1value"

        expect(Env.get("test.value", "default")).toEqual("default");
        expect(Env.get("test.value1")).toEqual("value1");
        expect(Env.get("test.VALUE1", undefined)).toEqual("value1");

        expect(Env.get("test.VALUE1value", undefined)).toEqual("value1value");
    });

    it('should load boolean', async () => {
        env["test.value2-1"] = "true"
        env["test.value2-2"] = "1"
        env["test.value2-3"] = "0"
        env["test.value2-4"] = "abc"

        expect(Env.getBoolean("test.none")).toBeUndefined();

        expect(Env.getBoolean("test.value2-1")).toBeTruthy();
        expect(Env.getBoolean("test.Value2-1", false)).toBeTruthy();

        expect(Env.getBoolean("test.value2-2")).toBeTruthy();

        expect(Env.getBoolean("test.value2-3")).toBeFalsy();

        expect(Env.getBoolean("test.value2-4")).toBeFalsy();
        expect(Env.getBoolean("test.Value2-4", true)).toBeFalsy();
    });

    it('should load int', async () => {
        env["test.value3-1"] = "100.0"
        env["test.value3-2"] = "100"
        env["test.value3-3"] = "abc"

        expect(Env.getInt("test.none")).toBeUndefined();
        expect(Env.getInt("test.none", 200)).toEqual(200);

        expect(Env.getInt("test.value3-1")).toEqual(100);
        expect(Env.getInt("test.Value3-1", 500)).toEqual(100);

        expect(Env.getInt("test.value3-2")).toEqual(100);

        expect(Env.getInt("test.value3-3")).toBeUndefined();
        expect(Env.getInt("test.value3-3", NaN)).toEqual(NaN);
        expect(Env.getInt("test.value3-3", 100)).toEqual(100);
    });

    it('should load flaot', async () => {
        env["test.value4-1"] = "100.1"
        env["test.value4-2"] = "100"
        env["test.value4-3"] = "abc"

        expect(Env.getFloat("test.none")).toBeUndefined();
        expect(Env.getFloat("test.none", 200.5)).toEqual(200.5);

        expect(Env.getFloat("test.value4-1")).toEqual(100.1);
        expect(Env.getFloat("test.Value4-1", 500)).toEqual(100.1);

        expect(Env.getFloat("test.value4-2")).toEqual(100.0);

        expect(Env.getFloat("test.value4-3")).toBeUndefined();        
        expect(Env.getFloat("test.value4-3", NaN)).toEqual(NaN);
        expect(Env.getFloat("test.value4-3", 100)).toEqual(100);
    });
});