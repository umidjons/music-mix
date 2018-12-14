const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');
const debug = require('debug');

(async () => {
    mongoose.promise = global.Promise;

    const isProduction = process.env.NODE_ENV === 'production';
    const {PORT, DB_CONN_STR} = process.env;

    const app = express();
    const log = debug('app:main');

    const pause = (timeMS) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, timeMS);
        });
    };

    // Do not continue until connection succeeded to DB
    while (true) {
        try {
            log('Connecting to db');
            await mongoose.connect(DB_CONN_STR, {
                useNewUrlParser: true,
                autoReconnect: true,
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 5000,
                connectTimeoutMS: 30000,
                poolSize: 5,
                bufferCommands: false
            });
            log('Connected to db.');
            break;
        } catch (error) {
            log('Failed connecting to db.');
            log(error);
            log('Waiting 5 seconds');
            await pause(5000);
        }
    }

    mongoose.set('debug', true);

    app.use(cors());
    app.use(require('morgan')('dev'));
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(session({
        secret: '7H7LmPVYy5ASULxL',
        cookie: {maxAge: 60000},
        resave: false,
        saveUninitialized: false
    }));

    require('./models/Users');
    require('./models/Medias');
    require('./config/passport');

    app.use(require('./routes'));

    if (!isProduction) {
        app.use((err, req, res, next) => {
            res.status(err.status || 500);
            res.json({
                errors: {
                    message: err.message,
                    error: err
                }
            });
        });
    }

    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message,
                error: {}
            }
        });
    });

    /*
    if (!isProduction) {
        app.use(errorHandler());
    }
    */

    app.listen(PORT, () => {
        log(`Server running on http://${PORT}`);
    });
})();

