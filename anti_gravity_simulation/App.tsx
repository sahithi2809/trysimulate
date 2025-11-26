import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { EvaluationModal } from './components/EvaluationModal';
import { INITIAL_CHANNELS, INITIAL_USERS, INITIAL_MESSAGES, CURRENT_USER, SCENARIOS } from './constants';
import { Channel, Message, User, Scenario, Evaluation } from './types';
import { generateIncomingMessage, generateReply, evaluatePerformance } from './services/simulationService';

// Icons
import { Play, Pause, Activity, Target, CheckSquare, Zap } from 'lucide-react';

export default function App() {
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [selectedChannelId, setSelectedChannelId] = useState<string>(INITIAL_CHANNELS[0].id);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({}); // channelId -> userIds
  
  // Scenario / Challenge State
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [showEvaluation, setShowEvaluation] = useState<boolean>(false);

  // Ref to track latest state for simulation intervals
  const stateRef = useRef({ channels, users, messages, isSimulating, activeScenario });
  
  useEffect(() => {
    stateRef.current = { channels, users, messages, isSimulating, activeScenario };
  }, [channels, users, messages, isSimulating, activeScenario]);

  // Handle sending a message as the current user
  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: CURRENT_USER.id,
      text,
      timestamp: Date.now(),
      channelId: selectedChannelId,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChannelId]: [...(prev[selectedChannelId] || []), newMessage],
    }));

    // Trigger responses based on context (Scenario or DM)
    const channel = channels.find(c => c.id === selectedChannelId);
    
    // Determine who should reply
    let responders: string[] = [];

    // Case 1: Active Scenario in this channel
    if (activeScenario && activeScenario.channelId === selectedChannelId) {
      // Pick a stakeholder who isn't the current user and maybe not the last speaker
      // For simplicity, pick a random stakeholder from the scenario list
      const potentialResponders = activeScenario.stakeholders.filter(id => id !== CURRENT_USER.id);
      
      // Higher chance of reply in scenarios
      if (potentialResponders.length > 0) {
        // Pick one or two stakeholders to reply
        const responderId = potentialResponders[Math.floor(Math.random() * potentialResponders.length)];
        responders.push(responderId);
      }
    } 
    // Case 2: Direct Message
    else if (channel?.type === 'dm') {
      const targetUserId = channel.memberIds.find(id => id !== CURRENT_USER.id);
      if (targetUserId) responders.push(targetUserId);
    }

    // Process responders
    for (const responderId of responders) {
        triggerTyping(selectedChannelId, responderId);
        try {
          // Delay for realism
          setTimeout(async () => {
             const responseText = await generateReply(
               responderId, 
               users, 
               stateRef.current.messages[selectedChannelId] || [], 
               text,
               activeScenario || undefined
             );
             addMessage(selectedChannelId, responderId, responseText);
             clearTyping(selectedChannelId, responderId);
          }, 2000 + Math.random() * 3000);
        } catch (error) {
          console.error("Failed to generate reply", error);
          clearTyping(selectedChannelId, responderId);
        }
    }
  };

  const addMessage = (channelId: string, senderId: string, text: string) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random(),
      senderId,
      text,
      timestamp: Date.now(),
      channelId,
    };

    setMessages((prev) => {
      const channelMessages = prev[channelId] || [];
      return {
        ...prev,
        [channelId]: [...channelMessages, newMessage],
      };
    });

    // Mark channel as unread if not currently selected
    if (selectedChannelId !== channelId) {
      setChannels(prev => prev.map(c => 
        c.id === channelId ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
      ));
    }
  };

  const triggerTyping = (channelId: string, userId: string) => {
    setTypingUsers(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), userId]
    }));
  };

  const clearTyping = (channelId: string, userId: string) => {
    setTypingUsers(prev => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter(id => id !== userId)
    }));
  };

  // Simulation Loop: Random background messages
  useEffect(() => {
    const interval = setInterval(async () => {
      const { isSimulating, channels, users, activeScenario } = stateRef.current;
      if (!isSimulating) return;

      // If a scenario is active, reduce background noise to focus user on the task
      const chance = activeScenario ? 0.2 : 0.7; // 20% vs 70%

      if (Math.random() < chance) { // Use < for clearer logic (if rand is less than chance)
        // Pick a random channel that is NOT the current one (mostly)
        const randomChannel = channels[Math.floor(Math.random() * channels.length)];
        
        // Don't interrupt the scenario channel with random noise if it's the active one
        if (activeScenario && randomChannel.id === activeScenario.channelId) return;

        // Pick a random user who is a member of that channel (and not the current user)
        const validSenders = randomChannel.memberIds.filter(id => id !== CURRENT_USER.id);
        if (validSenders.length === 0) return;
        
        const senderId = validSenders[Math.floor(Math.random() * validSenders.length)];
        
        triggerTyping(randomChannel.id, senderId);

        try {
          const text = await generateIncomingMessage(senderId, users, randomChannel);
          setTimeout(() => {
            addMessage(randomChannel.id, senderId, text);
            clearTyping(randomChannel.id, senderId);
          }, 3000); 
        } catch (e) {
          clearTyping(randomChannel.id, senderId);
          console.error("Simulation error", e);
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannelId(channelId);
    setChannels(prev => prev.map(c => 
      c.id === channelId ? { ...c, unreadCount: 0 } : c
    ));
  };

  // Scenario Management
  const startRandomScenario = () => {
    if (activeScenario) return;
    
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setActiveScenario(randomScenario);
    
    // Switch to the channel
    handleChannelSelect(randomScenario.channelId);

    // Post the initial message
    setTimeout(() => {
      addMessage(randomScenario.channelId, randomScenario.initiatorId, randomScenario.initialMessage);
    }, 1000);
  };

  const endScenario = async () => {
    if (!activeScenario) return;
    setIsEvaluating(true);

    try {
      const result = await evaluatePerformance(
        activeScenario, 
        messages[activeScenario.channelId] || [],
        users
      );
      setEvaluation(result);
      setShowEvaluation(true);
      setActiveScenario(null);
    } catch (e) {
      console.error("Evaluation failed", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden antialiased">
      {/* Sidebar */}
      <Sidebar 
        channels={channels} 
        selectedChannelId={selectedChannelId} 
        onSelectChannel={handleChannelSelect}
        users={users}
        currentUser={CURRENT_USER}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        
        {/* Scenario Banner */}
        {activeScenario && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center text-amber-800 text-sm">
              <Target size={16} className="mr-2" />
              <span className="font-bold mr-1">Current Challenge:</span>
              <span className="truncate max-w-xl">{activeScenario.title}</span>
            </div>
            <button 
              onClick={endScenario}
              disabled={isEvaluating}
              className="flex items-center space-x-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-semibold transition-colors"
            >
              {isEvaluating ? (
                <span>Generating Report...</span>
              ) : (
                <>
                  <CheckSquare size={14} />
                  <span>Submit Decision</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Header */}
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center font-bold text-gray-900 overflow-hidden">
            {selectedChannel?.type === 'dm' ? '@ ' : '# '}
            {selectedChannel?.name}
            {selectedChannel?.purpose && (
               <span className="ml-4 text-xs font-normal text-gray-500 hidden md:block truncate">
                 {selectedChannel.purpose}
               </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
             {/* Simulation Control */}
             <div className="flex items-center space-x-2">
                {!activeScenario && (
                  <button 
                    onClick={startRandomScenario}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-medium transition-colors shadow-sm"
                  >
                    <Zap size={14} />
                    <span>Start Challenge</span>
                  </button>
                )}
                
                <button 
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`p-2 rounded-md transition-colors ${isSimulating ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`}
                  title={isSimulating ? "Simulation Live" : "Simulation Paused"}
                >
                  {isSimulating ? <Activity size={18} /> : <Pause size={18} />}
                </button>
             </div>
          </div>
        </header>

        {/* Chat Area */}
        <ChatArea 
          messages={messages[selectedChannelId] || []}
          currentUser={CURRENT_USER}
          users={users}
          onSendMessage={handleSendMessage}
          typingUsers={typingUsers[selectedChannelId] || []}
          channelName={selectedChannel?.name || 'Unknown'}
        />

        {/* Evaluation Modal */}
        <EvaluationModal 
          isOpen={showEvaluation}
          onClose={() => setShowEvaluation(false)}
          evaluation={evaluation}
          scenarioTitle={activeScenario?.title || 'Completed Scenario'} 
        />
      </div>
    </div>
  );
}