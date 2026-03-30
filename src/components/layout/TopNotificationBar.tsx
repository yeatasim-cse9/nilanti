import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface TopNotificationBarProps {
  messages?: string[];
}

const TopNotificationBar = ({ messages = [] }: TopNotificationBarProps) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const defaultMessages = [
    "🧕 হিজাব, বোরকা ও শিশু পোশাক - সেরা কালেকশন!",
    "🚚 ঢাকায় ৬০ টাকা ও ঢাকার বাইরে ১২০ টাকা ডেলিভারি",
    "💯 ১০০% মানি ব্যাক গ্যারান্টি - নিশ্চিন্তে কেনাকাটা করুন",
    "🎁 এই মাসের বিশেষ অফার দেখতে 'অফার' মেনু চেক করুন!"
  ];

  const displayMessages = messages.length > 0 ? messages : defaultMessages;

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 relative overflow-hidden">
      <div className="flex items-center justify-center">
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-flex animate-slide-left">
            {displayMessages.map((msg, idx) => (
              <span key={idx} className="mx-8 text-sm font-medium">
                {msg}
              </span>
            ))}
            {displayMessages.map((msg, idx) => (
              <span key={`dup-${idx}`} className="mx-8 text-sm font-medium">
                {msg}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-2 p-1 hover:bg-primary-foreground/10 rounded-full transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TopNotificationBar;
