import { useState, useEffect } from "react";

export default function VectorCreation({ content }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  return visible ? (
    <div className="w-full p-1">
      <span className="flex flex-col items-center py-2 px-6 rounded shadow hover:shadow-lg transition-shadow duration-300 h-full tile-animation">
        <span>{content}</span>
      </span>
    </div>
  ) : null;
}
