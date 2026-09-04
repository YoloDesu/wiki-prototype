"use client";

import {
  ArrowDownToLine,
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe2,
  Headphones,
  ImageIcon,
  Languages,
  Maximize2,
  Mic2,
  Paperclip,
  Pause,
  Play,
  PhoneCall,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { animate, stagger } from "animejs";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BilingualCall from "./bilingual-call";

type Locale = "en" | "ja";
type ParticipantRole = "technician" | "engineer" | "customer";
type MessageKind = "text" | "image" | "audio" | "file" | "system";
type LocalizedContent = Record<Locale, string>;

type Participant = {
  id: ParticipantRole;
  name: string;
  role: string;
  initials: string;
  locale: Locale;
  color: string;
};

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
  { id: "technician", name: "Emma Collins", role: "Field Technician", initials: "EC", locale: "en", color: "#6b5dd3" },
  { id: "engineer", name: "Daniel Reed", role: "Engineering Lead", initials: "DR", locale: "en", color: "#1688c9" },
  { id: "customer", name: "Kenji Sato", role: "Customer Operations", initials: "KS", locale: "ja", color: "#e46f50" },
];

const messages: DemoMessage[] = [
  {
    id: "customer-alert",
    author: "customer",
    kind: "text",
    originalLocale: "ja",
    time: "15:42",
    content: {
      en: "The AX-400 cooling unit is showing error E-17, and the line has stopped.",
      ja: "AX-400冷却装置にE-17エラーが表示され、ラインが停止しました。",
    },
  },
  {
    id: "technician-request",
    author: "technician",
    kind: "text",
    originalLocale: "en",
    time: "15:43",
    content: {
      en: "Thanks, Kenji. Please keep the unit stopped and send a clear photo of the control panel.",
      ja: "ありがとうございます、佐藤さん。装置を停止したまま、操作パネルの写真を送ってください。",
    },
  },
  {
    id: "panel-photo",
    author: "customer",
    kind: "image",
    originalLocale: "ja",
    time: "15:44",
    content: { en: "Here is the current panel display.", ja: "現在のパネル表示です。" },
    detail: { en: "E-17 detected · Inlet pressure 1.4 bar", ja: "E-17を検出 · 入口圧力 1.4 bar" },
  },
  {
    id: "voice-note",
    author: "customer",
    kind: "audio",
    originalLocale: "ja",
    time: "15:45",
    content: {
      en: "After the restart, I can hear an unusual noise from the pump on the right.",
      ja: "再起動後、右側のポンプから異音が聞こえます。",
    },
  },
  {
    id: "engineer-analysis",
    author: "engineer",
    kind: "text",
    originalLocale: "en",
    time: "15:47",
    content: {
      en: "The pressure reading and the noise point to the inlet sensor connection. I’m sharing the inspection page now.",
      ja: "圧力値と異音から、入口センサーの接続が原因と考えられます。点検資料を共有します。",
    },
  },
  {
    id: "service-bulletin",
    author: "engineer",
    kind: "file",
    originalLocale: "en",
    time: "15:48",
    content: { en: "AX-400 E-17 Service Bulletin", ja: "AX-400 E-17 サービス速報" },
    detail: { en: "Translated copy ready · 2 pages", ja: "翻訳版の準備完了 · 2ページ" },
  },
  {
    id: "technician-instruction",
    author: "technician",
    kind: "text",
    originalLocale: "en",
    time: "15:50",
    content: {
      en: "Please check connector C4, align the marks, and confirm the collar is fully seated. Then run the sensor check once more.",
      ja: "コネクターC4の位置マークを合わせ、カラーが完全に固定されていることを確認してください。その後、センサーチェックを再実行してください。",
    },
  },
  {
    id: "customer-resolved",
    author: "customer",
    kind: "text",
    originalLocale: "ja",
    time: "15:53",
    content: {
      en: "C4 was slightly loose. The alert has cleared and pressure is stable at 2.2 bar. Thank you.",
      ja: "C4が少し緩んでいました。アラートは解除され、圧力は2.2 barで安定しています。ありがとうございます。",
    },
  },
  {
    id: "case-resolved",
    author: "system",
    kind: "system",
    originalLocale: "en",
    time: "15:54",
    content: {
      en: "Incident resolved · Translation transcript saved",
      ja: "インシデント解決 · 翻訳トランスクリプトを保存しました",
    },
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

function participantFor(id: ParticipantRole) {
  return participants.find((participant) => participant.id === id)!;
}

function localeFor(viewer: ParticipantRole): Locale {
  return viewer === "customer" ? "ja" : "en";
}

function Avatar({ participant, small = false }: { participant: Participant; small?: boolean }) {
  return (
    <span
      className={`avatar ${small ? "avatar-small" : ""}`}
      style={{ "--avatar-color": participant.color } as React.CSSProperties}
      aria-hidden="true"
    >
      {participant.initials}
      <span className="presence-dot" />
    </span>
  );
}

function TranslationBadge({ from, to }: { from: Locale; to: Locale }) {
  return (
    <span className="translation-badge">
      <Sparkles size={11} /> {from.toUpperCase()} <ArrowLeftRight size={10} /> {to.toUpperCase()}
    </span>
  );
}

function Waveform({ active }: { active: boolean }) {
  const heights = [10, 20, 29, 15, 34, 22, 30, 14, 26, 36, 20, 29, 13, 32, 21, 16, 26, 11];
  return (
    <div className={`waveform ${active ? "waveform-active" : ""}`} aria-hidden="true">
      {heights.map((height, index) => (
        <span key={`${height}-${index}`} style={{ height, animationDelay: `${index * -45}ms` }} />
      ))}
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
  const [callOpen, setCallOpen] = useState(false);
  const [fileLocale, setFileLocale] = useState<Locale>("en");
  const [quickRepliesOpen, setQuickRepliesOpen] = useState(false);
  const [customMessages, setCustomMessages] = useState<DemoMessage[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const viewerLocale = localeFor(activeViewer);
  const viewer = participantFor(activeViewer);
  const visibleMessages = useMemo(
    () => [...messages.slice(0, currentStep + 1), ...customMessages],
    [currentStep, customMessages],
  );
  const progress = ((currentStep + 1) / messages.length) * 100;
  const isRunning = isPlaying && currentStep < messages.length - 1;

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  const scrollChatToEnd = useCallback((behavior: ScrollBehavior = "smooth") => {
    const chat = chatScrollRef.current;
    if (!chat) return;

    chat.scrollTo({ top: chat.scrollHeight, behavior });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intro = animate("[data-intro]", {
      opacity: { from: 0 },
      translateY: { from: 12 },
      delay: stagger(75),
      duration: 700,
      ease: "out(3)",
    });
    return () => {
      intro.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setTimeout(
      () => setCurrentStep((step) => Math.min(step + 1, messages.length - 1)),
      currentStep === 3 ? 3600 : 4800,
    );
    return () => window.clearTimeout(timer);
  }, [currentStep, isRunning]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const newest = messages[currentStep];
    if (!reducedMotion && newest) {
      const messageAnimation = animate(`[data-message-id="${newest.id}"]`, {
        opacity: { from: 0 },
        translateY: { from: 22 },
        scale: { from: 0.98 },
        duration: 650,
        ease: "out(3)",
      });
      const translationAnimation = animate(".language-pulse", {
        scale: [1, 1.25, 1],
        rotate: [0, 8, 0],
        duration: 850,
        ease: "inOut(2)",
      });
      const scrollTimer = window.setTimeout(() => scrollChatToEnd(), 100);
      return () => {
        window.clearTimeout(scrollTimer);
        messageAnimation.cancel();
        translationAnimation.cancel();
      };
    }
    scrollChatToEnd("auto");
  }, [currentStep, scrollChatToEnd]);

  useEffect(() => {
    if (!audioPlaying) return;
    const timer = window.setTimeout(() => setAudioPlaying(false), 8000);
    return () => window.clearTimeout(timer);
  }, [audioPlaying]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setImageOpen(false);
        setCallOpen(false);
        setQuickRepliesOpen(false);
      }
      if (event.key === " " && event.target === document.body) {
        event.preventDefault();
        setIsPlaying((playing) => !playing);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function toggleOriginal(id: string) {
    setExpandedOriginals((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function restartDemo() {
    setCurrentStep(0);
    setCustomMessages([]);
    setExpandedOriginals(new Set());
    setIsPlaying(true);
  }

  function sendQuickReply(content: LocalizedContent, index: number) {
    setCustomMessages((current) => [
      ...current,
      {
        id: `quick-${activeViewer}-${index}-${current.length}`,
        author: activeViewer,
        kind: "text",
        originalLocale: activeViewer === "customer" ? "ja" : "en",
        time: "15:55",
        content,
      },
    ]);
    setQuickRepliesOpen(false);
    setIsPlaying(false);
    window.setTimeout(() => scrollChatToEnd(), 80);
    showToast("Translated and delivered");
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="workspace" data-intro>
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark"><Check size={18} strokeWidth={3} /></span>
            <span className="brand-name">RelayBridge</span>
          </div>

          <div className="translation-status" aria-label="English and Japanese live translation">
            <span>English</span>
            <span className="language-pulse"><Languages size={16} /></span>
            <span>日本語</span>
            <small><i /> Live translation</small>
          </div>

          <div className="topbar-end">
            <div className="stacked-avatars" aria-label="Three participants online">
              {participants.map((participant) => <Avatar key={participant.id} participant={participant} small />)}
            </div>
            <span className="online-copy"><i /> 3 online</span>
          </div>
        </header>

        <section className="case-header" data-intro>
          <div className="case-copy">
            <span className="live-kicker"><i /> LIVE SUPPORT · KANSAI PLANT</span>
            <h1>AX-400 pressure alert</h1>
            <p>One conversation. Everyone reads it in their own language.</p>
          </div>

          <div className="case-actions">
            <button
              className="call-launch"
              onClick={() => {
                setIsPlaying(false);
                setCallOpen(true);
              }}
            >
              <span><PhoneCall size={17} /></span>
              <span><strong>Join translated call</strong><small>English · 日本語</small></span>
              <i>LIVE</i>
            </button>

            <div className="viewer-area">
              <span className="viewer-label">Viewing as</span>
              <div className="viewer-switcher" role="group" aria-label="Choose participant perspective">
                {participants.map((participant) => (
                  <button
                    key={participant.id}
                    className={activeViewer === participant.id ? "viewer-active" : ""}
                    aria-pressed={activeViewer === participant.id}
                    onClick={() => {
                      setActiveViewer(participant.id);
                      setFileLocale(localeFor(participant.id));
                    }}
                  >
                    <span style={{ background: participant.color }}>{participant.initials}</span>
                    <b>{participant.id === "technician" ? "Technician" : participant.id === "engineer" ? "Engineer" : "Customer"}</b>
                    <small>{participant.locale.toUpperCase()}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="demo-bar" data-intro>
          <div className="demo-controls">
            <button onClick={restartDemo} aria-label="Restart demo"><RotateCcw size={15} /></button>
            <button disabled={currentStep === 0} onClick={() => { setIsPlaying(false); setCurrentStep((step) => Math.max(0, step - 1)); }} aria-label="Previous step"><ChevronLeft size={17} /></button>
            <button
              className="play-button"
              onClick={() => {
                if (currentStep === messages.length - 1) restartDemo();
                else setIsPlaying((playing) => !playing);
              }}
              aria-label={isRunning ? "Pause demo" : "Play demo"}
            >
              {isRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              {isRunning ? "Pause" : currentStep === messages.length - 1 ? "Replay" : "Play"}
            </button>
            <button disabled={currentStep === messages.length - 1} onClick={() => { setIsPlaying(false); setCurrentStep((step) => Math.min(messages.length - 1, step + 1)); }} aria-label="Next step"><ChevronRight size={17} /></button>
          </div>

          <div className="progress-wrap">
            <span className="step-counter">{String(currentStep + 1).padStart(2, "0")} / {String(messages.length).padStart(2, "0")}</span>
            <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>

        </div>

        <div className="chat-scroll" ref={chatScrollRef}>
          <div className="chat-canvas">
            <div className="day-divider"><span>Today</span></div>

            {visibleMessages.map((message) => {
              if (message.kind === "system") {
                return (
                  <div className="resolution-event" key={message.id} data-message-id={message.id}>
                    <span><Check size={15} /></span>
                    <strong>{message.content[viewerLocale]}</strong>
                    <small>{message.time}</small>
                  </div>
                );
              }

              const author = participantFor(message.author as ParticipantRole);
              const isOwn = message.author === activeViewer;
              const isTranslated = message.originalLocale !== viewerLocale;
              const originalOpen = expandedOriginals.has(message.id);

              return (
                <article className={`message ${isOwn ? "own-message" : ""}`} key={message.id} data-message-id={message.id}>
                  <Avatar participant={author} />
                  <div className="message-column">
                    <div className="message-meta">
                      <strong>{author.name}</strong>
                      <span>{author.role}</span>
                      <time>{message.time}</time>
                    </div>

                    <div className={`message-bubble message-${message.kind}`}>
                      {isTranslated && <TranslationBadge from={message.originalLocale} to={viewerLocale} />}
                      {message.kind !== "file" && <p className="message-text">{message.content[viewerLocale]}</p>}

                      {message.kind === "image" && (
                        <button className="image-attachment" onClick={() => setImageOpen(true)} aria-label="Open translated equipment image">
                          <Image src="/media/ax400-control-panel.png" alt="AX-400 industrial cooling unit control panel" width={1600} height={900} />
                          <span className="scan-line" />
                          <span className="error-chip">E-17</span>
                          <span className="image-caption"><Sparkles size={12} /> {message.detail?.[viewerLocale]}</span>
                          <span className="expand-icon"><Maximize2 size={15} /></span>
                        </button>
                      )}

                      {message.kind === "audio" && (
                        <>
                          <div className="audio-attachment">
                            <button onClick={() => setAudioPlaying((playing) => !playing)} aria-label={audioPlaying ? "Pause simulated audio" : "Play simulated audio"}>
                              {audioPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
                            </button>
                            <Waveform active={audioPlaying} />
                            <span>{audioPlaying ? "0:08" : "0:18"}</span>
                          </div>
                          <div className="transcript"><span><Headphones size={13} /> Transcript</span><p>{message.content[viewerLocale]}</p></div>
                        </>
                      )}

                      {message.kind === "file" && (
                        <div className="file-attachment">
                          <div className="file-icon"><FileText size={25} /><span>PDF</span></div>
                          <div className="file-copy">
                            <span className="file-eyebrow"><Check size={10} /> Translation ready</span>
                            <strong>{message.content[fileLocale]}</strong>
                            <small>{message.detail?.[fileLocale]}</small>
                            <div className="file-actions">
                              <div className="file-toggle" role="group" aria-label="Choose document language">
                                <button className={fileLocale === "en" ? "active" : ""} onClick={() => setFileLocale("en")}>EN</button>
                                <button className={fileLocale === "ja" ? "active" : ""} onClick={() => setFileLocale("ja")}>日本語</button>
                              </div>
                              <a href={`/demo-files/AX-400_E17_Service_Bulletin_${fileLocale === "en" ? "EN" : "JA"}.pdf`} target="_blank" rel="noreferrer">Open <ChevronRight size={13} /></a>
                              <a className="download-link" href={`/demo-files/AX-400_E17_Service_Bulletin_${fileLocale === "en" ? "EN" : "JA"}.pdf`} download aria-label="Download selected PDF"><ArrowDownToLine size={14} /></a>
                            </div>
                          </div>
                        </div>
                      )}

                      {isTranslated && (
                        <button className="original-toggle" onClick={() => toggleOriginal(message.id)} aria-expanded={originalOpen}>
                          <Globe2 size={12} /> {originalOpen ? "Hide original" : `Original ${message.originalLocale.toUpperCase()}`} <ChevronDown size={12} />
                        </button>
                      )}
                      {isTranslated && originalOpen && <div className="original-copy" lang={message.originalLocale}>{message.content[message.originalLocale]}</div>}
                    </div>
                  </div>
                </article>
              );
            })}
            <div />
          </div>
        </div>

        <div className="composer-wrap">
          {quickRepliesOpen && (
            <div className="quick-replies">
              <div className="quick-replies-title"><Sparkles size={14} /> Reply as {viewer.name}</div>
              {quickReplies[activeViewer].map((reply, index) => (
                <button key={reply.en} onClick={() => sendQuickReply(reply, index)}><span>{reply[viewerLocale]}</span><Send size={14} /></button>
              ))}
            </div>
          )}

          <div className="composer">
            <button className="composer-icon" aria-label="Attach file"><Paperclip size={18} /></button>
            <button className="composer-input" onClick={() => setQuickRepliesOpen((open) => !open)}>
              <span>Reply as {viewer.name}…</span>
              <small><Sparkles size={12} /> Auto-translate</small>
            </button>
            <button className="composer-icon" aria-label="Add image"><ImageIcon size={18} /></button>
            <button className="composer-icon" aria-label="Record voice note"><Mic2 size={18} /></button>
            <button className="send-button" onClick={() => setQuickRepliesOpen(true)} aria-label="Choose a translated quick reply"><Send size={17} /></button>
          </div>
        </div>
      </section>

      {imageOpen && (
        <div className="image-modal" role="dialog" aria-modal="true" aria-label="Translated equipment image">
          <button className="modal-backdrop" aria-label="Close image" onClick={() => setImageOpen(false)} />
          <div className="modal-card">
            <div className="modal-header"><div><span>VISUAL TRANSLATION</span><h2>AX-400 control panel</h2></div><button aria-label="Close image" onClick={() => setImageOpen(false)}><X size={19} /></button></div>
            <div className="modal-image">
              <Image src="/media/ax400-control-panel.png" alt="AX-400 industrial cooling unit control panel enlarged" width={1600} height={900} />
              <span className="modal-marker marker-error"><i />E-17 active alert</span>
              <span className="modal-marker marker-pressure"><i />Inlet pressure · 1.4 bar</span>
              <span className="modal-marker marker-connector"><i />Inspect connector C4</span>
            </div>
            <div className="modal-footer"><span><Sparkles size={15} /> 3 visual references translated</span><button onClick={() => setImageOpen(false)}>Done</button></div>
          </div>
        </div>
      )}

      {callOpen && (
        <BilingualCall
          activeViewer={activeViewer}
          onChangeViewer={(participant) => {
            setActiveViewer(participant);
            setFileLocale(localeFor(participant));
          }}
          onClose={() => setCallOpen(false)}
        />
      )}

      {toast && <div className="toast" role="status"><Check size={15} /> {toast}</div>}
    </main>
  );
}
