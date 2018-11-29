import { AwsClient, AwsRequestOptions } from "./aws-client";
import { Helper } from "./helper";

// reference: https://docs.aws.amazon.com/general/latest/gr/signature-v4-test-suite.html

class AWSTestClient extends AwsClient {
    constructor() {
        super({
            accessKey: "AKIDEXAMPLE",
            secretKey: "wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY"
        })
    }

    generateDateTimestamp(): string {
        return "20150830"
    }

    generateDateTimeTimestamp(): string {
        return "20150830T123600Z"
    }
}

describe('AwsClient', () => {
    it('should generate right canonical and string to sign', () => {
        let client = new AWSTestClient();
        let canonical = client["generateCanonical"]({
            method: "GET",
            path: "/",
            service: "service",
            host: "example.amazonaws.com",
            query: {
                "Param2": "value2",
                "Param1": "value1"
            },
            headers: {
                "Host": "example.amazonaws.com",
                "X-Amz-Date": "20150830T123600Z"
            }
        })

        expect(canonical.canonical).toEqual(`GET\n/\nParam1=value1&Param2=value2\nhost:example.amazonaws.com\nx-amz-date:20150830T123600Z\n\nhost;x-amz-date\ne3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`)

        let hashedCanonical = Helper.hash(canonical.canonical).toString("hex")

        expect(hashedCanonical).toEqual("816cd5b414d056048ba4f7c5386d6e0533120fb1fcfa93762cf0fc39e2cf19e0")

        let scope = `${client["generateDateTimestamp"]()}/us-east-1/service/aws4_request`;

        let stringToString = client["generateStringToSign"](client["generateDateTimeTimestamp"](), scope, hashedCanonical)

        expect(stringToString).toEqual("AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/service/aws4_request\n816cd5b414d056048ba4f7c5386d6e0533120fb1fcfa93762cf0fc39e2cf19e0")
    });

    it('should generate right signature', () => {
        let client = new AWSTestClient();

        let salt = client["generateSignatureSalt"](client.generateDateTimestamp(), "us-east-1", "iam")
        expect(salt.toString("hex")).toEqual("c4afb1cc5771d871763a393e44b703571b55cc28424d1a5e86da6ed3c154a4b9")

        let stringToSign = "AWS4-HMAC-SHA256\n20150830T123600Z\n20150830/us-east-1/iam/aws4_request\nf536975d06c0309214f805bb90ccff089219ecd68b2577efef23edd43b7e1a59"
        let signature = Helper.hmac(stringToSign, salt).toString("hex")

        expect(signature).toEqual("5d672d79c15b13162d9279b0855cfba6789a8edb4c82c400e06b5924a6f2b5d7")
    });

    it('should generate right options', () => {
        let client = new AWSTestClient();
        let options: AwsRequestOptions = {
            region: "us-east-1",
            service: "service",
            method: "GET",
            host: "example.amazonaws.com",
            query: {
                "Param2": "value2",
                "Param1": "value1"
            }
        }

        client["prepareRequest"](options)

        expect(options.path).toEqual("/?Param2=value2&Param1=value1")
        expect(options.headers["Authorization"]).toEqual("AWS4-HMAC-SHA256 Credential=AKIDEXAMPLE/20150830/us-east-1/service/aws4_request, SignedHeaders=host;x-amz-date, Signature=b97d918cfa904a5beff61c982a1b6f458b799221646efd99d3219ec94cdf2500")
    });
});