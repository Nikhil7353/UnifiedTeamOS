import React, { useEffect, useMemo, useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  Users,
  Settings,
  MessageCircle,
  LayoutGrid,
  Maximize,
} from 'lucide-react';

import {
  createVideoCall,
  joinVideoCall,
  leaveVideoCall,
  listVideoCalls,
  listVideoParticipants,
} from '../../services/videoService';

export default function VideoCalling({ currentUser }) {
  const [inCall, setInCall] = useState(false);
  const [activeCallId, setActiveCallId] = useState(null);
  const [calls, setCalls] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [layout, setLayout] = useState('grid');

  const me = useMemo(
    () => ({
      id: currentUser?.id || 0,
      name: currentUser?.username || 'You',
      initials: (currentUser?.username || 'Y').slice(0, 1).toUpperCase(),
      role: 'host',
      speaking: false,
      muted: !micOn,
      videoOff: !camOn,
    }),
    [currentUser, micOn, camOn]
  );

  const [participants, setParticipants] = useState([]);

  const loadCalls = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listVideoCalls();
      setCalls(data || []);
      if (activeCallId && !(data || []).some((c) => c.id === activeCallId)) {
        setActiveCallId(null);
        setInCall(false);
      }
    } catch (e) {
      setError('Failed to load calls.');
      // eslint-disable-next-line no-console
      console.error('Failed to load video calls', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipants = async (callId) => {
    if (!callId) {
      setParticipants([]);
      return;
    }
    try {
      const data = await listVideoParticipants(callId);
      const mapped = (data || []).map((p) => ({
        id: p.user_id,
        name: p.user_id === currentUser?.id ? (currentUser?.username || 'You') : `User #${p.user_id}`,
        initials: (p.user_id === currentUser?.id ? (currentUser?.username || 'Y') : 'U').slice(0, 1).toUpperCase(),
        role: p.user_id === currentUser?.id ? 'host' : 'member',
        speaking: false,
        muted: !p.audio_enabled,
        videoOff: !p.video_enabled,
      }));
      setParticipants(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load participants', e);
    }
  };

  useEffect(() => {
    loadCalls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeCallId) loadParticipants(activeCallId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCallId]);

  const join = (callId) => {
    (async () => {
      try {
        await joinVideoCall(callId, { video_enabled: camOn, audio_enabled: micOn });
        setActiveCallId(callId);
        setInCall(true);
        setShowChat(false);
        setSharing(false);
        await loadCalls();
      } catch (e) {
        setError('Failed to join call.');
        // eslint-disable-next-line no-console
        console.error('Failed to join call', e);
      }
    })();
  };

  const createAndJoin = () => {
    const name = prompt('Call name');
    if (!name) return;
    (async () => {
      try {
        const created = await createVideoCall({ name });
        await joinVideoCall(created.id, { video_enabled: camOn, audio_enabled: micOn });
        setActiveCallId(created.id);
        setInCall(true);
        await loadCalls();
      } catch (e) {
        setError('Failed to create call.');
        // eslint-disable-next-line no-console
        console.error('Failed to create call', e);
      }
    })();
  };

  const leave = () => {
    const id = activeCallId;
    (async () => {
      try {
        if (id) await leaveVideoCall(id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to leave call', e);
      } finally {
        setInCall(false);
        setActiveCallId(null);
        setShowChat(false);
        setSharing(false);
        loadCalls();
      }
    })();
  };

  const rejoin = () => {
    if (activeCallId) join(activeCallId);
  };

  const cards = useMemo(() => {
    // keep 'me' in sync
    const list = participants.length ? participants : [me];
    return list.map((p) => (p.id === me.id ? me : p));
  }, [participants, me]);

  const activeCall = useMemo(() => calls.find((c) => c.id === activeCallId) || null, [calls, activeCallId]);

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-bold text-secondary-900 dark:text-white">{activeCall?.name || 'Video Call'}</div>
              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                Call persistence enabled — WebRTC media later
              </div>
              {error && <div className="mt-2 text-sm text-danger-600">{error}</div>}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLayout((v) => (v === 'grid' ? 'speaker' : 'grid'))}
                className="btn btn-secondary px-3 py-2"
                title="Change layout"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary px-3 py-2" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary px-3 py-2" title="Fullscreen">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!inCall ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="card max-w-md text-center p-6">
              <Video className="w-14 h-14 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <div className="text-xl font-bold text-secondary-900 dark:text-white">Join a call</div>
              <div className="mt-2 text-secondary-600 dark:text-secondary-400">
                Select an existing call or create a new one.
              </div>
              <div className="mt-5 space-y-2 text-left">
                {isLoading && <div className="text-sm text-secondary-500">Loading…</div>}
                {(calls || []).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => join(c.id)}
                    className="w-full btn btn-secondary px-4 py-2 justify-between"
                  >
                    <span className="truncate">{c.name || `Call #${c.id}`}</span>
                    <span className="text-xs opacity-70">Join</span>
                  </button>
                ))}
                <button onClick={createAndJoin} className="w-full btn btn-primary mt-2 px-5 py-3">
                  Create call
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex">
            {/* Video area */}
            <div className="flex-1 min-w-0 p-6 overflow-auto">
              <div
                className={`grid gap-4 ${
                  layout === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1 lg:grid-cols-3'
                }`}
              >
                {cards.map((p) => (
                  <ParticipantCard key={p.id} p={p} layout={layout} />
                ))}
              </div>

              {sharing && (
                <div className="mt-4 card p-4">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white">Screen share (mock)</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Streaming placeholder</div>
                  <div className="mt-3 h-40 rounded-xl bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-600 dark:text-secondary-300">
                    Shared screen preview
                  </div>
                </div>
              )}

              <div className="mt-5 text-xs text-secondary-500 dark:text-secondary-400">
                Controls sync to backend for presence state. WebRTC, TURN/STUN, and live media streams will be added later.
              </div>
            </div>

            {/* Side chat */}
            {showChat && (
              <div className="w-96 shrink-0 border-l border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex flex-col">
                <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                  <div className="font-semibold text-secondary-900 dark:text-white">Meeting Chat</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">Mocked</div>
                </div>
                <div className="flex-1 overflow-auto p-4 space-y-3">
                  <Bubble who="N" text="Can you share the latest UI changes?" />
                  <Bubble who="Y" text="Sure — inbox + voice rooms are in." mine />
                </div>
                <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
                  <input
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call controls */}
        <div className="bg-white dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700 px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !micOn;
                  setMicOn(next);
                  if (inCall && activeCallId) joinVideoCall(activeCallId, { video_enabled: camOn, audio_enabled: next }).catch(() => {});
                }}
                className={`btn px-4 py-2 ${micOn ? 'btn-primary' : 'btn-secondary'}`}
                title={micOn ? 'Mute' : 'Unmute'}
                disabled={!inCall}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">{micOn ? 'Mic' : 'Muted'}</span>
              </button>

              <button
                onClick={() => {
                  const next = !camOn;
                  setCamOn(next);
                  if (inCall && activeCallId) joinVideoCall(activeCallId, { video_enabled: next, audio_enabled: micOn }).catch(() => {});
                }}
                className={`btn px-4 py-2 ${camOn ? 'btn-primary' : 'btn-secondary'}`}
                title={camOn ? 'Stop video' : 'Start video'}
                disabled={!inCall}
              >
                {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">{camOn ? 'Video' : 'Off'}</span>
              </button>

              <button
                onClick={() => setSharing((v) => !v)}
                className={`btn px-4 py-2 ${sharing ? 'btn-primary' : 'btn-secondary'}`}
                title="Screen share"
                disabled={!inCall}
              >
                <ScreenShare className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Share</span>
              </button>

              <button
                onClick={() => setShowChat((v) => !v)}
                className={`btn px-4 py-2 ${showChat ? 'btn-primary' : 'btn-secondary'}`}
                title="Chat"
                disabled={!inCall}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Chat</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-secondary-500 dark:text-secondary-400 hidden md:block">
                <Users className="w-4 h-4 inline mr-1" />
                {cards.length} participants
              </div>
              <button onClick={leave} className="btn btn-secondary px-4 py-2" title="Leave">
                <PhoneOff className="w-4 h-4" />
                <span className="ml-2 hidden sm:inline">Leave</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParticipantCard({ p, layout }) {
  const big = layout === 'speaker' && p.speaking;
  return (
    <div
      className={`card overflow-hidden ${big ? 'lg:col-span-2' : ''}`}
      style={{ minHeight: big ? 320 : 220 }}
    >
      <div className="relative h-full">
        <div className={`absolute inset-0 ${p.videoOff ? 'bg-secondary-100 dark:bg-secondary-700' : 'bg-gradient-to-r from-secondary-700 to-secondary-900'} `} />

        {/* Top bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="text-xs px-2 py-1 rounded-full bg-black/40 text-white flex items-center gap-2">
            <span className="font-semibold">{p.name}</span>
            {p.speaking && <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-500/80">Speaking</span>}
          </div>
          <div className="text-xs px-2 py-1 rounded-full bg-black/40 text-white">
            {p.muted ? 'Muted' : 'Live'}
          </div>
        </div>

        {/* Center avatar */}
        {p.videoOff && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${p.speaking ? 'from-success-500 to-success-600' : 'from-primary-500 to-accent-500'} text-white flex items-center justify-center text-3xl font-bold shadow-large`}>
              {p.initials}
            </div>
          </div>
        )}

        {/* Bottom right tiny badges */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 rounded-full bg-black/40 text-white">
            {p.role}
          </span>
        </div>
      </div>
    </div>
  );
}

function Bubble({ who, text, mine }) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-primary-500 text-white' : 'bg-secondary-100 dark:bg-secondary-700 text-secondary-900 dark:text-white'}`}>
        <div className="text-[10px] opacity-80 mb-1">{who}</div>
        {text}
      </div>
    </div>
  );
}
