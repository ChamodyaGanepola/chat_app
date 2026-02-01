// Auth reducer handles login, signup, profile updates, and logout
// Stores user data, loading states, and error messages
const authReducer = (
  state = { authData: null, loading: false, error: null, updateLoading: false },
  action
) => {
  switch (action.type) {
    // Login/Signup started → sets loading to true and clears previous errors
    case "AUTH_START":
      return { ...state, loading: true, error: null };

    // Login/Signup succeeded → saves user info in authData and sessionStorage, clears errors
    case "AUTH_SUCCESS":
      sessionStorage.setItem("profile", JSON.stringify({ ...action?.data }));
      return { ...state, authData: action.data, loading: false, error: null };

    // Login/Signup failed → sets descriptive error message
    case "AUTH_FAIL":
      return {
        ...state,
        loading: false,
        error: action?.message || "Invalid credentials", // default message if none provided
      };

    // Profile update started → sets updateLoading to true and clears previous errors
    case "UPDATING_START":
      return { ...state, updateLoading: true, error: null };

    // Profile update succeeded → updates user info in authData and sessionStorage, clears errors
    case "UPDATING_SUCCESS":
      sessionStorage.setItem("profile", JSON.stringify({ ...action?.data }));
      console.log("jso", JSON.stringify({ ...action?.data }));
      return { ...state, authData: action.data, updateLoading: false, error: null };

    // Profile update failed → sets descriptive error message
    case "UPDATING_FAIL":
      return {
        ...state,
        updateLoading: false,
        error: action?.message || "Update failed", // default message if none provided
      };
    case "UPDATE_BLOCKED_USERS":
      const updatedUser = {
        ...state.authData.user,
        blockedUsers: action.data,
      };
      const updatedAuthData = {
        ...state.authData,
        user: updatedUser,
      };
      sessionStorage.setItem("profile", JSON.stringify(updatedAuthData));
      return { ...state, authData: updatedAuthData };



    // Logout → clears user data from state and sessionStorage, resets all states
    case "LOG_OUT":
      sessionStorage.clear();
      return { authData: null, loading: false, error: null, updateLoading: false };
    // Clear authentication errors
    case "CLEAR_AUTH_ERROR":
      return { ...state, error: null };

    // Default → return current state if no action matches
    default:
      return state;
  }
};

export default authReducer;
