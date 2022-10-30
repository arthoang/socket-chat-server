import { default as bcrypt } from 'bcrypt';
import * as userModel from '../models/users.mjs';
import { io } from '../app.mjs';
import util from 'util';
import { default as DBG } from 'debug';
const log = DBG('flashchat:controller-users');
const error = DBG('flashchat:error');

const saltRounds = 10;

async function hashpass(password) {
    let salt = await bcrypt.genSalt(saltRounds);
    let hashed = await bcrypt.hash(password, salt);
    return hashed;
}


/* ===== Socket handling ===== */
export function init() {
    log('usersInit Called');
    io.of('/users').on('connection', socket => {
        log('users - socketio connection on /users');
        socket.on('create-user', async (data, fn) => {
            log('create-user event triggered');
            const existUser = await userModel.findOneUser(data.username);
            log(util.inspect(existUser));
            if (existUser) {
                log('existing user');
                const resData = {
                    success: false,
                    message: "User already exists"
                }
                fn(resData);
            } else {
                //create
                const hashed = await hashpass(data.password);
                const user = userModel.createUser(
                    {
                        username: data.username,
                        password: hashed,
                        online: true
                    }
                );
                emitUpdateUsersList();
                const resData = {
                    success: true,
                    user: user
                }
                fn(resData)
            }
        });

        socket.on('login', async (data, fn) => {
            const checked = await checkUserPassword(data.username, data.password);
            if (checked.check) {
                //login success. update online status
                await userModel.updateStatus(data.username, true);
                const resData = {
                    success: true,
                }
                emitUpdateUsersList();
                fn(resData);
            } else {
                const resData = {
                    success : false,
                }
                fn(resData);
            }
        });

        socket.on('getUserList', async (data, fn) => {
            const online = await userModel.getUsers(true);
            const offline = await userModel.getUsers(false);
            const resData = {
                online, offline
            }
            fn(resData);
        });

        socket.on('logout', async (data, fn) => {
            log('Logging out user ' + data.username);
            await userModel.updateStatus(data.username, false);
            emitUpdateUsersList();
            fn('ok');
        });
    });

    io.of('/users').on('disconnect', socket => {
        log('/Users socket disconnect. Logging out user');
    })
    // this.on('usercreated', emitUpdateUsersList);
    // this.on('statusupdated', emitUpdateUsersList);
}

export const emitUpdateUsersList = async () => {
    const onlineUsers = await userModel.getUsers(true);
    const offlineUsers = await userModel.getUsers(false);
    io.of('/users').emit('userslist', {
        online: onlineUsers,
        offline: offlineUsers
    });
}

export async function checkUserPassword(username, password) {
    const hashed = await userModel.getPass(username);
    let checked;
    if (hashed) {
        //check pass
        let pwcheck = false;
        if (hashed.username === username) {
            pwcheck = bcrypt.compare(password, hashed.password);
        }
        if (pwcheck) {
            checked = {
                check: true,
                username: username
            }
        }
    } else {
        checked = {
            check: false,
            username: username,
            message: 'Could not find user'
        }
    }
    return checked;
}