import { useContext, useEffect, useState } from "react";
import styles from "./Sidebar.module.css";
import blackLogo from "../assets/blacklogo.png";
import { MyContext } from "../MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { useNavigate } from "react-router-dom";

function Sidebar({ isOpen = false, onClose }) {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
    token,
    user,
    setToken,
    setUser,
    setIsAuthenticated,
  } = useContext(MyContext); //store all threads
  const navigate = useNavigate();
  const [editingThreadId, setEditingThreadId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const getAllThreads = async () => {
    try {
      const response = await fetch(`${API_URL}/api/thread`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      const filteredData = data.map((thread) => ({
        threadId: thread.threadId,
        title: thread.title,
      }));
      setAllThreads(filteredData);
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, [currThreadId]); //fetch all threads whenever the current thread changes

  const createNewChat = async () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);

    setCurrThreadId(null);

    setPrevChats([]);

    navigate("/chat");
    onClose?.();
  };

  const changeThread = async (newThreadId) => {
    navigate(`/chat/${newThreadId}`);
    setCurrThreadId(newThreadId);

    try {
      const response = await fetch(`${API_URL}/api/thread/${newThreadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPrevChats(data);
      setNewChat(false);
      setReply(null);
      onClose?.();
    } catch (error) {
      console.error("Error fetching thread chats:", error);
    }
  };

  const deleteThread = async (threadId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this chat?",
    );

    if (!shouldDelete) return;

    try {
      const response = await fetch(`${API_URL}/api/thread/${threadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res = await response.json();
      console.log(res);

      //update thread re-render
      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId),
      );

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const startRename = (threadId, title) => {
    setEditingThreadId(threadId);
    setEditingTitle(title);
  };

  const cancelRename = () => {
    setEditingThreadId(null);
    setEditingTitle("");
  };

  const saveRename = async (threadId, oldTitle) => {
    const newTitle = editingTitle.trim();

    if (!newTitle || newTitle === oldTitle) {
      cancelRename();
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/thread/${threadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to rename thread");
        return;
      }

      setAllThreads((prev) =>
        prev.map((thread) =>
          thread.threadId === threadId
            ? { ...thread, title: data.title }
            : thread,
        ),
      );

      cancelRename();
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
    onClose?.();
  };

  return (
    <section className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      <button className={styles.button} onClick={createNewChat}>
        <img src={blackLogo} alt="gpt-logo" className={styles.logo} />
        <span>
          <i className="fa-solid  fa-pen-to-square"></i>
        </span>
      </button>

      <ul className={styles.history}>
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={
              thread.threadId === currThreadId ? styles.highlighted : ""
            }
          >
            {editingThreadId === thread.threadId ? (
              <input
                className={styles.renameInput}
                value={editingTitle}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setEditingTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveRename(thread.threadId, thread.title);
                  }

                  if (e.key === "Escape") {
                    cancelRename();
                  }
                }}
                onBlur={() => saveRename(thread.threadId, thread.title)}
              />
            ) : (
              <>
                <span className={styles.threadTitle}>{thread.title}</span>

                <i
                  className={`fa-solid fa-pen ${styles["fa-rename"]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    startRename(thread.threadId, thread.title);
                  }}
                ></i>

                <i
                  className={`fa-solid fa-trash ${styles["fa-trash"]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(thread.threadId);
                  }}
                ></i>
              </>
            )}
          </li>
        ))}
      </ul>

      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <h4>{user?.name}</h4>
            <p>{user?.email}</p>
          </div>
        </div>

        <button className={styles.logoutBtn} onClick={logout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          Logout
        </button>
      </div>
    </section>
  );
}

export default Sidebar;
