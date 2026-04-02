import { useState } from "react";
import { X } from "lucide-react";

interface TopNotificationBarProps {
  messages?: string[];
}

const TopNotificationBar = ({ messages = [] }: TopNotificationBarProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const defaultMessages = [
    "🧕 হিজাব, বোরকা ও শিশু পোশাক - সেরা কালেকশন!",
    "🚚 ঢাকায় ৬০ টাকা ও ঢাকার বাইরে ১২০ টাকা ডেলিভারি",
    "💯 ১০০% মানি ব্যাক গ্যারান্টি - নিশ্চিন্তে কেনাকাটা করুন",
    "🎁 এই মাসের বিশেষ অফার দেখতে 'অফার' মেনু চেক করুন!",
  ];

  const displayMessages = messages.length > 0 ? messages : defaultMessages;

  if (!isVisible) return null;

  return (
    <div
      className="relative overflow-hidden py-2"
      style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f172a 100%)",
      }}
    >
      <div className="flex items-center justify-center">
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-flex animate-slide-left">
            {displayMessages.map((msg, idx) => (
              <span
                key={idx}
                className="mx-8 text-[12px] sm:text-sm font-medium text-white/85 tracking-wide"
              >
                {msg}
              </span>
            ))}
            {displayMessages.map((msg, idx) => (
              <span
                key={`dup-${idx}`}
                className="mx-8 text-[12px] sm:text-sm font-medium text-white/85 tracking-wide"
              >
                {msg}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 p-1.5 rounded-full transition-all duration-300 hover:bg-white/10 active:scale-90"
          aria-label="বন্ধ করুন"
        >
          <X className="h-3.5 w-3.5 text-white/50 hover:text-white/80 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default TopNotificationBar;
