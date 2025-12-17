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
    <div className="min-h-screen h-screen text-white flex flex-col relative overflow-x-hidden overflow-y-auto">
      {/* Main Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/assets/background.png')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-[#050b14]/80"></div>
      </div>
      {/* Navbar */}
      <nav className="flex-shrink-0 p-4 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-white/10 z-20">
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
      <main className="flex-1 flex flex-col items-center p-6 relative z-10 min-h-0">
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
              { file: 'File2.webp', name: 'Ocean King', mode: GameMode.FISH },
              { file: 'File3.webp', name: 'Dragon Slots', mode: GameMode.SLOTS },
              { file: 'File4.webp', name: 'Nano Studio', mode: GameMode.CREATIVE },
              { file: 'File5.svg', name: 'Red Hot Chili 7s', mode: GameMode.SLOTS },
              { file: 'File6.svg', name: 'Royal 40 Fruits', mode: GameMode.SLOTS },
              { file: 'File7.svg', name: 'Shining Princess', mode: GameMode.SLOTS },
              { file: 'File8.webp', name: 'Space Rocks', mode: GameMode.SLOTS },
              { file: 'File9.webp', name: 'Thunder Strike', mode: GameMode.SLOTS },
              { file: 'File10.webp', name: 'Wild Buffalo', mode: GameMode.SLOTS },
              { file: 'File11.webp', name: 'Wolf Reels', mode: GameMode.SLOTS },
              { file: 'File12.webp', name: 'Volcano Fruits', mode: GameMode.SLOTS },
              { file: 'File13.webp', name: 'Lucky 777', mode: GameMode.SLOTS },
              { file: 'File14.webp', name: 'Golden Dragon', mode: GameMode.SLOTS },
              { file: 'File15.webp', name: 'Fire Kirin', mode: GameMode.FISH },
              { file: 'File16.webp', name: 'Mega Fortune', mode: GameMode.SLOTS },
              { file: 'File17.webp', name: 'Crystal Quest', mode: GameMode.SLOTS },
              { file: 'File18.webp', name: 'Treasure Island', mode: GameMode.FISH },
              { file: 'File19.webp', name: 'Magic Forest', mode: GameMode.SLOTS },
              { file: 'File20.svg', name: 'Star Quest', mode: GameMode.SLOTS },
              { file: 'File21.svg', name: 'Diamond Rush', mode: GameMode.SLOTS },
              { file: 'File22.svg', name: 'Pirate Gold', mode: GameMode.SLOTS },
              { file: 'File23.svg', name: 'Phoenix Rising', mode: GameMode.SLOTS },
              { file: 'File24.svg', name: 'Neon Nights', mode: GameMode.SLOTS },
              { file: 'File25.svg', name: 'Cosmic Win', mode: GameMode.SLOTS },
              { file: 'File26.webp', name: 'Jungle Adventure', mode: GameMode.FISH },
              { file: 'File27.webp', name: 'Mystic Moon', mode: GameMode.SLOTS },
              { file: 'File28.webp', name: 'Desert Storm', mode: GameMode.SLOTS },
              { file: 'File29.webp', name: 'Ice Kingdom', mode: GameMode.SLOTS },
              { file: 'File30.webp', name: 'Tropical Paradise', mode: GameMode.SLOTS },
              { file: 'File31.webp', name: 'Ancient Temple', mode: GameMode.SLOTS },
              { file: 'File32.webp', name: 'Cyber City', mode: GameMode.SLOTS },
              { file: 'File33.webp', name: 'Fantasy Realm', mode: GameMode.SLOTS },
              { file: 'File34.webp', name: 'Ocean Depths', mode: GameMode.FISH },
              { file: 'File35.webp', name: 'Sky High', mode: GameMode.SLOTS },
              { file: 'File36.webp', name: 'Underground', mode: GameMode.SLOTS },
              { file: 'File37.webp', name: 'Mountain Peak', mode: GameMode.SLOTS },
              { file: 'File38.webp', name: 'River Flow', mode: GameMode.FISH },
              { file: 'File39.webp', name: 'Crystal Cave', mode: GameMode.SLOTS },
              { file: 'File40.webp', name: 'Sunset Valley', mode: GameMode.SLOTS },
              { file: 'File41.webp', name: 'Midnight Express', mode: GameMode.SLOTS },
              { file: 'File42.webp', name: 'Aurora Lights', mode: GameMode.SLOTS },
              { file: 'File43.webp', name: 'Storm Chaser', mode: GameMode.SLOTS },
              { file: 'File44.webp', name: 'Wind Rider', mode: GameMode.SLOTS },
              { file: 'File45.webp', name: 'Flame Keeper', mode: GameMode.SLOTS },
              { file: 'File46.webp', name: 'Water Spirit', mode: GameMode.FISH },
              { file: 'File47.webp', name: 'Earth Guardian', mode: GameMode.SLOTS },
              { file: 'File48.svg', name: 'Light Warrior', mode: GameMode.SLOTS },
              { file: 'File49.webp', name: 'Shadow Hunter', mode: GameMode.SLOTS },
              { file: 'File50.webp', name: 'Dragon Master', mode: GameMode.SLOTS },
              { file: 'File51.webp', name: 'Knight Quest', mode: GameMode.SLOTS },
              { file: 'File52.webp', name: 'Wizard Tower', mode: GameMode.SLOTS },
              { file: 'File53.webp', name: 'Castle Siege', mode: GameMode.SLOTS },
              { file: 'File54.webp', name: 'Kingdom Rush', mode: GameMode.SLOTS },
              { file: 'File55.webp', name: 'Empire Builder', mode: GameMode.SLOTS },
              { file: 'File56.webp', name: 'Legend Quest', mode: GameMode.SLOTS },
              { file: 'File57.svg', name: 'Hero Journey', mode: GameMode.SLOTS },
              { file: 'File58.svg', name: 'Epic Battle', mode: GameMode.SLOTS },
              { file: 'File59.svg', name: 'Final Boss', mode: GameMode.SLOTS },
              { file: 'File60.svg', name: 'Victory Lap', mode: GameMode.SLOTS },
              { file: 'File61.webp', name: 'Champion', mode: GameMode.SLOTS },
              { file: 'File62.svg', name: 'Grand Prize', mode: GameMode.SLOTS },
              { file: 'File63.svg', name: 'Jackpot King', mode: GameMode.SLOTS },
            ].map((game, index) => {
              return (
                <button
                  key={game.file}
                  onClick={() => setMode(game.mode)}
                  className="group relative h-48 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-slate-700/50 overflow-hidden hover:scale-105 hover:border-cyan-500/50 transition duration-300 shadow-lg hover:shadow-cyan-500/20"
                >
                  <div className="absolute inset-0">
                    <img 
                      src={`/assets/${game.file}`} 
                      alt={game.name}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition duration-300"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-slate-800 text-gray-500 text-xs">Image not found</div>';
                      }}
                    />
                  </div>
                </button>
              );
            })}
         </div>

         {/* Content Section */}
         <div className="w-full max-w-6xl mt-16 mb-12 px-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
               <h2 className="text-3xl md:text-4xl font-black text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 arcade-font">
                  RIVERSWEEPS™ SERVICES AND PRODUCTS — TOP AND UNIQUE BENEFITS
               </h2>
               
               <div className="space-y-8 text-gray-300 leading-relaxed">
                  <div>
                     <h3 className="text-xl md:text-2xl font-bold text-white mb-4">
                        UNLOCK THE POWER OF WEB-BASED SWEEPSTAKES SOFTWARE WITH RIVERSWEEPS™: SEAMLESSLY RUN AND MANAGE YOUR SWEEPSTAKES ONLINE FOR MAXIMUM SUCCESS
                     </h3>
                  </div>

                  <div>
                     <h3 className="text-xl font-bold text-cyan-400 mb-4">THE BENEFITS OF WEB-BASED SWEEPSTAKES SOFTWARE</h3>
                     <p className="mb-4">
                        Harness the potential of online promotions with <strong className="text-white">Riversweeps™</strong> and <strong className="text-white">River Sweeps</strong> web-based sweepstakes software. This innovative solution empowers you to effortlessly establish and oversee a wide array of sweepstakes. From customizable templates that infuse your unique brand identity to an array of features designed to amplify engagement with participants, web-based sweepstakes software sets the stage for harnessing the full power of online promotions.
                     </p>
                  </div>

                  <div>
                     <h3 className="text-xl font-bold text-cyan-400 mb-4">GREAT BENEFITS OF WEB-BASED SWEEPSTAKES SOFTWARE</h3>
                     <ul className="space-y-3 list-disc list-inside ml-4">
                        <li><strong className="text-white">Easy Setup and Management:</strong> Craft a professional sweepstakes website and tailor it to your preferences with just a few clicks. Efficiently oversee entries and regulations to ensure a seamless and effective operation.</li>
                        <li><strong className="text-white">Enhanced Participant Engagement:</strong> Elevate participant interaction by collecting additional data such as contact details and survey responses. Use this information to craft personalized communications that enhance the likelihood of converting entrants into loyal customers.</li>
                        <li><strong className="text-white">Automated Efficiency:</strong> Automate repetitive tasks like tracking entries and selecting winners with ease. Allow the software to handle administrative aspects, freeing you to concentrate on strategic promotion.</li>
                        <li><strong className="text-white">Security and Compliance:</strong> Maintain compliance with regulations and safeguard both entrants and your brand with <strong className="text-white">Riversweeps™</strong> web-based sweepstakes software's built-in security features.</li>
                     </ul>
                  </div>

                  <div>
                     <h3 className="text-xl font-bold text-cyan-400 mb-4">KEY FEATURES AND FUNCTIONALITIES</h3>
                     <p className="mb-4">Embrace a suite of capabilities that streamline the journey of executing a successful online promotion:</p>
                     <ul className="space-y-3 list-disc list-inside ml-4">
                        <li><strong className="text-white">Customizable Templates:</strong> Design a website that resonates with your brand through personalized templates.</li>
                        <li><strong className="text-white">Entry and Winner Tracking:</strong> Effortlessly manage entries, rules, and winners with intuitive tracking tools.</li>
                        <li><strong className="text-white">Automated Notifications:</strong> Keep participants informed about their entry status and notify winners automatically.</li>
                        <li><strong className="text-white">Digital Marketing Integration:</strong> Amplify awareness of your sweepstakes via various digital channels, including email and social media.</li>
                        <li><strong className="text-white">Analytics Insights:</strong> Gain valuable insights into sweepstakes performance, including entry count, return visitor rate, and more.</li>
                        <li><strong className="text-white">Security and Compliance Measures:</strong> Ensure the legality and validity of entries by adhering to industry regulations and standards.</li>
                     </ul>
                  </div>

                  <div>
                     <h3 className="text-xl font-bold text-cyan-400 mb-4">SEAMLESSLY RUNNING YOUR SWEEPSTAKES ONLINE</h3>
                     <p>
                        <strong className="text-white">River777</strong> and <strong className="text-white">Riversweeps™</strong> web-based sweepstakes software revolutionizes the process of conducting and overseeing online promotions. By automating laborious tasks, you can concentrate on crafting engaging content and boosting visibility for your sweepstakes. With simplified entry and winner tracking, you can ensure that all actions align with legal requirements, minimizing potential legal complications.
                     </p>
                  </div>

                  <div>
                     <h3 className="text-xl font-bold text-cyan-400 mb-4">MANAGING AND ANALYZING SWEEPSTAKES PERFORMANCE</h3>
                     <p>
                        Beyond its setup and management capabilities, <strong className="text-white">River Sweeps</strong> web-based sweepstakes software serves as an invaluable analytics tool. Key metrics, such as entry count, returning participants, and engagement duration, can be swiftly tracked. Leverage these insights to fine-tune your campaigns, guaranteeing the success of every sweepstakes. Integration with digital marketing tools further enables multi-channel promotion.
                     </p>
                  </div>

                  <div>
                     <h3 className="text-xl font-bold text-cyan-400 mb-4">CHOOSING THE RIGHT WEB-BASED SWEEPSTAKES SOFTWARE</h3>
                     <p className="mb-4">Selecting the ideal web-based sweepstakes software demands careful consideration:</p>
                     <ul className="space-y-3 list-disc list-inside ml-4">
                        <li><strong className="text-white">Prioritize Security and Compliance:</strong> Opt for solutions that prioritize security and comply with legal standards.</li>
                        <li><strong className="text-white">Suitable Features:</strong> Select software equipped with features tailored to your needs, from customizable templates to automated notifications.</li>
                        <li><strong className="text-white">Value Proposition:</strong> Compare solutions to find the best balance of features and pricing.</li>
                        <li><strong className="text-white">User-Friendly Interface:</strong> Opt for intuitive software to ensure hassle-free operation.</li>
                     </ul>
                     <p className="mt-4">
                        <strong className="text-white">Riversweeps™</strong> web-based sweepstakes software empowers you to optimize online promotions, unlock conversions, and cultivate customer growth. Make an informed choice and watch your business flourish.
                     </p>
                  </div>

                  <div className="mt-12 pt-8 border-t border-white/10">
                     <h3 className="text-2xl font-bold text-cyan-400 mb-6">FAQs</h3>
                     <div className="space-y-6">
                        <div>
                           <h4 className="font-bold text-white mb-2">Q: DOES WEB-BASED SWEEPSTAKES SOFTWARE COST MONEY?</h4>
                           <p className="text-gray-400">A: Most web-based sweepstakes software solutions have a fee, though limited-feature free versions may be available.</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-2">Q: IS WEB-BASED SWEEPSTAKES SOFTWARE SECURE?</h4>
                           <p className="text-gray-400">A: Yes, most solutions prioritize security and compliance. Look for features such as data encryption and secure payment processing.</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-2">Q: WHAT ARE THE BENEFITS OF WEB-BASED SWEEPSTAKES SOFTWARE?</h4>
                           <p className="text-gray-400">A: Web-based software simplifies setup, management, and tracking of promotions, offers engagement tools, automation, and compliance features.</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-2">Q: HOW DO I CHOOSE THE RIGHT WEB-BASED SWEEPSTAKES SOFTWARE?</h4>
                           <p className="text-gray-400">A: Prioritize security, features aligned with your needs, value, and user-friendliness.</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-2">Q: WHAT INSIGHTS CAN I GAIN FROM WEB-BASED SWEEPSTAKES SOFTWARE?</h4>
                           <p className="text-gray-400">A: Insights include entry count, return visitor rate, and more, aiding decision-making for future promotions.</p>
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-2">Q: ARE THERE OTHER ADVANTAGES TO USING WEB-BASED SWEEPSTAKES SOFTWARE?</h4>
                           <p className="text-gray-400">A: Yes, software ensures compliance and validity while simplifying entry and winner tracking, safeguarding your brand and participants.</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
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