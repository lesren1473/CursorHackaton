import {
  ArrowLeft,
  ChevronRight,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { ChatMessage } from '../types';
import { formatChatTime } from '../utils/eventHelpers';

export interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  title?: string;
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  setMessages,
  title = 'Chat ekipe',
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('instant');
    }
  }, [isOpen, messages.length, scrollToBottom]);

  const handleSend = () => {
    const t = inputText.trim();
    if (!t) return;
    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      authorId: 'me',
      authorName: 'Ti',
      authorInitials: 'TI',
      authorAvatarColor: 'bg-blue-100',
      authorTextColor: 'text-blue-800',
      text: t,
      timestamp: new Date().toISOString(),
      isSystem: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    if (end - start > 80) onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[60] flex justify-end ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={`chat-overlay-sportaj absolute inset-0 bg-black/40 ${isOpen ? 'is-open' : ''}`}
        onClick={onClose}
        aria-label="Zatvori chat"
        tabIndex={isOpen ? 0 : -1}
      />
      <aside
        className={`chat-panel-sportaj relative flex h-full w-full max-w-full flex-col bg-white shadow-2xl sm:max-w-[400px] ${isOpen ? 'is-open' : ''}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-stone-200 px-3 py-3">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-700 hover:bg-stone-100"
            aria-label="Natrag"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <MessageCircle className="h-5 w-5 text-stone-500" aria-hidden />
          <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-stone-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100"
            aria-label="Zatvori"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {messages.map((msg) =>
            msg.isSystem ? (
              <div key={msg.id} className="my-2 flex justify-center">
                <span className="rounded-full bg-gray-50 px-3 py-1 text-center text-xs italic text-gray-500">
                  {msg.text}
                </span>
              </div>
            ) : (
              <div key={msg.id} className="mb-3 flex gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${msg.authorAvatarColor} ${msg.authorTextColor}`}
                >
                  {msg.authorInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-medium text-stone-800">{msg.authorName}</span>
                    <span className="text-xs text-gray-400">{formatChatTime(msg.timestamp)}</span>
                  </div>
                  <div className="mt-1 rounded-2xl rounded-tl-sm bg-gray-50 px-3 py-2 text-sm text-stone-800">
                    {msg.text}
                  </div>
                </div>
              </div>
            ),
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="shrink-0 border-t border-stone-200 bg-white p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2 rounded-2xl bg-stone-100 px-3 py-1 ring-1 ring-stone-200/80">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napiši poruku…"
              className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-stone-900 outline-none placeholder:text-stone-400"
            />
            <button
              type="button"
              onClick={handleSend}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white hover:bg-stone-800"
              aria-label="Pošalji"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

/** Gumb za otvaranje chata na detail stranici */
export function ChatOpenButton({
  messageCount,
  onClick,
}: {
  messageCount: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-left shadow-sm ring-1 ring-stone-200/60 transition-colors hover:bg-stone-50"
    >
      <MessageCircle className="h-5 w-5 shrink-0 text-stone-600" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-stone-900">Chat ekipe</p>
        <p className="text-xs text-stone-500">
          {messageCount} {messageCount === 1 ? 'poruka' : 'poruka'}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-stone-400" />
    </button>
  );
}
