import React from "react";
import { ExitToApp } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./NavIcons.css";

const NavIcons = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Logout function with confirmation
  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      dispatch({ type: "LOG_OUT" }); // Dispatch logout action
      navigate("/"); // Redirect to home
    }
  };

  return (
    <div className="navIcons">
      <div className="logout-container">
        <ExitToApp 
          className="nav-icon" 
          onClick={handleLogout} // Call logout function on click
          style={{ cursor: "pointer", fontSize: "30px" }} // Make it clickable
        />
      </div>
    </div>
  );
};

export default NavIcons;
