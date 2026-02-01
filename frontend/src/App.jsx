import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth/Auth-app.jsx";
import Chat from "./pages/Chat/Chat.jsx";
import { useSelector } from "react-redux";

function App() {
  const user = useSelector((state) => state.authReducer.authData);

  return (
    <div
      className="App"
      style={{
        height: window.location.pathname === "/chat" ? "100vh" : "auto",
      }}
    >
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/chat" /> : <Auth />}
        />
        <Route
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/" />}
        />
        {/* Optional: catch all unknown routes */}
        <Route path="*" element={<Navigate to={user ? "/chat" : "/"} />} />
      </Routes>
    </div>
  );
}

export default App;
