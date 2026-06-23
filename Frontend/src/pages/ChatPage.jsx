import { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { MyContext } from "../MyContext";

import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

function ChatPage() {
  const { threadId } = useParams();

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
    <>
      <>
        {!isGuest && <Sidebar />}

        <ChatWindow />
      </>
    </>
  );
}

export default ChatPage;
