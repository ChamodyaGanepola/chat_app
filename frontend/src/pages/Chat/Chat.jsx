import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import ChatBox from "../Components/ChatBox/ChatBox";
import ChatSender from "../Components/ChatSender/ChatSender";
import Conversation from "../Components/Conversation/Conversation";
import NavIcons from "../Components/NavIcons/NavIcons";
import { userChats, createChat, findChat } from "../../api/ChatRequests";
import { getAllUser } from "../../api/UserRequest";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./Chat.css";

const Chat = () => {
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);

  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [userData, setUserData] = useState(null);

  // Fetch chats
  useEffect(() => {
    const getChats = async () => {
      try {
        const { data } = await userChats(user._id);
        setChats(data);
      } catch (err) {
        console.log(err);
      }
    };
    getChats();
  }, [user._id]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUser();
        setAllUsers(data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, [user._id]);

  // Setup socket
  useEffect(() => {
    socket.current = io("ws://localhost:5000");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("receive-message", (data) => setReceivedMessage(data));
  }, [user._id]);

  // Handle sending message
  const handleSend = async () => {
    if (!newMessage.trim() || !currentChat) return;

    const message = {
      senderId: user._id,
      text: newMessage,
      chatId: currentChat._id,
    };

    const receiverId = currentChat.members.find((id) => id !== user._id);
    socket.current.emit("send-message", { ...message, receiverId });

    try {
      // Add to DB (replace with API call)
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  // Append real-time messages
  useEffect(() => {
    if (receivedMessage && receivedMessage.chatId === currentChat?._id) {
      setMessages((prev) => [...prev, receivedMessage]);
    }
  }, [receivedMessage, currentChat]);

  // Load messages and chat user data
  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages || []);
      const otherUserId = currentChat.members.find((id) => id !== user._id);
      // Fetch user data (replace with API)
      const fetchUser = async () => {
        // const { data } = await getUser(otherUserId);
        setUserData({ firstname: "Demo", lastname: "User", gender: "Male" });
      };
      fetchUser();
    }
  }, [currentChat, user._id]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="Chat">
      {/* Left Side */}
      <div className={`Left-side-chat ${isChatOpen ? "hide" : ""}`}>
        <h2>Chats</h2>
        <div className="Chat-list">
          {chats.map((c) => (
            <div key={c._id} onClick={() => setCurrentChat(c)}>
              <Conversation
                data={c}
                currentUser={user._id}
                setCurrentChat={setCurrentChat}
              />
            </div>
          ))}
        </div>

        {/* Dropdown */}
        <button className="plus-button" onClick={() => setIsDropdownVisible(!isDropdownVisible)}>+</button>
        {isDropdownVisible && (
          <div className="user-dropdown visible">
            {allUsers.map((u) => (
              <div key={u._id} onClick={() => setCurrentChat(u)}>
                {u.firstname} {u.lastname}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className={`Right-side-chat ${isChatOpen ? "show" : ""}`}>
        <NavIcons />
        {windowWidth <= 768 && isChatOpen && (
          <button className="back-button" onClick={() => setIsChatOpen(false)}>
            <ArrowBackIcon />
          </button>
        )}
        <ChatBox
          chat={currentChat}
          currentUser={user._id}
          messages={messages}
          userData={userData}
        />
        <ChatSender
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          handleSend={handleSend}
        />
      </div>
    </div>
  );
};

export default Chat;
