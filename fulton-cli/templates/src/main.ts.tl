import { AppLauncher, FultonLog } from 'fulton-server';
import { ${appName} } from './app';


/*
AppLaunch help you launch tasks. 
If calling launch() with no paramaters, the default paramater is ["app"]. 
Task "app" is the pre-defined task which starts the app.

Also, you can add other tasks, for example:
```
AppLauncher.create(${appName})
    .task("batch-task", async (app: ${appName}) => {
        // Do Something
    })
    .task("clean-task", async (app: ${appName}) => {
        // Do Something
    })
    .launch();
```

There are 3 ways to launch these tasks.
1. hard code it, like
AppLauncher.launch(["batch-task", "clean-task", "app"]) 

2. as paramaters, like
> node src/main.ts batch-task clean-task app
or
> npm run start -- batch-task clean-task app

3. use .env file, like
```
${appName}.launch=batch-task,clean-task,app
```
*/

AppLauncher.create(${appName})
    .launch();