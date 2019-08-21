# kandy-cpaas2-sample-group-chat
Group chat app is used to create communication channel among multiple users via Chat APIs

### Group Chat

This app is used to create a communication between different participants on one group.

- Try the [demo](https://hclsampleapps.github.io/kandy-cpaas2-sample-group-chat/app)
- Try the [source code](https://github.com/hclsampleapps/kandy-cpaas2-sample-group-chat)

#### User Manual

1. create an account on **AT&T** portal via [Register now for a free account](https://apimarket.att.com/signup).
2. Open 2 instances of `index.html` in the browser for *User1* and *User2*.
3. Enter the *server URL*, for e.g.,
	- For AT&T API Marketplace [apimarket.att.com](https://apimarket.att.com), enter `https://oauth-cpaas.att.com`
4. Choose to get accessToken by *Password Grant* flow or *Client Credentials* flow.
5. Login using two different users' credentials in both the browser windows.
6. For **Password Grant** flow, enter 
	- *clientId* 
	- *emailId* 
	- *password*  
7. For **Client Credentials Grant** flow, enter
	- *privateKey*
	- *privateSecret*   
8. Click ***Login***
9. After successful login you will get an *accessToken* for *User1* and *User2*
10. Click "Subscribe" button in both the browser windows to create the webrtc channel.
11. Click "create Group" to create a group with n number of participants in it.
12. *User2* should be the same user which is included as a participant in a group created by *User1*.
13. Users can add new participants also in the existing group by clicking on "Add Participant".
14. Click on "Fetch Groups from Server" where user can get the list of all the groups created.
15. Click on "Get Groups" to get the number of groups created.
16. Click on "Get Group By ID" to get the group ID of recently created group.
17. Click on "Get Participants By GroupID" to get the list of all the participants present in the recent group.
18. Once *User2* has accepted the invite from *User1* by clicking on "Accept Invite", *User2* can also leave the group by clicking on "Leave GroupByID".
19. Click on "List Invitations" will get the list of all the invites sent by all the groups.
20. Click on "Reject Invite" will  reject the invitation received by group ID.
21. Click on "Delete GroupByID" will delete the current group from the list.
22. Click on "Fetch Conversations in a group" will fetch all the conversations being held within group members of particula group ID.
23. Once invite has been accepted, *User1* can initiate group chat by clicking on "createGroupChat", which creates a new conversation with the required participant.
24. After successful creation of group chat, *User1* can now send message which received at *User2* end, and can continue chat to and fro.


##### Notes

 - Existing user can confirm their account via [Log in to AT&T API Marketplace](https://apimarket.att.com/login)
 - You can download *kandy.js* from [Developer documentation - SDKs](https://apimarket.att.com/developer/sdks/javascript)


Then, open ```index.html``` in the browser to view the app.

#### Branching strategy

To learn about the branching strategy, contribution & coding conventions followed in the project, please refer [GitFlow based branching strategy for your project repository](https://gist.github.com/ribbon-abku/10d3fc1cff5c35a2df401196678e258a)
