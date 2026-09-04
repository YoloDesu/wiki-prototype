"use client";

import {
  Captions,
  Check,
  Download,
  FileAudio,
  Languages,
  Mic,
  MicOff,
  MoreHorizontal,
  Pause,
  PhoneOff,
  Play,
  Radio,
  Sparkles,
  Users,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildBilingualCallScript,
  callAudioTracks,
  callDuration,
  callSegments,
  type CallLocale,
  type CallParticipantRole,
} from "./call-data";

type CallProps = {
  activeViewer: CallParticipantRole;
  onChangeViewer: (viewer: CallParticipantRole) => void;
  onClose: () => void;
};

const callParticipants = [
  { id: "technician" as const, name: "Emma Collins", role: "Field Technician", initials: "EC", locale: "EN", color: "#6b5dd3" },
  { id: "engineer" as const, name: "Daniel Reed", role: "Engineering Lead", initials: "DR", locale: "EN", color: "#1688c9" },
  { id: "customer" as const, name: "Kenji Sato", role: "Customer Operations", initials: "KS", locale: "JA", color: "#e46f50" },
];

function localeFor(viewer: CallParticipantRole): CallLocale {
  return viewer === "customer" ? "ja" : "en";
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.min(callDuration, Math.floor(seconds)));
  return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export default function BilingualCall({ activeViewer, onChangeViewer, onClose }: CallProps) {
  const audioLocale = localeFor(activeViewer);
  const [scriptLocale, setScriptLocale] = useState<CallLocale | "both">(audioLocale);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [audioReady, setAudioReady] = useState<Record<CallLocale, boolean>>({ en: false, ja: false });
  const [switchNotice, setSwitchNotice] = useState<string | null>(null);
  const audioRefs = useRef<Record<CallLocale, HTMLAudioElement | null>>({ en: null, ja: null });
  const elapsedRef = useRef(0);
  const noticeTimer = useRef<number | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const activeSegment = useMemo(
    () => callSegments.find((segment) => elapsed >= segment.start && elapsed < segment.end) ?? callSegments.at(-1)!,
    [elapsed],
  );
  const activeSpeaker = callParticipants.find((participant) => participant.id === activeSegment.speaker)!;

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    if (!isPlaying || audioReady[audioLocale]) return;
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        const next = Math.min(current + 0.25, callDuration);
        if (next >= callDuration) setIsPlaying(false);
        return next;
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [audioLocale, audioReady, isPlaying]);

  useEffect(() => {
    const target = audioRefs.current[audioLocale];
    Object.values(audioRefs.current).forEach((audio) => audio?.pause());
    if (target) {
      try {
        target.currentTime = elapsedRef.current;
      } catch {
        // Metadata is not loaded yet; onCanPlay will synchronize the track.
      }
      target.muted = isMuted;
      if (isPlaying && audioReady[audioLocale]) void target.play().catch(() => setIsPlaying(false));
    }
  }, [audioLocale, audioReady, isMuted, isPlaying]);

  useEffect(() => () => {
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
  }, []);

  useEffect(() => {
    const activeRow = transcriptRef.current?.querySelector(`[data-call-segment="${activeSegment.id}"]`);
    activeRow?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeSegment.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function togglePlayback() {
    if (elapsed >= callDuration) {
      setElapsed(0);
      elapsedRef.current = 0;
    }
    setIsPlaying((current) => !current);
  }

  function switchPerspective(viewer: CallParticipantRole) {
    const nextLocale = localeFor(viewer);
    if (nextLocale !== audioLocale) {
      setScriptLocale(nextLocale);
      setSwitchNotice(`${callAudioTracks[nextLocale].nativeLabel} audio · ${formatTime(elapsedRef.current)}`);
      if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setSwitchNotice(null), 2600);
    }
    onChangeViewer(viewer);
  }

  function seek(next: number) {
    setElapsed(next);
    elapsedRef.current = next;
    Object.values(audioRefs.current).forEach((audio) => {
      if (!audio) return;
      try {
        audio.currentTime = next;
      } catch {
        // The simulated timeline remains available until metadata is loaded.
      }
    });
  }

  function setTrackReady(locale: CallLocale, ready: boolean) {
    setAudioReady((current) => current[locale] === ready ? current : { ...current, [locale]: ready });
    if (!ready) return;
    const audio = audioRefs.current[locale];
    if (audio) audio.currentTime = elapsedRef.current;
  }

  function downloadScript() {
    const blob = new Blob([buildBilingualCallScript()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "AX-400-bilingual-call-script.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="call-overlay" role="dialog" aria-modal="true" aria-labelledby="call-title">
      <section className="call-window">
        <header className="call-topbar">
          <div className="call-title-wrap">
            <span className="call-live-dot"><Radio size={14} /></span>
            <div>
              <span>LIVE SUPPORT CALL · KANSAI PLANT</span>
              <h2 id="call-title">AX-400 pressure alert</h2>
            </div>
          </div>
          <div className="call-language-state">
            <Languages size={15} />
            <span>Listening in <strong>{callAudioTracks[audioLocale].nativeLabel}</strong></span>
            <i />
          </div>
          <button className="call-close" onClick={onClose} aria-label="Close translated call"><X size={20} /></button>
        </header>

        <div className="call-content">
          <main className="call-stage">
            <div className="call-perspective-bar">
              <div><Users size={14} /><span>View and listen as</span></div>
              <div className="call-viewer-switch" role="group" aria-label="Choose call perspective and audio language">
                {callParticipants.map((participant) => (
                  <button
                    key={participant.id}
                    className={activeViewer === participant.id ? "active" : ""}
                    aria-pressed={activeViewer === participant.id}
                    onClick={() => switchPerspective(participant.id)}
                  >
                    <span style={{ background: participant.color }}>{participant.initials}</span>
                    <b>{participant.id === "technician" ? "Technician" : participant.id === "engineer" ? "Engineer" : "Customer"}</b>
                    <small>{participant.locale}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="call-video-grid">
              {callParticipants.map((participant) => {
                const isSpeaking = participant.id === activeSegment.speaker && isPlaying;
                return (
                  <article className={`call-person ${isSpeaking ? "speaking" : ""} ${cameraOn ? "camera-on" : ""}`} key={participant.id}>
                    <div className="call-person-glow" style={{ "--person-color": participant.color } as React.CSSProperties} />
                    <span className="call-person-avatar" style={{ "--person-color": participant.color } as React.CSSProperties}>{participant.initials}</span>
                    {isSpeaking && <span className="speaking-bars" aria-label="Speaking"><i /><i /><i /></span>}
                    <div className="call-person-meta">
                      <div><strong>{participant.name}</strong><span>{participant.role}</span></div>
                      <small><Languages size={11} /> {participant.locale}</small>
                    </div>
                    <span className="call-mic-status"><Mic size={13} /></span>
                  </article>
                );
              })}
            </div>

            {captionsOn && (
              <div className="call-caption" aria-live="polite">
                <span><Sparkles size={13} /> {activeSpeaker.name} · {activeSegment.originalLocale === audioLocale ? "Original" : "Live interpreted"}</span>
                <p lang={audioLocale}>{activeSegment.script[audioLocale]}</p>
              </div>
            )}

            <div className="call-timeline">
              <span>{formatTime(elapsed)}</span>
              <input
                type="range"
                min="0"
                max={callDuration}
                step="0.1"
                value={elapsed}
                onChange={(event) => seek(Number(event.target.value))}
                aria-label="Call timeline"
                style={{ "--call-progress": `${(elapsed / callDuration) * 100}%` } as React.CSSProperties}
              />
              <span>{formatTime(callDuration)}</span>
            </div>

            <div className="call-control-bar">
              <div className="call-audio-source" title={callAudioTracks[audioLocale].src}>
                <FileAudio size={15} />
                <span>{audioReady[audioLocale] ? "MP3 connected" : "Script preview"}</span>
                <i className={audioReady[audioLocale] ? "ready" : ""} />
              </div>
              <div className="call-main-controls">
                <button className={micOn ? "" : "off"} onClick={() => setMicOn((current) => !current)} aria-label={micOn ? "Mute microphone" : "Unmute microphone"}>{micOn ? <Mic size={18} /> : <MicOff size={18} />}</button>
                <button className={cameraOn ? "" : "off"} onClick={() => setCameraOn((current) => !current)} aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}>{cameraOn ? <Video size={19} /> : <VideoOff size={19} />}</button>
                <button className="call-play" onClick={togglePlayback} aria-label={isPlaying ? "Pause call" : "Play call"}>{isPlaying ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" />}</button>
                <button className={captionsOn ? "selected" : ""} onClick={() => setCaptionsOn((current) => !current)} aria-label="Toggle live captions"><Captions size={20} /></button>
                <button onClick={() => setIsMuted((current) => !current)} aria-label={isMuted ? "Unmute call audio" : "Mute call audio"}>{isMuted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
                <button aria-label="More call options"><MoreHorizontal size={20} /></button>
                <button className="hang-up" onClick={onClose} aria-label="Leave call"><PhoneOff size={19} /></button>
              </div>
              <span className="call-duration"><i /> 3 participants</span>
            </div>
          </main>

          <aside className="call-script-panel">
            <div className="script-header">
              <div><span>CALL RECORD</span><h3>Live script</h3></div>
              <button onClick={downloadScript} aria-label="Download bilingual call script" title="Download bilingual script"><Download size={17} /></button>
            </div>
            <div className="script-tabs" role="group" aria-label="Choose script language">
              <button className={scriptLocale === "en" ? "active" : ""} onClick={() => setScriptLocale("en")}>English</button>
              <button className={scriptLocale === "ja" ? "active" : ""} onClick={() => setScriptLocale("ja")}>日本語</button>
              <button className={scriptLocale === "both" ? "active" : ""} onClick={() => setScriptLocale("both")}>EN + JA</button>
            </div>
            <div className="script-sync-state"><Check size={12} /><span>Time-aligned transcript</span><small>{formatTime(elapsed)}</small></div>
            <div className="script-scroll" ref={transcriptRef}>
              {callSegments.map((segment) => {
                const speaker = callParticipants.find((participant) => participant.id === segment.speaker)!;
                const active = segment.id === activeSegment.id;
                return (
                  <button
                    className={`script-row ${active ? "active" : ""}`}
                    key={segment.id}
                    data-call-segment={segment.id}
                    onClick={() => seek(segment.start)}
                  >
                    <span className="script-time">{formatTime(segment.start)}</span>
                    <span className="script-avatar" style={{ background: speaker.color }}>{speaker.initials}</span>
                    <span className="script-copy">
                      <strong>{speaker.name}{active && <i>Now</i>}</strong>
                      {(scriptLocale === "en" || scriptLocale === "both") && <span lang="en">{segment.script.en}</span>}
                      {scriptLocale === "both" && <em />}
                      {(scriptLocale === "ja" || scriptLocale === "both") && <span lang="ja">{segment.script.ja}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="script-footer"><Sparkles size={13} /><span>English and Japanese versions are saved with the case.</span></div>
          </aside>
        </div>

        {switchNotice && <div className="audio-switch-notice" role="status"><Languages size={15} /><span>Audio switched to <strong>{switchNotice}</strong></span></div>}

        {(Object.keys(callAudioTracks) as CallLocale[]).map((locale) => (
          <audio
            key={locale}
            ref={(node) => { audioRefs.current[locale] = node; }}
            src={callAudioTracks[locale].src}
            preload="metadata"
            onCanPlay={() => setTrackReady(locale, true)}
            onError={() => setTrackReady(locale, false)}
            onTimeUpdate={(event) => {
              if (locale === audioLocale) setElapsed(event.currentTarget.currentTime);
            }}
            onEnded={() => { setElapsed(callDuration); setIsPlaying(false); }}
          />
        ))}
      </section>
    </div>
  );
}
