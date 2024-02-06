import { ArrowCircleRight } from "@phosphor-icons/react";

export default function InputArea({
  inputValue,
  setInputValue,
  sendMessage,
  blockUsage,
}) {
  return (
    <div className="flex items-center py-3">
      {/* 19. Create input box for message */}
      <input
        type="text"
        className={`flex-1 p-2 border rounded-l-md focus:outline-none focus:border-blue-500 text-black ${
          blockUsage
            ? "pointer-events-none cursor-not-allowed"
            : "pointer-events-auto"
        }`}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      {/* 20. Create send button */}
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
      >
        <ArrowCircleRight size={25} />
      </button>
    </div>
  );
}
