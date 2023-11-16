# Jobly Backend

This is the Express backend for Jobly, version 2.

To run this:

    node server.js
    
To run the tests:

    jest -i

# **Goals & Requirements**

- This is a pure API app, taking values from the query string (GET requests) or from a JSON body (other requests). It returns JSON.
- This gets authentication/authorization with JWT tokens. Make sure your additions only allow access as specified in our requirements.
- Be thoughtful about function and variable names, and write developer-friendly documentation *for every function and route* you write.
- The starter code is well-tested, with excellent coverage. We expect your new contributions to maintain good coverage.
- Model tests check the underlying database actions. Route tests check the underlying model methods and do not rely directly on the database changes. This is a useful testing design consideration and you should continue it.
- We *strongly encourage you* to practice some test-driven development. Write a test before writing a model method and a route. You will find that this can make the work of adding to an app like this easier, and much less bug-prone.

**Take your time, be organized and clear, and test carefully. Have fun!**