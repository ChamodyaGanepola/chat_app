import React, { useRef, useState, useEffect } from "react";
import ChatBox from "../Components/ChatBox/ChatBox";
import Conversation from "../Components/Conversation/Conversation";
import NavIcons from "../Components/NavIcons/NavIcons";
import "./Chat.css";
import { userChats, createChat, findChat, getMessages } from "../../api/ChatRequests";
import { getAllUser, getUserById } from "../../api/UserRequest";
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
  const [userData, setUserData] = useState(null); // Other user's info
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [allUsers, setAllUsers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const imageRef = useRef();

  // Fetch user chats
  useEffect(() => {
    const getChatsData = async () => {
      try {
        const { data } = await userChats(user._id);
        setChats(data);
      } catch (err) {
        console.log(err);
      }
    };
    getChatsData();
  }, [user._id]);

  // Fetch all users for dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUser();
        setAllUsers(res.data.filter(u => u._id !== user._id));
      } catch (err) {
        console.log(err);
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

    socket.current.on("receive-message", (data) => {
      if (currentChat && currentChat._id === data.chatId) {
        setMessages(prev => [...prev, data]);
      } else {
        setReceivedMessage(data);
      }
    });
  }, [user, currentChat]);

  // Window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if a user in chat is online
  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find(m => m !== user._id);
    return onlineUsers.some(u => u.userId === chatMember);
  };

  // Handle conversation click
  const handleChatClick = async (chat) => {
    setCurrentChat(chat);
    setIsChatOpen(true);

    // Fetch messages
    try {
      const res = await getMessages(chat._id);
      setMessages(res.data);

      // Get other user's data
      const otherUserId = chat.members.find(id => id !== user._id);
      const userRes = await getUserById(otherUserId);
      setUserData(userRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle selecting user from dropdown
  const handleUserSelect = async (selectedUserId) => {
    try {
      const existingChat = await findChat(user._id, selectedUserId);
      if (existingChat.data) {
        handleChatClick(existingChat.data);
      } else {
        const newChat = await createChat({ senderId: user._id, receiverId: selectedUserId });
        if (newChat.data) handleChatClick(newChat.data);
      }
      setIsDropdownVisible(false);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDropdown = () => setIsDropdownVisible(!isDropdownVisible);

  // Send new message
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const message = {
      senderId: user._id,
      text: newMessage,
      chatId: currentChat._id,
    };
    const receiverId = currentChat.members.find(id => id !== user._id);
    setSendMessage({ ...message, receiverId });

    setMessages(prev => [...prev, message]); // update locally
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
                onClick={() => handleChatClick(chat)}
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
            {allUsers.map(u => (
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
              messages={messages}
              userData={userData}
            />

            {/* Chat sender input */}
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
