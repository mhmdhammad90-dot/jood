import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, Hash, Sparkles, Utensils, Loader2, Copy, 
  Check, Clock, Trash2, ChefHat, Instagram 
} from "lucide-react";
import { generateFoodContent } from "./services/gemini";
import { FoodContent, HistoryItem } from "./types";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...classes: string[]) {
  return twMerge(clsx(classes));
}

const STORAGE_KEY = "zakawa_ai_history";

export default function App() {
  const [dish, setDish] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FoodContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dish.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const content = await generateFoodContent(dish.trim());
      setResult(content);
      
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        dish: dish.trim(),
        result: content,
        createdAt: new Date().toISOString()
      };
      setHistory(prev => [newItem, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearHistory = () => {
    if (window.confirm("هل أنت متأكد من مسح السجل بالكامل؟")) {
      setHistory([]);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setDish(item.dish);
    setResult(item.result);
    setShowHistory(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-gold">
              <ChefHat className="w-6 h-6 text-neutral-950" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold text-gradient">
                ZAKAWA
              </h1>
              <p className="text-xs text-neutral-400">AI Studio</p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors border border-neutral-800"
          >
            <Clock className="w-4 h-4" />
            السجل ({history.length})
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 mb-6">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span className="text-sm text-neutral-300">مولد محتوى الطعام الذكي</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            اصنع محتوى <span className="text-gradient">احترافيًا</span>
            <br />لمطعمك في ثوانٍ
          </h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
            أدخل اسم الطبق أو وصفه، وسنقوم بإنشاء تعليق جذاب، ووسوم احترافية، 
            ونصائح تصوير مميزة باستخدام الذكاء الاصطناعي
          </p>
        </motion.div>

        {/* Input Form */}
        <motion.form
          onSubmit={handleGenerate}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto mb-12"
        >
          <div className="relative flex items-center gap-3 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus-within:border-gold-400/50 focus-within:ring-2 focus-within:ring-gold-400/10 transition-all">
            <input
              type="text"
              value={dish}
              onChange={(e) => setDish(e.target.value)}
              placeholder="مثال: ستيك ريب آي مع صلصة الفطر، تشيز كيك بلوبيري..."
              className="flex-1 bg-transparent px-4 py-3 text-lg outline-none placeholder:text-neutral-600 text-right"
              dir="rtl"
            />
            <button
              type="submit"
              disabled={loading || !dish.trim()}
              className="px-8 py-3 rounded-xl gradient-gold text-neutral-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:shadow-lg hover:shadow-gold-400/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              توليد المحتوى
            </button>
          </div>
        </motion.form>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-3xl mx-auto mb-8 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden"
            >
              <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
                <h3 className="font-bold text-lg">سجل الطلبات الأخيرة</h3>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory} 
                    className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> مسح الكل
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto p-2">
                {history.length === 0 ? (
                  <p className="text-neutral-500 text-center py-6">لا يوجد سجل بعد</p>
                ) : (
                  history.map(item => (
                    <button
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="w-full text-right p-4 hover:bg-neutral-800 rounded-xl transition-colors mb-1 last:mb-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-lg">{item.dish}</span>
                        <span className="text-xs text-neutral-500">
                          {new Date(item.createdAt).toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-400 text-center mb-8"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto"
            >
              {/* Caption Card */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-gold-400/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Instagram className="w-5 h-5 text-gold-400" />
                    <h3 className="text-xl font-serif font-bold">التعليق</h3>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result.caption, "caption")} 
                    className="text-neutral-500 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-lg"
                  >
                    {copied === "caption" ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-neutral-200 leading-relaxed text-lg" dir="rtl">
                  {result.caption}
                </p>
              </div>

              {/* Hashtags Card */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-gold-400/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-gold-400" />
                    <h3 className="text-xl font-serif font-bold">الوسوم</h3>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(result.hashtags.map(t => `#${t}`).join(" "), "hashtags")} 
                    className="text-neutral-500 hover:text-white transition-colors p-2 hover:bg-neutral-800 rounded-lg"
                  >
                    {copied === "hashtags" ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.hashtags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 text-gold-400 text-sm font-medium hover:bg-neutral-700 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Photography Tips */}
              <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-gold-400/30 transition-all md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Camera className="w-5 h-5 text-gold-400" />
                  <h3 className="text-xl font-serif font-bold">نصائح التصوير</h3>
                </div>
                <ul className="space-y-3">
                  {result.photographyTips.map((tip, i) => (
                    <li key={i} className="flex gap-3 items-start text-neutral-300">
                      <span className="mt-2 w-2 h-2 rounded-full bg-gold-400 flex-shrink-0" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mood Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-800 md:col-span-2 text-center">
                <span className="text-sm text-neutral-500 uppercase tracking-widest mb-2 block">
                  الحالة المزاجية
                </span>
                <span className="text-3xl font-serif text-gradient font-bold">
                  {result.mood}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-neutral-800 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Utensils className="w-4 h-4 text-gold-400" />
          <span className="font-serif font-bold text-gradient">ZAKAWA</span>
        </div>
        <p className="text-neutral-500 text-sm">
          © {new Date().getFullYear()} Restaurant & Café. Powered by Google Gemini AI
        </p>
      </footer>
    </div>
  );
}