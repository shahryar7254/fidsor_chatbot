import React from 'react';
import './ChatbotLauncher.css';

interface ChatbotLauncherProps {
  onClick: () => void;
}

export const ChatbotLauncher: React.FC<ChatbotLauncherProps> = ({ onClick }) => {
  return (
    <button className="o_chatbot_launcher" onClick={onClick}>
      💬 AI Assistant
    </button>
  );
};
