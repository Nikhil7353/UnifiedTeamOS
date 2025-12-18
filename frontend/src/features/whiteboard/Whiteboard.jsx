import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Users,
  Palette,
  Minus,
  Plus,
  MousePointer2,
  Lock,
} from 'lucide-react';

import { addStroke, createBoard, listBoards, listStrokes } from '../../services/whiteboardService';

const COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#f59e0b', '#ef4444', '#0ea5e9', '#ffffff', '#111827'];

export default function Whiteboard({ currentUser }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const historyRef = useRef([]);

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);

  const [history, setHistory] = useState([]);
  const [redo, setRedo] = useState([]);

  const [boardId, setBoardId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  const collaborators = useMemo(
    () => [
      { id: 1, name: currentUser?.username || 'You', initials: (currentUser?.username || 'Y').slice(0, 1).toUpperCase(), role: 'owner' },
      { id: 2, name: 'Nikhil', initials: 'N', role: 'member' },
      { id: 3, name: 'Asha', initials: 'A', role: 'member' },
    ],
    [currentUser]
  );

  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches?.[0]?.clientX ?? e.clientX;
    const clientY = e.touches?.[0]?.clientY ?? e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const ensureCanvasSize = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ratio = window.devicePixelRatio || 1;
    const w = Math.floor(wrapper.clientWidth);
    const h = Math.floor(wrapper.clientHeight);

    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    redrawFromHistory();
  };

  const redrawFromHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dots grid
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#111827';
    const step = 24;
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Draw strokes
    for (const stroke of history) {
      if (stroke.type !== 'path') continue;
      const { points, color: c, size: s, composite } = stroke;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = c;
      ctx.lineWidth = s;
      ctx.globalCompositeOperation = composite;
      ctx.beginPath();
      points.forEach((p, idx) => {
        if (idx === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.restore();
    }
  };

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    ensureCanvasSize();
    window.addEventListener('resize', ensureCanvasSize);
    return () => window.removeEventListener('resize', ensureCanvasSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    (async () => {
      setError('');
      try {
        const boards = await listBoards();
        let b = (boards || [])[0];
        if (!b) {
          b = await createBoard({ title: 'Whiteboard' });
        }
        setBoardId(b.id);

        const strokes = await listStrokes(b.id);
        const mapped = (strokes || []).map((s) => {
          try {
            const payload = JSON.parse(s.stroke_data);
            return { ...payload, id: s.id };
          } catch {
            return null;
          }
        }).filter(Boolean);
        setHistory(mapped);
        setRedo([]);
        setTimeout(redrawFromHistory, 0);
      } catch (e) {
        setError('Failed to load whiteboard.');
        // eslint-disable-next-line no-console
        console.error('Failed to init whiteboard', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const begin = (e) => {
    e.preventDefault();
    const pt = getCanvasPoint(e);
    setIsDrawing(true);

    const composite = tool === 'eraser' ? 'destination-out' : 'source-over';
    const stroke = {
      id: Date.now(),
      type: 'path',
      tool,
      color: tool === 'eraser' ? '#000000' : color,
      size: tool === 'eraser' ? Math.max(size * 2, 10) : size,
      composite,
      points: [pt],
    };

    setHistory((prev) => [...prev, stroke]);
    setRedo([]);
  };

  const move = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pt = getCanvasPoint(e);

    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const updated = { ...last, points: [...last.points, pt] };
      const next = [...prev.slice(0, -1), updated];
      return next;
    });

    // Incremental draw for responsiveness
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const lastStroke = history[history.length - 1];
    const current = lastStroke || null;
    // We redraw from history on end; keep incremental simple.
    if (!current) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = current.color;
    ctx.lineWidth = current.size;
    ctx.globalCompositeOperation = current.composite;
    const pts = current.points;
    const a = pts[pts.length - 1];
    const b = pt;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.restore();
  };

  const end = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    redrawFromHistory();

    const id = boardId;
    if (!id) return;
    const currentHistory = historyRef.current || [];
    const stroke = currentHistory[currentHistory.length - 1];
    if (!stroke) return;

    setIsSyncing(true);
    setError('');
    addStroke(id, { stroke_data: JSON.stringify(stroke) })
      .catch((err) => {
        setError('Failed to save stroke.');
        // eslint-disable-next-line no-console
        console.error('Failed to save stroke', err);
      })
      .finally(() => setIsSyncing(false));
  };

  const doUndo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRedo((r) => [last, ...r]);
      const next = prev.slice(0, -1);
      return next;
    });
    setTimeout(redrawFromHistory, 0);
  };

  const doRedo = () => {
    setRedo((prev) => {
      if (prev.length === 0) return prev;
      const first = prev[0];
      setHistory((h) => [...h, first]);
      const next = prev.slice(1);
      setTimeout(redrawFromHistory, 0);
      return next;
    });
  };

  const clear = () => {
    if (!confirm('Clear the whiteboard?')) return;
    setHistory([]);
    setRedo([]);
    setTimeout(redrawFromHistory, 0);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Sidebar */}
      <div className="w-80 shrink-0 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold text-secondary-900 dark:text-white">Whiteboard</div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">
                {isSyncing ? 'Saving…' : boardId ? `Board #${boardId}` : 'Loading…'}
              </div>
            </div>
            <button className="btn btn-secondary px-3 py-2" title="Private (soon)">
              <Lock className="w-4 h-4" />
            </button>
          </div>

          {error && (
            <div className="mt-3 text-sm text-danger-700 bg-danger-50 border border-danger-200 rounded-xl p-3">{error}</div>
          )}

          <div className="mt-4">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
              Tools
            </div>
            <div className="grid grid-cols-3 gap-2">
              <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer2} label="Select" />
              <ToolButton active={tool === 'pen'} onClick={() => setTool('pen')} icon={Pencil} label="Pen" />
              <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={Eraser} label="Eraser" />
              <ToolButton active={tool === 'rect'} onClick={() => setTool('rect')} icon={Square} label="Rect" soon />
              <ToolButton active={tool === 'circle'} onClick={() => setTool('circle')} icon={Circle} label="Circle" soon />
              <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={Type} label="Text" soon />
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                Stroke
              </div>
              <div className="text-xs text-secondary-500 dark:text-secondary-400">{size}px</div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <button className="btn btn-secondary px-3 py-2" onClick={() => setSize((v) => Math.max(1, v - 1))}>
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="range"
                min={1}
                max={18}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
                className="flex-1"
              />
              <button className="btn btn-secondary px-3 py-2" onClick={() => setSize((v) => Math.min(18, v + 1))}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-5">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2 inline-flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Color
            </div>
            <div className="grid grid-cols-8 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-lg border ${
                    color === c ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-secondary-200 dark:border-secondary-700'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
              Actions
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-secondary px-4 py-2" onClick={doUndo} disabled={history.length === 0}>
                <Undo2 className="w-4 h-4 mr-2" />
                Undo
              </button>
              <button className="btn btn-secondary px-4 py-2" onClick={doRedo} disabled={redo.length === 0}>
                <Redo2 className="w-4 h-4 mr-2" />
                Redo
              </button>
              <button className="btn btn-secondary px-4 py-2" onClick={exportPng}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="btn btn-secondary px-4 py-2" onClick={clear}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2 inline-flex items-center gap-2">
            <Users className="w-4 h-4" />
            Collaborators
          </div>
          <div className="space-y-2">
            {collaborators.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-700/40">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center font-semibold">
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-secondary-900 dark:text-white truncate">{c.name}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400">{c.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-secondary-500 dark:text-secondary-400">
            Realtime cursors, shapes, and multiplayer sync will be added with backend later.
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary-600 dark:text-secondary-300">
              Tool: <span className="font-semibold text-secondary-900 dark:text-white">{tool}</span>
            </div>
            <div className="text-xs text-secondary-500 dark:text-secondary-400">
              Tip: draw with mouse/touch (pen + eraser supported)
            </div>
          </div>
        </div>

        <div ref={wrapperRef} className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 touch-none"
            onMouseDown={begin}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={begin}
            onTouchMove={move}
            onTouchEnd={end}
          />
        </div>
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, label, soon }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border text-left transition-colors ${
        active
          ? 'border-primary-300 bg-primary-50/60 dark:border-primary-700 dark:bg-primary-900/10'
          : 'border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700'
      }`}
      disabled={soon}
      title={soon ? 'Coming soon' : label}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-secondary-600 dark:text-secondary-200" />
          <span className="text-sm font-medium text-secondary-900 dark:text-white">{label}</span>
        </div>
        {soon && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-200">Soon</span>}
      </div>
    </button>
  );
}
