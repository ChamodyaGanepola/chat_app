import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUser } from "../../../api/UserRequest";
import { getMessages, readMessage } from "../../../api/MessageRequests";
import "./Conversation.css";

const Conversation = ({ data, currentUser, online, setCurrentChat }) => {
  const [userData, setUserData] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const userId = data.members.find((id) => id !== currentUser);
    const getUserData = async () => {
      try {
        const { data } = await getUser(userId);
        setUserData(data);
        dispatch({ type: "SAVE_USER", data: data });
      } catch (error) {
        console.log(error);
      }
    };
    getUserData();
  }, [data, currentUser, dispatch]);

  useEffect(() => {
    const fetchLastMessage = async () => {
      try {
        const res = await getMessages(data._id);
        if (res.data.length > 0) {
          setLastMessage(res.data[res.data.length - 1]);
        }
      } catch (err) {
        console.log(err);
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
        await readMessage(data._id, currentUser); // call backend
        setLastMessage({ ...lastMessage, read: true });
      } catch (err) {
        console.log(err);
      }
    }
  };

  const firstLetter = userData?.firstname
    ? userData.firstname.charAt(0).toUpperCase()
    : "?";

  return (
    <div className="conversation" onClick={handleClick}>
      <div
        className="avatar-circle"
        style={{
          backgroundColor:
            userData?.gender === "Male"
              ? "#3498db" // blue for male
              : userData?.gender === "Female"
              ? "#ff69b4" // pink for female
              : "#808080", // gray for other/undefined
        }}
      >
        <span className="avatar-text">{firstLetter}</span>
      </div>

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
    </div>
  );
};

export default Conversation;
