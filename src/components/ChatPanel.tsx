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
  /** Isti smisao kao `#chat-subtitle` na karti */
  subtitle?: string;
}

export function ChatPanel({
  isOpen,
  onClose,
  messages,
  setMessages,
  title = 'Chat ekipe',
  subtitle,
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
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-stone-900">{title}</h2>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-stone-500">{subtitle}</p>
            ) : null}
          </div>
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

function LockMiniIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 15v2" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/** Gumb za otvaranje chata na detail stranici */
export function ChatOpenButton({
  messageCount,
  onClick,
  disabled = false,
  disabledHint = 'Pridruži se terminu da otvoriš chat.',
}: {
  messageCount: number;
  onClick: () => void;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) onClick();
      }}
      aria-describedby={disabled ? 'chat-locked-hint' : undefined}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left shadow-sm ring-1 transition-colors ${
        disabled
          ? 'cursor-not-allowed border-stone-200 bg-stone-100 text-stone-500 ring-stone-200/40'
          : 'border-stone-300 bg-white ring-stone-200/60 hover:bg-stone-50'
      }`}
    >
      {disabled ? (
        <span
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-200/90 ring-1 ring-stone-300/60"
          title="Chat je zaključan do prijave na termin"
        >
          <MessageCircle className="h-5 w-5 text-stone-400" aria-hidden />
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 ring-2 ring-stone-100">
            <LockMiniIcon className="h-3.5 w-3.5 text-amber-900" />
          </span>
        </span>
      ) : (
        <MessageCircle className="h-5 w-5 shrink-0 text-stone-600" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        <p className={`flex flex-wrap items-center gap-1.5 text-sm font-semibold ${disabled ? 'text-stone-600' : 'text-stone-900'}`}>
          Chat ekipe
          {disabled ? (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900">
              <LockMiniIcon className="h-3 w-3" />
              Zaključano
            </span>
          ) : null}
        </p>
        <p
          id={disabled ? 'chat-locked-hint' : undefined}
          className={`text-xs ${disabled ? 'text-stone-500' : 'text-stone-500'}`}
        >
          {disabled ? disabledHint : `${messageCount} ${messageCount === 1 ? 'poruka' : 'poruka'}`}
        </p>
      </div>
      {disabled ? (
        <LockMiniIcon className="h-5 w-5 shrink-0 text-amber-700/80" aria-hidden />
      ) : (
        <ChevronRight className="h-5 w-5 shrink-0 text-stone-400" aria-hidden />
      )}
    </button>
  );
}
