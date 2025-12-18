import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Users,
  Clock,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  MessageSquare,
  Send,
  MoreVertical,
  Star,
  Trash2,
  Download,
  Share2,
} from 'lucide-react';

import {
  addDocumentComment,
  createDocument,
  deleteDocument as deleteDocumentApi,
  listDocumentComments,
  listDocuments,
  updateDocument,
} from '../../services/docsService';

export default function SharedDocuments({ currentUser }) {
  const [activeDocId, setActiveDocId] = useState(1);
  const [query, setQuery] = useState('');
  const [showComments, setShowComments] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [docs, setDocs] = useState([]);
  const [comments, setComments] = useState([]);

  const activeDoc = useMemo(() => docs.find((d) => d.id === activeDocId) || docs[0], [docs, activeDocId]);

  const formatUpdatedAt = (doc) => {
    const raw = doc?.updated_at || doc?.updatedAt;
    if (!raw) return '—';
    const dt = new Date(raw);
    if (Number.isNaN(dt.getTime())) return String(raw);
    return dt.toLocaleString();
  };

  const loadDocs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listDocuments();
      const withUi = (data || []).map((d) => ({
        ...d,
        starred: false,
        collaborators: [{ id: currentUser?.id || 0, name: currentUser?.username || 'You', initials: (currentUser?.username || 'Y').slice(0, 1).toUpperCase() }],
      }));
      setDocs(withUi);
      if (withUi.length > 0) {
        setActiveDocId((prev) => (withUi.some((x) => x.id === prev) ? prev : withUi[0].id));
      } else {
        setActiveDocId(0);
      }
    } catch (e) {
      setError('Failed to load documents.');
      // eslint-disable-next-line no-console
      console.error('Failed to load documents', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async (docId) => {
    if (!docId) {
      setComments([]);
      return;
    }
    try {
      const data = await listDocumentComments(docId);
      const mapped = (data || []).map((c) => ({
        id: c.id,
        author: c.author_id === currentUser?.id ? (currentUser?.username || 'You') : `User #${c.author_id}`,
        initials: (c.author_id === currentUser?.id ? (currentUser?.username || 'Y') : 'U').slice(0, 1).toUpperCase(),
        text: c.body,
        time: c.created_at ? new Date(c.created_at).toLocaleString() : '—',
      }));
      setComments(mapped);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load comments', e);
    }
  };

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeDocId) loadComments(activeDocId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDocId]);

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return docs;
    return docs.filter((d) => d.title.toLowerCase().includes(q));
  }, [docs, query]);

  const updateActiveDocLocal = (patch) => {
    setDocs((prev) => prev.map((d) => (d.id === activeDoc?.id ? { ...d, ...patch } : d)));
  };

  const toggleStar = (id) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, starred: !d.starred } : d)));
  };

  const createDoc = () => {
    const title = prompt('Document title');
    if (!title) return;
    (async () => {
      try {
        const created = await createDocument({ title, content: '' });
        await loadDocs();
        setActiveDocId(created.id);
      } catch (e) {
        setError('Failed to create document.');
        // eslint-disable-next-line no-console
        console.error('Failed to create document', e);
      }
    })();
  };

  const deleteDoc = (id) => {
    if (!confirm('Delete this document?')) return;
    (async () => {
      try {
        await deleteDocumentApi(id);
        await loadDocs();
      } catch (e) {
        setError('Failed to delete document.');
        // eslint-disable-next-line no-console
        console.error('Failed to delete document', e);
      }
    })();
  };

  const addComment = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    (async () => {
      try {
        const created = await addDocumentComment(activeDoc.id, { body: trimmed });
        setComments((prev) => [
          ...prev,
          {
            id: created.id,
            author: currentUser?.full_name || currentUser?.username || 'You',
            initials: (currentUser?.username || 'Y').slice(0, 1).toUpperCase(),
            text: created.body,
            time: created.created_at ? new Date(created.created_at).toLocaleString() : 'just now',
          },
        ]);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to add comment', e);
      }
    })();
  };

  return (
    <div className="flex h-full bg-secondary-50 dark:bg-secondary-900">
      {/* Sidebar */}
      <div className="w-80 shrink-0 border-r border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 flex flex-col">
        <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-secondary-100 dark:bg-secondary-700 flex items-center justify-center text-secondary-700 dark:text-secondary-200">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-secondary-900 dark:text-white">Docs</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Shared documents</div>
              </div>
            </div>
            <button onClick={createDoc} className="btn btn-primary px-3 py-2">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading && (
            <div className="p-4 text-sm text-secondary-500 dark:text-secondary-400">Loading documents…</div>
          )}
          {error && (
            <div className="p-4 text-sm text-danger-700 bg-danger-50 border-b border-danger-200">{error}</div>
          )}
          {filteredDocs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setActiveDocId(doc.id)}
              className={`w-full text-left px-4 py-3 border-b border-secondary-100 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors ${
                doc.id === activeDocId ? 'bg-secondary-50 dark:bg-secondary-700' : 'bg-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-secondary-900 dark:text-white truncate">{doc.title}</div>
                    {doc.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatUpdatedAt(doc)}</span>
                    <span className="text-secondary-300 dark:text-secondary-600">•</span>
                    <Users className="w-3.5 h-3.5" />
                    <span>{doc.collaborators?.length || 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(doc.id);
                    }}
                    className="p-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600 text-secondary-500 dark:text-secondary-300"
                    title="Star"
                  >
                    <Star className={`w-4 h-4 ${doc.starred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDoc(doc.id);
                    }}
                    className="p-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-600 text-secondary-500 dark:text-secondary-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xl font-bold text-secondary-900 dark:text-white truncate">{activeDoc?.title || 'No document selected'}</div>
              <div className="mt-1 flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
                <Clock className="w-4 h-4" />
                <span>Updated {formatUpdatedAt(activeDoc) || '—'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {(activeDoc?.collaborators || []).slice(0, 4).map((c) => (
                  <div
                    key={c.id}
                    className="w-9 h-9 rounded-full border-2 border-white dark:border-secondary-800 bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center text-xs font-semibold"
                    title={c.name}
                  >
                    {c.initials}
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary px-3 py-2" title="Share">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary px-3 py-2" title="Download">
                <Download className="w-4 h-4" />
              </button>
              <button
                className={`btn px-3 py-2 ${showComments ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setShowComments((v) => !v)}
                title="Comments"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary px-3 py-2" title="More">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-1">
            <button className="px-2 py-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200" title="Bold">
              <Bold className="w-4 h-4" />
            </button>
            <button className="px-2 py-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200" title="Italic">
              <Italic className="w-4 h-4" />
            </button>
            <button className="px-2 py-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200" title="Underline">
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-secondary-200 dark:bg-secondary-700 mx-2" />
            <button className="px-2 py-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200" title="Bullets">
              <List className="w-4 h-4" />
            </button>
            <button className="px-2 py-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200" title="Numbered">
              <ListOrdered className="w-4 h-4" />
            </button>
            <button className="px-2 py-1 rounded hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-200" title="Link">
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className={`flex-1 min-w-0 p-5 overflow-auto ${showComments ? 'border-r border-secondary-200 dark:border-secondary-700' : ''}`}>
            <textarea
              value={activeDoc?.content || ''}
              onChange={(e) => updateActiveDocLocal({ content: e.target.value })}
              onBlur={() => {
                if (!activeDoc?.id) return;
                updateDocument(activeDoc.id, { content: activeDoc.content }).catch(() => {});
              }}
              className="w-full h-full min-h-[520px] resize-none rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white p-4 font-mono text-sm"
              placeholder="Start writing..."
            />
          </div>

          {showComments && (
            <div className="w-96 shrink-0 bg-white dark:bg-secondary-800 flex flex-col">
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
                <div className="font-semibold text-secondary-900 dark:text-white">Comments</div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">Mocked – backend later</div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-3">
                {(comments || []).length === 0 ? (
                  <div className="text-sm text-secondary-500 dark:text-secondary-400">
                    No comments yet. Add one to start collaboration.
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-secondary-50 dark:bg-secondary-700">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white flex items-center justify-center text-xs font-semibold">
                          {c.initials}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-secondary-900 dark:text-white">{c.author}</div>
                          <div className="text-xs text-secondary-500 dark:text-secondary-400">{c.time}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-secondary-700 dark:text-secondary-200 whitespace-pre-wrap">{c.text}</div>
                    </div>
                  ))
                )}
              </div>

              <CommentComposer onSend={addComment} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentComposer({ onSend }) {
  const [text, setText] = useState('');

  return (
    <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
      <div className="flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
        />
        <button
          onClick={() => {
            onSend(text);
            setText('');
          }}
          className="btn btn-primary px-3 py-2"
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
