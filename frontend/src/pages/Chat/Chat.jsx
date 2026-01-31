import React, { useRef, useState, useEffect } from "react";
import ChatBox from "../Components/ChatBox/ChatBox";
import Conversation from "../Components/Conversation/Conversation";
import NavIcons from "../Components/NavIcons/NavIcons";
import "./Chat.css";
import { userChats, createChat, findChat } from "../../api/ChatRequests";
import { getAllUser, getUser } from "../../api/UserRequest";
import { getMessages, addMessage } from "../../api/MessageRequests";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InputEmoji from "react-input-emoji";

const Chat = () => {
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);

  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [allUsers, setAllUsers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const imageRef = useRef();

  // ------------------- Fetch initial data -------------------
  useEffect(() => {
  const fetchInitialData = async () => {
    try {
      // 1️⃣ Fetch user chats
      const chatRes = await userChats(); 
      const chatsWithUserData = await Promise.all(
        chatRes.data.map(async (chat) => {
          const otherUserId = chat.members.find((id) => id !== user._id);
          const userRes = await getUser(otherUserId);
          return { ...chat, userData: userRes.data };
        }),
      );
      setChats(chatsWithUserData);

      // 2️⃣ Fetch all users for dropdown
      const usersRes = await getAllUser();
      setAllUsers(usersRes.data.filter(u => u._id !== user._id));
    } catch (err) {
      console.error(err);
    }
  };

  fetchInitialData();
}, [user._id]);


  // ------------------- Socket setup -------------------
  useEffect(() => {
    socket.current = io("https://chat-app-kali.onrender.com");
    socket.current.emit("new-user-add", user._id);

    socket.current.on("get-users", setOnlineUsers);

    socket.current.on("receive-message", (data) => setReceivedMessage(data));

    socket.current.on("create-chat", async (newChat) => {
      const otherUserId = newChat.members.find((id) => id !== user._id);
      const userRes = await getUser(otherUserId);

      setChats((prev) => [
        ...prev,
        { ...newChat, userData: userRes.data, lastMessage: null },
      ]);
    });

    return () => socket.current.disconnect();
  }, [user._id]);

  // ------------------- Real-time message handling -------------------
  useEffect(() => {
    if (!receivedMessage) return;

    // Add to messages if it's the current chat
    if (receivedMessage.chatId === currentChat?._id) {
      setMessages((prev) => [...prev, receivedMessage]);
    }

    // Update last message in left-side chat list
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === receivedMessage.chatId
          ? { ...chat, lastMessage: receivedMessage }
          : chat,
      ),
    );
  }, [receivedMessage, currentChat]);

  // ------------------- Window resize -------------------
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ------------------- Helpers -------------------
  const checkOnlineStatus = (chat) =>
    onlineUsers.some(
      (u) => u.userId === chat.members.find((m) => m !== user._id),
    );

  const handleChatClick = async (chat) => {
    setCurrentChat(chat);
    setIsChatOpen(true);

    const otherUserId = chat.members.find((id) => id !== user._id);

    try {
      const [msgRes, userRes] = await Promise.all([
        getMessages(chat._id),
        getUser(otherUserId),
      ]);
      setMessages(msgRes.data || []);
      setUserData(userRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUserSelect = async (selectedUserId) => {
    try {
      const existingChat = await findChat(selectedUserId);

      if (existingChat.data) {
        handleChatClick(existingChat.data);
      } else {
        const newChat = await createChat({ receiverId: selectedUserId });
        if (newChat.data) handleChatClick(newChat.data);
      }
      setIsDropdownVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !currentChat) return;

    const message = {
      senderId: user._id,
      text: newMessage,
      chatId: currentChat._id,
    };
    const receiverId = currentChat.members.find((id) => id !== user._id);

    setSendMessage({ ...message, receiverId });

    try {
      const res = await addMessage(message);

      setMessages((prev) => [...prev, res.data]);

      // Add chat to left-side list if not exists
      setChats((prevChats) => {
        const exists = prevChats.some((chat) => chat._id === currentChat._id);
        if (!exists)
          return [
            ...prevChats,
            { ...currentChat, lastMessage: res.data, userData },
          ];
        return prevChats.map((chat) =>
          chat._id === currentChat._id
            ? { ...chat, lastMessage: res.data }
            : chat,
        );
      });

      setNewMessage("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="Chat">
      {/* Left Side */}
      <div className={`Left-side-chat ${isChatOpen ? "hide" : ""}`}>
        <div className="Chat-container">
          <h2>Chats</h2>
          <div className="Chat-list">
            {chats.map((chat) => (
              <Conversation
                key={chat._id}
                data={chat}
                currentUser={user._id}
                online={checkOnlineStatus(chat)}
                setCurrentChat={handleChatClick}
                setChats={setChats} 
              />
            ))}
          </div>
        </div>
        <button
          className="plus-button"
          onClick={() => setIsDropdownVisible(!isDropdownVisible)}
        >
          +
        </button>
        {isDropdownVisible && (
          <div className="user-dropdown visible">
            {allUsers.map((u) => (
              <div
                key={u._id}
                className="dropdown-item"
                onClick={() => handleUserSelect(u._id)}
              >
                {u.firstname} {u.lastname}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className={`Right-side-chat ${isChatOpen ? "show" : ""}`}>
        <NavIcons />
        {isChatOpen && windowWidth <= 768 && (
          <button className="back-button" onClick={() => setIsChatOpen(false)}>
            <ArrowBackIcon />
          </button>
        )}

        {currentChat ? (
          <>
            <ChatBox
              chat={currentChat}
              currentUser={user._id}
              messages={messages}
              setMessages={setMessages}
              userData={userData}
              updateLastMessage={(updatedMessage) => {
                setChats((prev) =>
                  prev.map((chatItem) =>
                    chatItem._id === currentChat._id
                      ? { ...chatItem, lastMessage: updatedMessage }
                      : chatItem,
                  ),
                );
              }}
            />

            <div className="chat-sender">
              <div
                className="attach-btn"
                onClick={() => imageRef.current.click()}
              >
                +
              </div>
              <InputEmoji value={newMessage} onChange={setNewMessage} />
              <div className="send-button" onClick={handleSend}>
                Send
              </div>
              <input type="file" style={{ display: "none" }} ref={imageRef} />
            </div>
          </>
        ) : (
          <div className="chatbox-empty">
            <img
              src="/typingGIF.gif"
              alt="Typing"
              className="chatbox-empty-img"
            />
            <h3>No chat selected</h3>
            <p>Pick a conversation from the left panel to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
