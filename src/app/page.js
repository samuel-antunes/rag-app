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

const SUPABASE_URL = "https://cpjirhyzwjiaafwuxfzk.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwamlyaHl6d2ppYWFmd3V4ZnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyMDI5MjYsImV4cCI6MjAyMjc3ODkyNn0.3EyrCg_WZmSQuDANglVpuyQe_KP1eXdfVFZ-UNpyCTU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const Component = COMPONENT_MAP[message.type];
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
  const [messageHistory, setMessageHistory] = useState(null);
  const [blockUsage, setBlockUsage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, [messageHistory]);

  useEffect(() => {
    const handleInserts = (payload) => {
      setMessageHistory((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        const isSameType =
          lastMessage?.payload?.type === "GPT" &&
          payload.new.payload.type === "GPT";
        return isSameType
          ? [...prevMessages.slice(0, -1), payload.new]
          : [...prevMessages, payload.new];
      });
    };
    supabase
      .channel("message_history")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "message_history" },
        handleInserts
      )
      .subscribe();
    supabase
      .from("message_history")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data: message_history, error }) => {
        if (error) console.log("error", error);
        const userID = getUserID();
        const filteredMessages = message_history.filter((message) => {
          const payload = message.payload;

          return payload.to === userID;
        });
        const queries = filteredMessages.filter((message) => {
          return message.payload.type === "Query";
        });

        if (queries.length > 3) {
          setBlockUsage(true);
          openModal();
        }
        setMessageHistory(filteredMessages);
      });

    if (getUserID() === "") setUUIDCookie();
  }, []);
  const sendMessage = async (messageToSend) => {
    const message = messageToSend || inputValue;
    const userID = getUserID();
    const body = JSON.stringify({ message: message, to: userID });
    setInputValue("");
    try {
      const response = await fetch("/api/backend", {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok: " + response.statusText);
      }
      console.log(response);
      const data = await response.json();
      console.log("data", data);

      const queries = messageHistory.filter((message) => {
        return message.payload.type === "Query";
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
    <div className="flex text-[#ebecf5] p-8 md:p-0 ">
      <Modal isOpen={isModalOpen} onClose={closeModal}></Modal>
      {messageHistory ? (
        <div className="flex-grow flex-col justify-between mx-auto max-w-4xl ">
          {messageHistory.map((message, index) => (
            <>
              <MessageHandler
                key={index}
                message={message.payload}
                sendMessage={sendMessage}
                blockUsage={blockUsage}
              />
            </>
          ))}
          <div className="">
            <InputArea
              inputValue={inputValue}
              setInputValue={setInputValue}
              sendMessage={sendMessage}
              blockUsage={blockUsage}
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        <div className="container h-screen flex items-center align-center">
          <div className="bounce">Loading...</div>
        </div>
      )}
    </div>
  );
}
