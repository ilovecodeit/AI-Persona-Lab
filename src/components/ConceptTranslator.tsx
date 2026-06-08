import { useState } from "react";
import { ConceptTranslation } from "../types";
import { Layers, Sparkles, Copy, Check, Info, ArrowUpRight, HelpCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SUGGESTED_KEYWORDS = [
  "양자역학 (Quantum Mechanics)",
  "블록체인 (Blockchain)",
  "슈뢰딩거의 고양이",
  "블랙홀의 사건의 지평선",
  "인플레 우주론",
  "머신러닝과 딥러닝"
];

export default function ConceptTranslator() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConceptTranslation | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"child" | "sns" | "academic">("child");
  const [copiedText, setCopiedText] = useState("");

  const handleTranslate = async (targetKeyword: string) => {
    if (!targetKeyword.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setKeyword(targetKeyword);

    try {
      const response = await fetch("/api/gemini/explain-concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: targetKeyword })
      });

      if (!response.ok) {
        throw new Error("개념 번역을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("분석 오류가 발생했습니다. 나중에 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, styleId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(styleId);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-16 relative z-10"
    >
      <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl p-6 md:p-8">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-300 font-bold bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-3">
            <Layers className="w-3.5 h-3.5" />
            다차원 정보 번역 필터
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">지식의 나이를 내리는 "개념 다차원 번역기"</h2>
          <p className="text-white/60 text-xs mt-1.5 leading-relaxed">
            한 단어 혹은 난해한 개념을 입력해 보세요. Gemini가 3가지 나이와 상황을 시뮬레이션하여, 가장 어울리는 맞춤형 비유와 문장으로 재해석 요약해 줍니다.
          </p>
        </div>

        {/* User Search Input Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTranslate(keyword);
              }}
              className="flex flex-col gap-2.5"
            >
              <label className="text-xs font-bold text-white/80">분석 및 번역할 다차원 키워드</label>
              <div className="relative">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="예: 양자역학, 신재생에너지, 디플레이션 등"
                  disabled={loading}
                  className="w-full text-xs text-white bg-white/5 hover:bg-white/10 focus:bg-white/[0.08] border border-white/10 rounded-xl px-4 py-4 pr-12 outline-none transition-all placeholder:text-white/20 focus:border-indigo-500/50"
                />
                <button
                  type="submit"
                  disabled={!keyword.trim() || loading}
                  className="absolute right-2 top-2 p-2 bg-[#050505] hover:bg-neutral-800 text-white border border-white/10 rounded-lg transition-all text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "번역하기"}
                </button>
              </div>
            </form>

            <div>
              <label className="text-xs font-bold text-white/40 block mb-2.5">인기 추천 개념 키워드</label>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_KEYWORDS.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setKeyword(kw);
                      handleTranslate(kw);
                    }}
                    disabled={loading}
                    className="text-xs bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-white/70 hover:text-indigo-300 rounded-lg px-2.5 py-1.5 transition-all text-left flex items-center gap-1 cursor-pointer disabled:opacity-60"
                  >
                    <span>{kw}</span>
                    <ArrowUpRight className="w-3 h-3 text-white/30" />
                  </button>
                ))}
              </div>
            </div>

            {/* Explanatory notice card */}
            <div className="bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-xl flex gap-3">
              <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-300/80 leading-normal">
                <strong>질문 팁:</strong> 전문 지식 단어 외에도 '철학적 허무주의', '인플레이션', 또는 '프랙탈 도형' 등 다채로운 개념과 인상을 던져주면 더욱 조화롭고 뛰어난 3원 색 번역이 나옵니다.
              </div>
            </div>
          </div>

          {/* Right Panel: Translations Box */}
          <div className="lg:col-span-7 bg-[#0a0a0a]/30 rounded-2xl border border-white/15 min-h-[420px] flex flex-col overflow-hidden">
            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 bg-transparent">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">개념 나이 분리 중...</h3>
                  <p className="text-xs text-white/40 mt-1 max-w-sm leading-relaxed">
                    Gemini가 3가지 고유 자아(대표 아동, 틱톡 인플루언서, 대학교수)에게 지식을 전달하는 문맥을 조율하고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {!loading && !result && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/40">
                <HelpCircle className="w-12 h-12 text-white/20 stroke-1 mb-3" />
                <h3 className="font-bold text-white/80 text-sm">대기 중인 지식 데이터베이스</h3>
                <p className="text-xs mt-1 max-w-sm leading-normal">
                  왼쪽 입력란에 알고 싶거나 번역하고 싶은 다차원 개념 단어를 적고 번역하기 버튼을 눌러보세요.
                </p>
              </div>
            )}

            {/* Translation Output Displays */}
            <AnimatePresence>
              {!loading && result && (
                <div className="flex-1 flex flex-col bg-transparent">
                  {/* Internal Subtabs Selector */}
                  <div className="grid grid-cols-3 border-b border-white/10 bg-black/40 p-1.5 gap-1">
                    <button
                      onClick={() => setActiveSubTab("child")}
                      className={`text-xs py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeSubTab === "child"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      <span>🐣 5세 어린이</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab("sns")}
                      className={`text-xs py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeSubTab === "sns"
                          ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      <span>⚡ SNS 중독자</span>
                    </button>
                    <button
                      onClick={() => setActiveSubTab("academic")}
                      className={`text-xs py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        activeSubTab === "academic"
                          ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      <span>🎓 학술 정보서</span>
                    </button>
                  </div>

                  {/* Filter Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-white/50">
                          선택한 고유 개념 : <span className="font-bold text-white">"{result.keyword}"</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-white/5 text-white/50 px-2.5 py-1 rounded-full border border-white/10">
                            번역 안정 등급 100%
                          </span>
                        </div>
                      </div>

                      {/* Child Mode Description */}
                      {activeSubTab === "child" && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-amber-500/5 border border-amber-500/10 p-4 md:p-5 rounded-xl animate-fade-in"
                        >
                          <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs mb-3">
                            <span>눈높이 비유 마법</span>
                          </div>
                          <p className="text-xs text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                            {result.childStyle}
                          </p>
                        </motion.div>
                      )}

                      {/* SNS Hub Mode Description */}
                      {activeSubTab === "sns" && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-purple-500/5 border border-purple-500/10 p-4 md:p-5 rounded-xl"
                        >
                          <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs mb-3">
                            <span>소셜 미디어 패러디 & 명쾌 요약</span>
                          </div>
                          <p className="text-xs text-purple-200/90 leading-relaxed whitespace-pre-wrap">
                            {result.snsStyle}
                          </p>
                        </motion.div>
                      )}

                      {/* Academic Mode Description */}
                      {activeSubTab === "academic" && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/[0.02] border border-white/5 p-4 md:p-5 rounded-xl"
                        >
                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs mb-3">
                            <span>엄밀한 학술 에세이 및 구조 요약</span>
                          </div>
                          <p className="text-xs text-indigo-200/90 font-mono leading-relaxed whitespace-pre-wrap">
                            {result.academicStyle}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    <div className="mt-8 border-t border-white/10 pt-5 flex items-center justify-between">
                      <p className="text-[10px] text-white/30 leading-normal">
                        * 해당 결과물은 Gemini 3.5 Flash 온톨로지 기법을 통해 분류되었습니다.
                      </p>

                      <button
                        onClick={() => {
                          const val =
                            activeSubTab === "child"
                              ? result.childStyle
                              : activeSubTab === "sns"
                              ? result.snsStyle
                              : result.academicStyle;
                          handleCopy(val, activeSubTab);
                        }}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all max-w-fit shadow-md shadow-indigo-600/10 cursor-pointer"
                      >
                        {copiedText === activeSubTab ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            복사 완료!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            이 텍스트 복사하기
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
