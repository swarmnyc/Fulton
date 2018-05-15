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
  "dependencies": {
    ${isCompressionEnabled ? '"compression": "^1.7.2",' : ""}
    ${isCorsEnabled ? '"cors": "^2.8.4",' : ""}

    <% if (isDatabaseEnabled) { %>
    "typeorm": "^0.2.5",
    "validator": "^10.2.0",
    "class-validator": "^0.8.5",
    <% } %>
    ${isMongoDbEnabled ? '"mongodb": "^3.0.7",' : ""}

    <% if (isIdentityEnabled) { %>
    "jws": "^3.1.4",
    "passport": "^0.4.0",
    "passport-http-bearer": "^1.0.1",
    "passport-local": "^1.0.0",
    "password-hash": "^1.2.2",
    <% } %>
    ${isGoogleAuthEnabled ? '"google-auth-library": "^1.4.0",' : ""}    
    ${isFacebookAuthEnabled ? '"passport-facebook": "^2.1.1",' : ""}
    ${isGitHubAuthEnabled ? '"passport-github": "^1.1.0",' : ""}

    ${isApiDocsEnabled ? '"swagger-ui-express": "^3.0.8",' : ""}

    ${isEmailNotificationEnabled ? '"nodemailer": "^4.6.4",' : ""}

    "dotenv": "^5.0.1"    
  },
  "devDependencies": {
    "@types/node": "^10.0.6",
    "rimraf": "^2.6.2",
    "ts-node": "^6.0.3",
    "typescript": "^2.8.3"
  }
}
