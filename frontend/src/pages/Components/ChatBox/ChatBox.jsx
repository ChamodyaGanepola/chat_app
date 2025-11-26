import React, { useEffect, useState } from "react";
import { useRef } from "react";
import {
  addMessage,
  getMessages,
  readMessage,
} from "../../../api/MessageRequests";
import { getUser } from "../../../api/UserRequest";
import "./ChatBox.css";
import { format } from "timeago.js";
import InputEmoji from "react-input-emoji";

const ChatBox = ({ chat, currentUser, setSendMessage, receivedMessage }) => {
  // Store the other user’s data (chat partner)
  const [userData, setUserData] = useState(null);
  // Store all messages of this chat
  const [messages, setMessages] = useState([]);
  // Store the message being typed
  const [newMessage, setNewMessage] = useState("");
  // Scroll reference to keep chat always at bottom
  const containerRef = useRef(null);     // the scrollable container (.chat-body)
  const messagesEndRef = useRef(null);   // anchor at the end of messages
  const imageRef = useRef();

  // Update newMessage when user types
  const handleChange = (newMessage) => {
    setNewMessage(newMessage);
  };

  //   Fetch chat partner’s user data for the header
  useEffect(() => {
    const userId = chat?.members?.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat !== null) getUserData();
  }, [chat, currentUser]);

  // Fetch all messages for the chat when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await getMessages(chat._id);
        console.log("Fetched messages:", data);
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    };

    if (chat !== null) fetchMessages();

    const markAsRead = async () => {
      if (chat) {
        try {
          //await readMessage(chat._id);
        } catch (err) {
          console.log(err);
        }
      }
    };
    markAsRead();
  }, [chat]);

  // Always scroll to last Message whenever messages update
useEffect(() => {
  // ensure DOM updated first
  requestAnimationFrame(() => {
    const container = containerRef.current;
    if (container) {
      // jump to bottom — keep UI stable; use smooth optionally
      container.scrollTop = container.scrollHeight;
    }
  });
}, [messages, chat]); // run when messages or chat changes

  // Send Message handling
  const handleSend = async (e) => {
    e.preventDefault();
    const message = {
      senderId: currentUser,
      text: newMessage,
      chatId: chat._id,
    };
    // Find receiver (the other user in the chat)
    const receiverId = chat.members.find((id) => id !== currentUser);
    // send message to socket server
    setSendMessage({ ...message, receiverId });
    // send message to database
    try {
      const { data } = await addMessage(message);
      setMessages([...messages, data]);
      // Clear input field
      setNewMessage("");
    } catch {
      console.log("error");
    }
  };

  //  Append new real-time message to chat if it belongs to current chat
  useEffect(() => {
    console.log("Message Arrived: ", receivedMessage);
    if (receivedMessage !== null && receivedMessage.chatId === chat._id) {
      setMessages((prevMessages) => [...prevMessages, receivedMessage]); // Appending the received message to the previous messages
    }
  }, [receivedMessage]); // Only depend on receivedMessage

  // Get first letter of user’s firstname for avatar
  const firstLetter = userData?.firstname
    ? userData.firstname.charAt(0).toUpperCase()
    : "?";

  return (
    <>
      <div className="ChatBox-container">
        {chat ? (
          <>
            {/* chat-header */}
            <div className="chat-header">
              <div className="follower">
                <div>
                  <div
                    className="avatar-circle"
                    style={{
                      backgroundColor:
                        userData?.gender === "Male"
                          ? "#3498db" // blue for male
                          : userData?.gender === "Female"
                          ? "#ff69b4" // pink for female
                          : "#808080", // gray for other/undefined
                    }}
                  >
                    <span className="avatar-text">{firstLetter}</span>
                  </div>
                  <div className="name" style={{ fontSize: "0.9rem" }}>
                    <span>
                      {userData?.firstname} {userData?.lastname}
                    </span>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  width: "95%",
                  border: "0.1px solid #ececec",
                  marginTop: "20px",
                }}
              />
            </div>
            {/* chat-body */}
            <div className="chat-body" ref={containerRef}>
              {messages.slice(-5).map((message) => (
                  <div
                    key={message._id}
                    className={
                      message.senderId === currentUser
                        ? "message own"
                        : "message"
                    }
                  >
                    <span>{message.text}</span>{" "}
                    <span>{format(message.createdAt)}</span>
                  </div>
              ))}
               <div ref={messagesEndRef} />
            </div>
            {/* chat-sender */}
            <div className="chat-sender">
              <div onClick={() => imageRef.current.click()}>+</div>
              <InputEmoji value={newMessage} onChange={handleChange} />
              <div className="send-button button" onClick={handleSend}>
                Send
              </div>
              <input
                type="file"
                name=""
                id=""
                style={{ display: "none" }}
                ref={imageRef}
              />
            </div>{" "}
          </>
        ) : (
          <div className="chatbox-empty">
            <img
              src="/typingGIF.gif" // Place your GIF in the public folder
              alt="Typing boy animation"
              className="chatbox-empty-img"
            />
            <h3 className="chatbox-empty-title">No chat selected</h3>
            <p className="chatbox-empty-text">
              Pick a conversation from the left panel to start messaging.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatBox;
