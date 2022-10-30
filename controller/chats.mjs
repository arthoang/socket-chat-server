import util from 'util';
import { io } from '../app.mjs';
import { default as DBG } from 'debug';
const log = DBG('flashchat:controller-chats');
const error = DBG('flashchat:error');
import * as convModel from '../models/conversations.mjs';
import * as chatModel from '../models/chats.mjs';

/* ==== socket handling ==== */
export function init() {
    log('chatsInit Called');
    io.of('/messages').on('connect', async socket => {
        log('/chats socket connected');
        //get conv Id of the 2 participants
        
        //register handlers
        socket.on('create-message', async(newmsg, fn) => {
            try {
                const data = {
                    key: newmsg.key,
                    from: newmsg.from,
                    message: newmsg.message
                }
                //save to db
                await chatModel.postMessage(data);
                //emit to room
                const toemit = {
                    from: newmsg.from,
                    message: newmsg.message
                }
                log(toemit);
                io.of('/messages').to(data.key).emit('newmessage', toemit);
            } catch (err) {
                error(`FAIL to create chat message ${err.stack}`);
            }
        });

        socket.on('getKey', async (data, fn) => {
            log('getKey called');
            var convKey = await convModel.findConversationKey(data.p1, data.p2);
            if (!convKey) {
            //create new conversation 
                convKey = await convModel.createConversation(data.p1, data.p2);
            }
            log('room key ' + convKey);
            //join room
            socket.join(convKey);
            
            fn(convKey);
        });

        socket.on('recentmessages', async (data, fn) => {
            //get list of recent messages and emit
            const recentMessages = await chatModel.findRecentMessages(data.key);
            fn(recentMessages);
        });
    });
    
}
