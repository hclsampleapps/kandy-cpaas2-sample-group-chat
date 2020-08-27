var changeView;
var showhideView;
var serverBase;
var mHostUrl;
var client;
var currentConvo
var myGroup;
var invitedToGroup;
const tokenAPI = '/cpaas/auth/v1/token'

// We will only track one group in this demo (even though multiple ones will
// be created on server side if you hit Create button with different names).
var group_ID

// From the start, nobody is administrator until someone first creates a group.
var adminUser = false

var adminActionsAdded = false

whenReady(function() {
    Notification.initialize();
    changeView = new ChangeView();
    changeView.showPasswordGrant();
});

class Notification {
    static initialize(el) {
        this.container = document.querySelector('.notification');
        this.close = document.querySelector('.notification .close');
        this.close.addEventListener('click', e => this.container.classList.add('hide'));
    }
}

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

    client.on('subscription:change', function() {

        if (
            client.services.getSubscriptions().isPending === false &&
            client.services.getSubscriptions().subscribed.length > 0
        ) {
            log('Successfully subscribed')
        }
    })

    client.on('subscription:error', function() {
        log('Unable to subscribe')
    })

    client.on('messages:new', function(convo) {
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

    // Listen for changes in group-related activities (e.g. group has been created).
    client.on('group:new', function(params) {
        const groupNameTxt = document.getElementById('groupname').value
        console.log("Params calue", params);

        if (params.error) {
            log('Failed to create the group with name: ' + groupNameTxt +
                '. Code is: ' + params.error.error.code +
                '. Error is: ' + params.error.error.message)
        } else {
            log('Successfully created the group with name: ' + groupNameTxt +
                '. Its generated ID is: ' + params.id);
        }

        // Save the group ID to be used later, by the administrator
        group_ID = params.id

        // Add the admin actions but only ONCE no matter how many groups this  user creates.
        if (adminUser && group_ID && !adminActionsAdded) {
            //allowAddingAParticipant()

            //allowRemovingAParticipant()

            // We got a valid group ID and this user is the administrator, so allow the user to delete group later on..
            //allowUserToDeleteGroup()

            adminActionsAdded = true
        }
    })

    // Listen for an incoming invitation for a particular group ID
    client.on('group:invitation_received', function(params) {
        log('Automatically accepting invitation to joining group whose Id is: ' + params.invitation.id + ' whose name is: ' + params.invitation.name)
        // For the purpose of making this example more simple, we'l just
        // automatically send an accept answer to any of the invitations.
        client.groups.acceptInvitation(params.invitation.id);

        // Save group ID for later, in case this non-admin user decides to leave the group.
        group_ID = params.invitation.id

        if (!adminUser && group_ID) {
            // It means this is the context in which a non-admin user is running.
            // So display the 'leave button'.
            // The 'Leave group' button should be hidden for the admin user, because
            // admin user cannot just leave a group (without deleting it).
            //allowUserToLeaveGroup()
        }
    })

    client.on('group:change', function(params) {
        if (!params.id) {
            log('WARNING: No groupId for group:change event. Ignoring this notification...')
            return
        }
        log('Received a group:change event for groupId: ' + params.id)
        //refreshParticipantsList(params.groupId)
    })

    client.on('group:error', function(params) {
        if (!params.error) {
            return
        }
        log('Encountered a group related error: ' + params.error.toString())
    })

    /*client.on('group:invitation_received', function (grou) {
        console.log(grou)
        console.log(grou.invitation.groupId)
        log('Being invited to join: ' + grou.invitation.groupId + "..participant: " + grou.invitation.participant[0].address + "..status: " + grou.invitation.participant[0].status)
        // invitedToGroup = myGroup
        invitedToGroup = grou.invitation.groupId;
        myGroup = invitedToGroup;
        console.log('invitedToGroup ---- ', invitedToGroup)
    })*/

    client.on('group:invitation_changed', function(grou) {
        console.log(grou);
        console.log('grou for invitation_changed : ', grou)
        log('Accepted/rejected the invite: ' + grou.groupId + "..participant: " + grou.group.participant + "..status: " + grou.group.status)
    })

    client.on('group:delete', function(grou) {
        console.log(JSON.stringify(grou))
        log('Group ' + myGroup + ' has been deleted')
    })

    client.on('messages:change', function(convo) {
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
    client.on('conversations:change', function(convos) {
        log('New conversation')
        console.log(convos)
        // If we don't have a current conversation, assign the new one and render it.
        if (!currentConvo && convos.length !== 0) {
            currentConvo = client.conversation.get(convos.destination[0], { type: convos.type })
            renderLatestMessage(currentConvo)
        }
    })

    client.on('group:refresh', function(params) {
        // Note: it is expected that 'params' is an empty object.
        if (!group_ID) {
            log('Could not refresh the participants list. No current group ID set.')
            return
        }
        log('Received a group:refresh event. Refreshing the list of outstanding participants associated with current group id:' + group_ID)

        //refreshParticipantsList(group_ID)
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

// Create a new group.
function createGroup() {
    const groupNameTxt = document.getElementById('groupname').value
    const subjectTxt = document.getElementById('subname').value
    const participantsTxt = document.getElementById('participant1').value

    // subject text is optional
    let params = subjectTxt ? { subject: subjectTxt, name: groupNameTxt, type: 'closed' } : { name: groupNameTxt, type: 'closed' }

    // participants (other then admin user) are also optional
    if (participantsTxt) {
        let listOfParticipants = participantsTxt.split(',')
        let participants = []
        listOfParticipants.forEach(function(item) {
            participants.push({ 'address': item })
        })
        params['participants'] = participants
    }
    // Pass in the above parameters. This is an asynchronous request
    // (i.e. result will be obtained through a callback listening for the 'group:new' event)
    client.groups.create(params)

    // Who ever hit the Create button becomes administrator user of the group, automatically.
    adminUser = true
}

function addParticipant() {
    console.log(group_ID)
    let participant3 = document.getElementById('participant3').value;
    client.groups.addParticipant(group_ID, participant3)
    log('Add participant: ' + group_ID)
}

function removeParticipant() {
    let removeParticipant = document.getElementById('participant4').value;
    client.groups.removeParticipant(group_ID, removeParticipant)
    log('Remove participant: ' + group_ID)
}

function fetchGroupsFromServer() {
    client.groups.fetch()
    log('Fetched groups from server')
}

function getGroups() {
    var groupArray = client.groups.getAll()
    console.log("dump groupArray")
    log('Got groups: ' + JSON.stringify(groupArray));
    groupArray.forEach(function(item, index, array) {
        console.log(item, index)
    })
}

function getGroupById() {
    console.log("dump group by groupId")
    var groupInfo = client.groups.get(group_ID)
    log('Got group by Id: ' + group_ID + ".." + '\n' + JSON.stringify(groupInfo) + '\n')
    console.log(groupInfo)
}

function getPartiByGroupById() {
    console.log("dump Participants by groupId")
    var partiArray = client.groups.getParticipants(group_ID)
    console.log(partiArray)
    log('Got participant by GroupId: ' + group_ID)
    partiArray.forEach(function(item, index, array) {
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
    log('Got list of Invites ' + JSON.stringify(inviteArray))
    inviteArray.forEach(function(item, index, array) {
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
    client.groups.delete(group_ID)
    log('Deleting group: ' + group_ID)
}

function fetchConvosInGroup() {
    client.conversation.fetch()
    var conversations = client.conversation.getAll()
    // var conversation = client.conversation.get(myGroup.groupId, { type: 'group' })
    console.log(conversations)
    log('Fetching Conversations in group ' + JSON.stringify(conversations));
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
    console.log('myGroup : ', group_ID)
    currentConvo = client.conversation.create(group_ID, { type: 'chat-group' })

    log('Group Conversation created with: ' + group_ID)
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
