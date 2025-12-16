import React, { useState, useEffect, useRef } from 'react';
import FishGame from './components/FishGame';
import SlotMachine from './components/SlotMachine';
import LandingPage from './components/LandingPage';
import CreativeStudio from './components/CreativeStudio';
import { GameMode, ChatMessage } from './types';
import { generatePitBossResponse } from './services/geminiService';
import { Bot, MessageSquare, Menu, X, Gamepad2, Coins, Palette } from 'lucide-react';

export const App = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedGame, setSelectedGame] = useState("RiverSweeps");
  const [mode, setMode] = useState<GameMode>(GameMode.LOBBY);
  const [balance, setBalance] = useState(10000);
  const [jackpot, setJackpot] = useState(50000); // Progressive Jackpot State
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  
  // Auto-scroll chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogin = (user: string, game: string) => {
      setUsername(user);
      setSelectedGame(game);
      setMessages([
        { role: 'model', text: `Welcome to ${game} on RiverSweeps, ${user}! I'm the Boss here. Need chips? Just ask!` }
      ]);
      setHasEntered(true);
  };

  // Handle AI interactions
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsLoadingChat(true);

    // Simple cheat codes handled locally, else Gemini
    if (chatInput.toLowerCase().includes("add coins") || chatInput.toLowerCase().includes("cheat")) {
       setTimeout(() => {
           setMessages(prev => [...prev, { role: 'model', text: '🤫 Giving you a stimulus package. Don\'t tell the owner.' }]);
           setBalance(b => b + 5000);
           setIsLoadingChat(false);
       }, 1000);
       return;
    }

    const responseText = await generatePitBossResponse(messages, chatInput, balance);
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsLoadingChat(false);
  };

  const onGameEvent = async (eventDescription: string) => {
    // Occasionally trigger AI comment on game events
    if (Math.random() > 0.7) {
        const responseText = await generatePitBossResponse(messages, `[System Event: Player triggered: ${eventDescription}]`, balance);
        setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    }
  };

  const goBack = () => setMode(GameMode.LOBBY);

  // Show Landing Page if not logged in
  if (!hasEntered) {
      return <LandingPage onLogin={handleLogin} />;
  }

  // Render Game Modes
  if (mode === GameMode.FISH) {
      return <FishGame balance={balance} setBalance={setBalance} onGameEvent={onGameEvent} goBack={goBack} />;
  }

  if (mode === GameMode.SLOTS) {
      return <SlotMachine balance={balance} setBalance={setBalance} jackpot={jackpot} setJackpot={setJackpot} onGameEvent={onGameEvent} goBack={goBack} />;
  }

  if (mode === GameMode.CREATIVE) {
      return <CreativeStudio goBack={goBack} onGameEvent={onGameEvent} />;
  }

  // Render Lobby (Default)
  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-x-hidden">
      {/* Main Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/background.png')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-[#050b14]/80"></div>
      </div>
      {/* Navbar */}
      <nav className="p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <img src="/assets/logo.svg" alt="RiverSweeps Logo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
               <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-vault-purple arcade-font leading-none">
                RiverSweeps
              </h1>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{selectedGame}</span>
          </div>
         
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center text-xs text-gray-400 font-bold mr-2">
              PLAYER: <span className="text-white ml-1">{username.toUpperCase()}</span>
           </div>
           <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-kirin-gold/50">
              <Coins className="w-4 h-4 text-kirin-gold" />
              <span className="font-bold font-mono">{balance.toLocaleString()}</span>
           </div>
           <button onClick={() => setChatOpen(!chatOpen)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
         {/* Background */}
         <div className="fixed inset-0 z-[-1] overflow-hidden">
            <div className="absolute inset-0 bg-[url('/assets/background.png')] bg-cover bg-center opacity-40"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(139,92,246,0.2),_transparent_70%)]"></div>
            {/* Floating Icons */}
            <div className="absolute top-1/4 left-1/4 text-6xl animate-float opacity-50">🐠</div>
            <div className="absolute bottom-1/4 right-1/4 text-6xl animate-spin-slow opacity-50">🎰</div>
         </div>

         <h2 className="text-4xl md:text-6xl font-black text-center mb-12 drop-shadow-[0_0_15px_rgba(255,69,0,0.8)] arcade-font">
           CHOOSE YOUR GAME
         </h2>
         
         {/* Global Jackpot Display in Lobby */}
         <div className="mb-12 bg-gradient-to-r from-transparent via-red-900/80 to-transparent px-12 py-4 border-y border-kirin-gold/30">
            <div className="text-center">
                <span className="text-kirin-gold font-bold tracking-widest text-sm uppercase">Live Progressive Jackpot</span>
                <div className="text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] tabular-nums">
                  ${jackpot.toLocaleString()}
                </div>
            </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-7xl">
            {/* Game Images from Assets */}
            {[
              'File2.webp', 'File3.webp', 'File4.webp', 'File5.svg', 'File6.svg',
              'File7.svg', 'File8.webp', 'File9.webp', 'File10.webp', 'File11.webp',
              'File12.webp', 'File13.webp', 'File14.webp', 'File15.webp', 'File16.webp',
              'File17.webp', 'File18.webp', 'File19.webp', 'File20.svg', 'File21.svg',
              'File22.svg', 'File23.svg', 'File24.svg', 'File25.svg', 'File26.webp',
              'File27.webp', 'File28.webp', 'File29.webp', 'File30.webp', 'File31.webp',
              'File32.webp', 'File33.webp', 'File34.webp', 'File35.webp', 'File36.webp',
              'File37.webp', 'File38.webp', 'File39.webp', 'File40.webp', 'File41.webp',
              'File42.webp', 'File43.webp', 'File44.webp', 'File45.webp', 'File46.webp',
              'File47.webp', 'File48.svg', 'File49.webp', 'File50.webp', 'File51.webp',
              'File52.webp', 'File53.webp', 'File54.webp', 'File55.webp', 'File56.webp',
              'File57.svg', 'File58.svg', 'File59.svg', 'File60.svg', 'File61.webp',
              'File62.svg', 'File63.svg'
            ].map((imageFile, index) => {
              // Map first few to game modes, rest to FISH mode
              let onClickHandler = () => setMode(GameMode.FISH);
              let gameName = `Game ${index + 1}`;
              
              if (index === 0) {
                onClickHandler = () => setMode(GameMode.FISH);
                gameName = 'Ocean King';
              } else if (index === 1) {
                onClickHandler = () => setMode(GameMode.SLOTS);
                gameName = 'Dragon Slots';
              } else if (index === 2) {
                onClickHandler = () => setMode(GameMode.CREATIVE);
                gameName = 'Nano Studio';
              }
              
              return (
                <button
                  key={imageFile}
                  onClick={onClickHandler}
                  className="group relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700/50 overflow-hidden hover:scale-105 hover:border-cyan-500/50 transition duration-300 shadow-lg hover:shadow-cyan-500/20"
                >
                  <div className="absolute inset-0">
                    <img 
                      src={`/assets/${imageFile}`} 
                      alt={gameName}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Game';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider arcade-font text-center drop-shadow-lg">
                      {gameName}
                    </h3>
                  </div>
                </button>
              );
            })}
         </div>
      </main>

      {/* AI Chat Overlay */}
      {chatOpen && (
          <div className="fixed bottom-4 right-4 w-80 h-96 bg-slate-900/95 border border-vault-purple/50 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden backdrop-blur-md">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-3 flex justify-between items-center border-b border-white/10">
                  <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-kirin-red flex items-center justify-center">
                          <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div>
                          <div className="font-bold text-sm">PIT BOSS</div>
                          <div className="text-[10px] text-green-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> ONLINE
                          </div>
                      </div>
                  </div>
                  <button onClick={() => setChatOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2 rounded-lg text-sm ${
                              m.role === 'user' 
                              ? 'bg-blue-600 text-white rounded-br-none' 
                              : 'bg-slate-700 text-gray-100 rounded-bl-none border border-slate-600'
                          }`}>
                              <div className="whitespace-pre-wrap">{m.text}</div>
                          </div>
                      </div>
                  ))}
                  {isLoadingChat && <div className="text-xs text-gray-500 animate-pulse pl-2">Typing...</div>}
                  <div ref={chatEndRef}></div>
              </div>

              <div className="p-3 bg-slate-900 border-t border-white/5">
                  <div className="flex gap-2">
                      <input 
                          type="text" 
                          className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:border-vault-purple text-white"
                          placeholder="Ask for luck or news..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button onClick={handleSendMessage} className="bg-vault-purple text-white rounded-full p-1.5 hover:bg-violet-500 transition">
                          <MessageSquare className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};