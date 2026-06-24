import styles from "./ChatWindow.module.css";
import Chat from "./Chat.jsx";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";

function ChatWindow({ showMenuButton = false, onMenuClick }) {
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
    isGuest,
    setIsGuest,
  } = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getReply = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setNewChat(false);
    const endpoint = isGuest
      ? "http://localhost:8080/api/chat/guest"
      : "http://localhost:8080/api/chat";
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",

        ...(isGuest
          ? {}
          : {
              Authorization: `Bearer ${token}`,
            }),
      },
      body: JSON.stringify({
        message: prompt,

        ...(isGuest
          ? {}
          : {
              threadId: currThreadId,
            }),
      }),
    };
    try {
      const response = await fetch(endpoint, options);
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
    setIsGuest(false);
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
        <div className={styles.brandGroup}>
          {showMenuButton && (
            <button
              className={styles.menuBtn}
              aria-label="Open sidebar"
              onClick={onMenuClick}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
          )}

          <span>
            SigmaGPT <i className="fa-solid fa-chevron-down"></i>
          </span>
        </div>

        <div className={styles.userIconDiv} onClick={handleProfileClick}>
          <span className={styles.userIcon}>
            <i className="fa-solid fa-user"></i>
          </span>
        </div>
      </div>
      {isGuest && (
        <div className={styles.guestBanner}>
          <span>👋 Guest Mode</span>

          <button
            className={styles.loginNowBtn}
            onClick={() => {
              setIsGuest(false);
              navigate("/login");
            }}
          >
            Login to save chats
          </button>
        </div>
      )}
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
