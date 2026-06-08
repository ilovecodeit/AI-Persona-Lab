import { Sparkles, Compass, MessageSquare, BookOpen, Layers } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { id: "persona", label: "AI 페르소나 실험실", icon: MessageSquare, desc: "역사적·철학적 아이콘과의 대화" },
    { id: "translator", label: "다차원 개념 번역기", icon: Layers, desc: "아동용에서 전문 학술 에세이까지" },
    { id: "writer", label: "스토리 공동 창작기", icon: BookOpen, desc: "AI와 함께 빌딩하는 스토리 시놉시스" }
  ];

  return (
    <header className="relative z-10 w-full max-w-7xl mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/10 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-3 py-1 text-xs font-semibold rounded-full tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini 2.5 Flash Powered
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              엔드포인트 대기 완료
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
            Gemini <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 font-extrabold">Creative Studio</span>
          </h1>
          <p className="text-sm text-white/60 mt-1.5 leading-relaxed font-sans max-w-2xl">
            고성능 AI 엔진을 활용해 위인들과 생각을 나누고, 지식을 나이와 영역에 맞춰 번역하며, 한 편의 대행 서사를 구성하는 인터랙티브 멀티 크리에이티브 시뮬레이터입니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-1.5 rounded-xl border border-white/10 flex gap-1.5">
            <span className="text-xs font-mono text-white/40 px-2 py-1">API v2.4</span>
            <div className="h-4 w-[1px] bg-white/10 self-center"></div>
            <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">Full-Stack Stable</span>
          </div>
        </div>
      </div>

      {/* Tabs list with responsive grids */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative text-left p-4 rounded-xl border transition-all duration-300 focus:outline-none cursor-pointer flex items-start gap-4 ${
                isActive
                  ? "bg-white/10 border-white/20 shadow-lg shadow-indigo-600/10"
                  : "bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/10"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute -inset-px rounded-xl border border-indigo-500/50 pointer-events-none"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div
                className={`p-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20" : "bg-white/5 text-white/40"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`font-semibold text-sm ${isActive ? "text-white" : "text-white/60"}`}>
                    {tab.label}
                  </span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>}
                </div>
                <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{tab.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </header>
  );
}
