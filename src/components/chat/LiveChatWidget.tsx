import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ChatMessage {
  id: string;
  message: string;
  sender_type: string;
  created_at: any;
}

const formatTimestamp = (ts: any) => {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts?.toDate) return ts.toDate();
  return ts ? new Date(ts) : new Date();
};

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Get or create session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem("chat_session_id");
    if (!storedSessionId) {
      storedSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("chat_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);

    // Check if chat was already started
    const chatStarted = localStorage.getItem("chat_started");
    if (chatStarted === "true") {
      setIsStarted(true);
    }
  }, []);

  // Subscribe to new messages
  useEffect(() => {
    if (!sessionId || !isStarted) return;

    const q = query(
      collection(db, `chat_sessions/${sessionId}/messages`),
      orderBy("created_at", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChatMessage[]);
    });

    return () => unsubscribe();
  }, [sessionId, isStarted]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startChat = async () => {
    if (!customerName.trim() || !customerPhone.trim() || !sessionId) return;
    setLoading(true);

    try {
      // Create or update chat session in Firestore
      const sessionRef = doc(db, "chat_sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        await setDoc(sessionRef, {
          session_id: sessionId,
          customer_name: customerName,
          customer_phone: customerPhone,
          user_id: user?.uid || null,
          last_message_at: serverTimestamp(),
          created_at: serverTimestamp(),
        });
      }

      localStorage.setItem("chat_started", "true");
      localStorage.setItem("chat_customer_name", customerName);
      setIsStarted(true);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return;
    setLoading(true);

    try {
      // Add message to subcollection
      await addDoc(collection(db, `chat_sessions/${sessionId}/messages`), {
        sender_type: "user",
        message: newMessage,
        user_id: user?.uid || null,
        created_at: serverTimestamp(),
      });

      // Update session's last message timestamp
      await updateDoc(doc(db, "chat_sessions", sessionId), {
        last_message_at: serverTimestamp()
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load stored name
  useEffect(() => {
    const storedName = localStorage.getItem("chat_customer_name");
    if (storedName) setCustomerName(storedName);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="চ্যাট শুরু করুন"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[350px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col transition-all ${
        isMinimized ? "h-14" : "h-[500px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-semibold">লাইভ চ্যাট</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {!isStarted ? (
            // Start Chat Form
            <div className="flex-1 p-4 flex flex-col justify-center space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-foreground">আমাদের সাথে চ্যাট করুন</h3>
                <p className="text-sm text-muted-foreground">
                  আপনার তথ্য দিন এবং চ্যাট শুরু করুন
                </p>
              </div>
              <Input
                placeholder="আপনার নাম"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                placeholder="ফোন নম্বর"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <Button
                onClick={startChat}
                disabled={loading || !customerName.trim() || !customerPhone.trim()}
                className="w-full"
              >
                চ্যাট শুরু করুন
              </Button>
            </div>
          ) : (
            // Chat Messages
            <>
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm text-center">
                    <p>আপনার মেসেজ লিখুন। আমরা শীঘ্রই উত্তর দেব!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.sender_type === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            msg.sender_type === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(formatTimestamp(msg.created_at), "hh:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t border-border flex gap-2">
                <Input
                  placeholder="মেসেজ লিখুন..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  disabled={loading}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default LiveChatWidget;
