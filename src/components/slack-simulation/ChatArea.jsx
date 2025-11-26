import React, { useRef, useEffect, useState } from 'react';
import { Send, Smile, Paperclip, Bolt } from 'lucide-react';
import { MessageItem } from './MessageItem';

export const ChatArea = ({ 
  messages, 
  currentUser, 
  users, 
  onSendMessage,
  typingUsers,
  channelName
}) => {
  const bottomRef = useRef(null);
  const [inputText, setInputText] = useState('');

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    const names = typingUsers.map(id => users.find(u => u.id === id)?.name || 'Someone');
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return 'Several people are typing...';
  };

  // Group messages by date to add dividers (simple version)
  // And group subsequent messages from same user
  const renderMessages = () => {
    let lastSenderId = '';
    let lastTime = 0;
    
    return messages.map((msg, index) => {
      // 5 minutes threshold for grouping
      const isSequence = msg.senderId === lastSenderId && (msg.timestamp - lastTime < 300000);
      lastSenderId = msg.senderId;
      lastTime = msg.timestamp;
      
      const sender = users.find(u => u.id === msg.senderId) || currentUser;

      return (
        <MessageItem 
          key={msg.id} 
          message={msg} 
          sender={sender} 
          isSequence={isSequence} 
          isCurrentUser={msg.senderId === currentUser.id}
        />
      );
    });
  };

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-white">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <Bolt size={32} />
            </div>
            <p>This is the start of the <span className="font-semibold">#{channelName}</span> channel.</p>
          </div>
        ) : (
          renderMessages()
        )}
        
        {typingUsers.length > 0 && (
           <div className="text-xs text-gray-500 ml-12 animate-pulse mt-2">
             {getTypingText()}
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4 pt-2">
        <div className="border border-gray-300 rounded-xl shadow-sm bg-white focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
          
          {/* Toolbar (Bold, Italic, etc - visual only) */}
          <div className="flex items-center px-2 py-1 bg-gray-50 rounded-t-xl border-b border-gray-100">
            <div className="flex space-x-1">
              <button className="p-1 hover:bg-gray-200 rounded text-gray-500 font-bold text-xs w-6 h-6 flex items-center justify-center">B</button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-500 italic text-xs w-6 h-6 flex items-center justify-center">I</button>
              <button className="p-1 hover:bg-gray-200 rounded text-gray-500 line-through text-xs w-6 h-6 flex items-center justify-center">S</button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-end p-2">
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${channelName}`}
                className="w-full max-h-32 min-h-[40px] p-2 outline-none text-gray-900 placeholder-gray-400 bg-transparent"
                autoFocus
              />
            </div>
            
            <div className="flex items-center space-x-2 pb-1">
               {/* Visual attachments buttons */}
               <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                  <Paperclip size={18} />
               </button>
               <button type="button" className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                  <Smile size={18} />
               </button>
               <button 
                  type="submit" 
                  disabled={!inputText.trim()}
                  className={`p-2 rounded transition-colors ${inputText.trim() ? 'bg-[#007a5a] text-white hover:bg-[#148567]' : 'bg-gray-200 text-gray-400'}`}
                >
                  <Send size={16} />
               </button>
            </div>
          </form>
        </div>
        <div className="text-[10px] text-gray-400 mt-1 text-center">
          <strong>Tip:</strong> Press Enter to send. This is a simulation powered by Gemini.
        </div>
      </div>
    </div>
  );
};

