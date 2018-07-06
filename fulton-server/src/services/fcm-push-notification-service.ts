import * as fs from 'fs';
import { IPushNotificationService } from '../interfaces';
import { Service } from './service';
import { JWT } from 'google-auth-library';
import { Credentials } from 'google-auth-library/build/src/auth/credentials';
import { FultonLog } from '../fulton-log';
import * as https from 'https'

interface Config {
    filePath: string
    fcmConfig: FcmConfig
}

interface FcmConfig {
    type: string
    project_id: string
    private_key_id: string
    private_key: string
    client_email: string
    client_id: string
    auth_uri: string
    token_uri: string
    auth_provider_x509_cert_url: string
    client_x509_cert_url: string
}

var MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';
var SCOPES = [MESSAGING_SCOPE];

export class FcmPushNotificationService extends Service implements IPushNotificationService {
    private config: Config
    private fcmConfig: FcmConfig;
    private credentials: Credentials;
    private requestOptions: https.RequestOptions;

    onInit() {
        this.config = this.app.options.notification.pushNotification.config
        if (this.config) {
            if (this.config.filePath) {
                this.fcmConfig = JSON.parse(fs.readFileSync(this.config.filePath).toString())
            }

            if (this.config.fcmConfig) {
                this.fcmConfig = this.config.fcmConfig
            }
        }

        if (this.fcmConfig == null) {
            throw new Error("For FcmPushNotificationService, notification.pushNotification.config.filePath or notification.pushNotification.config.fcmConfig cannot be undefined!")
        } else {
            this.requestOptions = {
                hostname: 'fcm.googleapis.com',
                port: 443,
                path: `/v1/projects/${this.fcmConfig.project_id}/messages:send`,
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
            })
        });
    }

    getAccessToken(): Promise<string> {
        if (this.credentials && this.credentials.expiry_date.valueOf() > Date.now()) {
            return Promise.resolve(this.credentials.access_token)
        }

        return new Promise((resolve, reject) => {
            var jwtClient = new JWT(
                this.fcmConfig.client_email,
                null,
                this.fcmConfig.private_key,
                SCOPES,
                null
            );

            jwtClient.authorize((err, result) => {
                if (err) {
                    FultonLog.error("FCM Auth Failed", err)
                    return;
                }

                this.credentials = result
                resolve(result.access_token);
            });
        });
    }
}