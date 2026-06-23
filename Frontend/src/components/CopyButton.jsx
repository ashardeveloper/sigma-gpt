import { useState } from "react";
import styles from "./CopyButton.module.css";

function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button className={styles.copyBtn} onClick={handleCopy}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export default CopyButton;
