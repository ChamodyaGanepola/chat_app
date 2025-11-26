import React, { useRef, useState, useEffect } from "react";
import ChatBox from "../Components/ChatBox/ChatBox";
import Conversation from "../Components/Conversation/Conversation";
import NavIcons from "../Components/NavIcons/NavIcons";
import "./Chat.css";
import { userChats, createChat, findChat } from "../../api/ChatRequests";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getAllUser } from "../../api/UserRequest";
import InputEmoji from "react-input-emoji";

const Chat = () => {
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);

  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [allUsers, setAllUsers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [newMessage, setNewMessage] = useState(""); // message input
  const imageRef = useRef();

  // Fetch chats
  useEffect(() => {
    const getChats = async () => {
      try {
        const { data } = await userChats(user._id);
        setChats(data);
      } catch (error) {
        console.log(error);
      }
    };
    getChats();
  }, [user._id]);

  // Fetch all users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUser();
        setAllUsers(response.data.filter((u) => u._id !== user._id));
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, [user._id]);

  // Socket connection
  useEffect(() => {
    socket.current = io("ws://localhost:5000");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("get-users", (users) => setOnlineUsers(users));
    socket.current.on("create-chat", (newChat) => setChats(prev => [...prev, newChat]));
  }, [user]);

  // Send message via socket
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  // Receive message from socket
  useEffect(() => {
    socket.current.on("receive-message", (data) => setReceivedMessage(data));
  }, []);

  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((m) => m !== user._id);
    return onlineUsers.some((u) => u.userId === chatMember);
  };

  const handleResize = () => setWindowWidth(window.innerWidth);
  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleUserSelect = async (selectedUserId) => {
    try {
      const existingChat = await findChat(user._id, selectedUserId);
      if (existingChat.data) setCurrentChat(existingChat.data);
      else {
        const newChat = await createChat({ senderId: user._id, receiverId: selectedUserId });
        if (newChat.data) setCurrentChat(newChat.data);
      }
      setIsChatOpen(true);
      setIsDropdownVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const message = {
      senderId: user._id,
      text: newMessage,
      chatId: currentChat._id,
    };
    const receiverId = currentChat.members.find((id) => id !== user._id);
    setSendMessage({ ...message, receiverId });
    setNewMessage("");
  };

  return (
    <div className="Chat">
      {/* Left Side */}
      <div className={`Left-side-chat ${isChatOpen ? "hide" : ""}`}>
        <div className="Chat-container">
          <h2>Chats</h2>
          <div className="Chat-list">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => setCurrentChat(chat) || setIsChatOpen(true)}
                className="conversation"
              >
                <Conversation
                  data={chat}
                  currentUser={user._id}
                  online={checkOnlineStatus(chat)}
                  setCurrentChat={setCurrentChat}
                />
              </div>
            ))}
          </div>
        </div>
        <button className="plus-button" onClick={toggleDropdown}>+</button>
        {isDropdownVisible && (
          <div className="user-dropdown visible">
            {allUsers.map((u) => (
              <div key={u._id} className="dropdown-item" onClick={() => handleUserSelect(u._id)}>
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
              setSendMessage={setSendMessage}
              receivedMessage={receivedMessage}
            />

            {/* Chat Sender only visible when a conversation is selected */}
            <div className="chat-sender">
              <div className="attach-btn" onClick={() => imageRef.current.click()}>+</div>
              <InputEmoji value={newMessage} onChange={setNewMessage} />
              <div className="send-button" onClick={handleSend}>Send</div>
              <input type="file" style={{ display: "none" }} ref={imageRef} />
            </div>
          </>
        ) : (
          <div className="chatbox-empty">
            <img src="/typingGIF.gif" alt="Typing" className="chatbox-empty-img" />
            <h3>No chat selected</h3>
            <p>Pick a conversation from the left panel to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
