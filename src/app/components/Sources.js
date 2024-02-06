import { GitBranch } from "@phosphor-icons/react";

export default function Sources({ content }) {
  const truncateText = (text, maxLength) =>
    text.length <= maxLength ? text : `${text.substring(0, maxLength)}...`;
  // 24. Extract site name from a URL
  const extractSiteName = (url) => new URL(url).hostname.replace("www.", "");
  return (
    <>
      <div className="text-3xl font-bold my-4 w-full flex">
        <GitBranch size={32} />
        <span className="px-2">Sources</span>
      </div>
      <div className="flex flex-wrap">
        {content?.map(({ title, link }) => (
          <a href={link} className="w-1/4 p-1" key={title + link}>
            <span className="flex flex-col items-center py-2 px-6 bg-[#4b4f70] rounded shadow hover:shadow-lg transition-shadow duration-300 tile-animation h-full">
              <span>{truncateText(title, 40)}</span>
              <span className="text-[#4c5ffc] text-clip">
                {extractSiteName(link)}
              </span>
            </span>
          </a>
        ))}
      </div>
    </>
  );
}
