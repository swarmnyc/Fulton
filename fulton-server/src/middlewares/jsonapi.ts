import { Request, Response, NextFunction } from "../index";
let JSONAPISerializer = require('jsonapi-serializer');

var deserializer = new (JSONAPISerializer.Deserializer)();


export async function jsonapi(req: Request, res: Response, next: NextFunction) {
    if (req.get("content-type") == "application/vnd.api+json" && req.body) {
        // change body
        let data = await deserializer.deserialize(req.body);
        (req as any)["rawBody"] = req.body;

        req.body = {
            data: data
        }
    }

    next();
}

function jsonapiSend(oldSend: any) {
    return (body?: any) => {
        let newBody = body;
        // serserializer
        oldSend(newBody);
    }
}