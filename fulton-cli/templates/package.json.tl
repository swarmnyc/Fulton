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
    "docker": "docker build ./",
    "dcu": "docker-compose up --build -d",
    "dcd": "docker-compose down",
    "test": "echo \"Error: no test specified\" && exit 1",
    "prebuild": "npm run clean",
    "predocker": "npm run build",
    "predcu": "npm run build"
  },
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}  
}
