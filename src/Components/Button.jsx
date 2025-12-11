// src/Components/Button.jsx
import React from "react";

 const Button = ({ onClick, disabled, className, children, variant }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={` btn btn-retro px-3 py-1 border-2 border-black ${
      variant === "outline" 
        ? " hover:bg-gray-100" 
        : "hover:bg-gray-100"
    } disabled:bg-gray-300 disabled:cursor-not-allowed ${className}`}
    style={{ boxShadow: disabled ? "none" : "2px 2px 0px black", fontSize: "0.8rem" }}
    
  >
    {children}
  </button>
);
export default Button;