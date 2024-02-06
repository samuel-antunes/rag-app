import { NextResponse } from "next/server";
import axios from "axios";
import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";
import { OpenAIEmbeddings } from "@langchain/openai";
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { Document } from "@langchain/core/documents";
import { RetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const config = {
  domain:
    "https://www.sfu.ca/students/calendar/2024/spring/areas-of-study/computing-science.html",
  query: "What majors are available?",
};

export async function GET(req, res) {
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
    batchSize: 512,
  });

  const response = await axios.get(config.domain);
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
  }
  const filePath = path.join(cacheDir, "response.html");
  fs.writeFileSync(filePath, response.data);

  const loader = new UnstructuredLoader(filePath, {
    apiKey: process.env.UNSTRUCTURED_API_KEY,
  });

  return new NextResponse({});
}
