import React, { useEffect, useMemo, useState } from 'react';
import {
  Headphones,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  Plus,
  Search,
  Lock,
  Hash,
  Settings,
  ScreenShare,
  PhoneOff,
  Crown,
} from 'lucide-react';

import {
  createVoiceRoom,
  joinVoiceRoom,
  leaveVoiceRoom,
  listVoiceParticipants,
  listVoiceRooms,
} from '../../services/voiceService';

export default function VoiceRooms({ currentUser }) {
  const [query, setQuery] = useState('');
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [ptt, setPtt] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [rooms, setRooms] = useState([]);
  const [participants, setParticipants] = useState([]);

  const loadRooms = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listVoiceRooms();
      const mapped = (data || []).map((r) => ({
        id: r.id,
        name: r.name,
        isPrivate: false,
        topic: 'Voice room',
        membersCount: null,
        created_by_id: r.created_by_id,
      }));
      setRooms(mapped);
      if (mapped.length > 0 && activeRoomId && !mapped.some((x) => x.id === activeRoomId)) {
        setActiveRoomId(null);
      }
    } catch (e) {
      setError('Failed to load rooms.');
      // eslint-disable-next-line no-console
      console.error('Failed to load voice rooms', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipants = async (roomId) => {
    if (!roomId) {
      setParticipants([]);
      return;
    }
    try {
      const data = await listVoiceParticipants(roomId);
      const mapped = (data || []).map((p) => ({
        id: p.user_id,
        name: p.user_id === currentUser?.id ? (currentUser?.username || 'You') : `User #${p.user_id}`,
        initials: (p.user_id === currentUser?.id ? (currentUser?.username || 'Y') : 'U').slice(0, 1).toUpperCase(),
        role: p.user_id === rooms.find((x) => x.id === roomId)?.created_by_id ? 'owner' : 'member',
        speaking: !!p.is_speaking,
      }));
      setParticipants(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load participants', e);
    }
  };

  useEffect(() => {
    loadRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeRoomId) loadParticipants(activeRoomId);
    else setParticipants([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoomId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => (r.name + ' ' + (r.topic || '')).toLowerCase().includes(q));
  }, [rooms, query]);

  const activeRoom = useMemo(
    () => rooms.find((r) => r.id === activeRoomId) || null,
    [rooms, activeRoomId]
  );

  const joinRoom = (id) => {
    (async () => {
      try {
        await joinVoiceRoom(id);
        setActiveRoomId(id);
        await loadRooms();
      } catch (e) {
        setError('Failed to join room.');
        // eslint-disable-next-line no-console
        console.error('Failed to join room', e);
      }
    })();
  };

  const leaveRoom = () => {
    const id = activeRoomId;
    (async () => {
      try {
        if (id) await leaveVoiceRoom(id);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to leave room', e);
      } finally {
        setActiveRoomId(null);
        setMuted(false);
        setDeafened(false);
        setPtt(false);
        loadRooms();
      }
    })();
  };

  const createRoom = () => {
    const name = prompt('Room name');
    if (!name) return;
    (async () => {
      try {
        const created = await createVoiceRoom({ name });
        await joinVoiceRoom(created.id);
        await loadRooms();
        setActiveRoomId(created.id);
      } catch (e) {
        setError('Failed to create room.');
        // eslint-disable-next-line no-console
        console.error('Failed to create room', e);
      }
    })();
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Left: room list */}
      <div className="w-80 shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-accent-500 to-primary-600 text-white flex items-center justify-center shadow-soft">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-secondary-900 dark:text-white">Voice Rooms</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Rooms & participants</div>
              </div>
            </div>

            <button onClick={createRoom} className="btn btn-primary px-3 py-2" title="Create room">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rooms..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-2">
            {error && (
              <div className="text-sm text-danger-700 bg-danger-50 border border-danger-200 rounded-xl p-3">{error}</div>
            )}
            {isLoading && (
              <div className="text-sm text-secondary-500 dark:text-secondary-400 p-2">Loading rooms…</div>
            )}
            {filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => joinRoom(r.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  activeRoomId === r.id
                    ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
                    : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-secondary-500 dark:text-secondary-300" />
                      <div className="font-semibold text-secondary-900 dark:text-white truncate">{r.name}</div>
                      {r.isPrivate && <Lock className="w-4 h-4 text-secondary-400" />}
                    </div>
                    <div className="mt-1 text-xs text-secondary-500 dark:text-secondary-400 truncate">{r.topic}</div>
                  </div>

                  <div className="shrink-0 text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 inline-flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {activeRoomId === r.id ? participants.length : r.membersCount ?? '—'}
                  </div>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="text-center text-sm text-secondary-500 dark:text-secondary-400 py-10">
                No rooms found.
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
            <div className="w-9 h-9 rounded-lg bg-gradient-secondary flex items-center justify-center">
              <span className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                {(currentUser?.username || 'Y').slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">
                {currentUser?.username || 'You'}
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate">Ready</div>
            </div>
            <button className="ml-auto btn-ghost p-2" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Right: room view */}
      <div className="flex-1 min-w-0 flex flex-col">
        {!activeRoom ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center card max-w-md">
              <Headphones className="w-14 h-14 text-secondary-300 dark:text-secondary-600 mx-auto mb-4" />
              <div className="text-xl font-bold text-secondary-900 dark:text-white mb-2">Join a voice room</div>
              <div className="text-secondary-600 dark:text-secondary-400">Select a room on the left to view participants and controls.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-secondary-900 dark:text-white truncate">{activeRoom.name}</div>
                    {activeRoom.isPrivate && (
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200 inline-flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        Private
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">{activeRoom.topic}</div>
                </div>

                <button onClick={leaveRoom} className="btn btn-secondary px-3 py-2" title="Leave room">
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {participants.map((m) => (
                  <div key={m.id} className="card p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold bg-gradient-to-r ${m.speaking ? 'from-success-500 to-success-600' : 'from-secondary-500 to-secondary-700'}`}>
                      {m.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-secondary-900 dark:text-white truncate">{m.name}</div>
                        {m.role === 'owner' && <Crown className="w-4 h-4 text-yellow-500" title="Owner" />}
                        {m.speaking && (
                          <span className="text-xs px-2 py-1 rounded-full bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300">
                            Speaking
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-secondary-500 dark:text-secondary-400">{m.role}</div>
                    </div>

                    <div className="text-secondary-500 dark:text-secondary-200">
                      <Volume2 className={`w-5 h-5 ${m.speaking ? 'text-success-500' : ''}`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-xs text-secondary-500 dark:text-secondary-400">
                Basic room persistence is enabled. WebRTC audio streaming will be added later.
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700 px-6 py-4">
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMuted((v) => !v)}
                    className={`btn px-4 py-2 ${muted ? 'btn-secondary' : 'btn-primary'}`}
                    title={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span className="ml-2 hidden sm:inline">{muted ? 'Muted' : 'Mic On'}</span>
                  </button>

                  <button
                    onClick={() => setDeafened((v) => !v)}
                    className={`btn px-4 py-2 ${deafened ? 'btn-primary' : 'btn-secondary'}`}
                    title={deafened ? 'Undeafen' : 'Deafen'}
                  >
                    {deafened ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span className="ml-2 hidden sm:inline">{deafened ? 'Deafened' : 'Audio'}</span>
                  </button>

                  <button
                    onClick={() => setPtt((v) => !v)}
                    className={`btn px-4 py-2 ${ptt ? 'btn-primary' : 'btn-secondary'}`}
                    title="Push-to-talk"
                  >
                    <span className="text-sm font-semibold">PTT</span>
                    <span className="ml-2 hidden sm:inline">{ptt ? 'On' : 'Off'}</span>
                  </button>
                </div>

                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                  {ptt ? 'Push-to-talk enabled (UI-only)' : 'Open mic mode (UI-only)'}
                </div>

                <div className="flex items-center gap-2">
                  <button className="btn btn-secondary px-4 py-2" title="Screen share (soon)">
                    <ScreenShare className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Share</span>
                  </button>

                  <button onClick={leaveRoom} className="btn btn-secondary px-4 py-2" title="Leave">
                    <PhoneOff className="w-4 h-4" />
                    <span className="ml-2 hidden sm:inline">Leave</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
