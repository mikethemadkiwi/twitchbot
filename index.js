const bigBang = Date.now();
// Dependancies
const twconf = require('../twitchconfig.json');
const tmi = require('tmi.js');
const colors = require('colors');
const ws = require('ws');
// STORE VALS
let CLIENTS = [];
let ROOMSTATE;
const channelUsers = [];
// SQL
const mysql = require('mysql');
const sqlconfig = require('../dbconfig.json'); 
const sqlConn = mysql.createConnection(sqlconfig);
sqlConn.on('error', function(err) {
    console.log('SQLERR', err.code)
    if(err.code == 'PROTOCOL_CONNECTION_LOST'){
        sqlConn = mysql.createConnection(sqlconfig);
    }
});
class DBLib {    
    dbCheck(){
        return new Promise((resolve, reject) => {
            sqlConn.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
                if (error) console.log(`utils.dbcheck`, error);
                if(results[0].solution == 2){
                    resolve(true)
                }
                else(resolve(false));
            });
        })
    }
}
// Auth
class AuthLib {
    async init(){
        // twconf
    }
    fetchToken(){
        // `https://id.twitch.tv/oauth2/authorize?client_id=${twconf.identity.clientID}&redirect_uri=http://127.0.0.1:8000&response_type=token`
    }
    fetchUser(){
        fetch(
            'https://api.twitch.tv/helix/users',
            {
                "headers": {
                    "Client-ID": client_id,
                    "Authorization": "Bearer " + access_token
                }
            }
        )
        .then(resp => resp.json())
        .then(resp => {
           resp.forEach(element => {
               console.log(element)               
           });
        })
        .catch(err => {
            console.log(err);
        });
    }
}
// PingLib
let pingStart = 0;
class PingLib {
    startPingTimer(){

    }
    sendPing(){
        
    }
    awaitPong(){

    }
    clearPingTimer(){

    }
}
// PubSub
class PubLib {
    async requestListen(topics, token) {
        let pck = {}
        pck.type = 'LISTEN';
        pck.nonce = myname + '-' + new Date().getTime();

        pck.data = {};
        pck.data.topics = topics;
        if (token) {
            pck.data.auth_token = token;
        }
        pubsub.send(JSON.stringify(pck));
    }
}
// Twitch Chat
class TwitchChatLib {
    async onConnectedHandler (addr, port) {
        console.log(`* Connected to ${addr}:${port}`);
    }
    async onMessageHandler (target, context, msg, self) {
        // if (self) {return;} //comment if you want to be able to run your own commands
        if(context['message-type']=='whisper'){
            let pre = `[${context['user-id']}]`.magenta;
            pre += ` {whisper} ${context['display-name']}`.yellow;
            pre += ` || `.magenta;
            pre += msg.grey;
            // console.log(pre);
        }
        else{        
            if(msg.substr(0, 1) == "!"){
                console.log(`command`, msg)
                CLIENTS['twitchchat'].say(target, `Kiwi has BDE`);
            }
            else {
                let pre = `[${context['user-id']}]`.magenta;
                if(context.subscriber){pre += ` {SUB}`.green};
                if(context.mod){pre += ` {MOD}`.green};
                pre += ` ${context['display-name']}`.yellow;
                pre += ` || `.magenta;
                pre += msg;
                console.log(pre);
            }
        }    
        // console.log('context', context)
    }
    async onUserJoin(channel, username, self) {
        if(self){console.log(`Connected to : [${channel}]`)}
        else{
            console.log(`${channel} ChatUsers[${channelUsers.length}] ${username} Joined`)
        }
        let Fu = channelUsers.map(function(user) { return user; }).indexOf(username);
        if(Fu==-1){
            channelUsers.push(username);
        }
    }
    async onUserPart(channel, username, self){
        if(self){console.log(`selfpart`)}
        let Fu = channelUsers.map(function(user) { return user; }).indexOf(username);
        channelUsers.splice(Fu, 1);
        console.log(`${channel}  ChatUsers[${channelUsers.length}] ${username} parted`)
    }
    async onReconnect(){console.log(`reconnected`)}
    async onClearChat(chan, user){
        console.log(`clearchat`, chan)
    }
    async onClearMsg(chan, msg, msgid){
        console.log(`clearmsg`, chan)
    }
    async onHostTarget(chan, num){
        console.log(`hosttarget`, chan)
    }
    async onNotice(channel, data){
        console.log(`notice ${channel}`, data)
    }
    async onUserNotice(chan, data){
        console.log(`usernotice`, data)
    }
    async onUserState(chan, data){
        console.log(`userstate`, data)
    }
    async onRoomState(chan, state){
        ROOMSTATE = state;
    }
}
class BotClients {
    async twitchChat(){
        let db = new DBLib;
        let tl = new TwitchChatLib;
        let ddddd = await db.dbCheck();
        console.log(`DB Sanity: ${ddddd}`)
        CLIENTS['twitchchat'] = new tmi.client(twconf);
        CLIENTS['twitchchat'].on('message', tl.onMessageHandler);
        CLIENTS['twitchchat'].on('connected', tl.onConnectedHandler);
        CLIENTS['twitchchat'].on('join', tl.onUserJoin);
        CLIENTS['twitchchat'].on('part', tl.onUserPart)
        CLIENTS['twitchchat'].on('clearchat', tl.onClearChat)
        CLIENTS['twitchchat'].on('clearmsg', tl.onClearMsg)
        CLIENTS['twitchchat'].on('hosttarget', tl.onHostTarget)
        CLIENTS['twitchchat'].on('notice', tl.onNotice)
        CLIENTS['twitchchat'].on('reconnect', tl.onReconnect)
        CLIENTS['twitchchat'].on('roomstate', tl.onRoomState)
        CLIENTS['twitchchat'].on('usernotice', tl.onUserNotice)
        CLIENTS['twitchchat'].on('userstate', tl.onUserState)
        CLIENTS['twitchchat'].connect();
    }
}
let botclients = new BotClients;
botclients.twitchChat();