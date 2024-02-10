"use client";
"use strict";

import React, { useEffect, useRef, useState, memo } from "react";

import { createClient } from "@supabase/supabase-js";
import Query from "./components/Query";
import InputArea from "./components/InputArea";
import Sources from "./components/Sources";
import VectorCreation from "./components/VectorCreation";
import FollowUp from "./components/FollowUp";
import GPT from "./components/GPT";
import Heading from "./components/Heading";
import { v4 as uuidv4 } from "uuid";
import Modal from "./components/Modal";
import io from "socket.io-client";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_API_KEY
);
//
const socket = io("https://rag-test-app-2-2235dc92aaf0.herokuapp.com/", {
  transports: ["websocket"],
  upgrade: false,
});

function generateRandomIdentifier() {
  return uuidv4();
}

function setUUIDCookie() {
  const uuid = generateRandomIdentifier();
  const daysToExpire = 30; // Set the cookie to expire in 30 days
  const expirationDate = new Date();
  expirationDate.setTime(
    expirationDate.getTime() + daysToExpire * 24 * 60 * 60 * 1000
  );
  const expires = "expires=" + expirationDate.toUTCString();

  document.cookie = "userID=" + uuid + ";" + expires + ";path=/";
}

function getUserID() {
  // Split document.cookie on semicolons and spaces, then filter for the cookie name
  const cookieArray = document.cookie
    .split("; ")
    .filter((cookie) => cookie.startsWith("userID="));

  return cookieArray.length > 0 ? cookieArray[0].slice(7) : "";
}

const MessageHandler = memo(({ message, sendMessage, blockUsage }) => {
  const COMPONENT_MAP = {
    Query,
    Sources,
    VectorCreation,
    Heading,
    GPT,
    FollowUp,
  };
  // if (!message || !message.type) console.log(message);
  const Component =
    message && message.type ? COMPONENT_MAP[message.type] : undefined;
  return Component ? (
    <Component
      content={message.content}
      sendMessage={sendMessage}
      blockUsage={blockUsage}
    />
  ) : null;
});

MessageHandler.displayName = "message_handler";

export default function Home() {
  const messagesEndRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [messageHistory, setMessageHistory] = useState([]);
  const [blockUsage, setBlockUsage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleInserts = (payload) => {
    // console.log(payload);
    setMessageHistory((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const isSameType = lastMessage?.type === "GPT" && payload.type === "GPT";
      return isSameType
        ? [...prevMessages.slice(0, -1), payload]
        : [...prevMessages, payload];
    });
  };

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [messageHistory]);

  useEffect(() => {
    socket.on("emit-payload", (payload) => {
      handleInserts(payload);
    });

    if (getUserID() == "") setUUIDCookie();

    supabase
      .from("message_history")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data: message_history, error }) => {
        if (error) console.log(error, "err");
        else {
          let messagesPayload = [];
          const userID = getUserID();
          message_history?.map((message) => {
            if (message.to == userID) messagesPayload.push(message.payload);
          });
          setMessageHistory(messagesPayload);
          const queries = messageHistory.filter((message) => {
            return message.type === "Query";
          });
          if (queries.length > 3) {
            setBlockUsage(true);
            openModal();
          }
          // console.log(messagesPayload);
        }
      });

    // Clean up on unmount
    return () => socket.off("emit-payload");
  }, []);

  const btnSendMessage = async (event) => {
    await sendMessage();
  };

  const sendMessage = async (messageToSend) => {
    const message = messageToSend || inputValue;

    setInputValue("");
    try {
      const userID = getUserID();
      // console.log(userID);
      const messagePayload = {
        type: "Query",
        content: message,
        userID: userID,
      };
      socket.emit("send-message", {
        messageData: { message: message },
        userID: userID,
      });

      handleInserts(messagePayload);

      const queries = messageHistory.filter((message) => {
        return message.type === "Query";
      });
      if (queries.length > 3) {
        setBlockUsage(true);
        openModal();
      }
    } catch (err) {
      console.log("err", err);
    }
  };
  return (
    <div className="flex text-[#ebecf5] p-8 ">
      <Modal isOpen={isModalOpen} onClose={closeModal}></Modal>
      {/* {messageHistory ? ( */}
      <div className="flex-grow flex-col justify-between mx-auto max-w-4xl ">
        <span className="text-3xl font-bold my-4 w-full flex">{`This is an AI RAG demo with web search results: (there is a limit to the number of queries)`}</span>

        {messageHistory?.map((message, index) => {
          // console.log(message);
          return (
            <MessageHandler
              key={index}
              message={message}
              sendMessage={sendMessage}
              blockUsage={blockUsage}
            />
          );
        })}
        <div className="">
          <InputArea
            inputValue={inputValue}
            setInputValue={setInputValue}
            sendMessage={sendMessage}
            btnSendMessage={btnSendMessage}
            blockUsage={blockUsage}
          />
          <div ref={messagesEndRef} />
        </div>
      </div>
      {/* ) : (
        <div className="container h-screen flex items-center align-center">
          <div className="bounce">Loading...</div>
        </div>
      )} */}
    </div>
  );
}
