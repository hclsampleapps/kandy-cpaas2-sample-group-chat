var changeView;
var showhideView;
var serverBase;
var mHostUrl;
var client;
var currentConvo
var myGroup;
var invitedToGroup;
const tokenAPI = '/cpaas/auth/v1/token'

whenReady(function () {
    changeView = new ChangeView();
    changeView.showPasswordGrant();
});

class ChangeView {
    constructor() {
        this.accountPasswordGrantView = document.getElementById('passwordID');
        this.accountClientCredentialsView = document.getElementById('clientCredID');

        this.accountPasswordGrantradio = document.getElementById('passwordGrant');
        this.accountPasswordGrantradio.addEventListener('click', (evt) => this.showPasswordGrant(evt));

        this.accountClientCredentialsradio = document.getElementById('clientCred');
        this.accountClientCredentialsradio.addEventListener('click', (evt) => this.showClientCredentials(evt));
    }

    showPasswordGrant() {
        Effect.hide(this.accountClientCredentialsView);
        Effect.show(this.accountPasswordGrantView);
    }

    showClientCredentials() {
        Effect.show(this.accountClientCredentialsView);
        Effect.hide(this.accountPasswordGrantView);
    }
}

function initClient() {
    let mServerUrl = document.getElementById("serverUrl").value;
    mHostUrl = new URL(mServerUrl).host;
    console.log(mHostUrl);
    client = Kandy.create({
        subscription: {
            expires: 3600
        },
        // Required: Server connection configs.
        authentication: {
            server: {
                base: mHostUrl
            },
            clientCorrelator: 'sampleCorrelator'
        }
    })
    console.log('client ---> ', client)

    /*
     * Listen for new messages sent or received.
     * This event occurs when a new message is added to a conversation.
     */
    // client.on('messages:change', function(convo) {
    //     const destination = convo.destination[0]
    //     log('New message in conversation with ' + destination)

    //     if (!currentConvo && ['im', 'chat', 'sms'].includes(convo.type)) {
    //         currentConvo = client.conversation.get(destination, { type: convo.type })
    //     }

    //     // If the message is in the current conversation, render it.
    //     if (currentConvo.destination[0] === destination) {
    //         renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))
    //     }
    // })

    /*
     * Listen for a change in the list of conversations.
     * In our case, it will occur when we receive a message from a user that
     * we do not have a conversation created with.
     */
    // client.on('conversations:change', function(convos) {
    //     log('New conversation')

    //     // If we don't have a current conversation, assign the new one and render it.
    //     if (!currentConvo && convos.length !== 0) {
    //         currentConvo = client.conversation.get(convos[0].destination, { type: convos[0].type })
    //         renderLatestMessage(currentConvo)
    //     }
    // })

    client.on('subscription:change', function () {

        if (
            client.services.getSubscriptions().isPending === false &&
            client.services.getSubscriptions().subscribed.length > 0
        ) {
            log('Successfully subscribed')
        }
    })

    client.on('subscription:error', function () {
        log('Unable to subscribe')
    })

    client.on('messages:new', function (convo) {
        const destination = convo.destination[0]
        log('New message in conversation with ' + destination)

        if (!currentConvo && ['im', 'chat', 'sms', 'group'].includes(convo.type)) {
            currentConvo = client.conversation.get(destination, { type: convo.type })
        }

        // If the message is in the current conversation, render it.
        if (currentConvo.destination[0] === destination) {
            renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))
        }
    })

    client.on('group:new', function (grou) {
        // for (let [key, value] of Object.entries(grou.group)) {
        //     console.log(`${key}: ${value}`);
        // }
        myGroup = grou.groupId;
        console.log(myGroup);
        // var groupIdent = myGroup.groupId
        // console.log("id:" + groupIdent)
        // var parInfo = myGroup.participant
        // console.log("partic Info:")
        // parInfo.forEach(function (item, index, array) {
        //     console.log(item, index);
        // });
        console.log(JSON.stringify(grou))
        log('Group created: ' + myGroup)
    })

    client.on('group:change', function (grou) {
        /**console.log("changed group");
        var groupIdent1 = grou.group.groupId
        console.log("changed:" +groupIdent1)
      var  parInfo1 = grou.group.participant
        console.log("changed partic1:")  
        parInfo1.forEach(function(item, index, array) {
        console.log(item, index);
        });
        log('Group updated: '+myGroup.groupId)**/
        console.log(myGroup)
        console.log(grou)
        console.log("changed group " + myGroup)
        log('Group created/changed: ' + myGroup)
    })

    client.on('group:invitation_received', function (grou) {
        console.log(grou)
        console.log(grou.invitation.groupId)
        log('Being invited to join: ' + grou.invitation.groupId + "..participant: " + grou.invitation.participant[0].address + "..status: " + grou.invitation.participant[0].status)
        // invitedToGroup = myGroup
        invitedToGroup = grou.invitation.groupId;
        console.log('invitedToGroup ---- ', invitedToGroup)
    })

    client.on('group:invitation_changed', function (grou) {
        console.log(grou);
        console.log('grou for invitation_changed : ', grou)
        log('Accepted/rejected the invite: ' + grou.groupId + "..participant: " + grou.group.participant + "..status: " + grou.group.status)
    })

    client.on('group:delete', function (grou) {
        console.log(JSON.stringify(grou))
        log('Group ' + myGroup + ' has been deleted')
    })

    client.on('messages:change', function (convo) {
        const destination = convo.destination[0]
        log('New message in conversation with ' + destination)

        if (!currentConvo && ['im', 'chat', 'sms', 'group'].includes(convo.type)) {
            currentConvo = client.conversation.get(destination, { type: convo.type })
        }

        // If the message is in the current conversation, render it.
        if (currentConvo.destination[0] === destination) {
            renderLatestMessage(client.conversation.get(currentConvo.destination, { type: convo.type }))
        }
    })

    /*
 * Listen for a change in the list of conversations.
 * In our case, it will occur when we receive a message from a user that
 * we do not have a conversation created with.
 */
    client.on('conversations:change', function (convos) {
        log('New conversation')
        console.log(convos)
        // If we don't have a current conversation, assign the new one and render it.
        if (!currentConvo && convos.length !== 0) {
            currentConvo = client.conversation.get(convos.destination[0], { type: convos.type })
            renderLatestMessage(currentConvo)
        }
    })
}

