import { useState, useEffect } from 'react';
import { ref, onValue, remove, update } from 'firebase/database';
import { realtimeDb } from '../../config/firebase';
import GradientLoader from './GradientLoader';
// Icon components as inline SVGs
const EnvelopeIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const PhoneIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const NewsletterIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 0l6.03-3.249m-6.03 3.249v6.375m0-6.375l-8.839 0m8.839 0l-6.03-3.249m0 0L5.25 9V4.236c0-.696.318-1.35.861-1.779l5.889-4.65a2.25 2.25 0 012.502 0l5.889 4.65c.543.43.861 1.083.861 1.779V9l-6.03 3.249" />
  </svg>
);
// Simple date formatting function
const format = (date, formatStr) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  if (formatStr === 'MMM d, h:mm a') {
    const month = months[d.getMonth()];
    const day = d.getDate();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${month} ${day}, ${hours}:${minutesStr} ${ampm}`;
  } else if (formatStr === 'MMMM d, yyyy h:mm a') {
    const month = monthsFull[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
  }
  return d.toString();
};

const MessagesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [careerApplications, setCareerApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [messageType, setMessageType] = useState('contact'); // contact, career
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize immediately to prevent SSR issues
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Fetch contact messages
    const messagesRef = ref(realtimeDb, 'messages');
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.entries(data).map(([id, message]) => ({
          id,
          ...message,
          type: 'contact'
        })).sort((a, b) => b.timestamp - a.timestamp);
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
    });

    // Fetch career applications
    const careerRef = ref(realtimeDb, 'career_applications');
    const unsubscribeCareer = onValue(careerRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const applicationsArray = Object.entries(data).map(([id, application]) => ({
          id,
          ...application,
          type: 'career'
        })).sort((a, b) => b.timestamp - a.timestamp);
        setCareerApplications(applicationsArray);
      } else {
        setCareerApplications([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeCareer();
    };
  }, []);

  const markAsRead = async (messageId, isCareer = false) => {
    try {
      const path = isCareer ? `career_applications/${messageId}` : `messages/${messageId}`;
      await update(ref(realtimeDb, path), {
        read: true,
        readAt: Date.now()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const deleteMessage = async (messageId, isCareer = false) => {
    const messageText = isCareer ? 'application' : 'message';
    if (window.confirm(`Are you sure you want to delete this ${messageText}?`)) {
      try {
        const path = isCareer ? `career_applications/${messageId}` : `messages/${messageId}`;
        await remove(ref(realtimeDb, path));
        setSelectedMessage(null);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  // Get current message list based on type
  const currentMessages = messageType === 'career' ? careerApplications : messages;

  const filteredMessages = currentMessages.filter(message => {
    // First apply the read/unread filter
    let matchesFilter = true;
    if (filter === 'unread') matchesFilter = !message.read;
    if (filter === 'read') matchesFilter = message.read;
    
    // Then apply search filter
    if (searchQuery && matchesFilter) {
      const query = searchQuery.toLowerCase();
      return (
        (message.name || '').toLowerCase().includes(query) ||
        (message.email || '').toLowerCase().includes(query) ||
        (message.message || '').toLowerCase().includes(query) ||
        (message.phone && message.phone.toLowerCase().includes(query)) ||
        (message.position && message.position.toLowerCase().includes(query)) ||
        (message.experience && message.experience.toLowerCase().includes(query))
      );
    }
    
    return matchesFilter;
  });

  const unreadContactCount = messages.filter(m => !m.read).length;
  const unreadCareerCount = careerApplications.filter(a => !a.read).length;
  const unreadCount = messageType === 'career' ? unreadCareerCount : unreadContactCount;

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    if (!message.read) {
      markAsRead(message.id, message.type === 'career');
    }
  };

  if (loading) {
    return <GradientLoader />;
  }

  return (
    <div className={`${isMobile ? 'h-screen' : 'min-h-screen lg:h-full'} w-full overflow-hidden`}>
      {/* iOS-style Messages UI */}
      <div className={`flex ${isMobile ? 'h-full' : 'min-h-screen lg:h-full'} bg-[#121212] relative overflow-hidden`}>
        {/* Sidebar - Message List */}
        <div className={`w-full lg:w-80 bg-black border-r border-[#282828] flex flex-col absolute lg:relative ${isMobile ? 'inset-0' : 'inset-y-0'} left-0 z-20 transition-transform duration-300 ${
          selectedMessage && isMobile ? '-translate-x-full' : 'translate-x-0'
        }`}>
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#282828]">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-white">
                {messageType === 'career' ? 'Career Applications' : 'Messages'}
              </h1>
              <span className="text-sm text-[#b3b3b3]">
                {unreadCount > 0 && `${unreadCount} unread`}
              </span>
            </div>
            
            {/* Message Type Toggle */}
            <div className="flex bg-[#282828] rounded-lg p-1 mb-3">
              <button
                onClick={() => {
                  setMessageType('contact');
                  setSelectedMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                  messageType === 'contact'
                    ? 'bg-white text-black'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                Contact Messages
                {unreadContactCount > 0 && (
                  <span className="ml-1.5 bg-[#1db954] text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadContactCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setMessageType('career');
                  setSelectedMessage(null);
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                  messageType === 'career'
                    ? 'bg-white text-black'
                    : 'text-[#b3b3b3] hover:text-white'
                }`}
              >
                Career Applications
                {unreadCareerCount > 0 && (
                  <span className="ml-1.5 bg-[#1db954] text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCareerCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder={messageType === 'career' ? 'Search applications' : 'Search messages'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#282828] text-white rounded-full px-3 py-1.5 pl-9 text-sm placeholder-[#b3b3b3] focus:outline-none focus:ring-2 focus:ring-white border-0"
              />
              <svg className="w-4 h-4 text-[#b3b3b3] absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Pills */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-black'
                    : 'bg-transparent text-[#b3b3b3] hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-white text-black'
                    : 'bg-transparent text-[#b3b3b3] hover:text-white'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === 'read'
                    ? 'bg-white text-black'
                    : 'bg-transparent text-[#b3b3b3] hover:text-white'
                }`}
              >
                Read
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-280px)]" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4a4a4a #1a1a1a' }}>
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#b3b3b3]">
                <EnvelopeIcon className="w-12 h-12 mb-2 text-[#6a6a6a]" />
                <p>No messages found</p>
              </div>
            ) : (
              <div>
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`px-3 py-2.5 border-b border-[#282828] cursor-pointer transition-colors hover:bg-[#282828] ${
                      selectedMessage?.id === message.id ? 'bg-[#282828]' : ''
                    } ${message.isNewsletter ? 'relative' : ''}`}
                  >
                    {/* Newsletter Banner */}
                    {message.isNewsletter && (
                      <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-green-500 px-2 py-0.5 flex items-center gap-1">
                        <NewsletterIcon className="w-3 h-3 text-white flex-shrink-0" />
                        <span className="text-[10px] font-semibold text-white truncate">Newsletter</span>
                      </div>
                    )}
                    
                    <div className={`flex items-start gap-3 ${message.isNewsletter ? 'mt-5' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isNewsletter ? 'bg-green-600' : 'bg-[#282828]'
                      }`}>
                        {message.isNewsletter ? (
                          <NewsletterIcon className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-white font-semibold text-base">
                            {(message.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`text-sm font-semibold truncate ${
                            !message.read ? 'text-white' : 'text-[#b3b3b3]'
                          }`}>
                            {message.name || 'Unknown'}
                          </h3>
                          <span className="text-xs text-[#b3b3b3] whitespace-nowrap flex-shrink-0">
                            {format(new Date(message.timestamp), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-[#b3b3b3] truncate">
                          {message.isNewsletter ? 
                            `Newsletter • ${message.email}` :
                            (message.type === 'career' && message.position ? 
                              `${message.position} • ${message.email}` : 
                              (message.email || 'No email')
                            )
                          }
                        </p>
                        <p className={`text-sm mt-1 overflow-hidden ${
                          !message.read ? 'text-[#b3b3b3]' : 'text-[#6a6a6a]'
                        }`} style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: '1.25rem',
                          maxHeight: '2.5rem'
                        }}>
                          {message.type === 'career' ? 
                            (message.experience || message.message || 'No details provided') :
                            (message.message || 'No message')
                          }
                        </p>
                      </div>
                      
                      {!message.read && (
                        <div className="w-2 h-2 bg-[#1db954] rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Detail View */}
        <div className={`flex-1 flex flex-col bg-[#121212] absolute lg:relative ${isMobile ? 'inset-0' : 'inset-0'} z-10 transition-transform duration-300 ${
          !selectedMessage && isMobile ? 'translate-x-full' : 'translate-x-0'
        }`}>
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#282828] bg-[#181818]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setSelectedMessage(null)}
                      className="lg:hidden p-2 hover:bg-[#282828] rounded-lg transition-colors text-[#b3b3b3] hover:text-white"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      selectedMessage.isNewsletter ? 'bg-green-600' : 'bg-[#282828]'
                    }`}>
                      {selectedMessage.isNewsletter ? (
                        <NewsletterIcon className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {(selectedMessage.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-white text-base">{selectedMessage.name || 'Unknown'}</h2>
                      <p className="text-xs text-[#b3b3b3]">{selectedMessage.email || 'No email'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selectedMessage.phone && (
                      <a
                        href={`tel:${selectedMessage.phone}`}
                        className="p-2 hover:bg-[#282828] rounded-lg transition-colors text-[#b3b3b3] hover:text-white"
                        title="Call"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </a>
                    )}
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="p-2 hover:bg-[#282828] rounded-lg transition-colors text-[#b3b3b3] hover:text-white"
                      title="Email"
                    >
                      <EnvelopeIcon className="h-5 w-5" />
                    </a>
                    <button
                      onClick={() => deleteMessage(selectedMessage.id, selectedMessage.type === 'career')}
                      className="p-2 hover:bg-[#282828] rounded-lg transition-colors text-red-500"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto p-4 pb-20">
                <div className="max-w-3xl mx-auto">
                  {/* Date */}
                  <div className="text-center mb-6">
                    <span className="text-xs text-gray-500">
                      {format(new Date(selectedMessage.timestamp), 'MMMM d, yyyy h:mm a')}
                    </span>
                  </div>

                  {/* Newsletter Subscription Banner */}
                  {selectedMessage.isNewsletter && (
                    <div className="mb-6 bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <NewsletterIcon className="w-6 h-6 text-white" />
                        <div>
                          <h3 className="text-white font-semibold">Newsletter Subscription</h3>
                          <p className="text-green-100 text-sm">This user subscribed to your newsletter</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Message/Application Content */}
                  {selectedMessage.type === 'career' ? (
                    <div className="space-y-4">
                      {/* Career Application Details */}
                      <div className="bg-[#282828] rounded-xl px-4 py-3">
                        <h3 className="text-white font-semibold mb-3 text-base">Application Details</h3>
                        <div className="space-y-2.5">
                          <div>
                            <span className="text-[#b3b3b3] text-xs">Position Applied For:</span>
                            <p className="text-white font-medium text-sm">{selectedMessage.position || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-[#b3b3b3] text-xs">Experience:</span>
                            <p className="text-white whitespace-pre-wrap text-sm">{selectedMessage.experience || 'Not provided'}</p>
                          </div>
                          {selectedMessage.portfolio && (
                            <div>
                              <span className="text-[#b3b3b3] text-xs">Portfolio/LinkedIn:</span>
                              <p className="text-white text-sm">
                                {selectedMessage.portfolio.startsWith('http') ? (
                                  <a href={selectedMessage.portfolio} target="_blank" rel="noopener noreferrer" 
                                     className="text-[#1db954] hover:underline">
                                    {selectedMessage.portfolio}
                                  </a>
                                ) : (
                                  selectedMessage.portfolio
                                )}
                              </p>
                            </div>
                          )}
                          {selectedMessage.message && (
                            <div>
                              <span className="text-[#b3b3b3] text-xs">Additional Message:</span>
                              <p className="text-white whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-[#b3b3b3]">
                        {selectedMessage.phone && (
                          <span>
                            <PhoneIcon className="inline w-3 h-3 mr-0.5" />
                            {selectedMessage.phone}
                          </span>
                        )}
                        {selectedMessage.read && selectedMessage.readAt && (
                          <span>
                            Read {format(new Date(selectedMessage.readAt), 'MMM d, h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-start mb-4">
                      <div className="max-w-[70%]">
                        <div className="bg-[#282828] rounded-xl px-3 py-2.5">
                          <p className="text-white whitespace-pre-wrap text-sm">{selectedMessage.message || 'No message content'}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 ml-2">
                          {selectedMessage.phone && (
                            <span className="text-xs text-[#b3b3b3]">
                              <PhoneIcon className="inline w-3 h-3 mr-1" />
                              {selectedMessage.phone}
                            </span>
                          )}
                          {selectedMessage.read && selectedMessage.readAt && (
                            <span className="text-xs text-[#b3b3b3]">
                              Read {format(new Date(selectedMessage.readAt), 'MMM d, h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-[#282828] bg-[#181818] z-10">
                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.type === 'career' ? `Your application for ${selectedMessage.position || 'position'}` : 'Your message to Brand'}&body=Hi ${selectedMessage.name || 'there'},%0D%0A%0D%0AThank you for ${selectedMessage.type === 'career' ? 'your interest in joining our team' : 'reaching out to us'}.%0D%0A%0D%0A${selectedMessage.type === 'career' ? `---Application Details---%0D%0APosition: ${selectedMessage.position || 'N/A'}%0D%0AExperience: ${selectedMessage.experience || 'N/A'}%0D%0APortfolio: ${selectedMessage.portfolio || 'N/A'}%0D%0AMessage: ${selectedMessage.message || 'N/A'}` : `---Original Message---%0D%0A${selectedMessage.message || ''}`}`}
                    className="flex-1 bg-[#CB6015] hover:bg-[#E06A15] text-white font-medium py-2.5 px-5 rounded-full transition-colors text-center text-sm"
                  >
                    Reply via Email
                  </a>
                  {selectedMessage.phone && (
                    <a
                      href={`tel:${selectedMessage.phone}`}
                      className="bg-[#282828] hover:bg-[#3e3e3e] text-white font-medium py-2.5 px-5 rounded-full transition-colors text-sm"
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#b3b3b3]">
              <div className="text-center">
                <EnvelopeIcon className="w-12 h-12 mx-auto mb-3 text-[#6a6a6a]" />
                <p className="text-base">Select a message to read</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;