version: '3'
services:
  app:
    image: "${appNameSafe}"
    build: ./
    ports:
     - "3000:3000"
     - "443:443"
    depends_on:
     ${isMongoDbEnabled ? "- mongodb" : "" }
    links:
     ${isMongoDbEnabled ? "- mongodb" : "" }
    environment: 
     ${isMongoDbEnabled ? "- " + appName + ".options.databases.default.url=mongodb://mongodb:27017/" + projectNameSafe : "" }

  <% if(isMongoDbEnabled) { %>
  mongodb:
    image: "mongo"
    ports:
     - "27017:27017"
  <% } %>