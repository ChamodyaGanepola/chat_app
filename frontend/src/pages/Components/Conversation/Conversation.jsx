import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUser } from "../../../api/UserRequest";
import "./Conversation.css"
const Conversation = ({ data, currentUser, online }) => {
  const [userData, setUserData] = useState(null);
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
  }, []);

  // Get the first letter of the username
  const firstLetter = userData?.firstname ? userData.firstname.charAt(0).toUpperCase() : "?";

  return (
    <>
      <div className="conversation">
        <div className="avatar-container">
          <div className="avatar-circle">
            <span className="avatar-text">{firstLetter}</span>
          </div>
        </div>
        <div className="name-container">
          <span className="username">
            {userData?.firstname} {userData?.lastname}
          </span>
        </div>
        <div className="status-container">
          <span className={`status ${online ? "online" : "offline"}`}>
            {online ? "Online" : "Offline"}
          </span>
        </div>
      </div>
      <hr style={{ width: "85%", border: "0.1px solid #ececec" }} />
    </>
  );
};

export default Conversation;