/**
 * Creates a form body from an dictionary
 */
function createFormBody(paramsObject) {
    const keyValuePairs = Object.entries(paramsObject).map(
        ([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value)
    )
    return keyValuePairs.join('&')
}

/**
 * Gets the tokens necessary for authentication to CPaaS
 */
async function getTokensByPasswordGrant({
    clientId,
    username,
    password
}) {
    const cpaasAuthUrl = constructServerUrl();
    const formBody = createFormBody({
        client_id: clientId,
        username,
        password,
        grant_type: 'password',
        scope: 'openid'
    })
    // POST a request to create a new authentication access token.
    const fetchResult = await fetch(cpaasAuthUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
    })
    // Parse the result of the fetch as a JSON format.
    const data = await fetchResult.json()
    return {
        accessToken: data.access_token,
        idToken: data.id_token
    }
}

async function loginByPasswordGrant() {
    initClient();
    const smsFrom = document.getElementById('sms-number-from').value
    const clientId = document.getElementById('clientId').value
    const userEmail = document.getElementById('userEmail').value
    const password = document.getElementById('password').value


    if (validateE164format(smsFrom)) {
        try {
            client.updateConfig({ messaging: { smsFrom } })
            const tokens = await getTokensByPasswordGrant({
                clientId,
                username: userEmail,
                password
            })

            log('Successfully logged in as ' + userEmail)

            client.setTokens(tokens)
        } catch (error) {
            log('Error: Failed to get authentication tokens. Error: ' + error)
        }
    } else {
        log('Phone number not in E164 format.')
    }

}

async function getTokensByClientCredGrant({
    client_id,
    client_secret
}) {

    const cpaasAuthUrl = constructServerUrl();
    const formBody = createFormBody({
        client_id,
        client_secret,
        grant_type: 'client_credentials',
        scope: 'openid regular_call'
    })

    // POST a request to create a new authentication access token.
    const fetchResult = await fetch(cpaasAuthUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
    })
    // Parse the result of the fetch as a JSON format.
    const data = await fetchResult.json();

    return {
        accessToken: data.access_token,
        idToken: data.id_token
    }
}

