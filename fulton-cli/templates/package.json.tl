{
  "name": "${projectName}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "clean": "rimraf ./build",
    "start": "ts-node -r dotenv/config ./src/main.ts",
    "start:prod": "node -r dotenv/config ./build/main.js",
    "debug": "node --inspect-brk=9229 -r dotenv/config -r ts-node/register ./src/main.ts",
    "build": "tsc -p tsconfig.json",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}  
}
