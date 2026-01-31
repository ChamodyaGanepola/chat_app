import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../../../api/UserRequest";
import { getMessages, readMessage } from "../../../api/MessageRequests";
import { deleteChatForMe } from "../../../api/ChatRequests";
import DeleteIcon from "@mui/icons-material/Delete";
import "./Conversation.css";

const Conversation = ({
  data,
  currentUser,
  online,
  setCurrentChat,
  setChats,
}) => {
  const dispatch = useDispatch();

  // Get logged-in user from Redux
  const authData = useSelector((state) => state.authReducer.authData);
  const loggedInUser = authData?.user;

  const [userData, setUserData] = useState(null); // other user
  const [lastMessage, setLastMessage] = useState(null);

  // Fetch other user's data
  useEffect(() => {
    const otherUserId = data.members.find((id) => id !== currentUser);

    const fetchUserData = async () => {
      try {
        const { data: userData } = await getUser(otherUserId);
        setUserData(userData);
        dispatch({ type: "SAVE_USER", data: userData });
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    if (otherUserId) fetchUserData();
  }, [data, currentUser, dispatch]);

  // Fetch last message
  useEffect(() => {
    const fetchLastMessage = async () => {
      try {
        const res = await getMessages(data._id);
        if (res.data.length > 0) {
          setLastMessage(res.data[res.data.length - 1]);
        } else {
          setLastMessage({ text: "No messages yet", read: true }); // fallback
        }
      } catch (err) {
        console.error(err);
        setLastMessage({ text: "Error loading messages", read: true });
      }
    };
    fetchLastMessage();
  }, [data]);

  const handleClick = async () => {
    setCurrentChat(data);

    if (
      lastMessage &&
      !lastMessage.read &&
      lastMessage.senderId !== currentUser
    ) {
      try {
        await readMessage(data._id);
        setLastMessage({ ...lastMessage, read: true });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteChat = async (e) => {
    e.stopPropagation(); // prevent opening chat
    try {
      await deleteChatForMe(data._id);

      // Remove deleted chat from chat list
      setChats((prevChats) =>
        prevChats.filter((chat) => chat._id !== data._id),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const firstLetter = userData?.firstname
    ? userData.firstname.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="conversation" onClick={handleClick}>
      {/* Avatar */}
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
        <span className="avatar-text">{firstLetter}</span>
      </div>

      {/* Name & last message */}
      <div className="name-status">
        <span className="username">
          {userData
            ? `${userData.firstname} ${userData.lastname}`
            : "Loading..."}
        </span>
        <span className={`status ${online ? "online" : "offline"}`}>
          {online ? "Online" : "Offline"}
        </span>
        <span
          className={`last-message ${
            lastMessage?.read === false && lastMessage.senderId !== currentUser
              ? "unread"
              : ""
          }`}
        >
          {lastMessage?.text || ""}
        </span>
      </div>

      {/* Delete icon */}
      <DeleteIcon className="chat-delete-icon" onClick={handleDeleteChat} />
    </div>
  );
};

export default Conversation;
