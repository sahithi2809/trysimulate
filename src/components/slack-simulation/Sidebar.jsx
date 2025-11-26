import React from 'react';
import { Hash, Lock, Circle, ChevronDown } from 'lucide-react';

export const Sidebar = ({ 
  channels, 
  selectedChannelId, 
  onSelectChannel, 
  users,
  currentUser 
}) => {
  
  const publicChannels = channels.filter(c => c.type === 'public');
  const privateChannels = channels.filter(c => c.type === 'private');
  const dms = channels.filter(c => c.type === 'dm');

  const ChannelItem = ({ channel }) => {
    const isSelected = channel.id === selectedChannelId;
    const isUnread = (channel.unreadCount || 0) > 0;
    
    // For DMs, find the other user to show status
    let statusColor = 'text-gray-400';
    let label = channel.name;
    let Icon = Hash;

    if (channel.type === 'private') Icon = Lock;
    
    if (channel.type === 'dm') {
      const otherUserId = channel.memberIds.find(id => id !== currentUser.id);
      const otherUser = users.find(u => u.id === otherUserId);
      label = otherUser?.name || 'Unknown';
      Icon = Circle;
      if (otherUser?.status === 'online') statusColor = 'text-green-500 fill-current';
      if (otherUser?.status === 'busy') statusColor = 'text-red-500 fill-current';
    }

    return (
      <button
        onClick={() => onSelectChannel(channel.id)}
        className={`
          w-full flex items-center px-4 py-1.5 text-sm mb-0.5
          transition-colors duration-150 group
          ${isSelected ? 'bg-blue-700 text-white' : 'text-slate-300 hover:bg-slate-700'}
          ${isUnread && !isSelected ? 'font-bold text-white' : ''}
        `}
      >
        <span className={`mr-2 opacity-70 ${channel.type === 'dm' ? statusColor : ''}`}>
           {channel.type === 'dm' ? (
             <Icon size={10} className={statusColor === 'text-gray-400' ? '' : 'fill-current'} />
           ) : (
             <Icon size={14} />
           )}
        </span>
        <span className="truncate">{label}</span>
        {isUnread && (
          <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 rounded-full">
            {channel.unreadCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="w-64 bg-[#19171D] text-slate-300 flex flex-col h-full flex-shrink-0">
      {/* Workspace Header */}
      <div className="h-14 border-b border-slate-700 flex items-center px-4 hover:bg-slate-700 cursor-pointer transition-colors">
        <h1 className="font-bold text-white text-lg truncate">Acme Corp Product</h1>
        <ChevronDown size={16} className="ml-2 opacity-70" />
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {/* Public Channels */}
        {publicChannels.length > 0 && (
          <div className="px-2 mb-4">
            <div className="px-2 text-xs font-semibold text-slate-400 uppercase mb-1">Channels</div>
            {publicChannels.map(channel => (
              <ChannelItem key={channel.id} channel={channel} />
            ))}
          </div>
        )}

        {/* Private Channels */}
        {privateChannels.length > 0 && (
          <div className="px-2 mb-4">
            <div className="px-2 text-xs font-semibold text-slate-400 uppercase mb-1">Private</div>
            {privateChannels.map(channel => (
              <ChannelItem key={channel.id} channel={channel} />
            ))}
          </div>
        )}

        {/* Direct Messages */}
        {dms.length > 0 && (
          <div className="px-2">
            <div className="px-2 text-xs font-semibold text-slate-400 uppercase mb-1">Direct Messages</div>
            {dms.map(channel => (
              <ChannelItem key={channel.id} channel={channel} />
            ))}
          </div>
        )}
      </div>

      {/* User Info Footer */}
      <div className="h-14 border-t border-slate-700 flex items-center px-4">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <img 
            src={currentUser.avatar} 
            alt={currentUser.name} 
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-xs text-slate-400 truncate">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

