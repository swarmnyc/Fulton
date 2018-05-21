## Launch Tasks
#${appName}.launch=app

## Options
${appName}.options.compression.enabled=${isCompressionEnabled}
${appName}.options.cors.enabled=${isCorsEnabled}
${appName}.options.docs.enabled=${isApiDocsEnabled}
${appName}.options.formatter.jsonApi=${isJsonApiEnabled}


<% if(isDatabaseEnabled) { %>## Databases<% } %><% databases.forEach(function(db){ %>
${db.options} 
<% }) %>

## Identity
${appName}.options.identity.enabled=${isIdentityEnabled}
<% if(isGoogleAuthEnabled) { %>${appName}.options.identity.google.enabled=true
${appName}.options.identity.google.clientId=your_google_client_id
${appName}.options.identity.google.clientSecret=your_google_client_secret
<% } %>
<% if(isFacebookAuthEnabled) { %>${appName}.options.identity.facebook.enabled=true
${appName}.options.identity.facebook.clientId=your_facebook_client_id
${appName}.options.identity.facebook.clientSecret=your_facebook_client_secret
<% } %>
<% if(isGitHubAuthEnabled) { %>${appName}.options.identity.github.enabled=true
${appName}.options.identity.github.clientId=your_github_client_id
${appName}.options.identity.github.clientSecret=your_github_client_secret
<% } %>
<% if(isGitHubAuthEnabled) { %>${appName}.options.identity.github.enabled=true
${appName}.options.identity.github.clientId=your_github_client_id
${appName}.options.identity.github.clientSecret=your_github_client_secret
<% } %>

<% if(isEmailNotificationEnabled) { %>## Notification
${appName}.options.notification.email.enabled=true
${appName}.options.notification.email.sender="Support" support@example.com
${appName}.options.notification.email.smtp.host=smtp.example.com
${appName}.options.notification.email.smtp.secure=true
${appName}.options.notification.email.smtp.auth.username=smtp_username
${appName}.options.notification.email.smtp.auth.password=smtp_password
<% } %>