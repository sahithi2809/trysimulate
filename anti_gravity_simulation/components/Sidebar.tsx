import React from 'react';
import { User, Channel } from '../types';
import { Hash, Lock, Circle, Plus, ChevronDown, MessageSquare } from 'lucide-react';

interface SidebarProps {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  users: User[];
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  channels, 
  selectedChannelId, 
  onSelectChannel, 
  users,
  currentUser 
}) => {
  
  const publicChannels = channels.filter(c => c.type === 'public');
  const privateChannels = channels.filter(c => c.type === 'private');
  const dms = channels.filter(c => c.type === 'dm');

  const ChannelItem: React.FC<{ channel: Channel }> = ({ channel }) => {
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
        {/* Sections */}
        <div className="mb-6">
          <div className="px-4 flex items-center justify-between group mb-1 cursor-pointer">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-300">Channels</h2>
            <Plus size={14} className="opacity-0 group-hover:opacity-100 text-slate-400" />
          </div>
          {publicChannels.map(c => <ChannelItem key={c.id} channel={c} />)}
          {privateChannels.map(c => <ChannelItem key={c.id} channel={c} />)}
        </div>

        <div className="mb-6">
          <div className="px-4 flex items-center justify-between group mb-1 cursor-pointer">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-hover:text-slate-300">Direct Messages</h2>
            <Plus size={14} className="opacity-0 group-hover:opacity-100 text-slate-400" />
          </div>
          {dms.map(c => <ChannelItem key={c.id} channel={c} />)}
        </div>
      </div>

      {/* User Profile Snippet */}
      <div className="p-3 bg-[#121016] flex items-center">
        <div className="relative">
          <img src={currentUser.avatar} alt="Me" className="w-9 h-9 rounded bg-gray-600" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#121016] rounded-full"></div>
        </div>
        <div className="ml-2 overflow-hidden">
          <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
          <div className="text-xs text-slate-400 truncate">Product Manager</div>
        </div>
      </div>
    </div>
  );
};