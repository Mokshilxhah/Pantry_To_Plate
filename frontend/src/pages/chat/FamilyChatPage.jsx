import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import chatService from '../../services/chatService';
import { 
  Send, 
  MessageSquare, 
  RefreshCw, 
  Loader2,
  User,
  Users,
  Check,
  Calendar,
  Grid,
  Plus,
  X,
  BarChart2,
  Paperclip,
  Smile,
  FileText,
  Download,
  File as FileIcon,
  Mic,
  Square,
  Trash2,
  Play,
  Pause
} from 'lucide-react';
import useToastStore from '../../store/toastStore';

export default function FamilyChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [activeTag, setActiveTag] = useState('General'); // 'General' | 'Grocery' | 'Meal idea'
  const [uploading, setUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // { file_url, file_name, file_type }
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const { token, user } = useAuthStore();
  const toast = useToastStore.getState();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Poll creation modal state
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [pollForm, setPollForm] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: ''
  });

  const fetchMessages = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const data = await chatService.getMessages(token);
      setMessages(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync family chat board.');
    } finally {
      setLoading(false);
    }
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (token) {
      fetchMessages(true);
      
      // Auto-poll every 5 seconds for real-time kitchen updates
      const interval = setInterval(() => {
        fetchMessages(false);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }

    setUploading(true);
    try {
      const data = await chatService.uploadFile(token, file);
      setAttachedFile(data);
      toast.success(`Attached: ${file.name}`);
    } catch (err) {
      console.error(err);
      toast.error('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Stop microphone
        stream.getTracks().forEach(track => track.stop());

        setUploading(true);
        try {
          const data = await chatService.uploadFile(token, audioFile);
          
          // Send immediately to the chat workspace
          const payload = {
            text: inputText,
            tag: activeTag,
            message_type: 'audio',
            file_url: data.file_url,
            file_name: data.file_name
          };

          const response = await chatService.sendMessage(token, payload);
          setMessages(prev => [...prev, response]);
          setInputText('');
          toast.success('Voice note sent!');
        } catch (err) {
          console.error(err);
          toast.error('Failed to send voice note.');
        } finally {
          setUploading(false);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      const stream = mediaRecorderRef.current.stream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setRecording(false);
      clearInterval(timerIntervalRef.current);
      toast.info('Recording cancelled.');
    }
  };

  const formatRecordingTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleEmojiClick = (emoji) => {
    setInputText(prev => prev + emoji);
    setEmojiPickerOpen(false);
  };

  const EMOJIS = [
    '😂', '😍', '👍', '🤔', '👏', '✨', '🔥', '❤️', 
    '🍕', '🍔', '🍟', '🥪', '🥞', '🥛', '🥚', '🥗', 
    '🍎', '🍌', '☕', '🍜', '🍰', '🥬', '🥕', '🍦'
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const originalText = inputText;
    const originalAttachment = attachedFile;

    setInputText('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      const payload = {
        text: originalText,
        tag: activeTag
      };

      if (originalAttachment) {
        payload.message_type = originalAttachment.file_type;
        if (originalAttachment.file_type === 'image') {
          payload.image_url = originalAttachment.file_url;
        } else {
          payload.file_url = originalAttachment.file_url;
          payload.file_name = originalAttachment.file_name;
        }
      }

      const response = await chatService.sendMessage(token, payload);
      // Append local message list immediately
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
      setInputText(originalText);
      setAttachedFile(originalAttachment);
    }
  };

  // Create Poll Submit
  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!pollForm.question.trim() || !pollForm.option1.trim() || !pollForm.option2.trim()) {
      return toast.error('Please fill in a question and at least 2 options.');
    }

    try {
      const response = await chatService.sendMessage(token, {
        message_type: 'poll',
        poll_question: pollForm.question.trim(),
        poll_options: [
          pollForm.option1.trim(),
          pollForm.option2.trim(),
          pollForm.option3.trim(),
          pollForm.option4.trim()
        ].filter(Boolean),
        text: pollForm.question.trim()
      });
      setMessages(prev => [...prev, response]);
      setPollModalOpen(false);
      setPollForm({ question: '', option1: '', option2: '', option3: '', option4: '' });
      toast.success('Poll launched to kitchen workspace!');
    } catch (err) {
      console.error(err);
    }
  };

  // Register Poll Vote
  const handleVote = async (messageId, optionIndex) => {
    try {
      const updatedMsg = await chatService.votePoll(token, messageId, optionIndex);
      setMessages(prev => prev.map(m => m.id === messageId ? updatedMsg : m));
      toast.success('Vote registered!');
    } catch (err) {
      console.error(err);
    }
  };

  // Tag helper styles
  const getTagBadgeStyle = (tag) => {
    switch (tag) {
      case 'Grocery':
        return 'bg-green-50/60 text-green-600 border border-green-100';
      case 'Meal idea':
        return 'bg-orange-50/60 text-orange-600 border border-orange-100';
      case 'General':
      default:
        return 'bg-slate-100 text-slate-500 border border-slate-200/50';
    }
  };

  // Timestamp formatting
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) {
    return (
      <DashboardLayout title="Family Kitchen Chat" subtitle="Coordinate meal preferences and real-time family updates">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            <p className="text-sm text-gray-500 font-semibold">Opening message board...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Family Kitchen Chat" subtitle="Coordinate meal preferences and real-time family updates">
      {/* Container spacing - pt-10 to prevent sticking to top screen */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 flex flex-col h-[calc(100vh-120px)] justify-between gap-4">
        
        {/* CHAT HEADER INFO */}
        <div className="clean-card-dark p-4 flex items-center justify-between shrink-0 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-emerald-300 border border-white/15">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Family Kitchen Chat</h3>
              <p className="text-[10px] text-stone-400 font-bold mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Active kitchen workspace thread
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Create Poll action (available for both admins and members) */}
            <button 
              onClick={() => setPollModalOpen(true)}
              className="py-2 px-4 bg-orange-500 hover:bg-orange-600 border border-orange-400/20 text-white rounded-xl text-xs font-bold transition-all shadow hover:shadow-md cursor-pointer flex items-center gap-1"
            >
              <BarChart2 className="w-4 h-4" /> Create Poll
            </button>

            <button 
              onClick={() => fetchMessages(false)}
              className="p-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-stone-400 transition-all cursor-pointer"
              title="Force reload thread"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MESSAGE HISTORY CONTAINER (Feed) */}
        <div className="flex-1 overflow-y-auto clean-card-green-inner border-none rounded-3xl p-5 space-y-4 min-h-[400px]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center text-emerald-950 border border-white/20 mb-4 shadow-sm">
                <MessageSquare className="w-6.5 h-6.5" />
              </div>
              <h3 className="text-xs font-extrabold text-emerald-950">No messages in workspace yet</h3>
              <p className="text-[10px] text-emerald-800/60 mt-1 max-w-[280px]">
                Start the conversation by typing below! Coordinate shopping lists, dietary notes, or dinner suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isMe = msg.userId === user?.id;
                const senderName = msg.user?.fullName || msg.sender_name || 'Family Member';
                const senderRole = msg.user?.role || 'member';

                const isPoll = msg.message_type === 'poll';
                const totalVotes = isPoll ? (msg.poll_options || []).reduce((acc, o) => acc + (parseInt(o.votes) || 0), 0) : 0;

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}
                  >
                    {/* Sender label with custom badges (only for other users) */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1 ml-1 select-none">
                        <span className="text-[10px] font-bold text-slate-700">{senderName}</span>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          senderRole === 'admin' 
                            ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/10' 
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {senderRole}
                        </span>
                      </div>
                    )}

                    {/* Chat Bubble card */}
                    {isPoll ? (
                      /* POLL CARD WRAPPER */
                      <div 
                        className={`p-4 rounded-2xl w-full max-w-[85%] sm:max-w-[70%] shadow-sm border ${
                          isMe 
                            ? 'bg-slate-800 text-white border-white/5 rounded-tr-none' 
                            : senderRole === 'admin'
                              ? 'bg-orange-50/90 border-2 border-orange-200 text-slate-800 rounded-tl-none shadow-orange-500/5'
                              : 'bg-white/95 border border-slate-200/60 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        <div className="space-y-3">
                          <span className="inline-block text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500 text-white select-none">
                            📊 FAMILY POLL
                          </span>
                          <h5 className="text-xs font-black leading-tight">
                            {msg.poll_question}
                          </h5>

                          {/* Poll Options Grid */}
                          <div className="space-y-3.5 mt-2">
                            {(msg.poll_options || []).map((opt, idx) => {
                              const votes = parseInt(opt.votes) || 0;
                              const isMyVote = opt.voters?.some(v => v.id === user?.id) || false;
                              const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

                              return (
                                <div key={idx} className="space-y-1">
                                  <button
                                    onClick={() => handleVote(msg.id, idx)}
                                    className={`w-full py-2 px-3.5 border rounded-xl text-left text-xs font-bold transition-all cursor-pointer flex justify-between items-center ${
                                      isMyVote 
                                        ? 'bg-orange-500/10 border-orange-500 text-orange-600' 
                                        : isMe 
                                          ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' 
                                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                                    }`}
                                  >
                                    <span>{opt.text}</span>
                                    <span className={`text-[10px] ${isMyVote ? 'text-orange-500 font-extrabold' : 'opacity-60'}`}>
                                      {votes} {votes === 1 ? 'vote' : 'votes'} ({percentage}%)
                                    </span>
                                  </button>

                                  {/* Progress bar */}
                                  <div className="w-full h-1 bg-slate-100/50 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${isMyVote ? 'bg-orange-500' : 'bg-slate-400'}`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>

                                  {/* Voters list */}
                                  {opt.voters && opt.voters.length > 0 && (
                                    <div className={`px-2 pb-0.5 text-[8.5px] font-bold ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>
                                      👥 {opt.voters.map(v => v.fullName).join(', ')}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className={`text-[8px] mt-1 font-bold ${isMe ? 'text-slate-400' : 'text-slate-450'}`}>
                            Total: {totalVotes} votes • {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD TEXT MESSAGE / IMAGE / FILE */
                      <div 
                        className={`p-3.5 rounded-2xl max-w-[80%] shadow-sm space-y-2 ${
                          isMe 
                            ? 'bg-slate-800 text-white rounded-tr-none' 
                            : senderRole === 'admin'
                              ? 'bg-orange-50/90 border-2 border-orange-200 text-slate-800 rounded-tl-none shadow-orange-500/5'
                              : 'bg-white/95 border border-slate-200/60 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {/* Message tag badge */}
                        {msg.tag && (
                          <span className={`inline-block text-[8px] font-extrabold px-2 py-0.5 rounded-full select-none ${getTagBadgeStyle(msg.tag)}`}>
                            #{msg.tag}
                          </span>
                        )}

                        {/* Image Preview */}
                        {(msg.message_type === 'image' || msg.image_url) && (
                          <div className="rounded-xl overflow-hidden max-w-full max-h-[220px] border border-slate-200/20">
                            <img 
                              src={msg.image_url.startsWith('http') ? msg.image_url : `http://localhost:8000${msg.image_url}`} 
                              alt="Uploaded photo" 
                              className="object-cover w-full h-full cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => window.open(msg.image_url.startsWith('http') ? msg.image_url : `http://localhost:8000${msg.image_url}`, '_blank')}
                            />
                          </div>
                        )}

                        {/* File Card for documents/PDF */}
                        {(msg.message_type === 'file' || msg.file_url) && (
                          <div className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${isMe ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                {msg.file_name?.toLowerCase().endsWith('.pdf') ? <FileText className="w-4.5 h-4.5" /> : <FileIcon className="w-4.5 h-4.5" />}
                              </div>
                              <div className="min-w-0">
                                <p className={`text-[11px] font-bold truncate ${isMe ? 'text-white' : 'text-slate-700'}`}>
                                  {msg.file_name || 'Document File'}
                                </p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                                  {msg.file_name?.toLowerCase().endsWith('.pdf') ? 'PDF Document' : 'Attachment File'}
                                </p>
                              </div>
                            </div>
                            <a 
                              href={msg.file_url.startsWith('http') ? msg.file_url : `http://localhost:8000${msg.file_url}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="p-1.5 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-655 transition-colors cursor-pointer shrink-0"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        )}

                        {/* Audio Player for Voice Notes */}
                        {(msg.message_type === 'audio' || msg.file_name?.toLowerCase().endsWith('.webm')) && (
                          <div className={`p-2 rounded-xl border ${isMe ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} w-full max-w-[280px]`}>
                            <p className={`text-[9px] font-bold mb-1.5 uppercase tracking-wider ${isMe ? 'text-slate-450' : 'text-slate-500'}`}>
                              🎙️ Voice Note
                            </p>
                            <audio 
                              controls 
                              src={msg.file_url.startsWith('http') ? msg.file_url : `http://localhost:8000${msg.file_url}`} 
                              className="w-full h-8 outline-none text-xs rounded-lg"
                            />
                          </div>
                        )}

                        {msg.text && (
                          <p className="text-xs leading-relaxed break-words">{msg.text}</p>
                        )}
                        
                        <div className={`text-[9px] font-bold ${isMe ? 'text-slate-400 text-right' : 'text-slate-450'}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ACTION INPUT FOOTER */}
        <div className="clean-card-base p-4 shadow-sm shrink-0 relative">
          
          {/* File Attachment Preview */}
          {attachedFile && (
            <div className="mb-3 p-2 bg-stone-100/60 rounded-xl border border-stone-200/50 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                  {attachedFile.file_type === 'image' ? (
                    <img 
                      src={`http://localhost:8000${attachedFile.file_url}`} 
                      alt="Attachment Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : attachedFile.file_name.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="w-4.5 h-4.5" />
                  ) : (
                    <FileIcon className="w-4.5 h-4.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-700 truncate">{attachedFile.file_name}</p>
                  <p className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider">
                    {attachedFile.file_type === 'image' ? 'Image Ready' : 'Document Ready'}
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={removeAttachment}
                className="p-1 hover:bg-stone-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Emoji Picker Popover */}
          {emojiPickerOpen && (
            <div className="absolute bottom-16 left-4 z-40 bg-white rounded-2xl p-3 border border-slate-200 shadow-xl w-60 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select Emoji</span>
                <button 
                  type="button" 
                  onClick={() => setEmojiPickerOpen(false)}
                  className="text-slate-400 hover:text-slate-655 text-[9px] font-bold"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-7 h-7 flex items-center justify-center text-sm rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            className="hidden" 
          />

          {/* Form input field / Recording layout */}
          {recording ? (
            <div className="flex items-center justify-between bg-orange-500/10 border border-orange-200/50 rounded-xl px-4 py-2.5 animate-pulse">
              <div className="flex items-center gap-2 text-orange-600 font-extrabold text-xs">
                <span className="w-2 h-2 bg-orange-600 rounded-full animate-ping" />
                <span>🎙️ RECORDING VOICE NOTE ({formatRecordingTime(recordingTime)})</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Discard button */}
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                  title="Discard recording"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
                {/* Stop & upload button */}
                <button
                  type="button"
                  onClick={stopRecording}
                  className="py-1.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg text-2xs transition-all shadow cursor-pointer flex items-center gap-1.5"
                  title="Finish and attach voice note"
                >
                  <Square className="w-3.5 h-3.5 fill-white" /> Stop & Upload
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
              
              {/* Attachment Button */}
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Attach photo or PDF document"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                ) : (
                  <Paperclip className="w-4 h-4" />
                )}
              </button>

              {/* Emoji Picker Button */}
              <button
                type="button"
                disabled={uploading}
                onClick={() => setEmojiPickerOpen(prev => !prev)}
                className={`p-2.5 border rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 ${emojiPickerOpen ? 'bg-orange-500/10 border-orange-300 text-orange-500' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'}`}
                title="Add Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Voice Record Button */}
              <button
                type="button"
                disabled={uploading}
                onClick={startRecording}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                title="Record voice note"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={uploading ? "Uploading attachment..." : "Message your family kitchen workspace..."}
                disabled={uploading}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-350 focus:bg-white transition-all shadow-inner"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={uploading || (!inputText.trim() && !attachedFile)}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all cursor-pointer shadow flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>

            </form>
          )}

        </div>

      </div>

      {/* CREATE POLL MODAL */}
      {pollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col shadow-xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                <BarChart2 className="w-5 h-5 text-orange-500" /> Launch Family Poll
              </h3>
              <button 
                onClick={() => setPollModalOpen(false)}
                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-405 hover:text-slate-655 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll}>
              <div className="p-5 space-y-4">
                {/* Question */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Poll Question</label>
                  <input 
                    type="text" 
                    placeholder="e.g. What should we cook for dinner?"
                    value={pollForm.question}
                    onChange={e => setPollForm(prev => ({ ...prev, question: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-all bg-white"
                    required
                  />
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Options</label>
                  
                  <input 
                    type="text" 
                    placeholder="Option 1 (Required)"
                    value={pollForm.option1}
                    onChange={e => setPollForm(prev => ({ ...prev, option1: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-all bg-white"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Option 2 (Required)"
                    value={pollForm.option2}
                    onChange={e => setPollForm(prev => ({ ...prev, option2: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-all bg-white"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="Option 3 (Optional)"
                    value={pollForm.option3}
                    onChange={e => setPollForm(prev => ({ ...prev, option3: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-all bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder="Option 4 (Optional)"
                    value={pollForm.option4}
                    onChange={e => setPollForm(prev => ({ ...prev, option4: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setPollModalOpen(false)}
                  className="px-4 py-2 border border-slate-250 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
                >
                  Launch Poll
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
