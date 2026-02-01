import React, { useEffect, useRef, useState } from "react";
import { format } from "timeago.js";
import InputEmoji from "react-input-emoji";
import "./ChatBox.css";
import { deleteMessage, editMessage } from "../../../api/MessageRequests";
import { blockUser, unblockUser } from "../../../api/UserRequest";

import { updateBlockedUsers } from "../../../actions/AuthActions";

import { useSelector, useDispatch } from "react-redux";
const ChatBox = ({
  chat,
  messages,
  userData,
  setUserData,
  setMessages,
  updateLastMessage,
  newMessage,
  setNewMessage,
  onSend,
}) => {
  const containerRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const currentUser = useSelector((state) => state.authReducer.authData?.user);
  const dispatch = useDispatch();
  const blockedByMe =
    currentUser?.blockedUsers?.includes(userData?._id) ?? false;
  const blockedMe = userData?.blockedUsers?.includes(currentUser?._id) ?? false;
  const isChatBlocked = blockedByMe || blockedMe;

  const handleBlock = async () => {
    try {
      const res = await blockUser(userData._id);
      dispatch(updateBlockedUsers(res.data.blockedUsers));
      setAvatarMenuOpen(false); // close menu
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnblock = async () => {
    try {
      const res = await unblockUser(userData._id);
      dispatch(updateBlockedUsers(res.data.blockedUsers));
      setAvatarMenuOpen(false); // close menu
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDelete = async (msgId) => {
    if (isChatBlocked) return;
    try {
      await deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (msgId) => {
    if (isChatBlocked) return;
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
                      {!blockedByMe ? (
                        <div className="menu-item" onClick={handleBlock}>
                          Block
                        </div>
                      ) : (
                        <div className="menu-item" onClick={handleUnblock}>
                          Unblock
                        </div>
                      )}

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

                    {msg.senderId === currentUser && !isChatBlocked && (
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
          {/* Chat sender */}
          <div className="chat-sender">
            {isChatBlocked ? (
              <div className="blocked-info">
                {blockedByMe
                  ? "You blocked this user. Unblock to send messages."
                  : "You are blocked by this user. You cannot send messages."}
              </div>
            ) : (
              <>
                <InputEmoji
                  value={newMessage}
                  onChange={setNewMessage}
                  placeholder="Type a message..."
                />
                <div className="send-button" onClick={onSend}>
                  Send
                </div>
              </>
            )}
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
