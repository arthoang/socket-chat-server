import { connectDB, closeDB } from './dbutils.mjs';
import util from 'util';
import { default as DBG } from 'debug';
const log = DBG('flashchat:model-chat');
const error = DBG('flashchat:error');

/* ===== define conversation model ===== */
const _key = Symbol('key');
const _from = Symbol('from');
const _message = Symbol('message');
const _timestamp = Symbol('timestamp');

export class Chat {
    constructor(key, from, message, timestamp) {
        this[_key] = key;
        this[_from] = from;
        this[_message] = message;
        this[_timestamp] = timestamp;
    }

    get key() { return this[_key]; }
    get from() { return this[_from]; }
    get message() { return this[_message]; }
    get timestamp() { return this[_timestamp]; }
}

/* ==== Helpers ==== */

function sanitizedMessage(message) {
    var ret = {
        id: message.key,
        from: message.from,
        message: message.message
    };
    return ret;
}

/* ==== DB handling ==== */

export async function findRecentMessages(convKey) {
    const db = await connectDB();
    const collection = db().collection('messages');
    const messages = await new Promise((resolve, reject) => {
        const messages = [];
        collection.find({key: convKey}).sort({_id:1}).forEach(message => {
            messages.push(sanitizedMessage(message));
        }, err => {
            if (err) reject(err);
            else resolve(messages);
        });
    });
    return messages;
}

export async function postMessage(data) {
    const db = await connectDB();
    const collection = db().collection('messages');
    await collection.insertOne({ 
        key: data.key,
        from: data.from,
        message: data.message,
        timestamp: Date.now()
    });
    const message = await findLastMessage(data.key);
    
    return message;
}

export async function findLastMessage(convKey) {
    const db = await connectDB();
    const collection = db().collection('messages');
    const messages = await collection.find({key: convKey}).sort({_id:-1}).limit(1);
    let message;
    if (messages && messages.length > 0) {
        message = message[0];
    }
    return message;
}


