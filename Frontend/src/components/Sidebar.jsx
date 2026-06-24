import { useContext, useEffect } from "react";
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

  const getAllThreads = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/thread", {
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
      const response = await fetch(
        `http://localhost:8080/api/thread/${newThreadId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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
    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${threadId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
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
            {thread.title}
            <i
              className={`fa-solid fa-trash ${styles["fa-trash"]}`}
              onClick={(e) => {
                e.stopPropagation(); //stop event bubbling
                deleteThread(thread.threadId);
              }}
            ></i>
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
