import React, { useRef } from "react";
import InputEmoji from "react-input-emoji";
import "./ChatSender.css"; // Separate CSS for sender

const ChatSender = ({ newMessage, setNewMessage, handleSend }) => {
  const imageRef = useRef();

  return (
    <div className="chat-sender">
      <div onClick={() => imageRef.current.click()} className="attach-btn">
        +
      </div>
      <InputEmoji
        value={newMessage}
        onChange={(msg) => setNewMessage(msg)}
        placeholder="Type a message"
      />
      <div className="send-button button" onClick={handleSend}>
        Send
      </div>
      <input type="file" style={{ display: "none" }} ref={imageRef} />
    </div>
  );
};

export default ChatSender;
