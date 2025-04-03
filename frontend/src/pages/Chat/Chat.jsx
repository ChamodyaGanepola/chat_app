import React, { useRef, useState, useEffect } from "react";
import ChatBox from "../Components/ChatBox/ChatBox";
import Conversation from "../Components/Conversation/Conversation";
import NavIcons from "../Components/NavIcons/NavIcons";
import "./Chat.css";
import { userChats, createChat, findChat } from "../../api/ChatRequests";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import MUI Icon
import { getAllUser } from "../../api/UserRequest";

const Chat = () => {
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);

  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // Controls visibility in small screens
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // State to track the window width
  const [allUsers, setAllUsers] = useState([]); // State to hold all users
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Controls dropdown visibility

  // Fetch chats for the logged-in user
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

  // Fetch all users for the dropdown, excluding the logged-in user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAllUser();
        console.log(response.data); // Check the data you are fetching
        // Filter out the logged-in user based on user._id
        setAllUsers(response.data.filter((u) => u._id !== user._id)); // Ensure user._id is correct
      } catch (error) {
        console.log(error);
      }
    };
    fetchUsers();
  }, [user._id]);

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("ws://localhost:8800");
    socket.current.emit("new-user-add", user._id);
    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });
    // Listen for the 'create-chat' event
    socket.current.on("create-chat", (newChat) => {
      console.log("New Chat Created:", newChat);
      // Add the new chat to the existing chat list
      setChats((prevChats) => [...prevChats, newChat]);
    });
  }, [user]);

  // Send Message to socket server
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  // Get the message from socket server
  useEffect(() => {
    socket.current.on("receive-message", (data) => {
      setReceivedMessage(data);
    });
  }, []);

  // Function to check if a user is online
  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((member) => member !== user._id);
    return onlineUsers.some((user) => user.userId === chatMember);
  };

  // Update window width when the screen is resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth); // Update the window width state
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Function to handle user selection from dropdown
  const handleUserSelect = async (selectedUserId) => {
    try {
      const existingChat = await findChat(user._id, selectedUserId);
      if (existingChat.data) {
        setCurrentChat(existingChat.data);
      } else {
        const newChatResponse = await createChat({
          senderId: user._id,
          receiverId: selectedUserId,
        });
  
        if (newChatResponse.data) {
          setCurrentChat(newChatResponse.data);
        } else {
          console.error("Failed to create new chat");
        }
      }
      setIsChatOpen(true);
      setIsDropdownVisible(false);
    } catch (error) {
      console.error("Error in creating or finding chat:", error);
    }
  };
  

  // Toggle dropdown visibility on button click
  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="Chat">
      {/* Left Side - Chats List */}
      <div className={`Left-side-chat ${isChatOpen ? "hide" : ""}`}>
        <div className="Chat-container">
          <h2>Chats</h2>
          <div className="Chat-list">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => {
                  setCurrentChat(chat);
                  setIsChatOpen(true);
                }}
                className="conversation"
              >
                <Conversation
                  data={chat}
                  currentUser={user._id}
                  online={checkOnlineStatus(chat)}
                />
              </div>
            ))}
          </div>
          
        </div>
        {/* Plus Button */}
        <button className="plus-button" onClick={toggleDropdown}>
          +
        </button>

        
        {/* User Dropdown */}
        {isDropdownVisible && (
          <div
            className={`user-dropdown ${isDropdownVisible ? "visible" : ""}`}
          >
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

      {/* Right Side - ChatBox */}
      <div className={`Right-side-chat ${isChatOpen ? "show" : ""}`}>
        <NavIcons />
        {isChatOpen &&
          windowWidth <= 768 && ( // Only show back button if on small screens
            <button
              className="back-button"
              onClick={() => setIsChatOpen(false)}
            >
              <ArrowBackIcon />
            </button>
          )}
        <ChatBox
          chat={currentChat}
          currentUser={user._id}
          setSendMessage={setSendMessage}
          receivedMessage={receivedMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
