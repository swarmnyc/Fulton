import * as cluster from 'cluster';
import * as os from 'os';
import { IFultonApp } from './fulton-app';
import { FultonLog } from './fulton-log';
import { Env } from './helpers';
import { fultonDebug } from './helpers/debug';
import { Type } from './types';

export type LaunchTask = (app: IFultonApp) => Promise<any>

/**
 * FultonApp launcher
 * 
 * you can start FultonApp http server, or just run a single task for a scheduled job
 * default tasks is "app"
 * the value can be overrode by process.env["{appName}.launch"]
 * for example process.env["MyApp.launch"] = "taskA, app"
 */
export class AppLauncher<TApp extends IFultonApp> {
    static create<TApp extends IFultonApp>(type: Type<TApp>): AppLauncher<TApp> {
        return new AppLauncher(type);
    }

    private app: IFultonApp;
    private tasks: Map<string, LaunchTask> = new Map();
    private longTasks: Map<string, boolean> = new Map();

    constructor(App: Type<IFultonApp>) {
        this.app = new App()

        this.task("app", this.appTask, true);
    }

    task(name: string, task: LaunchTask, isLongTask: boolean = false): AppLauncher<TApp> {
        this.tasks.set(name, task);
        this.longTasks.set(name, isLongTask);
        return this
    }

    /**
     * Launch Tasks based on process.env["{appName}.launch"]
     * @param stopAfterLaunch the default is based on task "app", if there is a task "app", the value is true
     */
    launch(tasks?: string[]): Promise<any> {
        if (tasks == null) {
            if (process.argv.length > 2) {
                // from args
                tasks = []
                process.argv.slice(2).forEach(arg => {
                    // to skip arg with =, for example dotenv_options_path=path for dotenv.
                    if (arg.includes("=")) return

                    tasks.push(...arg.split(","))
                })
            }
            
            if (tasks == null || tasks.length == 0){
                // from env
                tasks = Env.get(`${this.app.appName}.launch`, "app").split(",")
            }
        }

        fultonDebug("launcher", `Start Tasks : ${tasks}`)

        let longTask = false;
        let promise = this.app.init().then(() => {
            return Promise.all(tasks.map((taskName) => {
                taskName = taskName.trim();

                let task = this.tasks.get(taskName);

                if (task == null) {
                    FultonLog.error(`This project doesn't have task called ${taskName}`)
                    return;
                }

                longTask = longTask || this.longTasks.get(taskName);

                fultonDebug("launcher", `Starting Task : ${taskName}`)

                return task.call(this, this.app);
            }))
        })

        return promise.then(() => {
            fultonDebug("launcher", `Tasks Started`)

            if (longTask == false) {
                fultonDebug("launcher", `App Stopping`)
                return this.app.stop();
            }
        }).catch((error) => {
            FultonLog.error("Launch Failed by", error)
            this.app.stop().then(() => {
                process.exit(1)
            })
        });
    }

    private appTask(app: IFultonApp): Promise<any> {
        if (app.options.server.clusterEnabled) {
            if (cluster.isMaster) {
                let workerNum = app.options.server.clusterWorkerNumber || os.cpus().length;

                fultonDebug("launcher", `Master ${process.pid} is running with ${workerNum} worker(s)`);

                // Fork workers.
                for (let i = 0; i < workerNum; i++) {
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