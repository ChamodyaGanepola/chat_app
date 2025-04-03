import React, { useState, useEffect } from "react";
import { getAllUser } from "../../../api/UserRequest"; // Importing the API call
import Logo from "../../images/chat.jpeg";
import "./LogoSearch.css";
import { UilSearch } from "@iconscout/react-unicons";

const LogoSearch = () => {
  const [query, setQuery] = useState(""); // Search query state
  const [allUsers, setAllUsers] = useState([]); // All users from the API
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered results based on the query
  const [showDropdown, setShowDropdown] = useState(false); // Show dropdown on search input focus

  // Fetch all users from the backend when the component mounts
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await getAllUser(); // Fetch all users
        setAllUsers(res.data); // Set the users to the state
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  // Handle search as user types
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Filter users locally based on the search query
    if (value.length > 0) {
      const filtered = allUsers.filter((user) =>
        user.username.toLowerCase().includes(value.toLowerCase()) // Case-insensitive search
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    } else {
      setFilteredUsers([]); // Clear search results when input is empty
      setShowDropdown(false); // Hide dropdown when input is empty
    }
  };

  return (
    <div className="LogoSearch">
      <img src={Logo} alt="Chat Logo" className="logo-img" />
      <div className="Search">
        <input
          type="text"
          placeholder="Search username..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowDropdown(true)} // Show dropdown on focus
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Hide dropdown after 200ms
        />
        <div className="s-icon">
          <UilSearch />
        </div>
      </div>

      {showDropdown && filteredUsers.length > 0 && (
        <ul className="dropdown">
          {filteredUsers.map((user) => (
            <li key={user._id} onClick={() => setQuery(user.username)}>
              @{user.username} {/* Show username */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LogoSearch;
