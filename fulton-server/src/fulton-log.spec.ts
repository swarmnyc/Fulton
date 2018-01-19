import FultonLog from "./fulton-log";
import { WriteStream } from "fs";
import * as winston from "winston"

describe("FultonLogger", () => {
    let memory: winston.MemoryTransportInstance;

    beforeEach(() => {
        memory = new winston.transports.Memory();
        FultonLog.configure({
            level: "debug",
            transports: [memory]
        });
    });

    it("should do debug log on level debug", () => {
        FultonLog.debug("message");
        expect(memory.writeOutput.length).toEqual(0);
        expect(memory.errorOutput.length).toEqual(1);
        expect(memory.errorOutput[0] as string).toEqual("debug: message");
    });

    it("should do info log on level debug", () => {
        FultonLog.info("message");
        expect(memory.errorOutput.length).toEqual(0);
        expect(memory.writeOutput.length).toEqual(1);
        expect(memory.writeOutput[0] as string).toEqual("info: message");
    });

    it("should do error log on level debug", () => {
        FultonLog.error("message");
        expect(memory.writeOutput.length).toEqual(0);
        expect(memory.errorOutput.length).toEqual(1);
        expect(memory.errorOutput[0] as string).toEqual("error: message");
    });

    it("should not do info log on level error", () => {
        FultonLog.level = "error";
        FultonLog.info("message");

        expect(memory.writeOutput.length).toEqual(0);
        expect(memory.errorOutput.length).toEqual(0);
    })

    it("should add a new logger", () => {
        let memory2 = new (winston.transports.Memory)({ level: "debug" });
        let logger = FultonLog.addLogger("test", {
            transports: [memory2]
        });

        logger.info("message");

        expect(memory.writeOutput.length).toEqual(0);
        expect(memory.errorOutput.length).toEqual(0);

        expect(memory2.errorOutput.length).toEqual(0);
        expect(memory2.writeOutput.length).toEqual(1);
        expect(memory2.writeOutput[0] as string).toEqual("info: message");

    })

    it("should get an existing logger", () => {
        let memory2 = new (winston.transports.Memory)({ level: "debug" });
        FultonLog.addLogger("test2", {
            transports: [memory2]
        });

        let logger = FultonLog.getLogger("test2");

        logger.info("message");

        expect(memory.writeOutput.length).toEqual(0);
        expect(memory.errorOutput.length).toEqual(0);

        expect(memory2.errorOutput.length).toEqual(0);
        expect(memory2.writeOutput.length).toEqual(1);
        expect(memory2.writeOutput[0] as string).toEqual("info: message");

    })

    it("should create a new logger", () => {
        let memory2 = new (winston.transports.Memory)({ level: "debug" });
        let logger = FultonLog.createLogger({
            transports: [memory2]
        });

        logger.info("message");

        expect(memory.writeOutput.length).toEqual(0);
        expect(memory.errorOutput.length).toEqual(0);

        expect(memory2.errorOutput.length).toEqual(0);
        expect(memory2.writeOutput.length).toEqual(1);
        expect(memory2.writeOutput[0] as string).toEqual("info: message");

    })
});