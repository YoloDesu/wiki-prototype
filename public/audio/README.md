# RelayBridge call audio

Place the two final, interpreted call tracks in this directory:

- `ax400-support-call.en.mp3`
- `ax400-support-call.ja.mp3`

Both files must:

1. start at the same call instant;
2. be exactly 98 seconds long;
3. follow the segment timestamps in `app/call-data.ts`;
4. include the complete interpreted conversation in the named language.

The player loads both paths through `callAudioTracks`. When the active viewer
changes between the English-speaking team and the Japanese customer, the
player pauses the previous track, copies its current time to the other track,
and resumes in the selected language. If a file is absent, the UI keeps a
silent simulated timeline so the complete interaction remains testable.
