/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
  Brain, 
  MessageSquare, 
  Database, 
  User, 
  Cpu, 
  Send, 
  RefreshCcw, 
  History,
  ShieldCheck,
  ChevronRight,
  Target
} from 'lucide-react';
import { Message, Profile, Memory } from './types';
import { digitalMe } from './services/gemini';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'SYSTEM ONLINE. I am your MI Strategy Engine. My objective is to build your digital clone through sequential data extraction. Shall we begin?' }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [cloningProgress, setCloningProgress] = useState(5);
  const [activeTab, setActiveTab] = useState<'interview' | 'profile' | 'memory'>('interview');
  const [isExporting, setIsExporting] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, activeTab]);

  const handleExportSkill = async () => {
    if (!profile) return;
    setIsExporting(true);
    try {
      const markdown = await digitalMe.generateSkillMd(profile, memories);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SKILL.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing || cloningProgress >= 100) return;

    const userMsg: Message = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsProcessing(true);

    try {
      const response = await digitalMe.conductInterview(newHistory);
      const fullHistory = [...newHistory, { role: 'assistant', content: response } as Message];
      setMessages(fullHistory);
      
      let newProgress = cloningProgress;
      const userMessageCount = fullHistory.filter(m => m.role === 'user').length;
      
      if (userMessageCount > 0 && userMessageCount % 2 === 0) {
         const [newProfile, newMemories] = await Promise.all([
           digitalMe.extractProfile(fullHistory).catch(() => profile),
           digitalMe.distillMemories(fullHistory).catch(() => memories)
         ]);
         if (newProfile) {
           setProfile(newProfile as Profile);
           const p = newProfile as Profile;
           if (typeof p.completeness === 'number') {
             newProgress = Math.max(cloningProgress, Math.min(100, p.completeness));
           }
           setCloningProgress(newProgress);
         }
         if (newMemories) setMemories(newMemories as Memory[]);
      }

      if (newProgress >= 100 && cloningProgress < 100) {
         setMessages(prev => [...prev, { role: 'system', content: '>>> CLONING PROCESS COMPLETE. DIGITAL-ME PROFILE EXTRACTED. <<< \n You may now export the SKILL.md document or review your profile.' }]);
      }

    } catch (error) {
      console.error("Interview error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const navItems = [
    { id: 'interview', label: 'Interview', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'memory', label: 'Memory Hub', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-zinc-200">
      {/* Dynamic Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000010_1px,transparent_1px),linear-gradient(to_bottom,#00000010_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      </div>

      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-zinc-200 bg-white/80 backdrop-blur-md flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex items-center gap-3 text-black mb-6">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Cpu className="w-6 h-6" />
              </motion.div>
              <span className="text-lg font-mono font-bold tracking-tight">DIGITAL_ME</span>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">Cloning Status</p>
              <div className="h-[2px] w-full bg-zinc-100 overflow-hidden mb-2">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${cloningProgress}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
                  className="h-full bg-black" 
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>Phase 1</span>
                <span className="text-black font-bold">{cloningProgress}%</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`group relative w-full flex items-center gap-3 px-4 py-3 text-sm font-mono transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'text-black' 
                    : 'text-zinc-500 hover:text-black'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="active-nav"
                    className="absolute inset-0 bg-zinc-100 border border-zinc-200"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={`w-4 h-4 relative z-10 transition-colors ${activeTab === item.id ? 'text-black' : 'text-zinc-400 group-hover:text-black'}`} />
                <span className="uppercase tracking-wider relative z-10 font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-4 bg-zinc-50 border border-zinc-200 transition-colors hover:border-zinc-300">
              <div className="flex items-center gap-2 text-[10px] text-black mb-2 font-mono uppercase font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>Local Matrix</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                Data localized. Encryption active.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative bg-white/50 backdrop-blur-sm z-0">
          <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-mono text-black font-bold uppercase tracking-widest">{activeTab}_PROCESS</h2>
              <motion.div 
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 bg-black rounded-sm" 
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-zinc-400 hover:text-black transition-colors">
                <History className="w-4 h-4" />
              </button>
              <div className="h-4 w-[1px] bg-zinc-200" />
              <div className="flex items-center gap-2 px-3 py-1.5 border border-zinc-200 bg-zinc-50">
                <div className="w-1.5 h-1.5 bg-black" />
                <span className="text-[10px] font-mono text-black font-bold uppercase tracking-widest">v1.2.4</span>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {activeTab === 'interview' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : msg.role === 'system' ? 0 : -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : msg.role === 'system' ? 'justify-center' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] px-6 py-4 text-sm leading-relaxed transition-shadow shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-white text-black font-medium border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl rounded-tr-sm' 
                            : msg.role === 'system'
                            ? 'bg-zinc-100 text-zinc-600 font-mono text-xs uppercase tracking-widest text-center border border-zinc-200 rounded-xl'
                            : 'bg-white text-zinc-800 border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl rounded-tl-sm'
                        }`}>
                          <div className="markdown-body text-sm prose prose-sm prose-zinc prose-p:leading-relaxed prose-pre:bg-zinc-100 prose-pre:text-zinc-800">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isProcessing && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white border border-zinc-200 px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl rounded-tl-sm">
                          <div className="flex gap-2">
                            <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                            <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                            <motion.span animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-black rounded-full" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-8 pt-0 mt-auto">
                    <div className="relative flex items-center gap-2 bg-white border border-zinc-200 p-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[32px] focus-within:border-zinc-300 focus-within:shadow-[0_16px_40px_rgb(0,0,0,0.08)] transition-all duration-500">
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={cloningProgress >= 100}
                        placeholder={cloningProgress >= 100 ? "PROCESS COMPLETE." : "TRANSMIT DATA..."}
                        className="flex-1 bg-transparent px-6 py-3 outline-none text-sm placeholder:text-zinc-400 font-medium tracking-wide disabled:opacity-50"
                      />
                      <button 
                        onClick={handleSend}
                        disabled={!input.trim() || isProcessing || cloningProgress >= 100}
                        className="p-3.5 bg-black text-white rounded-full hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 group shadow-md"
                      >
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="p-10 h-full overflow-y-auto"
                >
                  {!profile ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                      <motion.div 
                        animate={{ rotate: 180 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 border-[1px] border-dashed border-zinc-300 flex items-center justify-center relative"
                      >
                        <motion.div 
                          animate={{ scale: [0.8, 1, 0.8] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Brain className="w-8 h-8 text-black" />
                        </motion.div>
                      </motion.div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-mono text-black font-bold uppercase tracking-widest">Awaiting Data</h3>
                        <p className="text-xs text-zinc-400 font-mono tracking-wide">Continue interaction to generate psychological profile.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 max-w-5xl mx-auto">
                       <div className="col-span-full flex justify-end">
                         <button 
                           onClick={handleExportSkill}
                           disabled={isExporting}
                           className="flex items-center gap-2 px-4 py-2 border border-black bg-black text-white hover:bg-zinc-800 transition-colors text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                         >
                           {isExporting ? 'Compiling...' : 'Export SKILL.md'}
                         </button>
                       </div>
                       <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
                        <div className="p-8 border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-[11px] font-mono font-bold text-black uppercase tracking-[0.2em] mb-6 border-b border-zinc-100 pb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-black inline-block" /> Core Traits
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {profile.traits.map((trait, i) => (
                              <motion.span 
                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                                key={i} className="px-4 py-1.5 border border-zinc-200 bg-zinc-50 text-[10px] font-mono text-black font-bold uppercase tracking-wider"
                              >
                                {trait}
                              </motion.span>
                            ))}
                          </div>
                        </div>

                        <div className="p-8 border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-[11px] font-mono font-bold text-black uppercase tracking-[0.2em] mb-6 border-b border-zinc-100 pb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-black inline-block" /> Archetype Prediction
                          </h3>
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center border border-zinc-200">
                              <Target className="w-6 h-6 text-black" />
                            </div>
                            <div>
                              <p className="text-3xl font-mono font-black text-black uppercase tracking-wider">{profile.mbti || "Unknown"}</p>
                              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Behavior pattern match</p>
                            </div>
                          </div>
                        </div>
                       </motion.section>

                       <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-8">
                        <div className="p-8 border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-zinc-50 border-l border-b border-zinc-100 flex items-center justify-center">
                            <span className="font-mono text-zinc-300 text-xs text-center leading-tight">BIO</span>
                          </div>
                          <h3 className="text-[11px] font-mono font-bold text-black uppercase tracking-[0.2em] mb-6 border-b border-zinc-100 pb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-black inline-block" /> Synopsis
                          </h3>
                          <p className="text-sm text-zinc-700 leading-relaxed font-serif italic relative z-10 pr-10">
                            "{profile.biography}"
                          </p>
                        </div>

                        <div className="p-8 border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="text-[11px] font-mono font-bold text-black uppercase tracking-[0.2em] mb-6 border-b border-zinc-100 pb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-black inline-block" /> Axioms
                          </h3>
                          <div className="space-y-5 pt-2">
                            {profile.values.map((v, i) => (
                              <div key={i} className="flex flex-col gap-2 group">
                                <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase text-zinc-500 group-hover:text-black transition-colors">
                                  <span>{v}</span>
                                  <span className="text-black">{80 - i * 15}%</span>
                                </div>
                                <div className="h-[1px] w-full bg-zinc-100 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }} animate={{ width: `${80 - i * 15}%` }} transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                    className="h-full bg-black" 
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                       </motion.section>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'memory' && (
                <motion.div 
                  key="memory"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="p-10 h-full overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-10 border-b border-zinc-200 pb-6 max-w-6xl mx-auto">
                    <div>
                      <h3 className="text-2xl font-mono font-black text-black uppercase tracking-widest">Memory Hub</h3>
                      <p className="text-[11px] font-mono font-medium text-zinc-500 uppercase tracking-[0.2em] mt-2">Distilled Knowledge Base</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:border-black bg-white transition-colors text-[10px] font-mono font-bold uppercase text-black hover:bg-zinc-50">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <RefreshCcw className="w-3 h-3" />
                      </motion.div>
                      Index
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <AnimatePresence>
                      {memories.map((mem, i) => (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 20, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          key={mem.id}
                          className="p-6 bg-white border border-zinc-200 shadow-sm hover:shadow-md flex flex-col gap-5 group hover:border-black transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-2 h-full bg-zinc-50 group-hover:bg-zinc-100 transition-colors" />
                          <div className="flex items-center justify-between border-b border-zinc-100 pb-3 relative z-10">
                            <span className="text-[10px] font-mono font-bold text-black uppercase tracking-[0.15em] bg-zinc-100 px-2 py-1">
                              {mem.category}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 group-hover:text-black transition-colors">
                              {new Date(mem.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-zinc-600 group-hover:text-black transition-colors font-serif leading-relaxed relative z-10">
                            {mem.fact}
                          </p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {memories.length === 0 && (
                      <div className="col-span-full h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                        <motion.div 
                          animate={{ y: [0, -10, 0] }} 
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Database className="w-10 h-10 text-zinc-300 mb-6" />
                        </motion.div>
                        <p className="text-zinc-600 font-mono font-bold text-xs uppercase tracking-[0.2em]">Data structure empty</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

