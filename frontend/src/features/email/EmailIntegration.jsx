import React, { useEffect, useMemo, useState } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Archive, 
  Trash2, 
  Search, 
  Filter,
  Paperclip,
  Reply,
  ReplyAll,
  Forward,
  Clock,
  User,
  Tag,
  MoreVertical,
  Edit3,
  Check,
  X,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink
} from 'lucide-react';

import {
  createEmailAccount,
  listEmailAccounts,
  listEmailThreads,
  listThreadMessages,
  sendEmail,
  syncEmailAccount,
  testEmailAccount,
} from '../../services/emailService';

export default function EmailIntegration() {
  const [activeView, setActiveView] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [isComposing, setIsComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [accounts, setAccounts] = useState([]);
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [threads, setThreads] = useState([]);
  const [threadMessages, setThreadMessages] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const connectAccount = () => {
    const email_address = prompt('Email address (e.g. you@gmail.com)');
    if (!email_address) return;
    const imap_host = prompt('IMAP host (e.g. imap.gmail.com)');
    if (!imap_host) return;
    const imap_username = prompt('IMAP username');
    if (!imap_username) return;
    const imap_password = prompt('IMAP password / app password');
    if (!imap_password) return;
    const smtp_host = prompt('SMTP host (e.g. smtp.gmail.com)');
    if (!smtp_host) return;
    const smtp_username = prompt('SMTP username');
    if (!smtp_username) return;
    const smtp_password = prompt('SMTP password / app password');
    if (!smtp_password) return;

    (async () => {
      setIsLoading(true);
      setError('');
      try {
        const created = await createEmailAccount({
          provider: 'imap_smtp',
          display_name: email_address,
          email_address,
          imap_host,
          imap_port: 993,
          imap_username,
          imap_password,
          smtp_host,
          smtp_port: 587,
          smtp_username,
          smtp_password,
          smtp_use_tls: true,
          from_email: email_address,
        });
        await loadAccounts();
        setActiveAccountId(created.id);
      } catch (e) {
        setError('Failed to connect account.');
        // eslint-disable-next-line no-console
        console.error('Failed to connect account', e);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const testAccount = () => {
    if (!activeAccountId) return;
    (async () => {
      setIsLoading(true);
      setError('');
      try {
        await testEmailAccount(activeAccountId);
      } catch (e) {
        setError('Account test failed.');
        // eslint-disable-next-line no-console
        console.error('Account test failed', e);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const syncAccount = () => {
    if (!activeAccountId) return;
    (async () => {
      setIsLoading(true);
      setError('');
      try {
        await syncEmailAccount(activeAccountId, 25);
        await loadThreads(activeAccountId);
      } catch (e) {
        setError('Sync failed.');
        // eslint-disable-next-line no-console
        console.error('Sync failed', e);
      } finally {
        setIsLoading(false);
      }
    })();
  };

  const loadAccounts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listEmailAccounts();
      setAccounts(data || []);
      if ((data || []).length > 0) {
        setActiveAccountId((prev) => prev || data[0].id);
      } else {
        setActiveAccountId(null);
      }
    } catch (e) {
      setError('Failed to load email accounts.');
      // eslint-disable-next-line no-console
      console.error('Failed to load email accounts', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadThreads = async (accountId) => {
    if (!accountId) {
      setThreads([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await listEmailThreads(accountId);
      setThreads(data || []);
    } catch (e) {
      setError('Failed to load inbox.');
      // eslint-disable-next-line no-console
      console.error('Failed to load threads', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (threadId) => {
    if (!threadId) {
      setThreadMessages([]);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await listThreadMessages(threadId);
      setThreadMessages(data || []);
    } catch (e) {
      setError('Failed to load message.');
      // eslint-disable-next-line no-console
      console.error('Failed to load thread messages', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (activeAccountId) loadThreads(activeAccountId);
  }, [activeAccountId]);

  useEffect(() => {
    if (selectedThreadId) loadMessages(selectedThreadId);
  }, [selectedThreadId]);

  const inboxItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = (threads || []).map((t) => ({
      id: t.id,
      from: t.last_from || '',
      fromName: (t.last_from || '').split('<')[0].trim() || t.last_from || 'Sender',
      subject: t.subject || '(no subject)',
      preview: t.snippet || '',
      content: t.snippet || '',
      timestamp: t.updated_at ? new Date(t.updated_at).toLocaleString() : '',
      isRead: true,
      isStarred: false,
      hasAttachment: false,
      labels: [],
      threadId: t.id,
    }));
    if (!q) return list;
    return list.filter((x) => (x.subject + ' ' + x.from + ' ' + x.preview).toLowerCase().includes(q));
  }, [threads, searchQuery]);

  const folders = [
    { id: 'inbox', name: 'Inbox', icon: Inbox, count: 3, unread: 1 },
    { id: 'sent', name: 'Sent', icon: Send, count: 1, unread: 0 },
    { id: 'drafts', name: 'Drafts', icon: Edit3, count: 1, unread: 0 },
    { id: 'starred', name: 'Starred', icon: Star, count: 1, unread: 0 },
    { id: 'archive', name: 'Archive', icon: Archive, count: 0, unread: 0 },
    { id: 'trash', name: 'Trash', icon: Trash2, count: 0, unread: 0 }
  ];

  const labels = [
    { id: 'important', name: 'Important', color: 'red' },
    { id: 'planning', name: 'Planning', color: 'blue' },
    { id: 'client', name: 'Client', color: 'green' },
    { id: 'project', name: 'Project', color: 'purple' },
    { id: 'newsletter', name: 'Newsletter', color: 'yellow' }
  ];

  const renderEmailList = () => {
    const currentEmails = activeView === 'inbox' ? inboxItems : [];
    
    return (
      <div className="flex-1 overflow-auto">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading && (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading…</div>
          )}
          {error && (
            <div className="p-4 text-sm text-red-600">{error}</div>
          )}
          {currentEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => {
                setSelectedThreadId(email.threadId);
                setSelectedEmail(email);
              }}
              className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                !email.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {email.fromName ? email.fromName.charAt(0).toUpperCase() : 'D'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-sm ${
                      !email.isRead 
                        ? 'font-semibold text-gray-900 dark:text-white' 
                        : 'font-medium text-gray-700 dark:text-gray-300'
                    }`}>
                      {email.fromName || `To: ${email.to}`}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{email.timestamp}</span>
                  </div>
                  <p className={`text-sm mb-1 ${
                    !email.isRead 
                      ? 'font-semibold text-gray-900 dark:text-white' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {email.subject}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{email.preview}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {email.hasAttachment && (
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Paperclip className="w-3 h-3 mr-1" />
                        <span className="text-xs">Attachment</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-yellow-500">
                    <Star className={`w-4 h-4 ${email.isStarred ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEmailContent = () => {
    if (!selectedEmail) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Select an email to read</p>
          </div>
        </div>
      );
    }

    const bodyText = (threadMessages || [])
      .map((m) => m.body_preview)
      .filter(Boolean)
      .join('\n\n');

    return (
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedEmail.subject}
            </h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Reply className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <ReplyAll className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Forward className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <Archive className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedEmail.fromName ? selectedEmail.fromName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedEmail.fromName || `To: ${selectedEmail.to}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedEmail.from || 'Draft'} • {selectedEmail.timestamp}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {bodyText || selectedEmail.content}
            </p>
          </div>

          {selectedEmail.hasAttachment && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Paperclip className="w-4 h-4" />
                <span>2 Attachments</span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">meeting_notes.pdf</span>
                  </div>
                  <button className="text-blue-500 hover:text-blue-600 text-sm">
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsComposing(true)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Reply className="w-4 h-4 mr-2" />
              Reply
            </button>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors flex items-center justify-center">
              <Forward className="w-4 h-4 mr-2" />
              Forward
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderComposeEmail = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">New Message</h3>
          <button 
            onClick={() => setIsComposing(false)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="To"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <textarea
                placeholder="Compose your message..."
                rows={10}
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsComposing(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center disabled:opacity-50"
              disabled={!activeAccountId || !composeTo.trim()}
              onClick={() => {
                if (!activeAccountId) return;
                (async () => {
                  setIsLoading(true);
                  setError('');
                  try {
                    await sendEmail(activeAccountId, {
                      to_email: composeTo,
                      subject: composeSubject,
                      body: composeBody,
                      is_html: false,
                    });
                    setIsComposing(false);
                    setComposeTo('');
                    setComposeSubject('');
                    setComposeBody('');
                  } catch (e) {
                    setError('Failed to send email.');
                    // eslint-disable-next-line no-console
                    console.error('Failed to send email', e);
                  } finally {
                    setIsLoading(false);
                  }
                })();
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={connectAccount}
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium"
              >
                Connect
              </button>
              <button
                onClick={testAccount}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                title="Test"
                disabled={!activeAccountId}
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={syncAccount}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                title="Sync"
                disabled={!activeAccountId}
              >
                <Clock className="w-4 h-4" />
              </button>
            </div>

            <select
              value={activeAccountId || ''}
              onChange={(e) => setActiveAccountId(e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Select account</option>
              {(accounts || []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.email_address || a.display_name || `Account #${a.id}`}
                </option>
              ))}
            </select>

            <button 
              onClick={() => setIsComposing(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Compose
            </button>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Folders
              </h3>
              <div className="space-y-1">
                {folders.map((folder) => {
                  const Icon = folder.icon;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => setActiveView(folder.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        activeView === folder.id
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{folder.name}</span>
                      </div>
                      {folder.count > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          folder.unread > 0
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {folder.unread > 0 ? folder.unread : folder.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Labels
              </h3>
              <div className="space-y-1">
                {labels.map((label) => (
                  <button
                    key={label.id}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full bg-${label.color}-500`} />
                    <span className="text-sm">{label.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {renderEmailList()}
          {renderEmailContent()}
        </div>
      </div>

      {isComposing && renderComposeEmail()}
    </div>
  );
}
