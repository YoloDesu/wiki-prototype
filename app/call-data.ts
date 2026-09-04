export type CallLocale = "en" | "ja";
export type CallParticipantRole = "technician" | "engineer" | "customer";

export type CallAudioTrack = {
  locale: CallLocale;
  label: string;
  nativeLabel: string;
  src: string;
};

export type CallSegment = {
  id: string;
  start: number;
  end: number;
  speaker: CallParticipantRole;
  originalLocale: CallLocale;
  script: Record<CallLocale, string>;
};

/**
 * Drop the final, time-aligned MP3 files at these paths. Both tracks must start
 * at the same instant and have the same duration so a locale switch can keep
 * the listener at the exact same point in the call.
 */
export const callAudioTracks: Record<CallLocale, CallAudioTrack> = {
  en: {
    locale: "en",
    label: "English interpreted audio",
    nativeLabel: "English",
    src: "/audio/ax400-support-call.en.mp3",
  },
  ja: {
    locale: "ja",
    label: "Japanese interpreted audio",
    nativeLabel: "日本語",
    src: "/audio/ax400-support-call.ja.mp3",
  },
};

export const callDuration = 98;

export const callSegments: CallSegment[] = [
  {
    id: "opening",
    start: 0,
    end: 11,
    speaker: "customer",
    originalLocale: "ja",
    script: {
      en: "Thank you for joining. The AX-400 line is still stopped, and error E-17 is visible on the panel.",
      ja: "ご参加ありがとうございます。AX-400のラインはまだ停止しており、パネルにはE-17が表示されています。",
    },
  },
  {
    id: "safety-check",
    start: 11,
    end: 23,
    speaker: "technician",
    originalLocale: "en",
    script: {
      en: "Understood. Please keep the unit isolated while we inspect it. Kenji, can you confirm the inlet pressure reading?",
      ja: "承知しました。点検中は装置を隔離したままにしてください。佐藤さん、入口圧力の値を確認できますか？",
    },
  },
  {
    id: "noise-report",
    start: 23,
    end: 35,
    speaker: "customer",
    originalLocale: "ja",
    script: {
      en: "It is holding at 1.4 bar. After the restart attempt, I also heard an unusual noise from the pump on the right.",
      ja: "1.4 barのままです。再起動を試した後、右側のポンプから異音も聞こえました。",
    },
  },
  {
    id: "diagnosis",
    start: 35,
    end: 49,
    speaker: "engineer",
    originalLocale: "en",
    script: {
      en: "The telemetry matches that reading. The most likely cause is a loose inlet sensor connection rather than a pump failure.",
      ja: "テレメトリもその値と一致しています。ポンプ故障ではなく、入口センサーの接続緩みが最も可能性の高い原因です。",
    },
  },
  {
    id: "camera-check",
    start: 49,
    end: 62,
    speaker: "technician",
    originalLocale: "en",
    script: {
      en: "Please point the camera at connector C4. Check that the alignment marks meet and that the locking collar is fully seated.",
      ja: "カメラをコネクターC4に向けてください。位置マークが合っていることと、ロックカラーが完全に固定されていることを確認してください。",
    },
  },
  {
    id: "connector-found",
    start: 62,
    end: 75,
    speaker: "customer",
    originalLocale: "ja",
    script: {
      en: "I found it. The collar was slightly loose, so I aligned the marks and secured it. I am running the sensor check now.",
      ja: "見つけました。カラーが少し緩んでいたので、位置マークを合わせて固定しました。今、センサーチェックを実行しています。",
    },
  },
  {
    id: "recovery",
    start: 75,
    end: 87,
    speaker: "engineer",
    originalLocale: "en",
    script: {
      en: "The pressure is recovering—2.2 bar and stable. The E-17 signal has cleared, and the pump trend is back within range.",
      ja: "圧力は回復し、2.2 barで安定しています。E-17信号は解除され、ポンプの推移も正常範囲に戻りました。",
    },
  },
  {
    id: "close",
    start: 87,
    end: 98,
    speaker: "technician",
    originalLocale: "en",
    script: {
      en: "Great. You can return the line to service. I will attach this bilingual call transcript to the case notes.",
      ja: "問題ありません。ラインを稼働に戻してください。このバイリンガル通話記録をケースノートに添付します。",
    },
  },
];

export function buildBilingualCallScript() {
  return callSegments
    .map((segment) => {
      const timestamp = `${String(Math.floor(segment.start / 60)).padStart(2, "0")}:${String(segment.start % 60).padStart(2, "0")}`;
      return `[${timestamp}] ${segment.speaker.toUpperCase()}\nEN: ${segment.script.en}\nJA: ${segment.script.ja}`;
    })
    .join("\n\n");
}
