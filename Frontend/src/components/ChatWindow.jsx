import styles from "./ChatWindow.module.css";
import Chat from "./Chat.jsx";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats,
    setNewChat,
    token,
    setToken,
    setUser,
    setIsAuthenticated,
    setCurrThreadId,
    setAllThreads,
    setIsTypingReply,
  } = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getReply = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setNewChat(false);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };
    try {
      const response = await fetch("http://localhost:8080/api/chat", options);
      const data = await response.json();

      setIsTypingReply(true);
      setReply(data.reply);
      if (!currThreadId) {
        setCurrThreadId(data.threadId);

        navigate(`/chat/${data.threadId}`);
      }
    } catch (error) {
      console.error("Error fetching reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  };

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);

    setUser(null);

    setIsAuthenticated(false);
    setAllThreads([]);

    setPrevChats([]);
    console.log("prevChats cleared");

    setReply(null);

    setPrompt("");

    setNewChat(true);

    setCurrThreadId(uuidv1());

    setIsOpen(false);
  };

  //Append new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        { role: "user", content: prompt },
        { role: "assistant", content: reply },
      ]);
    }

    setPrompt("");
  }, [reply]);

  return (
    <div className={styles.chatWindow}>
      <div className={styles.navbar}>
        <span>
          SigmaGPT <i className="fa-solid fa-chevron-down"></i>
        </span>
        <div className={styles.userIconDiv} onClick={handleProfileClick}>
          <span className={styles.userIcon}>
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>
      {isOpen && (
        <div className={styles.dropDown}>
          <div className={styles.dropDownItem}>
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div className={styles.dropDownItem}>
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
          </div>
          <div className={styles.dropDownItem} onClick={logout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}
      <Chat></Chat>
      <ScaleLoader color="#fff" loading={isLoading}></ScaleLoader>

      <div className={styles.chatInput}>
        <div className={styles.inputBox}>
          <input
            placeholder="Ask me anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
          />
          <div className={styles.submit} onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className={styles.info}>
          SigmaGPT can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;