async function loginByClientCred() {
    initClient();
    const privateKey = document.getElementById('privateKey').value
    const privateSecret = document.getElementById('privateSecret').value

    try {
        const tokens = await getTokensByClientCredGrant({
            client_id: privateKey,
            client_secret: privateSecret
        })
        client.setTokens(tokens)
        log('Successfully logged in with project User ' + privateKey)
    } catch (error) {
        log('Error: Failed to get authentication tokens. Error: ' + error)
    }
}

function constructServerUrl() {
    let cpaasUrl;
    let enteredBaseUrl = document.getElementById("serverUrl").value
    if (enteredBaseUrl.trim() !== "") {
        serverBase = enteredBaseUrl.trim()
    }
    cpaasUrl = serverBase + tokenAPI
    return cpaasUrl;
}

function validateE164format(phoneNumber) {
    const regex = /^\++?[1-9]\d{1,14}$/
    return regex.test(phoneNumber)
}


function subscribe() {
    const services = ['chat']
    const subscriptionType = 'websocket'
    client.services.subscribe(services, subscriptionType)

}


// Utility function for appending messages to the message div.
function log(message) {
    console.log(message);
    document.getElementById('terminal').innerHTML += '<p>' + message + '</p>';
}

function createGroup() {
    var parArray = [{ "address": "hcaidiocpaas1@hcaidio.ysxe.att.com" },
    { "address": "hcaidiocpaas2@hcaidio.ysxe.att.com" },
    { "address": "hcaidiocpaas3@hcaidio.ysxe.att.com" },
    { "address": "hcaidiocpaas4@hcaidio.ysxe.att.com" },
    { "address": "hcaidiocpaas5@hcaidio.ysxe.att.com" },
    { "address": "hcaidiocpaas6@hcaidio.ysxe.att.com" }];
    // { "address": "hcaidiocpaas7@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas8@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas9@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas10@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas11@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas12@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas13@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas14@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas52@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas16@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas17@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas18@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas19@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas20@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas21@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas22@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas23@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas24@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas25@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas53@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas27@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas28@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas29@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas30@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas31@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas32@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas33@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas34@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas35@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas36@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas37@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas38@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas39@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas40@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas41@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas42@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas43@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas44@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas45@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas46@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas47@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas49@hcaidio.ysxe.att.com" },
    // { "address": "hcaidiocpaas50@hcaidio.ysxe.att.com" }];

    var params = {
        "participants": parArray,
        "subject": "group100",
        "name": "Group100",
        "image": "empty",
        "type": "closed"
    }

    client.groups.create(params)
}

function addParticipant() {
    console.log(myGroup)
    // client.groups.addParticipant(myGroup.groupId, "ramasafariapp@ramasafariappbus.3qdl.att.com")
    client.groups.addParticipant(myGroup, "hcaidiocpaas16@hcaidio.ysxe.att.com")
    log('Add participant: ' + myGroup)
}

function removeParticipant() {
    client.groups.removeParticipant(myGroup, "hcaidiocpaas5@hcaidio.ysxe.att.com")
    log('Remove participant: ' + myGroup)
}

function fetchGroupsFromServer() {
    client.groups.fetch()
    log('Fetched groups from server')
}

function getGroups() {
    var groupArray = client.groups.getAll()
    console.log("dump groupArray")
    log('Got groups: ' + groupArray.length)
    groupArray.forEach(function (item, index, array) {
        console.log(item, index)
    })

}

function getGroupById() {
    console.log("dump group by groupId")
    var groupInfo = client.groups.get(myGroup)
    log('Got group by Id: ' + myGroup + ".." + '\n' + JSON.stringify(groupInfo) + '\n')
    console.log(groupInfo)
}

function getPartiByGroupById() {
    console.log("dump Participants by groupId")
    var partiArray = client.groups.getParticipants(myGroup)
    console.log(partiArray)
    log('Got participant by GroupId: ' + myGroup)
    partiArray.forEach(function (item, index, array) {
        console.log(item, index)
    })
}

