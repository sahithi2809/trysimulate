import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSimulationById, saveProgress } from '../utils/storage';

const UniversalSimulationRenderer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [simulation, setSimulation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [scores, setScores] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Decision Tree state
  const [currentNode, setCurrentNode] = useState('start');
  const [decisionPath, setDecisionPath] = useState([]);
  const [isDecisionTreeComplete, setIsDecisionTreeComplete] = useState(false);
  
  // Role Play state
  const [currentRolePlayStep, setCurrentRolePlayStep] = useState(0);
  const [conversation, setConversation] = useState([]);
  const [userResponse, setUserResponse] = useState('');
  const [isRolePlayComplete, setIsRolePlayComplete] = useState(false);
  
  // Drag Drop state
  const [itemPositions, setItemPositions] = useState({});
  const [isDragDropComplete, setIsDragDropComplete] = useState(false);
  const [showDragDropResults, setShowDragDropResults] = useState(false);

  useEffect(() => {
    const sim = getSimulationById(id);
    setLoading(false);
    
    if (sim && sim.isAIGenerated) {
      setSimulation(sim);
    } else {
      alert('AI-generated simulation not found');
      navigate('/browse');
    }
  }, [id, navigate]);

  const handleResponse = (stepId, response) => {
    setResponses(prev => ({
      ...prev,
      [stepId]: response
    }));
  };

  const handleNext = () => {
    const shouldContinue = () => {
      switch (simulation.interactionType) {
        case 'multiple-choice':
          return currentStep < (simulation.questions?.length || 0) - 1;
        case 'scenario-based':
          return currentStep < (simulation.decisions?.length || 0) - 1;
        case 'role-play':
          return currentStep < (simulation.interactions?.length || 0) - 1;
        case 'text-input':
          return currentStep < (simulation.interactions?.length || 0) - 1;
        case 'decision-tree':
        case 'drag-drop':
          return false; // These handle their own completion
        default:
          return currentStep < (simulation.interactions?.length || 0) - 1;
      }
    };

    if (shouldContinue()) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // Calculate scores based on simulation type
    const totalScore = calculateScore();
    saveProgress(id, totalScore, responses);
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!simulation) return 0;
    
    switch (simulation.interactionType) {
      case 'multiple-choice':
        return calculateMultipleChoiceScore();
      case 'scenario-based':
        return calculateScenarioScore();
      case 'text-input':
        return calculateTextInputScore();
      default:
        return 75; // Default score for custom types
    }
  };

  const calculateMultipleChoiceScore = () => {
    if (!simulation?.questions) return 0;
    
    let correct = 0;
    simulation.questions.forEach(question => {
      const response = responses[question.id];
      if (response && question.options.find(opt => opt.id === response)?.isCorrect) {
        correct++;
      }
    });
    
    return Math.round((correct / simulation.questions.length) * 100);
  };

  const calculateScenarioScore = () => {
    if (!simulation?.decisions) return 0;
    
    let totalScore = 0;
    simulation.decisions.forEach(decision => {
      const response = responses[decision.id];
      if (response) {
        const option = decision.options.find(opt => opt.id === response);
        if (option) {
          totalScore += option.score || 0;
        }
      }
    });
    
    return Math.min(totalScore, simulation.evaluation?.maxScore || 100);
  };

  const calculateTextInputScore = () => {
    // Simple scoring based on response length and keywords
    if (!simulation?.interactions) return 0;
    
    let totalScore = 0;
    simulation.interactions.forEach(interaction => {
      const response = responses[interaction.id];
      if (response && response.length > 10) {
        totalScore += 25; // Base score for having a response
        if (response.length > 50) totalScore += 25; // Bonus for detailed response
        if (response.length > 100) totalScore += 25; // Bonus for comprehensive response
        totalScore += 25; // Bonus for any response
      }
    });
    
    return Math.min(totalScore, 100);
  };

  const renderInteraction = (interaction) => {
    switch (simulation.interactionType) {
      case 'text-input':
        return renderTextInput(interaction);
      case 'multiple-choice':
        return renderMultipleChoice(interaction);
      case 'scenario-based':
        return renderScenarioBased(interaction);
      case 'decision-tree':
        return renderDecisionTree(interaction);
      case 'role-play':
        return renderRolePlay(interaction);
      case 'drag-drop':
        return renderDragDrop(interaction);
      default:
        return renderCustom(interaction);
    }
  };

  const renderTextInput = (interaction) => (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">Your Task</h3>
        <p className="text-blue-800">{interaction.prompt}</p>
        {interaction.context && (
          <p className="text-blue-700 text-sm mt-2">{interaction.context}</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          Your Response
        </label>
        <textarea
          value={responses[interaction.id] || ''}
          onChange={(e) => handleResponse(interaction.id, e.target.value)}
          rows={6}
          maxLength={interaction.maxLength || 500}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          placeholder="Type your response here..."
        />
        <div className="text-sm text-slate-500 mt-1">
          {(responses[interaction.id] || '').length}/{interaction.maxLength || 500} characters
        </div>
      </div>
    </div>
  );

  const renderMultipleChoice = (question) => (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Question {currentStep + 1}</h3>
        <p className="text-slate-700 mb-4">{question.question}</p>
        {question.context && (
          <p className="text-slate-600 text-sm mb-4">{question.context}</p>
        )}
        
        <div className="space-y-3">
          {question.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                responses[question.id] === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option.id}
                checked={responses[question.id] === option.id}
                onChange={(e) => handleResponse(question.id, e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-slate-700">{option.text}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderScenarioBased = (decision) => (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Decision Point {currentStep + 1}</h3>
        <p className="text-slate-700 mb-4">{decision.situation}</p>
        {decision.context && (
          <p className="text-slate-600 text-sm mb-4">{decision.context}</p>
        )}
        
        <div className="space-y-3">
          {decision.options.map((option) => (
            <label
              key={option.id}
              className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                responses[decision.id] === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name={`decision-${decision.id}`}
                value={option.id}
                checked={responses[decision.id] === option.id}
                onChange={(e) => handleResponse(decision.id, e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="text-slate-700 font-medium">{option.text}</div>
                {option.consequences && (
                  <div className="text-slate-600 text-sm mt-1">{option.consequences}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDecisionTree = (interaction) => {
    const getCurrentNodeData = () => {
      // New structure: decisionTree is an object with node IDs as keys
      return simulation.decisionTree?.[currentNode];
    };

    const handleDecision = (option) => {
      const newPath = [...decisionPath, { 
        node: currentNode, 
        choice: option.text,
        impact: option.impact 
      }];
      setDecisionPath(newPath);
      
      // Check if the next node exists
      const nextNode = simulation.decisionTree?.[option.next];
      
      if (nextNode) {
        setCurrentNode(option.next);
        
        // Check if it's an ending node
        if (nextNode.isEnd) {
          setIsDecisionTreeComplete(true);
          handleResponse('decision-tree', { path: newPath, ending: nextNode });
        }
      } else {
        // If next node doesn't exist, treat as incomplete
        console.error('Next node not found:', option.next);
      }
    };

    const resetTree = () => {
      setCurrentNode('start');
      setDecisionPath([]);
      setIsDecisionTreeComplete(false);
    };

    const currentNodeData = getCurrentNodeData();

    if (isDecisionTreeComplete) {
      // Get the ending node (current node should be an end node)
      const ending = simulation.decisionTree?.[currentNode];
      
      return (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-bold text-green-900 mb-4">Decision Tree Complete!</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Your Path:</h4>
                <div className="space-y-2">
                  {decisionPath.map((step, index) => (
                    <div key={index} className="text-sm bg-white rounded p-3 border border-green-200">
                      <div className="font-medium text-green-900">Step {index + 1}: {step.choice}</div>
                      {step.impact && <div className="text-xs text-green-700 mt-1">→ {step.impact}</div>}
                    </div>
                  ))}
                </div>
              </div>
              
              {ending && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Final Outcome: {ending.outcome}</h4>
                  <p className="text-green-700 mb-3">{ending.description}</p>
                  {ending.feedback && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                      <strong>Feedback:</strong> {ending.feedback}
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={resetTree}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentNodeData) {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="font-bold text-red-900 mb-4">Error</h3>
            <p className="text-red-700 mb-2">Decision tree data is incomplete.</p>
            <p className="text-sm text-red-600">Current node "{currentNode}" not found in decision tree.</p>
            <button
              onClick={resetTree}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reset Tree
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Decision Point {decisionPath.length + 1}</h3>
          <p className="text-slate-700 mb-2">{currentNodeData.description}</p>
          <p className="text-lg font-semibold text-slate-900 mb-6">{currentNodeData.question}</p>
          
          <div className="space-y-3">
            {currentNodeData.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleDecision(option)}
                className="w-full text-left p-4 rounded-lg border-2 border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <div className="font-medium text-slate-900 mb-2">{option.text}</div>
                {option.impact && <div className="text-sm text-slate-600">→ {option.impact}</div>}
                {option.consequences && (
                  <div className="text-sm text-slate-600">{option.consequences}</div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {decisionPath.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">Your Journey So Far:</h4>
            <div className="space-y-1">
              {decisionPath.map((step, index) => (
                <div key={index} className="text-sm text-blue-700">
                  Step {index + 1}: {step.choice}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRolePlay = (interaction) => {
    const interactions = simulation.interactions || [];
    const currentInt = interactions[currentRolePlayStep];

    const handleSendResponse = () => {
      if (!userResponse.trim()) return;

      const newConversation = [
        ...conversation,
        {
          type: 'user',
          message: userResponse,
          timestamp: new Date().toLocaleTimeString()
        }
      ];

      setConversation(newConversation);
      setUserResponse('');

      // Move to next interaction or complete
      if (currentRolePlayStep < interactions.length - 1) {
        setCurrentRolePlayStep(prev => prev + 1);
      } else {
        setIsRolePlayComplete(true);
        handleResponse('role-play', { conversation: newConversation });
      }
    };

    const resetConversation = () => {
      setCurrentRolePlayStep(0);
      setConversation([]);
      setUserResponse('');
      setIsRolePlayComplete(false);
    };

    if (isRolePlayComplete) {
      return (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-bold text-green-900 mb-4">Role Play Complete!</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Conversation Summary:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conversation.map((msg, index) => (
                    <div key={index} className={`text-sm p-2 rounded ${
                      msg.type === 'user' 
                        ? 'bg-blue-100 text-blue-800 ml-4' 
                        : 'bg-slate-100 text-slate-700 mr-4'
                    }`}>
                      <strong>{msg.type === 'user' ? 'You' : 'Character'}:</strong> {msg.message}
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={resetConversation}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentInt) {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <h3 className="font-bold text-red-900 mb-4">Error</h3>
            <p className="text-red-700">Role play data is incomplete.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Character Information */}
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Role Play - Interaction {currentRolePlayStep + 1}</h3>
          
          <div className="mb-4">
            <h4 className="font-semibold text-slate-800 mb-2">Character:</h4>
            <p className="text-slate-700">{currentInt.participant}</p>
            <p className="text-slate-600 text-sm">{currentInt.situation}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-4">
            <h4 className="font-semibold text-blue-900 mb-2">What they say:</h4>
            <p className="text-blue-800 italic">"{currentInt.theirMessage}"</p>
            {currentInt.context && (
              <p className="text-blue-700 text-sm mt-2">{currentInt.context}</p>
            )}
          </div>
        </div>

        {/* Conversation History */}
        {conversation.length > 0 && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <h4 className="font-semibold text-slate-800 mb-3">Conversation History:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {conversation.map((msg, index) => (
                <div key={index} className={`text-sm p-2 rounded ${
                  msg.type === 'user' 
                    ? 'bg-blue-100 text-blue-800 ml-4' 
                    : 'bg-slate-100 text-slate-700 mr-4'
                }`}>
                  <strong>{msg.type === 'user' ? 'You' : 'Character'}:</strong> {msg.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Response Input */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-3">Your Response:</h4>
          <div className="space-y-4">
            <textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Type your response to the character..."
            />
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {currentRolePlayStep + 1} of {interactions.length} interactions
              </div>
              <button
                onClick={handleSendResponse}
                disabled={!userResponse.trim()}
                className={`px-6 py-2 font-semibold text-white rounded-lg transition-all ${
                  userResponse.trim()
                    ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
                    : 'bg-slate-400 cursor-not-allowed'
                }`}
              >
                {currentRolePlayStep < interactions.length - 1 ? 'Send & Continue' : 'Send & Finish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDragDrop = (interaction) => {
    const items = simulation.items || [];
    const categories = simulation.categories || [];

    const handleDragStart = (e, itemId) => {
      e.dataTransfer.setData('text/plain', itemId);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e, categoryId) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      setItemPositions(prev => ({
        ...prev,
        [itemId]: categoryId
      }));
    };

    const handleSubmit = () => {
      setIsDragDropComplete(true);
      setShowDragDropResults(true);
      handleResponse('drag-drop', { positions: itemPositions });
    };

    const resetPositions = () => {
      setItemPositions({});
      setIsDragDropComplete(false);
      setShowDragDropResults(false);
    };

    const calculateScore = () => {
      if (!simulation.evaluation?.correctPlacements) return 0;
      
      let correct = 0;
      const total = Object.keys(simulation.evaluation.correctPlacements).length;
      
      Object.entries(simulation.evaluation.correctPlacements).forEach(([itemId, correctCategory]) => {
        if (itemPositions[itemId] === correctCategory) {
          correct++;
        }
      });
      
      return Math.round((correct / total) * 100);
    };

    const getItemsInCategory = (categoryId) => {
      return items.filter(item => itemPositions[item.id] === categoryId);
    };

    const getUnplacedItems = () => {
      return items.filter(item => !itemPositions[item.id]);
    };

    if (showDragDropResults) {
      const score = calculateScore();
      
      return (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="font-bold text-green-900 mb-4">Drag & Drop Complete!</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">{score}%</div>
                <div className="text-green-800">Overall Score</div>
              </div>
              
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Your Placements:</h4>
                <div className="space-y-2">
                  {Object.entries(itemPositions).map(([itemId, categoryId]) => {
                    const item = items.find(i => i.id === itemId);
                    const category = categories.find(c => c.id === categoryId);
                    const isCorrect = simulation.evaluation?.correctPlacements?.[itemId] === categoryId;
                    
                    return (
                      <div key={itemId} className={`p-2 rounded text-sm ${
                        isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        <strong>{item?.title}</strong> → {category?.title}
                        {isCorrect ? ' ✓' : ' ✗'}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <button
                onClick={resetPositions}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="font-bold text-slate-900 mb-4">Drag & Drop Task</h3>
          <p className="text-slate-700 mb-4">{simulation.scenario?.task}</p>
          
          <div className="text-sm text-slate-600">
            Drag each item to the appropriate category based on priority and importance.
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Items to Drag */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Items to Organize:</h4>
            <div className="space-y-2">
              {getUnplacedItems().map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="p-4 bg-white border-2 border-dashed border-slate-300 rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="font-medium text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{item.description}</div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      {item.timeEstimate}
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      {item.impact} impact
                    </span>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                      {item.urgency} urgency
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drop Zones */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-800">Categories:</h4>
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, category.id)}
                  className="min-h-[120px] p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <div className="font-medium text-slate-900 mb-2">{category.title}</div>
                  <div className="text-sm text-slate-600 mb-3">{category.description}</div>
                  
                  <div className="space-y-2">
                    {getItemsInCategory(category.id).map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-white border border-slate-200 rounded text-sm"
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={Object.keys(itemPositions).length === 0}
            className={`px-8 py-3 font-semibold text-white rounded-lg transition-all ${
              Object.keys(itemPositions).length > 0
                ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            Submit Organization
          </button>
        </div>
      </div>
    );
  };

  const renderCustom = (interaction) => (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-4">Custom Interaction</h3>
        <p className="text-slate-700">{interaction.prompt}</p>
        {interaction.context && (
          <p className="text-slate-600 text-sm mt-2">{interaction.context}</p>
        )}
      </div>
    </div>
  );

  if (loading || !simulation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading simulation...</div>
      </div>
    );
  }

  if (showResults) {
    const totalScore = calculateScore();
    
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Simulation Complete!</h2>
              <p className="text-slate-600">Here's how you performed</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{totalScore}%</div>
                <div className="text-slate-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent mb-2">
                  {simulation.interactions?.length || simulation.questions?.length || 0}
                </div>
                <div className="text-slate-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500 mb-2">
                  {simulation.difficulty}
                </div>
                <div className="text-slate-600">Difficulty Level</div>
              </div>
            </div>

            {simulation.learningObjectives && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Learning Objectives</h3>
                <ul className="space-y-2">
                  {simulation.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-center text-slate-700">
                      <span className="text-green-500 mr-2">✓</span>
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/browse')}
                className="flex-1 py-3 font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg hover:shadow-lg transition-all"
              >
                Browse More Simulations
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentInteraction = () => {
    switch (simulation.interactionType) {
      case 'multiple-choice':
        return simulation.questions?.[currentStep];
      case 'scenario-based':
        return simulation.decisions?.[currentStep];
      case 'decision-tree':
        return simulation.decisionTree;
      case 'role-play':
        return simulation.interactions?.[currentStep];
      case 'drag-drop':
        return simulation;
      default:
        return simulation.interactions?.[currentStep];
    }
  };

  const getProgressDisplay = () => {
    switch (simulation.interactionType) {
      case 'multiple-choice':
        return `${currentStep + 1}/${simulation.questions?.length || 1}`;
      case 'scenario-based':
        return `${currentStep + 1}/${simulation.decisions?.length || 1}`;
      case 'decision-tree':
        return 'Decision Tree';
      case 'role-play':
        return `${currentStep + 1}/${simulation.interactions?.length || 1}`;
      case 'drag-drop':
        return 'Drag & Drop';
      default:
        return `${currentStep + 1}/${simulation.interactions?.length || 1}`;
    }
  };

  const canProceed = () => {
    const currentInteraction = getCurrentInteraction();
    const response = responses[currentInteraction?.id];
    const hasValidResponse = response && response.trim().length > 0;
    
    // Debug logging
    console.log('canProceed debug:', {
      interactionType: simulation.interactionType,
      currentStep,
      currentInteraction: currentInteraction?.id,
      hasResponse: !!response,
      responseLength: response?.length || 0,
      hasValidResponse,
      responseValue: response,
      responses
    });
    
    switch (simulation.interactionType) {
      case 'decision-tree':
      case 'drag-drop':
        return false; // These handle their own completion
      case 'multiple-choice':
        return !!response; // Any selection is valid
      case 'scenario-based':
        return !!response; // Any selection is valid
      case 'text-input':
        return hasValidResponse; // Must have actual text content
      case 'role-play':
        return true; // Role play handles its own validation
      default:
        return hasValidResponse; // Default to requiring actual content
    }
  };

  const getNextButtonText = () => {
    switch (simulation.interactionType) {
      case 'decision-tree':
      case 'drag-drop':
        return 'Complete'; // These don't use the next button
      case 'multiple-choice':
        return currentStep < (simulation.questions?.length || 0) - 1 ? 'Next' : 'Finish';
      case 'scenario-based':
        return currentStep < (simulation.decisions?.length || 0) - 1 ? 'Next' : 'Finish';
      case 'role-play':
        return currentStep < (simulation.interactions?.length || 0) - 1 ? 'Next' : 'Finish';
      case 'text-input':
        return currentStep < (simulation.interactions?.length || 0) - 1 ? 'Next' : 'Finish';
      default:
        return currentStep < (simulation.interactions?.length || 0) - 1 ? 'Next' : 'Finish';
    }
  };

  const currentInteraction = getCurrentInteraction();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{simulation.title}</h1>
              <p className="text-slate-600 mt-2">{simulation.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Progress</div>
              <div className="text-2xl font-bold text-primary">
                {getProgressDisplay()}
              </div>
            </div>
          </div>

          {simulation.scenario && (
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">Scenario</h3>
              <p className="text-slate-700 mb-2">
                <strong>Role:</strong> {simulation.scenario.role}
              </p>
              <p className="text-slate-700">
                <strong>Context:</strong> {simulation.scenario.context}
              </p>
              {simulation.scenario.situation && (
                <p className="text-slate-700 mt-2">
                  <strong>Situation:</strong> {simulation.scenario.situation}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Current Interaction */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 mb-6">
          {currentInteraction && renderInteraction(currentInteraction)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate('/browse')}
            className="px-6 py-3 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all"
          >
            Exit Simulation
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-6 py-3 font-semibold text-white rounded-lg transition-all ${
              canProceed()
                ? 'bg-gradient-to-r from-primary to-accent hover:shadow-lg'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            {getNextButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversalSimulationRenderer;
