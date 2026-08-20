import styles from "./ChatWindow.module.css";
import Chat from "./Chat.jsx";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
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
    theme,
    setTheme,
  } = useContext(MyContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef(null);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const resizeTextarea = () => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 160;
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const getReply = async () => {
    if (isLoading || !prompt.trim()) return;
    setError("");
    setIsLoading(true);
    setNewChat(false);
    const endpoint = isGuest
      ? `${API_URL}/api/chat/guest`
      : `${API_URL}/api/chat`;
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

      if (!response.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setIsTypingReply(true);
      setReply(data.reply);
      if (!currThreadId) {
        setCurrThreadId(data.threadId);

        navigate(`/chat/${data.threadId}`);
      }
    } catch (error) {
      console.error("Error fetching reply:", error);
      setError("Network error. Please try again.");
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

  useEffect(() => {
    resizeTextarea();
  }, [prompt]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

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

        <div ref={profileMenuRef} className={styles.profileMenu}>
          <div className={styles.userIconDiv} onClick={handleProfileClick}>
            <span className={styles.userIcon}>
              <i className="fa-solid fa-user"></i>
            </span>
          </div>

          {isOpen && (
            <div className={styles.dropDown}>
              <div
                className={styles.dropDownItem}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <i className="fa-solid fa-circle-half-stroke"></i>
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </div>

              <div className={styles.dropDownItem} onClick={logout}>
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
              </div>
            </div>
          )}
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

      <Chat></Chat>
      <ScaleLoader color="#fff" loading={isLoading}></ScaleLoader>

      <div className={styles.chatInput}>
        {error && <p className={styles.errorText}>{error}</p>}
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            placeholder="Ask me anything..."
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              resizeTextarea();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                getReply();
              }
            }}
            disabled={isLoading}
            rows={1}
          />
          <div
            className={`${styles.submit} ${isLoading ? styles.disabled : ""}`}
            onClick={getReply}
          >
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
