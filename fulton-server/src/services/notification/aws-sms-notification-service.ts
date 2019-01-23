import { AwsClient } from '../../helpers/aws-client';
import { ISmsNotificationService, SmsMessage } from '../../types';
import { Service } from '../service';

export default class AwsSmsNotificationService extends Service implements ISmsNotificationService {
    private client: AwsClient

    onInit() {
        this.client = new AwsClient({
            accessKey: this.app.options.notification.sms.configs.aws_access_key_id,
            secretKey: this.app.options.notification.sms.configs.aws_secret_access_key,
            region: this.app.options.notification.sms.configs.aws_region
        })
    }

    send(message: SmsMessage): Promise<void> {
        return this.client.request({
            service: "sns",
            method: "GET",
            host: `sns.${this.client.configs.region}.amazonaws.com`,
            query: {
                Action: "Publish",
                Message: message.message,
                PhoneNumber: message.phoneNumber
            }
        }) as Promise<any>
    }
}