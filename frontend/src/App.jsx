import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";


import Auth from "./pages/Auth/Auth-app.jsx";

import Chat from "./pages/Chat/Chat.jsx";
import { useSelector } from "react-redux";


function App() {
  //ses Redux (useSelector) to see if a user is logged in.
  const user = useSelector((state) => state.authReducer.authData);
  return (
    <div
      className="App"
      style={{
        height:
          window.location.href === "http://localhost:5173/chat"
            ? "calc(100vh)"
            : "auto",
      }}
    >
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="../chat" /> : <Auth />}
        />
          <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="../" />}
        />
        </Routes>

    </div>
  );
}

export default App;