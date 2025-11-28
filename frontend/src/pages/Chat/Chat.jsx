import React, { useRef, useState, useEffect } from "react";
import ChatBox from "../Components/ChatBox/ChatBox";
import Conversation from "../Components/Conversation/Conversation";
import NavIcons from "../Components/NavIcons/NavIcons";
import "./Chat.css";
import { userChats, createChat, findChat } from "../../api/ChatRequests";
import { getAllUser, getUser } from "../../api/UserRequest";
import { getMessages } from "../../api/MessageRequests";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import InputEmoji from "react-input-emoji";
import { addMessage } from "../../api/MessageRequests";
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

  // Fetch chats for logged-in user
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
    socket.current = io("https://chat-app-kali.onrender.com");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("get-users", (users) => {
      console.log("Active users from socket:", users);
      setOnlineUsers(users);
    });

    socket.current.on("create-chat", (newChat) =>
      setChats((prev) => [...prev, newChat])
    );
    socket.current.on("receive-message", (data) => setReceivedMessage(data));
  }, [user]);

  // Send message via socket
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  // Receive Message from socket
  useEffect(() => {
    if (receivedMessage !== null) {
      // Add to messages if it's the current chat
      if (receivedMessage.chatId === currentChat?._id) {
        setMessages((prev) => [...prev, receivedMessage]);
      }

      // Update the last message in the left chat list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === receivedMessage.chatId
            ? { ...chat, lastMessage: receivedMessage }
            : chat
        )
      );
    }
  }, [receivedMessage, currentChat]);

  // Update window width
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if a user is online
  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((m) => m !== user._id);
    return onlineUsers.some((u) => u.userId === chatMember);
  };

  // Handle selecting a chat
  const handleChatClick = async (chat) => {
    setCurrentChat(chat);
    setIsChatOpen(true);
    try {
      // Fetch messages
      const res = await getMessages(chat._id);
      setMessages(res.data || []);

      // Fetch user info
      const otherUserId = chat.members.find((id) => id !== user._id);
      const userRes = await getUser(otherUserId);
      setUserData(userRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle creating or finding chat via dropdown
  const handleUserSelect = async (selectedUserId) => {
    try {
      const existingChat = await findChat(user._id, selectedUserId);
      if (existingChat.data) handleChatClick(existingChat.data);
      else {
        const newChat = await createChat({
          senderId: user._id,
          receiverId: selectedUserId,
        });
        if (newChat.data) handleChatClick(newChat.data);
      }
      setIsDropdownVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  // Send Message handling
  const handleSend = async () => {
    if (!newMessage.trim() || !currentChat) return;
    const message = {
      senderId: user._id,
      text: newMessage,
      chatId: currentChat._id,
    };
    // Receiver
    const receiverId = currentChat.members.find((id) => id !== user._id);
    // Send to socket
    setSendMessage({ ...message, receiverId });
    try {
      // Save to DB
      const res = await addMessage(message);
      // Add DB message (important!)
      setMessages((prev) => [...prev, res.data]);
      // Update last message in chat list
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === currentChat._id
            ? { ...chat, lastMessage: res.data }
            : chat
        )
      );
      setNewMessage(""); // clear input
    } catch (err) {
      console.log(err);
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
              />
            ))}
          </div>
        </div>
        <button className="plus-button" onClick={toggleDropdown}>
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
              userData={userData}
            />

            {/* Chat Sender */}
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
