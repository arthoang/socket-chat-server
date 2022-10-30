import { port, dbgerror } from './app.mjs';

export function normalizePort(val) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    } 
    if (port >= 0) {
        return port;
    }
    return false;
}

export function onError(error) {
    dbgerror(error);
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

import { server, debug } from './app.mjs';
export function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug(`Listening on ${bind}`);
}

export function handle404(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
}

export function basicErrorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    //set locals. Render error message in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    //render error page
    res.status(err.status || 500);
    res.render('error');
}

process.on('uncaughtException', function(err) {
    console.error(`Crashed!!! - ${err.stack || err}`);
});

import * as util from 'util';
process.on('unhandledRejection', (reason, p) => {
    console.error(`Unhandled Rejection at: ${util.inspect(p)} reason: ${util.inspect(reason)}`);
});

async function catchProcessDeath() {
    debug('urk....');
    await server.close();
    process.exit(0);
}

process.on('SIGTERM', catchProcessDeath);
process.on('SIGINT', catchProcessDeath);
process.on('SIGHUP', catchProcessDeath);

process.on('exit', () => { debug('exiting.....'); });
