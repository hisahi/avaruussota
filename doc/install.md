# Usage
Open the site and play.

# Install
Download the source code and run
```
$ npm install
```

Next you must give `JWT_SECRET` either as an environment variable or in a file
called `.env` (as `JWT_SECRET=`...). The value can be whatever you want but
should not be revealed to anyone.

The server can then be started with
```
$ npm start
```

The port is set to `5000` by default, but can be changed by using the
environment variable `PORT`.
