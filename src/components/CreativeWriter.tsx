import { useState } from "react";
import { CreativeSynopsis } from "../types";
import { BookOpen, Copy, Check, Sparkles, Wand2, Info, Loader2, Theater, Feather } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const WRITING_IDEAS = [
  "자정에만 작동하며 상대방의 가장 깊은 기억 하나를 삭제하는 연필",
  "스스로 자아를 갖게 되어 도망친 안드로이드 집사와 고독한 화가",
  "심해 5000m 고대 잠수함 유적에서 들려오는 클래식 피아노 연주음",
  "인구가 정체된 가상 연립 도시에서 우연히 발견된 열지 못하는 골동 열쇠"
];

const GENRES = [
  { id: "SF / 스페이스 오페라", label: "🪐 SF 우주", color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
  { id: "다크 판타지 / 전설", label: "🔮 판타지", color: "bg-violet-50 border-violet-100 text-violet-700" },
  { id: "미스터리 / 서스펜스", label: "🔍 미스터리", color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
  { id: "로맨스 / 휴먼 일상물", label: "💝 로맨스", color: "bg-rose-50 border-rose-100 text-rose-700" }
];

const MOODS = [
  { id: "쓸쓸하고 먹먹한 분위기", label: "☁️ 쓸쓸한 슬픔", desc: "고독한 수묵화 느낌의 정적인 미장센" },
  { id: "웅장하고 신비로운 서사", label: "✨ 장엄하고 신비", desc: "스케일이 크고 가슴 벅찬 클라이맥스" },
  { id: "숨막히는 긴장감과 차가움", label: "❄️ 냉정하고 서스펜스", desc: "의문을 증폭시키는 서늘하고 정밀한 연출" },
  { id: "유쾌하고 엉뚱한 반전 매력", label: "🎨 엉뚱 발랄 위트", desc: "독창적이고 웃음 짓게 하는 밝은 극조선" }
];

export default function CreativeWriter() {
  const [selectedGenre, setSelectedGenre] = useState("SF / 스페이스 오페라");
  const [selectedMood, setSelectedMood] = useState("쓸쓸하고 먹먹한 분위기");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [synopsis, setSynopsis] = useState<CreativeSynopsis | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateStory = async () => {
    if (!subject.trim() || loading) return;

    setLoading(true);
    setSynopsis(null);

    try {
      const response = await fetch("/api/gemini/co-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          genre: selectedGenre,
          mood: selectedMood,
          subject: subject
        })
      });

      if (!response.ok) {
        let errMsg = `서버 오류 (상태 코드: ${response.status})`;
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = `서버 오류 (${response.status}): ${errData.error}`;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
      setSynopsis(data);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "공동 창작 스토리를 구축하는 중에 실패했습니다. 잠시 후 시도해 주십시오.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (!synopsis) return;
    const fullText = `[제목]: ${synopsis.title}\n[시놉시스]: ${synopsis.synopsis}\n\n[오프닝 씬 시나리오 대본]:\n${synopsis.openingScene}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <BookOpen className="w-3.5 h-3.5" />
            공동 창작 스토리 연구실
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AI 공동창작 파트너 "스토리 크리에이터"</h2>
          <p className="text-white/60 text-xs mt-1.5 leading-relaxed">
            장르, 지향할 분위기, 그리고 중심이 될 핵심 오프닝 한 조각을 적어 보세요. Gemini가 웅장한 극을 펼쳐낼 시놉시스, 조연 캐릭터들과 몰입도 높은 대화 연극 대본을 한 번에 설계해 줍니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Creation inputs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Genre Selectors */}
            <div>
              <label className="text-xs font-bold text-white/80 block mb-2.5">대서사 장르 설정</label>
              <div className="grid grid-cols-2 gap-2">
                {GENRES.map((g) => {
                  const isSel = selectedGenre === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGenre(g.id)}
                      disabled={loading}
                      className={`text-xs text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSel
                          ? "bg-white/15 border-white/20 text-white font-medium shadow-md shadow-neutral-950/25 ring-1 ring-white/10"
                          : "bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/5"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Atmosphere/Mood select */}
            <div>
              <label className="text-xs font-bold text-white/80 block mb-2.5">작품 예술적 분위기</label>
              <div className="flex flex-col gap-2">
                {MOODS.map((m) => {
                  const isSel = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMood(m.id)}
                      disabled={loading}
                      className={`text-xs text-left p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                        isSel
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/25 font-medium"
                          : "bg-white/[0.02] border border-white/5 text-white/50 hover:bg-white/5"
                      }`}
                    >
                      <div>
                        <span className="font-semibold block">{m.label}</span>
                        <span className="text-[10px] text-white/40 mt-0.5 block">{m.desc}</span>
                      </div>
                      {isSel && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Subject/Keyword Ideas Input */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-white/80">중심 오브제 및 사건 모티프</label>
              <textarea
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={loading}
                rows={3}
                placeholder="스토리를 촉발할 중요한 단서, 사건 혹은 사물을 적어주세요..."
                className="w-full text-xs text-white bg-white/5 hover:bg-white/10 focus:bg-white/[0.08] border border-white/10 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-white/20 focus:border-indigo-500/50 resize-none leading-relaxed"
              />

              {/* Instant suggested chips */}
              <div className="mt-2 text-left">
                <span className="text-[10px] font-bold text-white/40 block mb-1.5">이런 번득이는 소재는 어때요?</span>
                <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {WRITING_IDEAS.map((idea, i) => (
                    <button
                      key={i}
                      onClick={() => setSubject(idea)}
                      disabled={loading}
                      className="text-left bg-white/5 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/20 text-white/70 hover:text-indigo-200 rounded-lg p-2 text-[11px] truncate cursor-pointer transition-colors"
                    >
                      💡 {idea}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch story creation */}
            <button
              onClick={handleCreateStory}
              disabled={!subject.trim() || loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/15 text-white font-bold text-xs p-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  스토리 영감 정립 중...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  공동 시나리오 빌딩 시작하기
                </>
              )}
            </button>
          </div>

          {/* Right Panel: Showcase book and details */}
          <div className="lg:col-span-7 bg-[#0a0a0a]/30 rounded-2xl border border-white/15 min-h-[500px] flex flex-col justify-between overflow-hidden">
            {loading && (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center gap-4 bg-transparent h-full py-20">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Feather className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">극적 줄거리 구상 집필 중</h3>
                  <p className="text-xs text-white/40 mt-1 max-w-sm leading-relaxed">
                    Gemini가 지정한 장르론과 서글픈 미장센 요소를 검토하고 개성 넘치는 첫 오프닝 시나리오 대사를 창의적으로 자아내고 있습니다.
                  </p>
                </div>
              </div>
            )}

            {!loading && !synopsis && (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center text-white/40 h-full py-20">
                <Theater className="w-12 h-12 text-white/20 stroke-1 mb-3" />
                <h3 className="font-bold text-white/80 text-sm">비어 있는 원고 양식</h3>
                <p className="text-xs mt-1 max-w-xs leading-normal">
                  왼쪽 조건란에서 아름다운 잉크를 묻힌 사건 소재와 장르를 설정해 나만의 연극집을 빌딩해 마법을 부리세요.
                </p>
              </div>
            )}

            {/* Synopsis Loaded Visual Book */}
            <AnimatePresence>
              {!loading && synopsis && (
                <div className="flex-grow flex flex-col bg-transparent p-6 md:p-8">
                  {/* Book Title Header */}
                  <div className="border-b border-white/10 pb-5 mb-6">
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      <span className="text-[10px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full font-bold">
                        {selectedGenre}
                      </span>
                      <span className="text-[10px] bg-white/5 border border-white/10 text-white/60 px-2.5 py-0.5 rounded-full">
                        {selectedMood}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl md:text-2xl text-white leading-tight">
                      제목: <span className="text-indigo-400">"{synopsis.title}"</span>
                    </h3>
                  </div>

                  {/* Themes / Synopsis block */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">극적 시놉시스 (Synopsis)</h4>
                      <p className="text-xs text-white/80 leading-relaxed bg-white/[0.02] px-4 py-3.5 rounded-xl border border-white/5">
                        {synopsis.synopsis}
                      </p>
                    </div>

                    {/* Key Characters Section */}
                    <div>
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5">등장 인물 관계도 (Characters/Casts)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {synopsis.characters.map((char, index) => (
                          <div key={index} className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex flex-col">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white/95">{char.name}</span>
                              <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded font-medium">{char.role}</span>
                            </div>
                            <p className="text-[11px] text-white/50 mt-1 leading-normal">{char.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stage Script Details */}
                    <div>
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>첫 프롤로그 지문과 대본 (Opening Act Script)</span>
                      </h4>
                      <div className="bg-[#050505] rounded-xl p-4 md:p-5 text-white/80 font-mono text-[11px] max-h-60 overflow-y-auto leading-relaxed border border-white/5 shadow-inner scrollbar-thin">
                        <span className="text-[9px] text-indigo-400 block mb-3">// Scene 1. PROLOGUE</span>
                        <p className="whitespace-pre-wrap text-white/90">{synopsis.openingScene}</p>
                      </div>
                    </div>

                    {/* Philosophical Subthemes */}
                    <div>
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">서브텍스트 핵심 키워드 테마</h4>
                      <div className="flex gap-2 flex-wrap">
                        {synopsis.keyThemes.map((theme, i) => (
                          <span key={i} className="text-[10px] bg-white/5 text-white/60 border border-white/10 px-2.5 py-1 rounded-lg">
                            # {theme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar Footer */}
                  <div className="border-t border-white/10 pt-5 mt-8 flex items-center justify-between gap-4">
                    <p className="text-[10px] text-white/30 leading-normal">
                      * 이 원고지는 Gemini 3.5 창작 온디맨드 문맥 분류에 입각해 임시 안전 보전됩니다.
                    </p>

                    <button
                      onClick={handleCopyScript}
                      className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          원고 복사 완료!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          원고지 내용 전체 복사
                        </>
                      )}
                    </button>
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
