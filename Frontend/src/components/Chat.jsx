import styles from "./Chat.module.css";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, prevChats, reply, isTypingReply, setIsTypingReply } =
    useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

  useEffect(() => {
    console.log("reply:", reply, "isTypingReply:", isTypingReply);
    if (!isTypingReply || !reply) {
      setLatestReply(null);
      return;
    }
    // if (!prevChats?.length) return;

    const content = reply.split(" ");

    let idx = 0;
    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));
      idx++;
      if (idx >= content.length) {
        clearInterval(interval);

        setIsTypingReply(false);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [reply, isTypingReply]);

  return (
    <>
      {newChat && <h1>Start a new chat</h1>}
      <div className={styles.chats}>
        {prevChats?.slice(0, -1).map((chat, idx) => (
          <div
            className={chat.role === "user" ? styles.userDiv : styles.gptDiv}
            key={idx}
          >
            {chat.role === "user" ? (
              <p className={styles.userMessage}>{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}
        {prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              <div className={styles.gptDiv} key={"non-typing"}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="gptDiv" key={"typing"}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                  {latestReply}
                </ReactMarkdown>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default Chat;