function leaveGroupById() {
    console.log(invitedToGroup)
    client.groups.leave(invitedToGroup)
    // client.groups.leave(myGroup)
    log('Leaving group: ' + invitedToGroup)
    // log('Leaving group: ' + myGroup)
}

function getInvites() {
    var inviteArray = client.groups.getInvitations()
    log('Got list of Invites')
    inviteArray.forEach(function (item, index, array) {
        console.log(item, index)
    })
}

function acceptInvite() {
    client.groups.acceptInvitation(invitedToGroup)
    log('Accept Invitation from: ' + invitedToGroup)
}

function rejectInvite() {
    client.groups.rejectInvitation(invitedToGroup)
    log('Reject Invitation from: ' + invitedToGroup)
}

function deleteGroupById() {
    client.groups.delete(myGroup)
    log('Deleting group: ' + myGroup)
}

function fetchConvosInGroup() {
    //  client.conversation.fetch(type='group')
    //client.conversation.fetchMessages(100)
    /**Try 1
    client.conversation.fetch()
    var conversations = client.conversation.getAll()
    console.log("messages retrieved:")
    console.log(conversations)
    console.log('testing fetchMessages'+ conversations[0].messages.length)

    //conversations[0].fetchMessages(100)

    conversations.forEach(function(item, index, array) {  
    console.log(item, index);
    });

    for(var i=0; i<conversations.length; i++)
      console.log('printing conversations ' +i + ' '+conversations.length )
      console.log(conversations[i].fetchMessages(100))
      **/
    // Try 2 
    client.conversation.fetch()
    var conversations = client.conversation.getAll()
    // var conversation = client.conversation.get(myGroup.groupId, { type: 'group' })
    console.log(conversations)
    // conversations[0].fetchMessages(100)
    //var messageArray = conversation.getMessages()
    //console.log(messageArray.length)
    //for(var i=0; i< messageArray.length; i++){
    //console.log(messageArray[i])
    //} 
    // Try 3 
    /**
    //client.conversation.fetch()
    var conversations = client.conversation.getAll()
    console.log("messages retrieved:")
    console.log(conversations)
    console.log('retrieve messsages in this groupchat conversation'+ conversations[0].messages.length)    
    for (var i = 0; i < conversations.length; i++) {
    var mess = conversations[i].messages
      if(mess instanceof Array){
          for (var j = 0; j < mess.length; j++) {
              var indMess = mess[j];
              var part = indMess.parts
              if(part instanceof Array){
                  for (var k = 0; k < part.length; k++) {
                      var message = part[k].text
                      console.log(indMess.sender + ": " +message)
                      }
                  }
              }
          }
      } 
    console.log('retrieve messsages in this groupchat conversation finished')
    **/
    log('Fetching Conversations in group')
}


function printArray(array) {
    for (var i = 0; i < array.length; i++) {
        var v = array[i];
        if (v instanceof Array) {
            printArray(v);
        } else {
            console.log(v);
        }
    }
}

// Create a new conversation with another user.
function createConvo() {
    // Pass in the SIP address of a user to create a conversation with them.
    console.log('myGroup : ', myGroup)
    currentConvo = client.conversation.create(myGroup, { type: 'chat-group' })

    log('Group Conversation created with: ' + myGroup)
}

// Create and send a message to the current conversation.
function sendMessage() {
    if (currentConvo) {
        var text = document.getElementById('message-text').value

        // Create the message object, passing in the text for the message.
        var message = currentConvo.createMessage(text)

        // Send the message!
        message.send()
    } else {
        log('No current conversation to send message to.')
    }
}



// Display the latest message in the provided conversation.
function renderLatestMessage(convo) {
    // Retrieve the latest message from the conversation.
    var messages = convo.getMessages()
    var message = messages[messages.length - 1]

    // Construct the text of the message.
    var text = message.sender + ': ' + message.parts[0].text

    // Display the message.
    var convoDiv = document.getElementById('convo-messages')
    convoDiv.innerHTML += '<div>' + text + '</div>'
}

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}