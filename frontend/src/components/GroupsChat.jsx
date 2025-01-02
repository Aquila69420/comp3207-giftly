// src/components/GroupsChat.jsx
import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window
} from 'stream-chat-react';
import 'stream-chat-react/dist/css/v2/index.css';
import 'stream-chat-react/dist/css/v2/index.layout.css';

/**
 * GroupsChat component:
 * 
 * Props:
 *  - userID (string)     : The ID of the current user
 *  - username (string)   : The username of the current user
 *  - group (object)      : The active group object (with .chatChannelID)
 *  - division (object)   : The active division object (with .chatChannelID)
 *    (You can pass one or the other, or code logic to pick which is active.)
 *
 * Usage:
 *   <GroupsChat
 *      userID={currentUserID}
 *      username={currentUsername}
 *      group={activeGroup}
 *      division={activeDivision}
 *   />
 */
const GroupsChat = ({ userID, username, group, division }) => {
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  // If you only care about group OR division, pick whichever has a chatChannelID
  // e.g. group?.chatChannelID || division?.chatChannelID
  const chatChannelID = group?.chatChannelID;
  useEffect(() => {
    if (!userID) return;   // No user, skip
    if (!chatChannelID) return; // No channel, skip

    let didCancel = false;
    const streamKey = '5cs3zw7bzvyk';  // from your environment/config

    const initChat = async () => {
      try {
        setLoading(true);

        // 1) Get a token from your backend
        //    (Your endpoint: http://localhost:5000/get_token)
        const res = await fetch('http://localhost:5000/get_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userID, username }),
        });
        const data = await res.json();

        if (!data.result) {
          console.error('Error fetching token:', data.msg);
          setLoading(false);
          return;
        } else {
          console.log('Token fetched:', data.token);
        }
        const token = data.token; // from your backend

        // 2) Create the Stream chat client
        const client = StreamChat.getInstance(streamKey);
        
        // 3) Connect the user with the retrieved token
        await client.connectUser(
          {
            id: userID,
            name: username,
            // you can add more fields if needed
          },
          token
        );

        if (didCancel) return; // if component unmounted

        // 4) Fetch / watch the correct channel
        const newChannel = client.channel('messaging', chatChannelID);
        await newChannel.watch();

        if (didCancel) {
          // Clean up if unmounted
          client.disconnectUser();
          return;
        }

        setChatClient(client);
        setChannel(newChannel);
      } catch (err) {
        console.error('Error initializing chat:', err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      didCancel = true;
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
    // eslint-disable-next-line
  }, [userID, chatChannelID]);

  if (!chatChannelID) {
    return <div style={{ padding: '1rem' }}>No chat channel found.</div>;
  }

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading chat...</div>;
  }

  if (!chatClient || !channel) {
    return <div style={{ padding: '1rem' }}>Connecting to chat...</div>;
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <Window>
            {/* A typical stream-chat layout: header, messages, input */}
            <ChannelHeader />
            <MessageList />
            <MessageInput />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default GroupsChat;
