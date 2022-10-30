import { default as express } from 'express';
import { Server as SocketIoServer} from 'socket.io';
import * as path from 'path';
//import * as favicon from 'serve-favicon';
import { default as logger } from 'morgan';
import { default as DBG } from 'debug';
import { default as rfs } from 'rotating-file-stream';

//import { default as cookieParser} from 'cookie-parser';
import { default as bodyParser} from 'body-parser';
import * as http from 'http';
import { approotdir } from './approotdir.mjs';
const __dirname = approotdir;
import {
  normalizePort, onError, onListening, handle404, basicErrorHandler
} from './appsupport.mjs';

//import { router as indexRouter, init as homeInit } from './routes/index.mjs';
//import { router as usersRouter, initPassport } from './routes/users.mjs';

import { init as usersInit } from './controller/users.mjs';
import { init as chatsInit } from './controller/chats.mjs';

export const app = express();
export const debug = DBG('chat:debug');
export const dbgerror = DBG('chat:error');
export const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

export const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
//setup socket.io
export const io = new SocketIoServer(server);

//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
  stream: process.env.REQUEST_LOG_FILE ? 
    rfs.createStream(process.env.REQUEST_LOG_FILE, {
      size: '10M',
      interval: '1d',
      compress: 'gzip'
    })
    : process.stdout
}));


app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());

//init socket
usersInit();
chatsInit();

//route function list
// app.use('/', indexRouter);
// app.use('/notes', notesRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(handle404);
app.use(basicErrorHandler);


server.on('request', (req, res) => {
  debug(`${new Date().toISOString()} request ${req.method} ${req.url}`);
});