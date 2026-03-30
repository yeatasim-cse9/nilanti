import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { format } from "date-fns";
import { bn } from "date-fns/locale";

const formatTimestamp = (ts: any) => {
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts?.toDate) return ts.toDate();
  return ts ? new Date(ts) : new Date();
};

const AdminChat = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch and subscribe to chat sessions
  useEffect(() => {
    const q = query(collection(db, "chat_sessions"), orderBy("last_message_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSessions(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });
    return () => unsubscribe();
  }, []);

  // Fetch and subscribe to messages for selected session
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, `chat_sessions/${selectedSessionId}/messages`),
      orderBy("created_at", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });

    return () => unsubscribe();
  }, [selectedSessionId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedSessionId) return;
    setLoading(true);

    try {
      // Insert message with subcollection
      await addDoc(collection(db, `chat_sessions/${selectedSessionId}/messages`), {
        sender_type: "admin",
        message: newMessage,
        created_at: serverTimestamp(),
      });

      // Update session's last_message_at
      await updateDoc(doc(db, "chat_sessions", selectedSessionId), {
        last_message_at: serverTimestamp()
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedSession = () => {
    return sessions.find(s => (s.session_id || s.id) === selectedSessionId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">লাইভ চ্যাট</h1>
        <p className="text-muted-foreground">কাস্টমারদের সাথে রিয়েল-টাইম চ্যাট</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              চ্যাট সেশন ({sessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {sessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">কোনো চ্যাট নেই</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.session_id)}
                    className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedSessionId === session.session_id ? "bg-muted" : ""
                    }`}
                  >
                    <p className="font-medium">{session.customer_name || "অজানা"}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.customer_phone || session.session_id?.slice(0, 15) + "..."}
                    </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {session.last_message_at 
                          ? format(formatTimestamp(session.last_message_at), "dd MMM, hh:mm a", { locale: bn })
                          : "—"
                        }
                      </p>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>
              {selectedSessionId
                ? getSelectedSession()?.customer_name || "চ্যাট"
                : "একটি চ্যাট সিলেক্ট করুন"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              {!selectedSessionId ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  বাম দিক থেকে একটি চ্যাট সিলেক্ট করুন
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  কোনো মেসেজ নেই
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.sender_type === "admin"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
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
            {selectedSessionId && (
              <div className="p-4 border-t flex gap-2">
                <Input
                  placeholder="মেসেজ লিখুন..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage} disabled={loading || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChat;
