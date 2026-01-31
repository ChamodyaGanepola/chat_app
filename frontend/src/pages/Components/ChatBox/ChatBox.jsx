import React, { useEffect, useRef, useState } from "react";
import { format } from "timeago.js";
import InputEmoji from "react-input-emoji";
import "./ChatBox.css";
import { deleteMessage, editMessage } from "../../../api/MessageRequests";

const ChatBox = ({
  chat,
  currentUser,
  messages,
  userData,
  setMessages,
  updateLastMessage,
}) => {
  const containerRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDelete = async (msgId) => {
    try {
      await deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (msgId) => {
    if (!editingText.trim()) return;
    try {
      const res = await editMessage(msgId, editingText);
      const updatedMsg = { ...res.data };

      // Update messages in ChatBox
      setMessages((prev) =>
        prev.map((m) =>
          m._id === msgId ? { ...m, text: updatedMsg.text } : m,
        ),
      );

      // Update lastMessage in conversation (left panel)
      updateLastMessage(updatedMsg);

      setEditingId(null);
      setEditingText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="ChatBox-container">
      {chat ? (
        <>
          <div className="chat-header">
            <div className="follower">
              <div>
                <div
                  className="avatar-wrapper"
                  style={{ position: "relative" }}
                >
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
                    onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                  >
                    {userData?.firstname?.charAt(0).toUpperCase() || "?"}
                  </div>

                  {avatarMenuOpen && (
                    <div className="avatar-menu-card">
                      <div
                        className="menu-item"
                        onClick={() => alert("Add Friend clicked")}
                      >
                        Add
                      </div>
                      <div
                        className="menu-item"
                        onClick={() => alert("Block clicked")}
                      >
                        Block
                      </div>
                      <div
                        className="menu-item cancel"
                        onClick={() => setAvatarMenuOpen(false)}
                      >
                        Cancel
                      </div>
                    </div>
                  )}
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
                  msg.senderId === currentUser ? "message own" : "message"
                }
              >
                {editingId === msg._id ? (
                  <div className="edit-message-container">
                    <InputEmoji
                      value={editingText}
                      onChange={setEditingText}
                      autoFocus
                      cleanOnEnter={false}
                      onEnter={() => handleEdit(msg._id)}
                      placeholder="Edit message..."
                    />
                    <div className="edit-message-buttons">
                      <button
                        className="save-btn"
                        onClick={() => handleEdit(msg._id)}
                      >
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span>{msg.text}</span>
                    <span>{format(msg.createdAt)}</span>

                    {msg.senderId === currentUser && (
                      <div className="message-menu-container">
                        <span
                          className="three-dots"
                          onClick={() =>
                            setMenuOpenId(
                              menuOpenId === msg._id ? null : msg._id,
                            )
                          }
                        >
                          &#8942;
                        </span>
                        {menuOpenId === msg._id && (
                          <div className="message-actions-dropdown">
                            <div
                              onClick={() => {
                                setEditingId(msg._id);
                                setEditingText(msg.text);
                                setMenuOpenId(null);
                              }}
                            >
                              Edit
                            </div>
                            <div
                              onClick={() => {
                                handleDelete(msg._id);
                                setMenuOpenId(null);
                              }}
                            >
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
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
