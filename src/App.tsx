/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { toPng } from 'html-to-image';
import { 
  Type, 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Layout, 
  Palette, 
  AlignLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Trash2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

// --- Types ---

type StyleRecipe = 'technical' | 'editorial' | 'luxury' | 'organic' | 'minimal' | 'brutalist';

interface StyleConfig {
  id: StyleRecipe;
  name: string;
  description: string;
  containerClass: string;
  headerClass: string;
  bodyClass: string;
  accentClass: string;
}

// --- Constants & Styles ---

const STYLE_RECIPES: StyleConfig[] = [
  {
    id: 'minimal',
    name: 'Clean Utility',
    description: 'Trustworthy, functional, and modern. Perfect for reports and documentation.',
    containerClass: 'bg-[#f5f5f5] text-[#1a1a1a] font-sans p-12 min-h-[600px]',
    headerClass: 'text-4xl font-light tracking-tight mb-8 border-b border-black/10 pb-4',
    bodyClass: 'prose prose-slate max-w-none text-lg leading-relaxed',
    accentClass: 'bg-white shadow-sm rounded-3xl p-8 border border-black/5'
  },
  {
    id: 'editorial',
    name: 'Magazine Hero',
    description: 'Bold, dramatic, and attention-grabbing. Great for storytelling and impact.',
    containerClass: 'bg-[#050505] text-white font-sans p-16 min-h-[600px] overflow-hidden relative',
    headerClass: 'text-7xl font-black uppercase tracking-tighter leading-[0.85] mb-12 skew-x-[-5deg]',
    bodyClass: 'prose prose-invert max-w-2xl text-xl leading-snug opacity-90',
    accentClass: 'border-l-4 border-[#F27D26] pl-8'
  },
  {
    id: 'luxury',
    name: 'Dark Luxury',
    description: 'Sophisticated, minimal, and premium. Ideal for high-end presentations.',
    containerClass: 'bg-black text-white font-sans p-20 min-h-[600px]',
    headerClass: 'text-6xl font-extralight tracking-[-2px] mb-16 border-b border-white/20 pb-8',
    bodyClass: 'prose prose-invert max-w-3xl text-lg font-light leading-loose tracking-wide',
    accentClass: 'uppercase text-[10px] tracking-[0.3em] opacity-50 mb-4 block'
  },
  {
    id: 'technical',
    name: 'Data Grid',
    description: 'Precise, professional, and dense. Best for technical specs and data-heavy text.',
    containerClass: 'bg-[#E4E3E0] text-[#141414] font-mono p-8 min-h-[600px] border-[1px] border-[#141414]',
    headerClass: 'text-xs uppercase tracking-widest opacity-50 mb-2 font-serif italic',
    bodyClass: 'text-sm leading-relaxed space-y-4',
    accentClass: 'border-b border-[#141414] pb-4 mb-8'
  },
  {
    id: 'organic',
    name: 'Warm Organic',
    description: 'Approachable, refined, and human. Perfect for cultural or personal content.',
    containerClass: 'bg-[#f5f5f0] text-[#1a1a1a] font-serif p-16 min-h-[600px] rounded-[40px]',
    headerClass: 'text-5xl font-medium italic mb-10 text-[#5A5A40]',
    bodyClass: 'prose prose-stone max-w-2xl text-xl leading-relaxed',
    accentClass: 'bg-white/50 backdrop-blur-sm rounded-[32px] p-10 shadow-xl shadow-black/5'
  },
  {
    id: 'brutalist',
    name: 'Creative Brutalist',
    description: 'Bold, unconventional, and high-energy. For creative and experimental text.',
    containerClass: 'bg-white text-black font-sans p-12 min-h-[600px] border-4 border-black',
    headerClass: 'text-8xl font-black uppercase leading-[0.8] mb-8',
    bodyClass: 'text-2xl font-bold leading-none space-y-6',
    accentClass: 'bg-[#00FF00] inline-block px-4 py-2 border-2 border-black mb-4'
  }
];

// --- Main Component ---

export default function App() {
  const [inputText, setInputText] = useState('');
  const [transformedContent, setTransformedContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<StyleRecipe>('minimal');
  const [isPreviewFull, setIsPreviewFull] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const activeConfig = STYLE_RECIPES.find(r => r.id === activeRecipe) || STYLE_RECIPES[0];

  const handleTransform = async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Transform the following plain text into a beautifully structured Markdown document. 
        Identify headers, subheaders, lists, blockquotes, and emphasize key points. 
        Make it look professional and organized. 
        Do not change the core meaning, but you can improve the flow and structure.
        
        TEXT TO TRANSFORM:
        ${inputText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: "You are a world-class document designer and editor. Your goal is to take raw, messy text and turn it into a perfectly structured, elegant Markdown document that follows professional hierarchy and readability standards."
        }
      });

      setTransformedContent(response.text || '');
    } catch (error) {
      console.error("Transformation error:", error);
      alert("Failed to transform text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    
    try {
      const dataUrl = await toPng(previewRef.current, { 
        quality: 1,
        pixelRatio: 2,
        backgroundColor: activeConfig.id === 'editorial' || activeConfig.id === 'luxury' ? '#000' : '#fff'
      });
      const link = document.createElement('a');
      link.download = `textrefine-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transformedContent);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleDownloadHTML = () => {
    if (!previewRef.current) return;
    
    const content = previewRef.current.innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>TextRefine Export</title>
          ${styles}
          <style>
            body { margin: 0; padding: 0; }
            .export-container { min-height: 100vh; }
          </style>
        </head>
        <body>
          <div class="export-container">
            ${content}
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `textrefine-${Date.now()}.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-black selection:text-white">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">TextRefine</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setInputText('')}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-black/40 hover:text-black"
              title="Clear all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="h-4 w-[1px] bg-black/10" />
            <a 
              href="https://github.com" 
              target="_blank" 
              className="text-sm font-medium opacity-50 hover:opacity-100 transition-opacity"
            >
              v1.0.4
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" />
                  Source Text
                </h2>
                <label className="cursor-pointer group">
                  <input type="file" accept=".txt,.md" className="hidden" onChange={handleFileUpload} />
                  <span className="text-xs font-medium text-black/60 group-hover:text-black flex items-center gap-1 transition-colors">
                    <Upload className="w-3 h-3" />
                    Upload .txt
                  </span>
                </label>
              </div>
              
              <div className="relative group">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your raw text here... (e.g., meeting notes, a rough draft, or a simple list)"
                  className="w-full h-[450px] p-6 bg-white border border-black/10 rounded-3xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all resize-none text-lg leading-relaxed placeholder:text-black/20"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={handleTransform}
                    disabled={isProcessing || !inputText.trim()}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl font-medium transition-all active:scale-95 disabled:opacity-50 disabled:scale-100",
                      !isProcessing && "hover:shadow-xl hover:shadow-black/20"
                    )}
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isProcessing ? 'Refining...' : 'Transform Text'}
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Visual Recipes
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_RECIPES.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => setActiveRecipe(recipe.id)}
                    className={cn(
                      "p-4 text-left rounded-2xl border transition-all group",
                      activeRecipe === recipe.id 
                        ? "bg-black border-black text-white shadow-lg shadow-black/10" 
                        : "bg-white border-black/5 hover:border-black/20 text-black/60 hover:text-black"
                    )}
                  >
                    <div className="font-bold text-sm mb-1 flex items-center justify-between">
                      {recipe.name}
                      {activeRecipe === recipe.id && <ChevronRight className="w-3 h-3" />}
                    </div>
                    <div className={cn(
                      "text-[10px] leading-tight opacity-60 group-hover:opacity-100",
                      activeRecipe === recipe.id && "opacity-80"
                    )}>
                      {recipe.description}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Preview */}
          <div className={cn(
            "lg:col-span-7 transition-all duration-500",
            isPreviewFull && "fixed inset-0 z-[60] bg-white p-12 overflow-y-auto"
          )}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-black/40 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                Live Preview
              </h2>
              <div className="flex items-center gap-2">
                {transformedContent && (
                  <>
                    <button
                      onClick={handleCopy}
                      className="p-2 hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium"
                    >
                      {copySuccess ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      {copySuccess ? 'Copied' : 'Copy MD'}
                    </button>
                    <div className="h-4 w-[1px] bg-black/10 mx-1" />
                    <button
                      onClick={handleDownload}
                      className="p-2 hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium"
                      title="Download as high-quality image"
                    >
                      <Download className="w-4 h-4" />
                      PNG
                    </button>
                    <button
                      onClick={handleDownloadHTML}
                      className="p-2 hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium"
                      title="Download as standalone HTML file"
                    >
                      <Type className="w-4 h-4" />
                      HTML
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsPreviewFull(!isPreviewFull)}
                  className="p-2 hover:bg-black/5 rounded-xl transition-colors ml-2"
                >
                  {isPreviewFull ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="relative min-h-[600px] group">
              <AnimatePresence mode="wait">
                {!transformedContent && !isProcessing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-black/5 rounded-[40px] bg-white/50"
                  >
                    <div className="w-16 h-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                      <FileText className="w-8 h-8 text-black/20" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No transformation yet</h3>
                    <p className="text-black/40 max-w-xs">
                      Paste some text and click "Transform" to see the magic happen.
                    </p>
                  </motion.div>
                ) : isProcessing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-black/5 rounded-[40px] bg-white/50 z-10"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-black/5 border-t-black rounded-full animate-spin mb-8" />
                      <Sparkles className="w-8 h-8 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">AI is designing...</h3>
                    <p className="text-black/40 max-w-xs">
                      Analyzing structure, hierarchy, and tone to create your professional document.
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div 
                ref={previewRef}
                className={cn(
                  "transition-all duration-700 ease-in-out shadow-2xl shadow-black/5 overflow-hidden",
                  activeConfig.containerClass,
                  !transformedContent && "opacity-0 scale-95 pointer-events-none"
                )}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className={activeConfig.accentClass}>
                    <div className={activeConfig.bodyClass}>
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h1 className={activeConfig.headerClass}>{children}</h1>,
                          h2: ({ children }) => <h2 className="text-2xl font-bold mt-12 mb-6 border-b border-current/10 pb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-xl font-semibold mt-8 mb-4">{children}</h3>,
                          p: ({ children }) => <p className="mb-6 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-6 mb-6 space-y-3">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-6 mb-6 space-y-3">{children}</ol>,
                          li: ({ children }) => <li className="pl-2">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-current/20 pl-6 italic my-8 opacity-80 text-lg">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children }) => (
                            <code className="bg-current/5 px-1.5 py-0.5 rounded font-mono text-[0.9em]">
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre className="bg-current/5 p-6 rounded-2xl font-mono text-sm overflow-x-auto my-8">
                              {children}
                            </pre>
                          ),
                          strong: ({ children }) => <strong className="font-bold text-current">{children}</strong>,
                          em: ({ children }) => <em className="italic opacity-90">{children}</em>,
                          hr: () => <hr className="my-12 border-current/10" />,
                        }}
                      >
                        {transformedContent}
                      </ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-black/5 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-40">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Powered by Gemini 3.1 Pro</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-black/40">
            <a href="#" className="hover:text-black transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-black transition-colors">Feedback</a>
          </div>
          <div className="text-[10px] text-black/20 uppercase tracking-widest">
            © 2026 TextRefine Studio
          </div>
        </div>
      </footer>
    </div>
  );
}
