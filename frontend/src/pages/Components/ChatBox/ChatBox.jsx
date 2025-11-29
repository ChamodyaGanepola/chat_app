import React, { useEffect, useRef } from "react";
import { format } from "timeago.js";
import "./ChatBox.css";

const ChatBox = ({ chat, currentUser, messages, userData }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current)
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    console.log(currentUser);
    console.log(messages);
  }, [messages]);

  const firstLetter = userData?.firstname
    ? userData.firstname.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="ChatBox-container">
      {chat ? (
        <>
          <div className="chat-header">
            <div className="follower">
              <div>
                <div
                  className="avatar-circle"
                  style={{
                    backgroundColor:
                      userData?.gender === "Male"
                        ? "#3498db"
                        : userData?.gender === "Female"
                        ? "#ff69b4"
                        : "#808080",
                  }}
                >
                  {firstLetter}
                </div>
                <div className="name">
                  {userData?.firstname} {userData?.lastname}
                </div>
              </div>
            </div>
            <hr style={{ width: "95%", border: "0.1px solid #ececec" }} />
          </div>
          <div className="chat-body" ref={containerRef}>
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={
                  msg.senderId === currentUser._id ? "message own" : "message"
                }
              >
                <span>{msg.text}</span>
                <span>{format(msg.createdAt)}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="chatbox-empty">
          <img src="/typingGIF.gif" alt="Typing animation" />
          <h3>No chat selected</h3>
          <p>Pick a conversation from the left panel to start messaging.</p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
