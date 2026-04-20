import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatPanel() {
    const [messages, setMessages] = useState([
        { type: "ai", text: "Hi! How can I help you today with your Kubernetes environment?" }
    ]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { type: "user", text: input }]);

        // Mock AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                type: "ai",
                text: "Root cause: OOMKilled on the pod. Recommendation: Increase memory limit from 512Mi to 1Gi and enable HPA."
            }]);
        }, 800);

        setInput("");
    };

    return (
        <div className="bg-white/5 rounded-3xl p-6 h-80 flex flex-col">
            <h3 className="font-semibold mb-4">Dynatrace AI Assistant</h3>

            <div className="flex-1 overflow-auto space-y-4 text-sm mb-4">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.type === 'user' ? 'bg-cyan-600' : 'bg-white/10'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask anything... (Why is pod failing?)"
                    className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-3 outline-none"
                />
                <button
                    onClick={sendMessage}
                    className="bg-cyan-500 hover:bg-cyan-600 w-12 h-12 rounded-2xl flex items-center justify-center"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}