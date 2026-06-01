import { useState, useRef, useEffect } from 'react';
import { aiAlerts } from '../data/mockData';
import {
  Bot, Send, Mic, MicOff, AlertTriangle, Info, AlertCircle,
  Bell, TrendingUp, RefreshCw
} from 'lucide-react';

const suggestedQueries = [
  "Show me top 5 low stock items",
  "What is our COD recovery rate this month?",
  "Generate production efficiency report",
  "Compare sales this month vs last month",
  "Which carrier has highest RTO rate?",
  "What are our best selling products?",
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: { label: string; type: string }[];
}

export default function AIManager() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your FabricFlow AI Manager. I can help you analyze data, generate reports, update records, and provide insights about your business. What would you like to know?",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        timestamp: new Date().toLocaleTimeString(),
        actions: input.toLowerCase().includes('report') 
          ? [{ label: 'Download PDF', type: 'download' }, { label: 'View Details', type: 'view' }]
          : input.toLowerCase().includes('create') 
            ? [{ label: 'Confirm', type: 'confirm' }, { label: 'Cancel', type: 'cancel' }]
            : undefined,
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('low stock')) {
      return "Based on current inventory levels, here are your top 5 low stock items:\n\n1. **Cotton Grey Fabric** (RM-COT-GRY) - 45 MTR left (Reorder: 100)\n2. **V-Neck Grey L** (FG-VN-GRY-L) - 12 pcs left (Reorder: 30)\n3. **Classic Polo White L** (FG-PL-WHT-L) - 30 pcs left (Reorder: 50)\n\n⚠️ Cotton Grey Fabric is critically low. I recommend creating a purchase order for 500 MTR. Would you like me to generate one?";
    }
    
    if (lowerQuery.includes('cod recovery')) {
      return "📊 **COD Recovery Analysis - December 2024**\n\n• Total COD Amount: ₹4,25,000\n• Collected: ₹2,85,000 (67.1%)\n• Pending: ₹1,25,000\n• Overdue (>7 days): ₹15,000\n\n📈 Recovery rate is 3.2% higher than last month.\n\n**By Aggregator:**\n• Express Logistics: ₹85,000 pending\n• Delhivery: ₹25,000 pending\n• Shiprocket: ₹15,000 pending\n\nI recommend initiating settlement with Express Logistics for the pending ₹85,000.";
    }
    
    if (lowerQuery.includes('sales') && lowerQuery.includes('compare')) {
      return "📊 **Sales Comparison: December vs November 2024**\n\n| Metric | Nov 2024 | Dec 2024 | Change |\n|--------|----------|----------|--------|\n| Total Revenue | ₹11,25,000 | ₹12,50,000 | +11.1% |\n| B2B Sales | ₹6,75,000 | ₹7,50,000 | +11.1% |\n| B2C Sales | ₹4,50,000 | ₹5,00,000 | +11.1% |\n| Orders | 1,120 | 1,245 | +11.2% |\n| Avg Order Value | ₹1,004 | ₹1,004 | 0% |\n\n📈 **Key Insights:**\n• December shows strong growth across all channels\n• B2C from Shopify contributed most to the increase\n• Average order value remained stable";
    }
    
    if (lowerQuery.includes('production') || lowerQuery.includes('efficiency')) {
      return "📋 **Production Efficiency Report - December 2024**\n\n**Summary:**\n• Total Job Works: 22\n• Completed: 15 (68.2%)\n• In Process: 2\n• Delayed: 1 (JW-101)\n\n**By Contractor:**\n| Contractor | Jobs | On-Time | Efficiency |\n|------------|------|---------|------------|\n| Star Stitching Works | 18 | 16 | 88.9% |\n| Quality Garments | 4 | 4 | 100% |\n\n**Cost Analysis:**\n• Average cost per piece: ₹72\n• Total production value: ₹2,45,000\n\n⚠️ **Alert:** JW-101 is 4 days overdue. Contractor: Star Stitching Works. Contact: Ramesh Kumar (+91 98777 88899)";
    }
    
    if (lowerQuery.includes('rto') || lowerQuery.includes('courier')) {
      return "🚚 **Courier Performance Analysis - Last 30 Days**\n\n| Courier | Orders | Delivered | RTO | RTO Rate |\n|---------|--------|-----------|-----|----------|\n| Delhivery | 450 | 420 | 30 | 6.67% |\n| Express Logistics | 380 | 365 | 15 | 3.95% |\n| BlueDart | 290 | 275 | 15 | 5.17% |\n\n📈 **Analysis:**\n• **Best Performer:** Express Logistics (3.95% RTO)\n• **Needs Improvement:** Delhivery (6.67% RTO)\n\n⚠️ **Recommendation:**\n1. Delhivery's RTO rate is 67% higher than average\n2. Consider addressing delivery instructions with Delhivery\n3. Top RTO reason: Customer not available (45%)\n\nWould you like me to generate a detailed report?";
    }
    
    if (lowerQuery.includes('best') || lowerQuery.includes('top product')) {
      return "🏆 **Top Performing Products - December 2024**\n\n| Rank | Product | SKU | Units Sold | Revenue | Margin |\n|------|---------|-----|------------|---------|--------|\n| 1 | Classic Polo Black M | FG-PL-BLK-M | 198 | ₹1,38,402 | 68.5% |\n| 2 | Classic Polo White M | FG-PL-WHT-M | 165 | ₹1,15,335 | 68.5% |\n| 3 | Classic Polo White L | FG-PL-WHT-L | 134 | ₹93,766 | 68.5% |\n\n📈 **Insights:**\n• Classic Polo in Black & White dominates sales\n• Medium size is the most popular\n• Men's products account for 85% of revenue\n\n💡 **Recommendation:** Increase production of Classic Polo variants. Consider launching in Navy Blue based on market trends.";
    }
    
    return `I understand your query: "${query}"\n\nLet me analyze this for you. Based on the current data in your FabricFlow ERP system, I've processed your request.\n\nHere are the key findings:\n• Your business is performing well with 12.5% revenue growth\n• Inventory levels are healthy with 3 items requiring attention\n• Production efficiency is at 88.5% this month\n\nWould you like me to:\n1. Generate a detailed report?\n2. Create a new record?\n3. Send notifications to relevant team members?\n\nPlease let me know how I can help further!`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">AI Manager</h1>
            <p className="text-gray-500 text-sm">Your intelligent business assistant</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'chat', label: 'Chat', icon: Bot },
              { id: 'alerts', label: 'Alerts', icon: Bell, count: aiAlerts.filter(a => !a.isRead).length },
              { id: 'insights', label: 'Insights', icon: TrendingUp },
              { id: 'actions', label: 'Actions Log', icon: RefreshCw },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count && tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-medium text-indigo-600">AI Manager</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    {message.actions && (
                      <div className="flex gap-2 mt-3">
                        {message.actions.map((action, idx) => (
                          <button key={idx} className="px-3 py-1.5 bg-white text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-50 border border-indigo-200">
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {suggestedQueries.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={`p-2.5 rounded-lg transition-colors ${
                    isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything about your business..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {activeTab === 'alerts' && (
          <div className="p-4 space-y-4">
            {aiAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-xl border ${
                !alert.isRead ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.type === 'critical' ? 'bg-red-100' :
                    alert.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                  }`}>
                    {alert.type === 'critical' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                     alert.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-600" /> :
                     <Info className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{alert.title}</h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        alert.type === 'critical' ? 'bg-red-100 text-red-700' :
                        alert.type === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-400">{alert.module}</span>
                      <span className="text-xs text-gray-400">{alert.timestamp}</span>
                    </div>
                    {alert.actions && (
                      <div className="flex gap-2 mt-3">
                        {alert.actions.map((action, idx) => (
                          <button key={idx} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        {activeTab === 'insights' && (
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">AI-Generated Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Sales Growth Opportunity', desc: 'Shopify orders dropped 40% in 3 days. Investigate marketing campaigns.', type: 'warning' },
                { title: 'Inventory Optimization', desc: 'Classic Polo variants have 15% higher turnover than other products.', type: 'info' },
                { title: 'Production Efficiency', desc: 'Star Stitching has 88.9% on-time delivery. Consider for priority jobs.', type: 'success' },
                { title: 'COD Risk Alert', desc: 'Express Logistics has ₹85K pending COD. Initiate settlement soon.', type: 'warning' },
              ].map((insight, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      insight.type === 'warning' ? 'bg-amber-500' :
                      insight.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <h4 className="font-medium text-gray-800">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions Log */}
        {activeTab === 'actions' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">AI Actions Log</h3>
            <p className="text-gray-500 mb-4">
              All actions performed by the AI Manager are logged here for audit and review.
            </p>
            <p className="text-sm text-gray-400">No actions recorded yet in this session.</p>
          </div>
        )}
      </div>
    </div>
  );
}
