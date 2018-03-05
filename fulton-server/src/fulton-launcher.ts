import * as cluster from 'cluster';
import * as os from 'os';

import { FultonApp, IFultonApp } from './fulton-app';

import { Env } from './helpers';
import { FultonLog } from './fulton-log';
import { Type } from './interfaces';
import { fultonDebug } from './helpers/debug';

export type LaunchTask<TApp> = (app: TApp) => Promise<any>

/**
 * FultonApp launcher
 * 
 * you can start FultonApp http server, or just run a single task for a scheduled job
 * default tasks is ["app"]
 * the value can be overrided by process.env["{appName}.Launch"]
 * for example process.env["MyApp.Launch"] = "taskA, app"
 */
export class FultonAppLauncher<TApp extends IFultonApp> {
    static create<TApp extends IFultonApp>(type: Type<TApp>): FultonAppLauncher<TApp> {
        return new FultonAppLauncher(type);
    }

    private app: IFultonApp;
    private tasks: Map<string, LaunchTask<TApp>> = new Map();

    constructor(App: Type<IFultonApp>) {
        this.app = new App()

        this.task("app", this.appTask);
    }

    task(name: string, task: LaunchTask<TApp>): FultonAppLauncher<TApp> {
        this.tasks.set(name, task);
        return this
    }

    /**
     * Launch Tasks based on process.env["{appName}.Launch"]
     * @param stopAfterLaunch the default is based on task "App", if there is a task "App", the value is true
     */
    launch(stopAfterLaunch?: boolean): Promise<any> {
        let startTasks = Env.get(`${this.app.appName}.Launch`, "app")

        fultonDebug("launcher", `Start Tasks : ${startTasks}`)
        let promise = this.app.init().then(() => {
            return Promise.all(startTasks.split(",").map((taskName) => {
                taskName = taskName.trim();

                let task = this.tasks.get(taskName);
                if (stopAfterLaunch == null && taskName == "app") {
                    stopAfterLaunch = false;
                }

                if (task == null) {
                    FultonLog.error(`The launcher doesn't have task name called ${taskName}`)
                    return;
                }

                fultonDebug("launcher", `Starting Task : ${taskName}`)

                return task.call(this, this.app);
            }))
        })

        return promise.then(() => {
            fultonDebug("launcher", `Tasks Started`)

            if (stopAfterLaunch == true || stopAfterLaunch == null) {
                fultonDebug("launcher", `App Stopping`)
                return this.app.stop();
            }
        }).catch((error) => {
            FultonLog.error("Launch Failed by ", error)
        });
    }

    private appTask(app: IFultonApp): Promise<any> {
        if (app.options.server.clusterEnabled) {
            if (cluster.isMaster) {
                let wokerNum = app.options.server.clusterWorkerNumber || os.cpus().length;
                
                fultonDebug("launcher", `Master ${process.pid} is running with ${wokerNum} worker(s)`);
                

                // Fork workers.
                for (let i = 0; i < wokerNum; i++) {
                    cluster.fork();
                }

                cluster.on('exit', (worker, code, signal) => {
                    fultonDebug("launcher", `Worker ${worker.process.pid} died`);
                });
            } else {
                fultonDebug("launcher", `Worker ${process.pid} started`);
                return app.start()
            }
        } else {
            return app.start()
        }
    }
}