import React from 'react';

export const MessageItem = ({ message, sender, isSequence, isCurrentUser }) => {
  const timeString = new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={`
      group flex items-start px-2 py-1 -mx-2 hover:bg-gray-50 rounded transition-colors
      ${isSequence ? 'mt-0' : 'mt-3'}
    `}>
      {/* Avatar Gutter */}
      <div className="w-9 flex-shrink-0 mr-3">
        {!isSequence && (
          <img 
            src={sender.avatar} 
            alt={sender.name} 
            className="w-9 h-9 rounded-md bg-gray-200 object-cover" 
          />
        )}
        {isSequence && (
           <div className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 text-right pr-1 pt-1">
             {timeString}
           </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {!isSequence && (
          <div className="flex items-baseline">
            <span className="font-bold text-gray-900 mr-2">{sender.name}</span>
            <span className="text-xs text-gray-500">{timeString}</span>
          </div>
        )}
        
        <div className="text-gray-800 leading-relaxed text-[15px]">
          {message.text}
        </div>
      </div>
    </div>
  );
};

