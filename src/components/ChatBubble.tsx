interface ChatBubbleProps {
  content: string;
  sender: { id: string; username: string };
  isOwn: boolean;
  createdAt: string;
  isDeleted: boolean;
}

export default function ChatBubble({ content, sender, isOwn, createdAt, isDeleted }: ChatBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? "bg-[var(--color-magenta)] text-black rounded-br-md"
            : "bg-[var(--color-panel)] text-[var(--color-ink)] rounded-bl-md border border-[var(--color-line)]"
        }`}
      >
        {!isOwn && (
          <p className="text-[10px] font-semibold text-[var(--color-cyan)] mb-0.5">{sender.username}</p>
        )}
        {isDeleted ? (
          <p className="text-sm italic text-[var(--color-mute)]">[deleted]</p>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
        )}
        <p className={`text-[10px] mt-1 ${isOwn ? "text-black/60" : "text-[var(--color-mute)]"}`}>
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
