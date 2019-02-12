import * as fs from 'fs';
import { JWT } from 'google-auth-library';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import * as https from 'https';
import { FultonLog } from '../../fulton-log';
import { IPushNotificationService } from '../../types';
import { PushNotificationProviderConfigs } from '../../options/notification-pn-options';
import { Service } from '../service';

var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
var SCOPES = [MESSAGING_SCOPE];

export default class FcmPushNotificationService extends Service implements IPushNotificationService {
    private configs: PushNotificationProviderConfigs
    private credentials: Credentials;
    private requestOptions: https.RequestOptions;

    onInit() {
        if (this.app.options.notification.pushNotification.configs) {
            if (this.app.options.notification.pushNotification.configs.filePath) {
                this.configs = JSON.parse(fs.readFileSync(this.app.options.notification.pushNotification.configs.filePath).toString())
            } else {
                this.configs = this.app.options.notification.pushNotification.configs
            }
        }

        if (this.configs == null) {
            throw new Error("For FcmPushNotificationService, notification.pushNotification.config cannot be undefined!")
        } else {
            this.requestOptions = {
                hostname: 'fcm.googleapis.com',
                port: 443,
                path: `/v1/projects/${this.configs.project_id}/messages:send`,
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                }
            };
        }
    }

    send(payload: any): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getAccessToken().then((accessToken) => {
                let body = JSON.stringify(payload)
                this.requestOptions.headers["Authorization"] = `Bearer ${accessToken}`
                this.requestOptions.headers["Content-Length"] = body.length

                let req = https.request(this.requestOptions, (res) => {
                    if (res.statusCode != 200) {
                        res.on("data", (d) => {
                            var error = String(d)
                            FultonLog.error(`Sending FCM failed by`, error);
                            reject(error)
                        })
                    } else {
                        resolve()
                        FultonLog.debug(`FCM Sent`);
                    }
                });

                req.on("error", (err) => {
                    reject(err)
                    FultonLog.error(`Sending FCM failed by`, err);
                })

                req.write(body)
                req.end()
            }).catch(reject)
        });
    }

    getAccessToken(): Promise<string> {
        if (this.credentials && this.credentials.expiry_date.valueOf() > Date.now()) {
            return Promise.resolve(this.credentials.access_token)
        }

        return new Promise((resolve, reject) => {
            var jwtClient = new JWT(
                this.configs.client_email,
                null,
                this.configs.private_key,
                SCOPES,
                null
            );

            jwtClient.authorize((err, result) => {
                if (err) {
                    FultonLog.error("FCM Auth Failed", err)
                    reject(err)
                    return;
                }

                this.credentials = result
                resolve(result.access_token);
            });
        });
    }
}
