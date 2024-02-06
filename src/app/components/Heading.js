import { ChatCenteredDots } from "@phosphor-icons/react";

export default function Heading({ content }) {
  return (
    <div className="text-3xl font-bold my-4 w-full flex">
      <ChatCenteredDots size={32} />
      <span className="px-2">{content}</span>
    </div>
  );
}
