import { useState, useRef, useEffect } from "react";
import { Message, Persona, PersonaId } from "../types";
import { MessageSquare, Send, ArrowRight, User, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const PERSONAS: Persona[] = [
  {
    id: "socrates",
    name: "소크라테스 (Socrates)",
    title: "아고라의 그리스 철학자",
    description: "산파술과 질문을 통해 상대방 스스로 진리를 깨닫게 하는 성찰주의자.",
    emoji: "🏛️",
    color: "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200",
    borderColor: "border-amber-200",
    welcomeMessage: "반갑네, 젊은 친구여. 나는 아테네 아고라 광장에서 끊임없이 묻고 답하던 소크라테스라고 하네. 우리는 오늘 지혜에 관해 어떤 진지한 성찰을 나누어 볼 참인가? 무지함을 함께 깨달아 가게나."
  },
  {
    id: "jobs",
    name: "스티브 잡스 (Steve Jobs)",
    title: "완벽주의 테크 혁신가",
    description: "단순함과 직관, 우주에 흔적을 남기는 열정으로 가득한 에너제틱 리더.",
    emoji: "🕶️",
    color: "bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border-neutral-200",
    borderColor: "border-neutral-200",
    welcomeMessage: "반갑습니다. 단순함(Simplicity)은 복잡함보다 더 어렵다는 것을 알고 계십니까? 어떤 혁신적인 비전과 우주에 흔적을 남길 끝내주게 멋진(Insanely Great) 아이디어를 저와 함께 설계해보시겠습니까?"
  },
  {
    id: "prince",
    name: "어린 왕자 (Little Prince)",
    title: "행성 B612의 소년",
    description: "가장 소중한 것은 마음으로만 볼 수 있다는 순수한 시선을 담은 사색가.",
    emoji: "🌹",
    color: "bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200",
    borderColor: "border-blue-200",
    welcomeMessage: "안녕... 내 행성에는 매일 만나는 예쁜 장미꽃 한 송이와 화산 세 개가 있어. 혹시 너도 여우를 기르는 법을 알고 있니? 보이지 않는 진짜 아름다운 비밀들을 나랑 아주 조용하게 나누어 볼래?"
  },
  {
    id: "holmes",
    name: "셜록 홈즈 (Sherlock Holmes)",
    title: "냉철한 명탐정",
    description: "관찰과 정량적 논리 추론으로 모든 불가능을 걷어내 진실을 파악하는 분석가.",
    emoji: "🔍",
    color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200",
    borderColor: "border-emerald-200",
    welcomeMessage: "셜록 홈즈입니다. 런던 베이커 가 221B번지에 오신 것을 환영하네. 당신의 타이핑 손놀림과 지체된 문장 길이를 보면 꽤나 복잡하고 까다로운 사건을 마주하고 있는 듯하군. 불필요한 가설을 지우고 진실을 추론해 보지."
  }
];

const SUGGESTIONS: Record<PersonaId, string[]> = {
  socrates: [
    "인생에서 가장 가치 있게 추구해야 할 선(Good)은 무엇인가요?",
    "제가 무엇에 대해 아무것도 모른다는 것을 어떻게 스스로 인정할 수 있을까요?",
    "인공지능이 인간보다 더 뛰어난 지혜를 가질 수 있을까요?"
  ],
  jobs: [
    "세상을 바꿀 엄청난 아이디어가 생겼을 때, 첫 단계로 무엇을 해야 하나요?",
    "당신이 생각하는 최고의 '미학적 완벽함'을 설명해 줄 수 있나요?",
    "애플에서 해고당했을 때의 깊은 좌절감을 어떻게 전진하는 힘으로 바꿨나요?"
  ],
  prince: [
    "가장 마음에 드는 단 하나의 장미를 돌본다는 건 어떤 느낌인가요?",
    "어른들은 왜 그렇게 의미 없는 숫자와 일에 집착하는 걸까요?",
    "나에게 소중한 친구를 만드는 '길들임'의 과정은 어떻게 시작하면 되니?"
  ],
  holmes: [
    "사건 현장을 볼 때 가장 먼저 주목하는 첫 단서의 규칙이 있습니까?",
    "감정과 주관적 마음이 완벽한 논리에 어떻게 방해가 된다고 믿나요?",
    "최근 풀리지 않은 미스터리한 수학/과학 공식이 있는데 셜록식으로 대처해 주세요."
  ]
};

export default function PersonaLab() {
  const [selectedId, setSelectedId] = useState<PersonaId>("socrates");
  const [chats, setChats] = useState<Record<PersonaId, Message[]>>({
    socrates: [],
    jobs: [],
    prince: [],
    holmes: []
  });
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMess, setErrorMess] = useState<string | null>(null);

  const activePersona = PERSONAS.find((p) => p.id === selectedId)!;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedId, loading]);

  const currentMessages = chats[selectedId];

  // Helper inside client to post data to our server API proxy
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setErrorMess(null);
    setInputVal("");

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    };

    // Build chat history context payload
    const updatedMessages = [...currentMessages, userMessage];

    // Update frontend state immediately
    setChats(prev => ({
      ...prev,
      [selectedId]: updatedMessages
    }));

    setLoading(true);

    try {
      const response = await fetch("/api/gemini/persona-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedId,
          messages: updatedMessages
        })
      });

      if (!response.ok) {
        throw new Error("서버와의 원활한 소통에 실패했습니다.");
      }

      const data = await response.json();

      const modelMessage: Message = {
        role: "model",
        content: data.content,
        timestamp: new Date(data.timestamp).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
      };

      setChats(prev => ({
        ...prev,
        [selectedId]: [...updatedMessages, modelMessage]
      }));

    } catch (err: any) {
      console.error(err);
      setErrorMess(err.message || "오류가 발생했습니다. 잠시 후 백엔드에 재요청해주세요.");
      // Rollback user message if error is major or keep it but raise alarm
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setChats(prev => ({
      ...prev,
      [selectedId]: []
    }));
    setErrorMess(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-7xl mx-auto px-4 md:px-6 mb-16 relative z-10"
    >
      {/* Sidebar: Persona Selector Profile Lists */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-[0.15em] mb-3">개성 강한 페르소나 선택</h2>
          <div className="flex flex-col gap-2">
            {PERSONAS.map((p) => {
              const isSelected = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setErrorMess(null);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? `bg-white/10 border-white/20 shadow-md ring-1 ring-white/10`
                      : `bg-white/[0.02] hover:bg-white/5 border-white/5 text-white/60`
                  }`}
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold text-sm ${isSelected ? "text-white" : "text-white/80"}`}>{p.name}</h3>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5 truncate">{p.title}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Persona Bio Description */}
        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-4xl">{activePersona.emoji}</span>
              <div>
                <h3 className="font-bold text-base text-white">{activePersona.name}</h3>
                <p className="text-xs text-indigo-400 font-medium">{activePersona.title}</p>
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
              {activePersona.description}
            </p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <h4 className="text-xs font-bold text-white/60 tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              대화를 여는 질문 힌트
            </h4>
            <div className="flex flex-col gap-1.5">
              {SUGGESTIONS[selectedId].map((suggest, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggest)}
                  disabled={loading}
                  className="text-left w-full p-2.5 rounded-lg text-xs bg-white/5 hover:bg-indigo-500/10 hover:text-indigo-200 border border-white/5 hover:border-indigo-500/20 transition-all text-white/60 leading-normal flex items-center gap-1.5 group disabled:opacity-50"
                >
                  <ArrowRight className="w-3 h-3 flex-shrink-0 text-white/30 group-hover:text-indigo-400 transition-colors" />
                  <span className="truncate">{suggest}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-8 flex flex-col h-[650px] bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden">
        {/* Chat Control Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs font-bold text-white/80">익명 소통 통로</span>
            <div className="h-3 w-[1px] bg-white/10 mx-1"></div>
            <span className="text-xs text-white/40">{activePersona.name}과(와) 연결됨</span>
          </div>

          <button
            onClick={handleReset}
            className="text-xs font-semibold text-white/60 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg cursor-pointer"
          >
            대화 리셋하기
          </button>
        </div>

        {/* Messaging Box Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-[#0a0a0a]/35">
          {/* Default Welcome Card if empty */}
          {currentMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center py-10">
              <span className="text-5xl mb-4 animate-bounce duration-1000">{activePersona.emoji}</span>
              <h3 className="text-base font-bold text-white mb-2">{activePersona.name}</h3>
              <p className="text-xs text-white/60 leading-relaxed bg-white/[0.03] border border-white/10 p-4 rounded-xl shadow-md">
                "{activePersona.welcomeMessage}"
              </p>
            </div>
          )}

          {/* List of Dialogue messages */}
          <AnimatePresence initial={false}>
            {currentMessages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-end gap-2.5`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                      {activePersona.emoji}
                    </div>
                  )}

                  <div className="flex flex-col max-w-[70%]">
                    <div
                      className={`px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap rounded-2xl ${
                        isUser
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-none shadow-md shadow-indigo-500/10"
                          : "bg-white/5 text-white/90 border border-white/10 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className={`text-[10px] text-white/30 mt-1 ${isUser ? "text-right" : "text-left"}`}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-400/20 flex items-center justify-center text-white text-xs flex-shrink-0">
                      <User className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Prompt Loading Indicators */}
          {loading && (
            <div className="flex justify-start items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                {activePersona.emoji}
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          {/* Error Alert Display inside container */}
          {errorMess && (
            <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-rose-950/80 border border-rose-500/30 text-rose-200 font-medium text-xs px-4 py-3 rounded-xl shadow-lg max-w-sm backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{errorMess}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat input box trigger bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          className="border-t border-white/10 p-4 flex gap-2.5 bg-[#0a0a0a]/30 items-center"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            placeholder={`${activePersona.name}에게 던질 날카로운 철학적 질문을 입력하세요...`}
            className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/[0.08] text-xs text-white border border-white/10 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-white/20 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors cursor-pointer shadow-md shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
}
