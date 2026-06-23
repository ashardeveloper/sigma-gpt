import styles from "./Chat.module.css";
import { MyContext } from "../MyContext.jsx";
import { useContext, useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import CopyButton from "./CopyButton.jsx";

function Chat() {
  const { newChat, prevChats, reply, isTypingReply, setIsTypingReply } =
    useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);

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

  const markdownComponents = {
    pre({ children }) {
      const isCodeBlock = children?.props?.className?.includes("hljs");
      const codeString = extractText(children.props.children);

      if (!isCodeBlock) {
        return <pre>{children}</pre>;
      }

      return (
        <div
          style={{
            position: "relative",
          }}
        >
          <CopyButton code={codeString} />

          <pre>{children}</pre>
        </div>
      );
    },
  };

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
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={markdownComponents}
              >
                {chat.content}
              </ReactMarkdown>
            )}
          </div>
        ))}
        {prevChats.length > 0 && (
          <>
            {latestReply === null ? (
              <div className={styles.gptDiv} key={"non-typing"}>
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
                  {prevChats[prevChats.length - 1].content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="gptDiv" key={"typing"}>
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  components={markdownComponents}
                >
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
