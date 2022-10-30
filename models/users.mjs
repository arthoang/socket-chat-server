import { connectDB, closeDB } from './dbutils.mjs';
import util from 'util';
import { default as DBG } from 'debug';
const log = DBG('flashchat:model-users');
const error = DBG('flashchat:error');

/* ===== define user model ===== */
const _user_name = Symbol('username');
const _password = Symbol('password');
const _status = Symbol('status');

export class User {
    constructor(username, password, status) {
        this[_user_name] = username;
        this[_password] = password;
        this[_status] = status;
    }

    get username() { return this[_user_name]; }
    get password() { return this[_password]; }
    get status() { return this[_status]; }
}

/* ==== Helpers ==== */

function sanitizedUser(user) {
    var ret = {
        id: user.username,
        username: user.username,
        status: user.status
    };
    return ret;
}


/* ==== DB handling ==== */


export async function close() {
    if (client) client.close();
    client = undefined;
}

export async function findOneUser(username) {
    const db = await connectDB();
    const collection = db().collection('users');
    const doc = await collection.findOne( { username } );
    const user = doc ? sanitizedUser(new User(doc.username, doc.password, doc.status)) : undefined;
    return user;
}

export async function getPass(username) {
    const db = await connectDB();
    const collection = db().collection('users');
    const doc = await collection.findOne( { username } );
    const pass = doc ? { username: doc.username, password: doc.password } : undefined;
    return pass;
}

export async function createUser(data) {
    const db = await connectDB();
    const collection = db().collection('users');
    await collection.insertOne({ 
        username: data.username,
        password: data.password,
        status: data.online ? 'online' : 'offline'
    });
    const user = await findOneUser(data.username);
    return user;
}

export async function updateStatus(username, online) {
    const db = await connectDB();
    const status = online ? 'online' : 'offline';
    const collection = db().collection('users');
    await collection.updateOne(
        {
            username: username
        }
        ,{
            $set: {
                status
            }
        }
    );
    const user = await findOneUser(username);
    return user;
}


export async function getUsers(online) {
    const db = await connectDB();
    const collection = db().collection('users');
    const status = online ? 'online' : 'offline';
    const users = await new Promise((resolve, reject) => {
        const users = [];
        collection.find({status}).forEach(user => {
            users.push(sanitizedUser(user));
        }, err => {
            if (err) reject(err);
            else resolve(users);
        });
    });
    return users;
}

