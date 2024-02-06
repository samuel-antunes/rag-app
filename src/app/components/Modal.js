import React from "react";

const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "#3a3b42",
        color: "#ebecf5",
        padding: "20px",
        zIndex: 1000,
      }}
      className="border rounded-md border-black"
    >
      <h2 className="text-3xl mb-2">Usage limit</h2>
      <p className="text-xl mb-2">
        Unfortunately, this is just a demo, therefore the number of queries per
        user has a limit.
      </p>
      <button
        onClick={onClose}
        className="justify-end border rounded-md focus:outline-none focus:border-blue-500 p-2"
      >
        Close
      </button>
    </div>
  );
};

export default Modal;
