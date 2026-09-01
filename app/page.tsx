"use client";

import {
  Activity,
  ArrowDownToLine,
  ArrowLeftRight,
  Bot,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  Gauge,
  Globe2,
  Headphones,
  ImageIcon,
  Languages,
  Maximize2,
  MessageSquareText,
  Mic2,
  MoreHorizontal,
  Paperclip,
  Pause,
  Play,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { animate, stagger } from "animejs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Locale = "en" | "ja";
type ParticipantRole = "technician" | "engineer" | "customer";
type MessageKind = "text" | "image" | "audio" | "file" | "system";

type Participant = {
  id: ParticipantRole;
  name: string;
  role: string;
  initials: string;
  locale: Locale;
  color: string;
  location: string;
};

type LocalizedContent = Record<Locale, string>;

type DemoMessage = {
  id: string;
  author: ParticipantRole | "system";
  kind: MessageKind;
  originalLocale: Locale;
  time: string;
  content: LocalizedContent;
  detail?: LocalizedContent;
};

const participants: Participant[] = [
  { id: "technician", name: "Emma Collins", role: "Field Technician", initials: "EC", locale: "en", color: "#5b5ce2", location: "London · Online" },
  { id: "engineer", name: "Daniel Reed", role: "Engineering Lead", initials: "DR", locale: "en", color: "#2686df", location: "Chicago · Online" },
  { id: "customer", name: "Kenji Sato", role: "Customer Operations", initials: "KS", locale: "ja", color: "#dd6f38", location: "Osaka · Online" },
];

const messages: DemoMessage[] = [
  {
    id: "customer-alert", author: "customer", kind: "text", originalLocale: "ja", time: "15:42",
    content: { en: "The AX-400 cooling unit is showing error E-17, and the line has stopped.", ja: "AX-400冷却装置にE-17エラーが表示され、ラインが停止しました。" },
    detail: { en: "The alert appeared immediately after the morning restart.", ja: "今朝の再起動直後にアラートが表示されました。" },
  },
  {
    id: "technician-request", author: "technician", kind: "text", originalLocale: "en", time: "15:43",
    content: { en: "Thanks, Kenji. Please keep the unit stopped and send a clear photo of the control panel.", ja: "ありがとうございます、佐藤さん。装置を停止したまま、操作パネルの写真を送ってください。" },
  },
  {
    id: "panel-photo", author: "customer", kind: "image", originalLocale: "ja", time: "15:44",
    content: { en: "Here is the current panel display.", ja: "現在のパネル表示です。" },
    detail: { en: "Detected: E-17 · Inlet pressure 1.4 bar", ja: "検出：E-17 · 入口圧力 1.4 bar" },
  },
  {
    id: "voice-note", author: "customer", kind: "audio", originalLocale: "ja", time: "15:45",
    content: { en: "After the restart, I can hear an unusual noise from the pump on the right.", ja: "再起動後、右側のポンプから異音が聞こえます。" },
    detail: { en: "Voice note · Japanese · 0:18", ja: "音声メモ · 日本語 · 0:18" },
  },
  {
    id: "engineer-analysis", author: "engineer", kind: "text", originalLocale: "en", time: "15:47",
    content: { en: "The pressure reading and the noise point to the inlet sensor connection. I’m sharing the inspection page now.", ja: "圧力値と異音から、入口センサーの接続が原因と考えられます。点検資料を共有します。" },
  },
  {
    id: "service-bulletin", author: "engineer", kind: "file", originalLocale: "en", time: "15:48",
    content: { en: "AX-400 E-17 Service Bulletin", ja: "AX-400 E-17 サービス速報" },
    detail: { en: "Translated copy ready · 2 pages · PDF", ja: "翻訳版の準備完了 · 2ページ · PDF" },
  },
  {
    id: "technician-instruction", author: "technician", kind: "text", originalLocale: "en", time: "15:50",
    content: { en: "Please check connector C4, align the marks, and confirm the collar is fully seated. Then run the sensor check once more.", ja: "コネクターC4の位置マークを合わせ、カラーが完全に固定されていることを確認してください。その後、センサーチェックを再実行してください。" },
  },
  {
    id: "customer-resolved", author: "customer", kind: "text", originalLocale: "ja", time: "15:53",
    content: { en: "C4 was slightly loose. The alert has cleared and pressure is stable at 2.2 bar. Thank you.", ja: "C4が少し緩んでいました。アラートは解除され、圧力は2.2 barで安定しています。ありがとうございます。" },
  },
  {
    id: "case-resolved", author: "system", kind: "system", originalLocale: "en", time: "15:54",
    content: { en: "Incident resolved · Translation transcript saved", ja: "インシデント解決 · 翻訳トランスクリプトを保存しました" },
  },
];

const quickReplies: Record<ParticipantRole, LocalizedContent[]> = {
  technician: [
    { en: "The reading looks stable. I’ll keep monitoring with you.", ja: "測定値は安定しています。引き続き一緒に監視します。" },
    { en: "Could you send one more photo of connector C4?", ja: "コネクターC4の写真をもう一枚送っていただけますか？" },
    { en: "Everything is translated and documented in the case.", ja: "すべての内容が翻訳され、ケースに記録されています。" },
  ],
  engineer: [
    { en: "I’ve reviewed the telemetry and the pressure is within range.", ja: "テレメトリを確認し、圧力が正常範囲内であることを確認しました。" },
    { en: "The Japanese service bulletin is ready for download.", ja: "日本語版のサービス速報をダウンロードできます。" },
    { en: "I’ll add the sensor trend to the case notes.", ja: "センサーの推移をケースノートに追加します。" },
  ],
  customer: [
    { en: "The line is running normally again. Thank you for the support.", ja: "ラインは正常に稼働しています。サポートありがとうございました。" },
    { en: "I can confirm the pressure remains stable.", ja: "圧力が安定していることを確認しました。" },
    { en: "I have downloaded the translated service bulletin.", ja: "翻訳されたサービス速報をダウンロードしました。" },
  ],
};

const navItems = [
  { label: "Chat", icon: MessageSquareText, active: true },
  { label: "Live translation", icon: Languages },
  { label: "Files", icon: FileText },
  { label: "Insights", icon: Activity },
];

function participantFor(id: ParticipantRole) {
  return participants.find((participant) => participant.id === id)!;
}

function localeFor(viewer: ParticipantRole): Locale {
  return viewer === "customer" ? "ja" : "en";
}

function Avatar({ participant, small = false }: { participant: Participant; small?: boolean }) {
  return (
    <span className={`avatar ${small ? "avatar-small" : ""}`} style={{ "--avatar-color": participant.color } as React.CSSProperties} aria-hidden="true">
      {participant.initials}<span className="presence-dot" />
    </span>
  );
}

function TranslationBadge({ from, to }: { from: Locale; to: Locale }) {
  return <span className="translation-badge"><Sparkles size={11} />Translated {from.toUpperCase()} → {to.toUpperCase()}</span>;
}

function Waveform({ active }: { active: boolean }) {
  const heights = [11, 19, 28, 16, 35, 23, 31, 15, 26, 37, 20, 29, 14, 33, 22, 17, 27, 12];
  return (
    <div className={`waveform ${active ? "waveform-active" : ""}`} aria-hidden="true">
      {heights.map((height, index) => <span className="wave-bar" key={`${height}-${index}`} style={{ height, animationDelay: `${index * -45}ms` }} />)}
    </div>
  );
}

export default function Home() {
  const [activeViewer, setActiveViewer] = useState<ParticipantRole>("technician");
  const [currentStep, setCurrentStep] = useState(3);
  const [isPlaying, setIsPlaying] = useState(true);
  const [expandedOriginals, setExpandedOriginals] = useState<Set<string>>(new Set());
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [fileLocale, setFileLocale] = useState<Locale>("en");
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  const [customMessages, setCustomMessages] = useState<DemoMessage[]>([]);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const viewerLocale = localeFor(activeViewer);
  const viewer = participantFor(activeViewer);
  const visibleMessages = useMemo(() => [...messages.slice(0, currentStep + 1), ...customMessages], [currentStep, customMessages]);
  const progress = ((currentStep + 1) / messages.length) * 100;

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const intro = animate("[data-intro]", { opacity: { from: 0 }, translateY: { from: 10 }, delay: stagger(60), duration: 680, ease: "out(3)" });
    return () => intro.cancel();
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= messages.length - 1) { setIsPlaying(false); return; }
    const timer = window.setTimeout(() => setCurrentStep((step) => Math.min(step + 1, messages.length - 1)), currentStep === 3 ? 3600 : 4800);
    return () => window.clearTimeout(timer);
  }, [currentStep, isPlaying]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const newest = messages[currentStep];
    if (!reduceMotion && newest) {
      const messageAnimation = animate(`[data-message-id="${newest.id}"]`, { opacity: { from: 0 }, translateY: { from: 20 }, scale: { from: 0.985 }, duration: 620, ease: "out(3)" });
      const orbAnimation = animate(".translation-orb", { scale: [1, 1.12, 1], rotate: [0, 4, 0], duration: 850, ease: "inOut(2)" });
      window.setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return () => { messageAnimation.cancel(); orbAnimation.cancel(); };
    }
    chatEndRef.current?.scrollIntoView();
  }, [currentStep]);

  useEffect(() => {
    if (!audioPlaying) return;
    const timer = window.setTimeout(() => setAudioPlaying(false), 8000);
    return () => window.clearTimeout(timer);
  }, [audioPlaying]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setImageOpen(false); setRightPanelOpen(false); setQuickRepliesOpen(false); }
      if (event.key === " " && event.target === document.body) { event.preventDefault(); setIsPlaying((playing) => !playing); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function toggleOriginal(id: string) {
    setExpandedOriginals((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function restartDemo() {
    setCurrentStep(0); setCustomMessages([]); setExpandedOriginals(new Set()); setIsPlaying(true);
  }

  function sendQuickReply(content: LocalizedContent, index: number) {
    const authorLocale = activeViewer === "customer" ? "ja" : "en";
    setCustomMessages((current) => [...current, { id: `quick-${activeViewer}-${index}-${current.length}`, author: activeViewer, kind: "text", originalLocale: authorLocale, time: "15:55", content }]);
    setQuickRepliesOpen(false); setIsPlaying(false);
    window.setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    showToast("Message translated and delivered");
  }

  const translatedEvents = visibleMessages.filter((message) => message.author !== "system" && message.originalLocale !== viewerLocale).slice(-4).reverse();

  return (
    <main className="app-shell">
      <header className="global-header" data-intro>
        <div className="brand-lockup"><span className="brand-mark"><Check size={18} strokeWidth={3} /></span><span className="brand-name">RelayBridge</span><span className="product-pill">LIVE</span></div>
        <div className="global-search" role="search"><Search size={16} /><span>Search conversations, files and translated transcripts</span><kbd>⌘ K</kbd></div>
        <div className="header-actions"><span className="demo-label"><span /> Simulated demo</span><button className="icon-button" aria-label="Help"><CircleHelp size={18} /></button><button className="icon-button" aria-label="Settings"><Settings size={18} /></button><Avatar participant={participantFor("technician")} small /></div>
      </header>

      <aside className="app-rail" data-intro>
        <nav aria-label="Primary navigation">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button className={`rail-button ${active ? "rail-button-active" : ""}`} key={label} aria-label={label} aria-current={active ? "page" : undefined} onClick={() => { if (label === "Files") setFileLocale(viewerLocale); showToast(active ? "You’re already in the live conversation" : `${label} preview opened`); }}>
              <Icon size={20} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <button className="rail-button rail-bottom" aria-label="Profile"><span className="mini-avatar">EC</span><span>Profile</span></button>
      </aside>

      <aside className="workspace-sidebar" data-intro>
        <div className="workspace-heading"><span>Workspaces</span><button className="icon-button" aria-label="Workspace options"><MoreHorizontal size={17} /></button></div>
        <button className="workspace-select"><span className="workspace-icon"><Gauge size={18} /></span><span><strong>Kansai Plant</strong><small>Support workspace</small></span><ChevronDown size={15} /></button>
        <p className="sidebar-label">ACTIVE CASE</p>
        <button className="channel active-channel"><span className="channel-hash">#</span><span><strong>AX-400 · E-17</strong><small>3 participants</small></span><span className="unread-dot" /></button>
        <button className="channel"><span className="channel-hash">#</span><span><strong>General support</strong><small>12 participants</small></span></button>
        <p className="sidebar-label sidebar-label-people">IN THIS CONVERSATION</p>
        <div className="participant-list">
          {participants.map((participant) => (
            <button className={`participant-row ${activeViewer === participant.id ? "participant-row-active" : ""}`} key={participant.id} onClick={() => setActiveViewer(participant.id)}>
              <Avatar participant={participant} small /><span><strong>{participant.name}</strong><small>{participant.role}</small></span>
            </button>
          ))}
        </div>
        <div className="case-health"><span className="health-icon"><ShieldCheck size={18} /></span><div><small>Translation coverage</small><strong>100% localized</strong></div><span className="health-value">EN ⇄ JA</span></div>
      </aside>

      <section className="conversation" data-intro>
        <div className="conversation-header">
          <div className="case-title-block"><span className="case-icon"><Zap size={20} /></span><div><div className="case-kicker"><span className="live-dot" /> LIVE SUPPORT · CASE #RB-2048</div><h1>AX-400 / E-17 Pressure Alert</h1></div></div>
          <div className="case-header-actions"><div className="stacked-avatars" aria-label="Three participants online">{participants.map((participant) => <Avatar key={participant.id} participant={participant} small />)}</div><button className="header-action-button" onClick={() => setRightPanelOpen(true)}><Activity size={16} /> Activity</button><button className="icon-button" aria-label="More case options"><MoreHorizontal size={19} /></button></div>
        </div>

        <div className="perspective-bar">
          <div className="perspective-copy"><span className="perspective-icon"><Globe2 size={16} /></span><span><small>VIEWING AS</small><strong>{viewer.name}</strong></span></div>
          <div className="viewer-switcher" role="group" aria-label="Choose participant perspective">
            {participants.map((participant) => (
              <button key={participant.id} className={activeViewer === participant.id ? "viewer-active" : ""} aria-pressed={activeViewer === participant.id} onClick={() => setActiveViewer(participant.id)}>
                <span style={{ background: participant.color }}>{participant.initials}</span><b>{participant.id === "technician" ? "Technician" : participant.id === "engineer" ? "Engineer" : "Customer"}</b><small>{participant.locale.toUpperCase()}</small>
              </button>
            ))}
          </div>
          <div className="language-route"><span>EN</span><ArrowLeftRight size={14} /><span>日本語</span></div>
        </div>

        <div className="demo-controller">
          <div className="demo-controls">
            <button className="controller-button" onClick={restartDemo} aria-label="Restart demo"><RotateCcw size={15} /></button>
            <button className="controller-button" disabled={currentStep === 0} onClick={() => { setIsPlaying(false); setCurrentStep((step) => Math.max(0, step - 1)); }} aria-label="Previous step"><ChevronLeft size={17} /></button>
            <button className="play-button" onClick={() => { if (currentStep === messages.length - 1 && !isPlaying) restartDemo(); else setIsPlaying((playing) => !playing); }} aria-label={isPlaying ? "Pause demo" : "Play demo"}>{isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}{isPlaying ? "Pause" : currentStep === messages.length - 1 ? "Replay" : "Play"}</button>
            <button className="controller-button" disabled={currentStep === messages.length - 1} onClick={() => { setIsPlaying(false); setCurrentStep((step) => Math.min(messages.length - 1, step + 1)); }} aria-label="Next step"><ChevronRight size={17} /></button>
          </div>
          <div className="demo-progress-wrap"><div className="progress-label"><span>Guided demo</span><span>{currentStep + 1} of {messages.length}</span></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div></div>
          <span className="demo-state"><span className={isPlaying ? "state-pulse" : ""} /> {isPlaying ? "Auto-playing" : "Paused"}</span>
        </div>

        <div className="chat-scroll">
          <div className="chat-canvas">
            <div className="day-divider"><span>Today · Live translation is active</span></div>
            {visibleMessages.map((message) => {
              if (message.kind === "system") return <div className="resolution-event" key={message.id} data-message-id={message.id}><span><Check size={16} /></span><strong>{message.content[viewerLocale]}</strong><small>{message.time}</small></div>;
              const author = participantFor(message.author as ParticipantRole);
              const isOwn = message.author === activeViewer;
              const isTranslated = message.originalLocale !== viewerLocale;
              const originalOpen = expandedOriginals.has(message.id);
              return (
                <article className={`message ${isOwn ? "own-message" : ""}`} key={message.id} data-message-id={message.id}>
                  <Avatar participant={author} />
                  <div className="message-column">
                    <div className="message-meta"><strong>{author.name}</strong><span>{author.role}</span><time>{message.time}</time></div>
                    <div className={`message-card message-${message.kind}`}>
                      {isTranslated && <TranslationBadge from={message.originalLocale} to={viewerLocale} />}
                      {message.kind !== "file" && <p className="message-text">{message.content[viewerLocale]}</p>}

                      {message.kind === "image" && (
                        <button className="image-attachment" onClick={() => setImageOpen(true)} aria-label="Open translated equipment image">
                          <img src="/media/ax400-control-panel.png" alt="AX-400 industrial cooling unit control panel" /><span className="image-scan-line" /><span className="error-chip">E-17</span><span className="image-callout"><Sparkles size={12} /> {message.detail?.[viewerLocale]}</span><span className="image-expand"><Maximize2 size={15} /></span>
                        </button>
                      )}

                      {message.kind === "audio" && (
                        <div className="audio-attachment"><button className="audio-play" onClick={() => setAudioPlaying((playing) => !playing)} aria-label={audioPlaying ? "Pause simulated audio" : "Play simulated audio"}>{audioPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}</button><div className="audio-main"><Waveform active={audioPlaying} /><div className="audio-progress"><span className={audioPlaying ? "audio-progress-active" : ""} /></div></div><span className="audio-time">{audioPlaying ? "0:08" : "0:18"}</span><span className="audio-language"><Mic2 size={12} /> {message.originalLocale === "ja" ? "JA" : "EN"}</span></div>
                      )}
                      {message.kind === "audio" && <div className="transcript-box"><span><Headphones size={14} /> Live transcript</span><p>{message.content[viewerLocale]}</p></div>}

                      {message.kind === "file" && (
                        <div className="file-attachment">
                          <div className="pdf-thumbnail"><span>PDF</span><FileText size={31} /></div>
                          <div className="file-copy"><div className="file-topline"><span>TRANSLATED DOCUMENT</span><span className="ready-dot"><Check size={10} /> Ready</span></div><strong>{message.content[viewerLocale]}</strong><small>{message.detail?.[viewerLocale]}</small>
                            <div className="file-actions"><div className="file-toggle" role="group" aria-label="Choose document language"><button className={fileLocale === "en" ? "file-locale-active" : ""} onClick={() => setFileLocale("en")}>EN</button><button className={fileLocale === "ja" ? "file-locale-active" : ""} onClick={() => setFileLocale("ja")}>日本語</button></div><a href={`/demo-files/AX-400_E17_Service_Bulletin_${fileLocale === "en" ? "EN" : "JA"}.pdf`} target="_blank" rel="noreferrer">Open preview <ChevronRight size={13} /></a><a className="download-link" href={`/demo-files/AX-400_E17_Service_Bulletin_${fileLocale === "en" ? "EN" : "JA"}.pdf`} download aria-label="Download selected PDF"><ArrowDownToLine size={14} /></a></div>
                          </div>
                        </div>
                      )}

                      {isTranslated && <button className="original-toggle" onClick={() => toggleOriginal(message.id)} aria-expanded={originalOpen}><Globe2 size={12} /> {originalOpen ? "Hide original" : `View original ${message.originalLocale.toUpperCase()}`} <ChevronDown size={12} /></button>}
                      {isTranslated && originalOpen && <div className="original-copy" lang={message.originalLocale}>{message.content[message.originalLocale]}</div>}
                    </div>
                  </div>
                </article>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="composer-wrap">
          {quickRepliesOpen && <div className="quick-replies"><div className="quick-replies-title"><Sparkles size={14} /><span>Try a translated reply as {viewer.name}</span></div>{quickReplies[activeViewer].map((reply, index) => <button key={reply.en} onClick={() => sendQuickReply(reply, index)}><span>{reply[viewerLocale]}</span><Send size={14} /></button>)}</div>}
          <div className="composer"><button className="composer-icon" aria-label="Attach file"><Paperclip size={18} /></button><button className="composer-input" onClick={() => setQuickRepliesOpen((open) => !open)}><span>Reply as {viewer.name}…</span><span className="composer-ai"><Sparkles size={12} /> Auto-translate to {viewerLocale === "en" ? "Japanese" : "English"}</span></button><button className="composer-icon" aria-label="Add image"><ImageIcon size={18} /></button><button className="composer-icon" aria-label="Record voice note"><Mic2 size={18} /></button><button className="send-button" onClick={() => setQuickRepliesOpen(true)} aria-label="Choose a translated quick reply"><Send size={17} /></button></div>
        </div>
      </section>

      <aside className={`translation-panel ${rightPanelOpen ? "translation-panel-open" : ""}`} data-intro>
        <div className="panel-heading"><div><span className="eyebrow">AI TRANSLATION</span><h2>Live activity</h2></div><button className="panel-close" aria-label="Close activity panel" onClick={() => setRightPanelOpen(false)}><X size={18} /></button><span className="live-status"><span /> LIVE</span></div>
        <div className="translation-hero"><div className="translation-orb"><span className="orb-ring orb-ring-one" /><span className="orb-ring orb-ring-two" /><Languages size={27} /></div><strong>English ⇄ Japanese</strong><span>Always-on translation</span><div className="translation-metrics"><div><strong>0.8s</strong><small>Latency</small></div><div><strong>99%</strong><small>Confidence</small></div><div><strong>{visibleMessages.length}</strong><small>Events</small></div></div></div>
        <div className="panel-section-title"><span>TRANSLATION STREAM</span><span>{translatedEvents.length} active</span></div>
        <div className="event-list">
          {translatedEvents.map((message, index) => { const author = participantFor(message.author as ParticipantRole); return <div className="translation-event" key={message.id}><div className="event-line"><span /><i /></div><div className="event-copy"><div><strong>{author.name}</strong><time>{message.time}</time></div><p>{message.content[viewerLocale]}</p><span className="confidence"><Check size={10} /> {98 - index}% confidence</span></div></div>; })}
        </div>
        <div className="ai-note"><span><Bot size={18} /></span><div><strong>Context-aware AI</strong><p>Technical terms, document layout and speaker intent stay consistent across the case.</p></div></div>
        <button className="transcript-button" onClick={() => showToast("Translated transcript is ready to export")}><FileText size={15} /> View full transcript <ChevronRight size={14} /></button>
      </aside>

      {rightPanelOpen && <button className="panel-backdrop" aria-label="Close panel" onClick={() => setRightPanelOpen(false)} />}

      {imageOpen && (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label="Translated equipment image">
          <button className="modal-backdrop" aria-label="Close image" onClick={() => setImageOpen(false)} />
          <div className="modal-card"><div className="modal-header"><div><span className="eyebrow">VISUAL TRANSLATION</span><h2>AX-400 control panel</h2></div><button className="icon-button" aria-label="Close image" onClick={() => setImageOpen(false)}><X size={19} /></button></div><div className="modal-image-wrap"><img src="/media/ax400-control-panel.png" alt="AX-400 industrial cooling unit control panel enlarged" /><span className="modal-marker marker-error"><i />E-17 active alert</span><span className="modal-marker marker-pressure"><i />Inlet pressure · 1.4 bar</span><span className="modal-marker marker-connector"><i />Inspect sensor connector C4</span></div><div className="modal-footer"><span><Sparkles size={15} /> 3 visual references translated to {viewerLocale === "en" ? "English" : "Japanese"}</span><button onClick={() => setImageOpen(false)}>Done</button></div></div>
        </div>
      )}

      {toast && <div className="toast" role="status"><Check size={15} /> {toast}</div>}
    </main>
  );
}
