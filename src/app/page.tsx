"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Twitter, User, Bot, Loader2, Sparkles,
  Settings, Wallet, ShieldCheck, History, Menu, X, PlusCircle,
  Clock
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ConnectWallet,
  Wallet as OnchainWallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity
} from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        role: "bot",
        content: "Welcome back! I'm your AgentKit assistant. Connect your Base wallet to verify your on-chain identity before we start tweeting!",
        timestamp: new Date(),
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!isConnected) {
      const errorMsg: Message = {
        id: Date.now().toString() + "-error",
        role: "bot",
        content: "Please connect your Base wallet using the button in the top right before making a request.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: data.response || "No response received.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: "bot",
        content: `Error: ${error.message || "Failed to talk to the agent."}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-500/5 blur-[100px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-30 flex w-80 flex-col border border-white/5 bg-black/40 p-6 backdrop-blur-2xl md:flex shadow-2xl m-4 rounded-3xl"
          >
            <div className="mb-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-600/30">
                  <Twitter className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">AgentKit Twitter Bot</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="md:hidden p-2 hover:bg-white/5 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-6">
              <div>
                <button className="group flex w-full items-center justify-between rounded-2xl bg-white/5 border border-white/5 px-4 py-3 text-white transition-all hover:bg-white/10 hover:border-white/10">
                  <div className="flex items-center gap-3">
                    <PlusCircle className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">New Session</span>
                  </div>
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-white/40">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              </div>

              <div className="space-y-4">
                {/* <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Recent Activity</h3>
                  <History className="h-3 w-3 text-white/20" />
                </div> */}

              </div>
            </nav>

            <div className="mt-auto pt-6 space-y-4 border-t border-white/5">
              <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-white/40 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                <span>Preferences</span>
              </button>

              <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/[0.07]">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 shadow-inner">
                  <User className="h-5 w-5 opacity-60" />
                </div>
                <div className="overflow-hidden">
                  <p className="truncate text-xs font-semibold text-white">@Chanda84245125</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <main className="relative flex flex-1 flex-col overflow-hidden bg-[#0a0a0a]/50 m-4 ml-0 rounded-3xl border border-white/5">
        {/* Header */}
        <header className="z-20 flex h-20 items-center justify-between px-8 bg-black/20 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <Menu className="h-6 w-6 text-white" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                Chat Session <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-3 w-3 text-indigo-400/80" />
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">Authenticated via CDP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {mounted && (
              <OnchainWallet>
                <ConnectWallet
                  className="!bg-indigo-600/10 !hover:bg-indigo-600/20 !text-indigo-400 !border !border-indigo-500/20 !rounded-2xl !h-11 !px-6 !text-sm !font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/5 group"
                  disconnectedLabel="Connect Base Wallet"
                >
                  <Avatar className="!h-6 !w-6 !rounded-lg mr-2" />
                  <Name className="!text-white !font-bold" />
                </ConnectWallet>
                <WalletDropdown className="!bg-slate-900 !border-white/10 !rounded-2xl !p-2 !shadow-2xl">
                  <Identity className="px-4 pt-4 pb-2" hasCopyAddressOnClick>
                    <Avatar className="!h-10 !w-10 !rounded-xl" />
                    <Name className="!text-white !font-bold" />
                    <Address className="!text-white/40 !text-xs" />
                  </Identity>
                  <WalletDropdownLink icon="wallet" href="https://keys.coinbase.com" className="!text-white hover:!bg-white/10 !rounded-xl">
                    View Assets
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect className="!text-red-400 hover:!bg-red-500/10 !rounded-xl" />
                </WalletDropdown>
              </OnchainWallet>
            )}
          </div>
        </header>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto px-6 py-8 md:px-24 md:py-16 space-y-8 scroll-smooth"
        >
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={cn(
                "flex w-full gap-4",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg mt-1",
                msg.role === "user"
                  ? "bg-indigo-600 text-white shadow-indigo-600/20"
                  : "bg-slate-800 text-slate-400 border border-white/10"
              )}>
                {msg.role === "user" ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
              </div>
              <div className={cn(
                "group relative flex flex-col",
                msg.role === "user" ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "max-w-xl rounded-2xl p-5 text-sm md:text-base leading-relaxed tracking-tight shadow-xl",
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                    : "bg-white/[0.03] text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-md"
                )}>
                  {msg.content}
                </div>
                {msg.timestamp && (
                  <span className="mt-2 text-[10px] font-bold text-white/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 border border-white/10 animate-pulse">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="ml-4 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="relative p-6 md:p-10 md:pt-4">
          <div className="mx-auto max-w-4xl">
            <div className={cn(
              "group relative flex items-center gap-2 rounded-2xl border bg-black/40 p-2.5 backdrop-blur-3xl transition-all duration-300",
              (mounted && isConnected)
                ? "border-white/5 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10"
                : "border-red-500/20 bg-red-500/5"
            )}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <input
                type="text"
                disabled={!(mounted && isConnected) || isLoading}
                placeholder={(mounted && isConnected) ? "Message AgentKit..." : "Connect wallet to start chatting..."}
                className="flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none disabled:cursor-not-allowed"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || !(mounted && isConnected)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                  input.trim() && !isLoading && (mounted && isConnected)
                    ? "bg-white text-black hover:bg-slate-200 scale-100 shadow-xl"
                    : "bg-white/5 text-white/20 scale-95 cursor-not-allowed"
                )}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-4 px-2">
              <div className="flex items-center gap-4 text-[10px] font-bold text-white/20 tracking-widest uppercase">
                <div className="flex items-center gap-1.5">
                  <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", (mounted && isConnected) ? "bg-green-500" : "bg-red-500")} />
                  {(mounted && isConnected) ? "Base Connected" : "Wallet Required"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Twitter className="h-3 w-3" />
                  Read & Write
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                Built on BASE langchain with the courtesy of Coinbase OnchainKit
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
