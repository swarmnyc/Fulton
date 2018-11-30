import { AwsClient } from '../../../src/helpers/aws-client';
import * as fs from 'fs'

xdescribe('AWS Client', () => {
    it('should send sns message', async () => {
        let client = new AwsClient()
        let res = await client.request({
            service: "sns",
            region: "us-east-1",
            method: "GET",
            query: {
                Action: "Publish",
                Message: "Hello",
                PhoneNumber: process.env["tester_phone"]
            }
        })

        expect(res.statusCode).toEqual(200)
    });

    it('should upload file to s3', async () => {
        let file = fs.readFileSync("./README.md")
        
        let client = new AwsClient()
        let res = await client.request({
            service: "s3",
            region: "us-east-1",
            method: "PUT",
            host: `${process.env["AWS_S3_BUCKET"]}.s3.amazonaws.com`,
            path: "/test.txt",
            payloadHash: "UNSIGNED-PAYLOAD",
            payload: file,
            headers: {
                "Content-Type": "text/plain",
                "Content-Length": file.byteLength,
                "X-AMZ-ACL": "public-read",
                "X-AMZ-CONTENT-SHA256": "UNSIGNED-PAYLOAD"
            }
        })

        if (res.statusCode != 200){
            fail(res.body)
        }
    });
});