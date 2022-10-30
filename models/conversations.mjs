import { connectDB } from './dbutils.mjs';
import { v4 as uuid } from 'uuid';
import util from 'util';
import { default as DBG } from 'debug';
const log = DBG('chat:model-conversation');
const error = DBG('chat:error');

/* ===== define conversation model ===== */
const _key = Symbol('key');
const _p1 = Symbol('p1');
const _p2 = Symbol('p2');

export class Conversation {
    constructor(key, p1, p2) {
        this[_key] = key;
        this[_p1] = p1;
        this[_p2] = p2;
    }

    get key() { return this[_key]; }
    get p1() { return this[_p1]; }
    get p2() { return this[_p2]; }
}

/* ==== DB handling ==== */

export async function findConversationKey(p1, p2) {
    const db = await connectDB();
    const collection = db().collection('conversations');
    const doc = await collection.findOne( {$or: [{ p1, p2 }, {p2: p1, p1: p2}]});
    const convKey = doc ? doc.key : undefined;
    return convKey;
}

export async function createConversation(p1, p2) {
    const db = await connectDB();
    const collection = db().collection('conversations');
    const key = uuid();
    await collection.insertOne({ 
        key, p1, p2
    });
    const convKey = await findConversationKey(p1, p2);
    return convKey;
}