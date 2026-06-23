import "./App.css";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import Auth from "./components/Auth.jsx";
import { MyContext } from "./MyContext.jsx";
import { useEffect, useState } from "react";
import { v1 as uuidv1 } from "uuid";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ChatPage from "./pages/ChatPage.jsx";

function App() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]); //store all chats for current thread
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]); //store all threads
  const [isTypingReply, setIsTypingReply] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token"),
  );

  const providerValues = {
    token,
    setToken,
    user,
    setUser,
    isAuthenticated,
    setIsAuthenticated,
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
    allThreads,
    setAllThreads,
    isTypingReply,
    setIsTypingReply,
    isGuest,
    setIsGuest,
  };

  useEffect(() => {
    const loadUser = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        setUser(data);
      } catch (error) {
        console.log(error);
      }
    };

    loadUser();
  }, [token]);

  return (
    <div className="app">
      <MyContext.Provider value={providerValues}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/signup" element={<Signup />} />

            <Route
              path="/chat/:threadId?"
              element={
                isAuthenticated ? <ChatPage /> : <Navigate to="/login" />
              }
            />

            <Route
              path="*"
              element={<Navigate to={isAuthenticated ? "/chat" : "/login"} />}
            />
          </Routes>
        </BrowserRouter>
      </MyContext.Provider>
    </div>
  );
}

export default App;
