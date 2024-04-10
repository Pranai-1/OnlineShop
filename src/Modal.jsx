import React from "react";



const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed right-1 bg-[#fff] bottom-[100px] p-2 rounded-xl shadow-xl">
      <div className="p-2">
        <div className="flex flex-row items-center justify-between font">
          <h2 className="text-lg">{title}</h2>
          <button onClick={onClose}>Close</button> 
        </div>
        <div className="">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
