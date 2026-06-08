import { useState } from "react";
import Header from "./components/Header";
import PersonaLab from "./components/PersonaLab";
import ConceptTranslator from "./components/ConceptTranslator";
import CreativeWriter from "./components/CreativeWriter";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("persona");

  return (
    <div id="applet-viewport" className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-900/15 rounded-full blur-[150px]"></div>
      </div>

      {/* Visual Application Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Feature View Container Routing */}
      <main className="flex-1 w-full relative z-10">
        {activeTab === "persona" && <PersonaLab />}
        {activeTab === "translator" && <ConceptTranslator />}
        {activeTab === "writer" && <CreativeWriter />}
      </main>

      {/* Subtle brand footer */}
      <footer className="w-full text-center py-6 border-t border-white/5 bg-black/30 backdrop-blur-md relative z-10">
        <p className="text-xs text-white/30 font-mono tracking-wider">
          © {new Date().getFullYear()} Gemini Creative Studio • Developed in Cloud Sandbox Workspace
        </p>
      </footer>
    </div>
  );
}
