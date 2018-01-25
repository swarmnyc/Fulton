tests in the integration-tests needs database connections

if you want to test them, change `xdescribe` to `describe` or `fdescribe`

and prepare mongodb for `mongodb://localhost:27017/fulton-test`