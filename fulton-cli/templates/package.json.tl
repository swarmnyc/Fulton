{
  "name": "${projectName}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "clean": "rimraf ./build",
    "start": "ts-node -r dotenv/config ./src/main.ts",
    "start:prod": "node -r dotenv/config ./build/main.js",
    "debug": "node --inspect-brk=9229 -r dotenv/config -r ts-node/register ./src/main.ts",
    "build": "npm run clean && tsc -p tsconfig.json",
    <% if (isDockerEnabled) { %>"docker": "npm run build && docker build ./",
    "dcu": "npm run build && docker-compose up --build -d",
    "dcd": "docker-compose down",<% } %>
    "test": "echo \"Error: no test specified\" && exit 1"
    
  },
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {}  
}
