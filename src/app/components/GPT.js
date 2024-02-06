import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function GPT({ content }) {
  return (
    <ReactMarkdown
      className="prose mt-1 w-full break-words prose-p:leading-relaxed"
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} style={{ color: "#4c5ffc" }} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
