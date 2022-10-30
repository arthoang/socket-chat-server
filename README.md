# socket-chat-server
Nodejs Socket.io server


## The project uses nodejs and mongoDB for storing users. There are 2 applications: 
1. Server: handling socket.io events emitted by the client. Based on specific events, the following will be done:
*	Register user
*	Login user
*	Logout user
*	Post message
*	Get recent messages
*	Create conversation
*	Get conversation

2. Client:  [Command line Client](https://github.com/arthoang/socket-chat-client)
Console app, using readline library. Based on user input, will communicate with server by emitting events

3. How to use this server:
-	Navigate to “server” project folder, and run: 
```
npm install
```
This will install dependencies
-	To bring up the chat server, run the command: 
```
npm start
```
Note: Make sure port 5858 is available. Otherwise, modify environment PORT in package.json, the the “start” script

### Video demo
[Chat Demo](https://youtu.be/QQ6oG3r9uvE)
