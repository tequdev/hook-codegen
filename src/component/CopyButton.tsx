import { useCallback, useState } from "react";
import { CheckIcon } from "../Icons/CheckIcon";
import { CopyIcon } from "../Icons/CopyIcon";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy:", e);
    }
  }, [text]);

  return (
    <button
      type="button"
      className="copy-button"
      onClick={handleCopy}
      disabled={!text}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <CheckIcon />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <CopyIcon />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
