import React, { useEffect } from "react";
import { ExitToApp } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./NavIcons.css";

const NavIcons = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.authReducer.authData.user);

  useEffect(() => {
    if (userData) {
      console.log("Logged in user data:", userData);
    }
  }, [userData]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      dispatch({ type: "LOG_OUT" });
      navigate("/");
    }
  };

  return (
    <div className="navIcons">
  {userData && (
    <div className="logout-container">
      {/* Avatar + Username */}
      <div className="user-info">
        <div
          className="avatar-circle"
          style={{
            backgroundColor:
              userData.gender === "Male"
                ? "#3498db"
                : userData.gender === "Female"
                ? "#ff69b4"
                : "#808080",
          }}
        >
          {userData.firstname?.charAt(0).toUpperCase() || "?"}
        </div>
        <span className="user-name">{userData.username}</span>
      </div>

      {/* Logout Icon */}
      <ExitToApp className="nav-icon" onClick={handleLogout} />
    </div>
  )}
</div>

  );
};

export default NavIcons;
