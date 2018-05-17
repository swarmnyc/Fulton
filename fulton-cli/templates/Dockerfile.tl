FROM node:slim

EXPOSE 3000
EXPOSE 443

ENV NODE_ENV production
# Update the enviroment variables there, like
# ENV ${appName}.options.databases.default.url database_url 

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
WORKDIR /app
RUN npm install --production

# or update the enviroment variables by use different .env files, like
# COPY ./prod.env /app/.env 
COPY ./.env /app/.env
COPY ./build /app/build

ENTRYPOINT ["npm", "run", "start:prod"]