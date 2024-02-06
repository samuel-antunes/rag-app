import { Stack } from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";

export default function FollowUp({ content, sendMessage, blockUsage }) {
  // 32. State for storing parsed follow-up options
  const [followUp, setFollowUp] = useState([]);
  // 33. useRef for scrolling
  const messagesEndReff = useRef(null);
  // 34. Scroll into view when followUp changes
  useEffect(() => {
    setTimeout(() => {
      messagesEndReff.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [followUp]);
  // 35. Parse JSON content to extract follow-up options
  useEffect(() => {
    if (content[0] === "{" && content[content.length - 1] === "}") {
      try {
        const parsed = JSON.parse(content);
        setFollowUp(parsed.follow_up || []);
      } catch (error) {
        console.log("error parsing json", error);
      }
    }
  }, [content]);
  // 36. Handle follow-up click event
  const handleFollowUpClick = (text, e) => {
    e.preventDefault();
    sendMessage(text);
  };
  // 37. Render the FollowUp component
  return (
    <>
      {followUp.length > 0 && (
        <div className="text-3xl font-bold my-4 w-full flex">
          <Stack size={32} /> <span className="px-2">Follow-Up</span>
        </div>
      )}
      {/* 38. Map over follow-up options */}
      <div className="flex flex-col">
        {followUp.map((text, index) => (
          <a
            href="#"
            key={index}
            className={`text-xl w-full p-1 ${
              blockUsage
                ? "pointer-events-none cursor-not-allowed "
                : "pointer-events-auto"
            }`}
            onClick={(e) => handleFollowUpClick(text, e)}
          >
            <span>{text}</span>
          </a>
        ))}
      </div>
      {/* 39. Scroll anchor */}
      <div ref={messagesEndReff} />
    </>
  );
}
