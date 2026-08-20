import styles from "./Chat.module.css";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import CopyButton from "./CopyButton.jsx";

function Chat() {
  const { newChat, prevChats, reply, isTypingReply, setIsTypingReply } =
    useContext(MyContext);

  const [latestReply, setLatestReply] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const bottomRef = useRef(null);

  const extractText = (node) => {
    if (typeof node === "string") {
      return node;
    }

    if (Array.isArray(node)) {
      return node.map(extractText).join("");
    }

    if (node?.props?.children) {
      return extractText(node.props.children);
    }

    return "";
  };

  const formatCopiedMessage = (content) => {
    return content
      .replace(/\r\n/g, "\n")
      .replace(/```(\w+)?\n?/g, "")
      .replace(/```/g, "")
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  const copyMessage = async (messageId, content) => {
    try {
      await navigator.clipboard.writeText(formatCopiedMessage(content));

      setCopiedMessageId(messageId);

      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const markdownComponents = {
    pre({ children }) {
      const className = children?.props?.className || "";
      const language = className
        .replace("hljs language-", "")
        .replace("language-", "");
      const codeString = extractText(children.props.children);

      if (!className.includes("hljs")) {
        return <pre>{children}</pre>;
      }

      return (
        <div className={styles.codeBlock}>
          <div className={styles.codeHeader}>
            <div className={styles.codeLanguage}>
              <i className="fa-solid fa-code"></i>
              <span>{language || "Code"}</span>
            </div>

            <CopyButton code={codeString} variant="header" />
          </div>

          <pre>{children}</pre>
        </div>
      );
    },
  };

  const renderCopyButton = (messageId, content) => (
    <button
      className={styles.messageCopyBtn}
      onClick={() => copyMessage(messageId, content)}
      aria-label="Copy message"
      title="Copy message"
    >
      {copiedMessageId === messageId ? "Copied" : "Copy"}
    </button>
  );

  const renderMessage = (chat, idx) => {
    const messageId = `message-${idx}`;

    return (
      <div
        className={chat.role === "user" ? styles.userDiv : styles.gptDiv}
        key={messageId}
      >
        <div className={styles.messageBlock}>
          {chat.role === "user" ? (
            <p className={styles.userMessage}>{chat.content}</p>
          ) : (
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {chat.content}
            </ReactMarkdown>
          )}

          {renderCopyButton(messageId, chat.content)}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (!isTypingReply || !reply) {
      setLatestReply(null);
      return;
    }

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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [prevChats.length, latestReply]);

  return (
    <>
      {newChat && <h1 className={styles.newChatTitle}>Start a new chat</h1>}

      <div className={styles.chats}>
        {prevChats?.slice(0, -1).map((chat, idx) => renderMessage(chat, idx))}

        {prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              renderMessage(prevChats[prevChats.length - 1], "latest")
            ) : (
              <div className={styles.gptDiv} key="typing">
                <div className={styles.messageBlock}>
                  <ReactMarkdown
                    rehypePlugins={[rehypeHighlight]}
                    components={markdownComponents}
                  >
                    {latestReply}
                  </ReactMarkdown>

                  {renderCopyButton("typing", latestReply)}
                </div>
              </div>
            )}
          </>
        )}

        <div ref={bottomRef} />
      </div>
    </>
  );
}

export default Chat;
