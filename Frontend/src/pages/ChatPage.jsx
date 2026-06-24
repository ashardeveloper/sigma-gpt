import { useEffect, useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { MyContext } from "../MyContext";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function ChatPage() {
  const { threadId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    token,
    setCurrThreadId,
    setPrevChats,
    setNewChat,
    setReply,
    isGuest,
  } = useContext(MyContext);

  useEffect(() => {
    if (isGuest) return;
    const loadThread = async () => {
      if (!threadId) {
        setCurrThreadId(null);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/thread/${threadId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        setCurrThreadId(threadId);

        setPrevChats(data);

        setNewChat(false);

        //  setReply(null);
      } catch (error) {
        console.log(error);
      }
    };

    loadThread();
  }, [threadId]);

  return (
    <div className="chatLayout">
      {!isGuest && (
        <>
          <button
            className={`sidebarOverlay ${isSidebarOpen ? "show" : ""}`}
            aria-label="Close sidebar"
            onClick={() => setIsSidebarOpen(false)}
          />

          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </>
      )}

      <ChatWindow
        showMenuButton={!isGuest}
        onMenuClick={() => setIsSidebarOpen(true)}
      />
    </div>
  );
}

export default ChatPage;
