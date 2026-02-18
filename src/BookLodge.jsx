import React, { useState, useRef, useEffect } from 'react';

const BookLodgeApp = () => {
  // Navigation
  const [currentRoom, setCurrentRoom] = useState(0); // 0 = Concierge, 1 = Guest Room
  
  // AI Companion state
  const [inputValue, setInputValue] = useState('');
  const [conciergeMessages, setConciergeMessages] = useState([]);
  const [loungeMessages, setLoungeMessages] = useState([]);
  
  // Active messages based on current room
  const messages = currentRoom === 2 ? loungeMessages : conciergeMessages;
  const setMessages = currentRoom === 2 ? setLoungeMessages : setConciergeMessages;
  const [isLoading, setIsLoading] = useState(false);
  
  // User state
  const [user, setUser] = useState(null);
  const [showReservation, setShowReservation] = useState(false);
  const [reservationStep, setReservationStep] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showConnectionRequest, setShowConnectionRequest] = useState(false);
  const [connectionTargetUser, setConnectionTargetUser] = useState(null);
  const [connectionRequestData, setConnectionRequestData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [nominations, setNominations] = useState([]); // Track user's nominations: [{type, id, timestamp}]
  const [showReadModal, setShowReadModal] = useState(false);
  const [currentReading, setCurrentReading] = useState(null); // {piece, category}

  // Book Clubs state (Reading Circles & Silent Book Club)
  const [readingCircles, setReadingCircles] = useState([]);
  const [silentClubEvents, setSilentClubEvents] = useState([]);
  const [showCreateCircle, setShowCreateCircle] = useState(false);
  const [showCreateSilentEvent, setShowCreateSilentEvent] = useState(false);
  const [activeCircleId, setActiveCircleId] = useState(null);
  const [activeSilentEventId, setActiveSilentEventId] = useState(null);
  const [circleDiscussionInput, setCircleDiscussionInput] = useState('');
  const [editingCircleId, setEditingCircleId] = useState(null);
  const [editingSilentEventId, setEditingSilentEventId] = useState(null);
  const [newCircle, setNewCircle] = useState({
    name: '', description: '', bookTitle: '', privacy: 'public',
    meetingDate: '', meetingTime: '', meetingLink: ''
  });
  const [newSilentEvent, setNewSilentEvent] = useState({
    name: '', date: '', time: '', privacy: 'public', location: ''
  });

  // Fireside Lounge directory filters
  const [directoryFilter, setDirectoryFilter] = useState('all'); // all, reader, writer, pro
  const [directoryGenreFilter, setDirectoryGenreFilter] = useState('');
  const [directoryThemeFilter, setDirectoryThemeFilter] = useState('');
  const [directoryLookingForFilter, setDirectoryLookingForFilter] = useState('');
  const [directorySearchText, setDirectorySearchText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };
  const [readerSignup, setReaderSignup] = useState({ name: '', email: '' });
  const [hasJoinedReaderList, setHasJoinedReaderList] = useState(false);
  const [reservationData, setReservationData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'writer', // reader, writer, or pro
    proRole: '', // agent, editor, designer, formatter, publisher
    bio: '', // "Why You Write/Read" - their personal mission/story
    // Matching fields for literary connections
    genres: [], // What they read/write
    lookingFor: [], // beta readers, critique partners, etc.
    themes: [], // Thematic interests — spiritual, emotional, social, etc.
    openToConnect: true, // Available for new connections
    agreedToTerms: false // Terms of Service agreement
  });
  
  // Subscription state
  const [messageCount, setMessageCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(null);
  const TRIAL_DAYS = 7;
  
  // Message limits by tier
  const getMessageLimit = () => {
    if (!user) return 3; // 3 free messages for guests
    if (user.userType === 'reader') return 50;
    if (user.userType === 'writer') return 150;
    if (user.userType === 'pro') return 999999; // Unlimited
    return 50;
  };
  
  // Guest Room state
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomData, setRoomData] = useState({
    // Reader features
    favoriteBooks: [],
    wantToRead: [],
    recommendations: [],
    // Writer features (includes reader features)
    publishedWorks: [],
    wips: [],
    // Pro features (includes all above)
    portfolio: [],
    // Universal
    website: '',
    socialLinks: { twitter: '', instagram: '', linkedin: '' },
    uploadedFiles: [],
    betaReaders: [],
    readerList: [], // Readers who accessed short stories/poetry/essays
    lookingToMeet: '', // Free-form field for who they want to connect with
    // NEW: Short form writing sections
    shortStories: [],
    poetry: [],
    essays: []
  });
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Book Lists state
  const [bookLists, setBookLists] = useState(() => {
    const saved = localStorage.getItem('bookLodgeBookLists');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [activeListId, setActiveListId] = useState(null);
  const [bookSearch, setBookSearch] = useState('');
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [bookSearchLoading, setBookSearchLoading] = useState(false);
  const [showShareRoom, setShowShareRoom] = useState(false);
  const [shareRoomCopied, setShareRoomCopied] = useState(false);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Sign In modal state
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signInError, setSignInError] = useState('');

  // Forgot Password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState('form'); // 'form' | 'sent'

  // Beta reader modal state
  const [showBetaModal, setShowBetaModal] = useState(false);
  const [currentWipForBeta, setCurrentWipForBeta] = useState(null);
  const [betaSignupData, setBetaSignupData] = useState({
    name: '',
    email: '',
    consent: false
  });
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  // Load user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bookLodgeUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      if (userData.room) setRoomData(userData.room);
      
      // Load nominations
      const savedNominations = localStorage.getItem('bookLodgeNominations');
      if (savedNominations) {
        setNominations(JSON.parse(savedNominations));
      }

      // Load book clubs data
      const savedCircles = localStorage.getItem('bookLodgeCircles');
      if (savedCircles) setReadingCircles(JSON.parse(savedCircles));
      const savedSilentEvents = localStorage.getItem('bookLodgeSilentEvents');
      if (savedSilentEvents) setSilentClubEvents(JSON.parse(savedSilentEvents));
      
      // Calculate trial days remaining
      if (userData.trialStartDate && !userData.isPaid) {
        const trialStart = new Date(userData.trialStartDate);
        const now = new Date();
        const daysElapsed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
        const remaining = TRIAL_DAYS - daysElapsed;
        setTrialDaysRemaining(remaining > 0 ? remaining : 0);
      }
    }
    
    // Load this month's message count
    const currentMonth = new Date().toISOString().slice(0, 7);
    const savedCount = localStorage.getItem('messageCount');
    const savedMonth = localStorage.getItem('messageMonth');
    
    if (savedMonth === currentMonth) {
      setMessageCount(parseInt(savedCount) || 0);
    } else {
      setMessageCount(0);
      localStorage.setItem('messageMonth', currentMonth);
      localStorage.setItem('messageCount', '0');
    }
  }, []);

  // Auto-scroll chat — scroll to the start of the latest message
  const latestMessageRef = useRef(null);
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to let the DOM render the new message
      setTimeout(() => {
        latestMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }, [messages.length]);

  // Build lodger context for Wells
  const getLodgerContext = () => {
    if (!user) return '';
    
    let context = `\n\n--- THIS LODGER'S PROFILE ---`;
    context += `\nName: ${user.name}`;
    if (user.bio) context += `\nTheir Story: "${user.bio}"`;
    if (user.genres && user.genres.length > 0) context += `\nGenres: ${user.genres.join(', ')}`;
    if (user.themes && user.themes.length > 0) context += `\nThemes: ${user.themes.join(', ')}`;
    if (user.lookingFor && user.lookingFor.length > 0) context += `\nLooking For: ${user.lookingFor.join(', ')}`;
    if (roomData.website) context += `\nWebsite: ${roomData.website}`;
    
    if (roomData.lookingToMeet) {
      context += `\n${user.userType === 'reader' ? 'Voices They\'re Seeking' : 'Who They Want to Meet'}: "${roomData.lookingToMeet}"`;
    }
    
    const favBooks = (roomData.favoriteBooks || []).filter(b => b.title);
    if (favBooks.length > 0) context += `\nFavorite Books: ${favBooks.map(b => `"${b.title}"${b.author ? ` by ${b.author}` : ''}${b.description ? ` — ${b.description}` : ''}`).join('; ')}`;
    
    const wantToRead = (roomData.wantToRead || []).filter(b => b.title);
    if (wantToRead.length > 0) context += `\nWant to Read: ${wantToRead.map(b => `"${b.title}"${b.author ? ` by ${b.author}` : ''}`).join('; ')}`;
    
    const recs = (roomData.recommendations || []).filter(b => b.title);
    if (recs.length > 0) context += `\nTheir Recommendations: ${recs.map(b => `"${b.title}"${b.author ? ` by ${b.author}` : ''}`).join('; ')}`;
    
    const published = (roomData.publishedWorks || []).filter(b => b.title);
    if (published.length > 0) context += `\nPublished Works: ${published.map(b => `"${b.title}"${b.description ? ` — ${b.description}` : ''}`).join('; ')}`;
    
    const wips = (roomData.wips || []).filter(b => b.title);
    if (wips.length > 0) context += `\nWorks in Progress: ${wips.map(b => `"${b.title}"${b.description ? ` — ${b.description}` : ''}`).join('; ')}`;
    
    const stories = (roomData.shortStories || []).filter(b => b.title);
    if (stories.length > 0) context += `\nShort Stories: ${stories.map(b => `"${b.title}"${b.author ? ` by ${b.author}` : ''}`).join('; ')}`;
    
    const poems = (roomData.poetry || []).filter(b => b.title);
    if (poems.length > 0) context += `\nPoetry: ${poems.map(b => `"${b.title}"${b.author ? ` by ${b.author}` : ''}`).join('; ')}`;
    
    const essaysList = (roomData.essays || []).filter(b => b.title);
    if (essaysList.length > 0) context += `\nEssays: ${essaysList.map(b => `"${b.title}"${b.author ? ` by ${b.author}` : ''}`).join('; ')}`;
    
    const portfolio = (roomData.portfolio || []).filter(b => b.title);
    if (portfolio.length > 0) context += `\nProfessional Portfolio: ${portfolio.map(b => `"${b.title}"${b.author ? ` by ${b.author}` : ''}${b.description ? ` — ${b.description}` : ''}`).join('; ')}`;
    
    const betaCount = (roomData.betaReaders || []).length;
    if (betaCount > 0) context += `\nBeta Readers Signed Up: ${betaCount}`;
    
    const readerCount = (roomData.readerList || []).length;
    if (readerCount > 0) context += `\nReaders Who've Read Their Work: ${readerCount}`;
    
    context += `\n--- END PROFILE ---`;
    context += `\n\nIMPORTANT: Use this profile knowledge naturally and warmly — reference their books, their WIPs, their tastes, and what they're looking for when it's relevant. Don't recite their profile back to them, but let it inform your recommendations, encouragement, and conversation. You KNOW this person. Make them feel known.`;
    
    return context;
  };

  // AI System Prompt based on user type
  const getSystemPrompt = () => {
    const basePrompt = `You are Wells, the warm and knowledgeable Literary Companion at THE BOOK LODGE. Your role is to be a hospitable guide for the entire book community. The Lodge's tagline is "Together, let's book better." You embody hospitality, wisdom, and genuine care for books and the people who love them. Never use asterisk actions or emotes like *smiles* or *leans forward* — express warmth through your words, not stage directions. Keep responses conversational and concise.`;
    
    if (!user) return basePrompt + ` Welcome visitors warmly. Keep responses brief and inviting.`;
    
    const lodgerContext = getLodgerContext();
    
    if (user.userType === 'writer') {
      return basePrompt + `
This lodger is a WRITER. Help them:
- Develop craft and storytelling skills
- Navigate the publishing industry
- Stay motivated through creative challenges
- NEVER write content for them - guide and encourage
Be encouraging, insightful, and respectful of their creative process.` + lodgerContext;
    }
    
    if (user.userType === 'reader') {
      return basePrompt + `
This lodger is a READER — and readers are the heartbeat of the Lodge. Help them:
- Discover new voices and debut authors they won't find anywhere else
- Explore literary history, contexts, and the craft behind stories they love
- Deepen their connection to the literary world in a personal, intimate way
- Find their next great read based on what truly moves them
- Feel empowered: remind them that their taste MATTERS — when they nominate work in the Lodge (using the ☆ star on any published work, WIP, story, poem, or essay), they're helping surface rising voices and influencing what gets published next
- Encourage them to explore writers' Guest Rooms and the Fireside Lounge to discover authors directly
You're a wise librarian, an enthusiastic book club friend, and a champion of the idea that readers aren't passive — they shape the literary world. Writers in this Lodge are waiting to hear from readers like them.` + lodgerContext;
    }
    
    if (user.userType === 'pro') {
      return basePrompt + `
This lodger is an INDUSTRY PROFESSIONAL (${user.proRole || 'book professional'}). Help them:
- Navigate industry trends
- Understand reader preferences
- Connect craft with professional insights
- Provide thoughtful analysis
Respect their expertise while offering fresh perspectives.` + lodgerContext;
    }
    
    return basePrompt + lodgerContext;
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Check if user needs to subscribe
    const isInTrial = trialDaysRemaining !== null && trialDaysRemaining > 0;
    const isPaid = user?.isPaid || false;
    const limit = getMessageLimit();
    
    // Guest limit (no account)
    if (!user && messageCount >= 3) {
      setReservationStep(0);
      setShowReservation(true);
      return;
    }
    
    // Trial expired
    if (user && !isInTrial && !isPaid) {
      setShowUpgradeModal(true);
      return;
    }
    
    // Message limit (paid users, non-unlimited)
    if (isPaid && user.userType !== 'pro' && messageCount >= limit) {
      setShowUpgradeModal(true);
      return;
    }
    
    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Increment message count (except unlimited pro tier)
    if (user?.userType !== 'pro' || !isPaid) {
      const newCount = messageCount + 1;
      setMessageCount(newCount);
      localStorage.setItem('messageCount', newCount.toString());
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          system: getSystemPrompt(),
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ]
        })
      });

      const data = await response.json();
      if (data.content?.[0]) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I seem to be having trouble connecting right now. Please try again in a moment.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reservation flow handlers
  const handleReservationNext = () => {
    setReservationStep(reservationStep + 1);
  };

  const handleReservationComplete = () => {
    if (!reservationData.name || !reservationData.email || !reservationData.password) return;
    
    const newUser = {
      ...reservationData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      trialStartDate: new Date().toISOString(),
      isPaid: false,
      room: roomData
    };
    
    localStorage.setItem('bookLodgeUser', JSON.stringify(newUser));
    setUser(newUser);
    setTrialDaysRemaining(TRIAL_DAYS);
    setShowReservation(false);
    setReservationStep(0);
    // Take them to Guest Room after signup
    setCurrentRoom(1);
  };

  // Guest Room functions
  const handleSaveRoom = () => {
    console.log('Attempting to save room data...');
    console.log('Room data:', roomData);
    try {
      const updatedUser = { ...user, room: roomData };
      const dataString = JSON.stringify(updatedUser);
      console.log('Data size:', (dataString.length / 1024).toFixed(2) + ' KB');
      localStorage.setItem('bookLodgeUser', dataString);
      setUser(updatedUser);
      setIsEditingRoom(false);
      console.log('Save successful!');
    } catch (error) {
      console.error('Error saving room:', error);
      showToast('Unable to save - your data may be too large. Try using smaller images or fewer files.');
    }
  };

  const addItem = (category) => {
    const baseItem = {
      title: '', 
      description: '', 
      link: '', 
      author: '', 
      id: Date.now()
    };

    // Short stories, poetry, essays get content field
    if (category === 'shortStories' || category === 'poetry' || category === 'essays') {
      baseItem.content = '';
    }

    // WIPs get extra fields for visibility and PDF uploads
    if (category === 'wips') {
      baseItem.visibility = 'private';
      baseItem.uploadedPdf = null;
      baseItem.embedUrl = '';
      baseItem.embedType = '';
      baseItem.coverImage = null;
    }

    // Published Works get cover image
    if (category === 'publishedWorks') {
      baseItem.coverImage = null;
    }

    setRoomData(prev => ({
      ...prev,
      [category]: [...prev[category], baseItem]
    }));
  };

  const updateItem = (category, id, field, value) => {
    setRoomData(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (category, id) => {
    setRoomData(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  // Get room sections based on user type (cumulative)
  const getRoomSections = () => {
    if (!user) return [];
    
    const sections = [];
    
    // All users get reader features
    sections.push(
      { key: 'favoriteBooks', title: 'Favorite Books', fields: ['title', 'author', 'description'] },
      { key: 'wantToRead', title: 'Want to Read', fields: ['title', 'author'] },
      { key: 'recommendations', title: 'My Recommendations', fields: ['title', 'author', 'description'] }
    );
    
    // Writers get writer features + reader features
    if (user.userType === 'writer') {
      sections.push(
        { key: 'publishedWorks', title: 'Published Works', fields: ['title', 'description', 'link'] },
        { key: 'wips', title: 'Works in Progress', fields: ['title', 'description'] },
        { key: 'shortStories', title: 'Short Stories', fields: ['title', 'author', 'content'] },
        { key: 'poetry', title: 'Poetry', fields: ['title', 'author', 'content'] },
        { key: 'essays', title: 'Essays & Articles', fields: ['title', 'author', 'content'] }
      );
    }
    
    // Pros get their portfolio + role-appropriate sections
    if (user.userType === 'pro') {
      const roleLabels = {
        agent: 'Books I\'ve Represented',
        editor: 'Books I\'ve Edited',
        copyeditor: 'Books I\'ve Polished',
        designer: 'Covers I\'ve Designed',
        formatter: 'Books I\'ve Formatted',
        publisher: 'Books I\'ve Published',
        ghostwriter: 'Books I\'ve Ghostwritten',
        publicist: 'Books I\'ve Promoted',
        marketer: 'Campaigns I\'ve Run',
        socialmedia: 'Authors I\'ve Supported',
        narrator: 'Books I\'ve Narrated',
        translator: 'Books I\'ve Translated',
        illustrator: 'Books I\'ve Illustrated',
        booktrailer: 'Trailers I\'ve Produced',
        coach: 'Authors I\'ve Coached',
        sensitivity: 'Books I\'ve Reviewed',
        rights: 'Deals I\'ve Brokered',
        other: 'Professional Portfolio'
      };

      sections.push({
        key: 'portfolio',
        title: roleLabels[user.proRole] || 'Professional Portfolio',
        fields: ['title', 'author', 'description', 'link']
      });

      // Pros who also write get writing sections
      const writingPros = ['ghostwriter', 'coach', 'editor', 'copyeditor', 'sensitivity'];
      if (writingPros.includes(user.proRole)) {
        sections.push(
          { key: 'publishedWorks', title: 'My Own Published Works', fields: ['title', 'description', 'link'] },
          { key: 'essays', title: 'Essays & Articles', fields: ['title', 'author', 'content'] }
        );
      }

      // Content-creating pros get a showcase section
      const contentPros = ['illustrator', 'designer', 'booktrailer', 'narrator'];
      if (contentPros.includes(user.proRole)) {
        sections.push(
          { key: 'publishedWorks', title: 'Featured Work', fields: ['title', 'description', 'link'] }
        );
      }
    }
    
    return sections;
  };

  // Generate shareable profile URL
  const getProfileUrl = () => {
    if (!user) return '';
    const username = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `https://thebooklodge.com/${username}`;
  };

  const copyProfileLink = () => {
    const url = getProfileUrl();
    navigator.clipboard.writeText(url);
    showToast('Profile link copied to clipboard!');
  };

  // Logout/Reset (for testing)
  const handleLogout = () => {
    localStorage.removeItem('bookLodgeUser');
    localStorage.removeItem('messageCount');
    localStorage.removeItem('messageMonth');
    localStorage.removeItem('bookLodgeCircles');
    localStorage.removeItem('bookLodgeSilentEvents');
    setUser(null);
    setConciergeMessages([]);
    setLoungeMessages([]);
    setMessageCount(0);
    setCurrentRoom(0);
    setTrialDaysRemaining(null);
    setReadingCircles([]);
    setSilentClubEvents([]);
    setActiveCircleId(null);
    setActiveSilentEventId(null);
    setRoomData({
      favoriteBooks: [],
      wantToRead: [],
      recommendations: [],
      publishedWorks: [],
      wips: [],
      portfolio: [],
      website: '',
      socialLinks: { twitter: '', instagram: '', linkedin: '' },
      uploadedFiles: [],
      betaReaders: [],
      lookingToMeet: ''
    });
  };

  // Sign In handler
  const handleSignIn = () => {
    setSignInError('');
    if (!signInData.email.trim() || !signInData.password.trim()) {
      setSignInError('Please enter your email and password.');
      return;
    }

    // TODO (backend): Replace this localStorage lookup with an API call:
    // POST /api/auth/login { email, password }
    // → returns { user, token } on success, or 401 on failure
    const savedUser = localStorage.getItem('bookLodgeUser');
    if (!savedUser) {
      setSignInError('No account found with that email. Please check your details or reserve a new room.');
      return;
    }

    const userData = JSON.parse(savedUser);
    if (userData.email.toLowerCase() !== signInData.email.trim().toLowerCase()) {
      setSignInError('No account found with that email.');
      return;
    }
    if (userData.password !== signInData.password) {
      setSignInError('Incorrect password. Please try again.');
      return;
    }

    // Successful sign-in
    setUser(userData);
    if (userData.room) setRoomData(userData.room);

    const savedNominations = localStorage.getItem('bookLodgeNominations');
    if (savedNominations) setNominations(JSON.parse(savedNominations));

    const savedCircles = localStorage.getItem('bookLodgeCircles');
    if (savedCircles) setReadingCircles(JSON.parse(savedCircles));

    const savedSilentEvents = localStorage.getItem('bookLodgeSilentEvents');
    if (savedSilentEvents) setSilentClubEvents(JSON.parse(savedSilentEvents));

    if (userData.trialStartDate && !userData.isPaid) {
      const trialStart = new Date(userData.trialStartDate);
      const now = new Date();
      const daysElapsed = Math.floor((now - trialStart) / (1000 * 60 * 60 * 24));
      const remaining = TRIAL_DAYS - daysElapsed;
      setTrialDaysRemaining(remaining > 0 ? remaining : 0);
    }

    setShowSignIn(false);
    setSignInData({ email: '', password: '' });
    setSignInError('');
    setCurrentRoom(1);
  };

  // Forgot password handler
  const handleForgotPasswordSubmit = () => {
    if (!forgotEmail.trim()) return;

    // TODO (backend): Replace with API call:
    // POST /api/auth/forgot-password { email }
    // Backend should: generate a secure token, store it with expiry, and email the reset link
    // This frontend only needs to show the confirmation — the API response doesn't need to confirm
    // whether the email exists (to prevent user enumeration attacks)

    setForgotPasswordStep('sent');
  };

  const handleForgotPasswordClose = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotPasswordStep('form');
  };

  // Book Lists handlers
  const saveBookLists = (lists) => {
    setBookLists(lists);
    localStorage.setItem('bookLodgeBookLists', JSON.stringify(lists));
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList = {
      id: Date.now(),
      name: newListName.trim(),
      books: [],
      isPublic: false,
      createdAt: new Date().toISOString()
    };
    const updated = [...bookLists, newList];
    saveBookLists(updated);
    setNewListName('');
    setShowAddList(false);
    setActiveListId(newList.id);
  };

  const handleDeleteList = (listId) => {
    const updated = bookLists.filter(l => l.id !== listId);
    saveBookLists(updated);
    if (activeListId === listId) setActiveListId(null);
  };

  const handleToggleListVisibility = (listId) => {
    const updated = bookLists.map(l => l.id === listId ? {...l, isPublic: !l.isPublic} : l);
    saveBookLists(updated);
  };

  const handleAddBookToList = (listId, book) => {
    const updated = bookLists.map(l => l.id === listId ? {
      ...l, books: [...l.books, {...book, id: Date.now(), read: false, addedAt: new Date().toISOString()}]
    } : l);
    saveBookLists(updated);
    setBookSearch('');
    setBookSearchResults([]);
  };

  const handleToggleBookRead = (listId, bookId) => {
    const updated = bookLists.map(l => l.id === listId ? {
      ...l, books: l.books.map(b => b.id === bookId ? {...b, read: !b.read} : b)
    } : l);
    saveBookLists(updated);
  };

  const handleRemoveBookFromList = (listId, bookId) => {
    const updated = bookLists.map(l => l.id === listId ? {
      ...l, books: l.books.filter(b => b.id !== bookId)
    } : l);
    saveBookLists(updated);
  };

  const handleBookSearch = async (query) => {
    setBookSearch(query);
    if (query.length < 3) { setBookSearchResults([]); return; }
    setBookSearchLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8&fields=title,author_name,cover_i,key`);
      const data = await res.json();
      setBookSearchResults(data.docs || []);
    } catch {
      setBookSearchResults([]);
    }
    setBookSearchLoading(false);
  };

  const handleShareRoom = () => {
    const shareUrl = `${window.location.origin}?room=${encodeURIComponent(user.name)}&invite=true`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareRoomCopied(true);
      setTimeout(() => setShareRoomCopied(false), 3000);
    });
  };

  // Get pricing for user's role
  const getUserPrice = () => {

    if (!user) return 5;
    if (user.userType === 'reader') return 5;
    if (user.userType === 'writer') return 12;
    if (user.userType === 'pro') return 20;
    return 5;
  };

  // Toggle visibility for WIP items
  const toggleItemVisibility = (category, id) => {
    setRoomData(prev => ({
      ...prev,
      [category]: prev[category].map(item => 
        item.id === id 
          ? { ...item, visibility: item.visibility === 'private' ? 'public' : 'private' }
          : item
      )
    }));
  };

  // Handle PDF upload for WIP items
  const handleWipPdfUpload = (e, category, itemId) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setRoomData(prev => ({
        ...prev,
        [category]: prev[category].map(item =>
          item.id === itemId
            ? { 
                ...item, 
                uploadedPdf: {
                  name: file.name,
                  data: event.target.result,
                  size: file.size
                },
                embedType: 'uploaded_pdf',
                embedUrl: ''
              }
            : item
        )
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle cover image upload for Published Works
  const handleCoverImageUpload = (e, category, itemId) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set max width/height (compress large images)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 1200;
        
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > MAX_WIDTH) {
          height = (height * MAX_WIDTH) / width;
          width = MAX_WIDTH;
        }
        if (height > MAX_HEIGHT) {
          width = (width * MAX_HEIGHT) / height;
          height = MAX_HEIGHT;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG with quality 0.8 for smaller file size
        const compressedData = canvas.toDataURL('image/jpeg', 0.8);
        
        setRoomData(prev => ({
          ...prev,
          [category]: prev[category].map(item =>
            item.id === itemId
              ? { 
                  ...item, 
                  coverImage: {
                    name: file.name,
                    data: compressedData
                  }
                }
              : item
          )
        }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Remove cover image
  const handleRemoveCoverImage = (category, itemId) => {
    setRoomData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId
          ? { ...item, coverImage: null }
          : item
      )
    }));
  };

  // Profile image crop state
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropCanvasRef = React.useRef(null);
  const cropImgRef = React.useRef(null);

  // Profile image upload — opens crop modal
  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImageSrc(event.target.result);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = () => {
    const img = cropImgRef.current;
    if (!img) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const OUTPUT_SIZE = 300;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    
    const containerSize = 280;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;
    
    // The base scale matches how the image is displayed at zoom=1
    // (shorter dimension fills 280px)
    let baseScale;
    if (natW > natH) {
      baseScale = containerSize / natH;
    } else {
      baseScale = containerSize / natW;
    }
    
    const totalScale = baseScale * cropZoom;
    
    // The visible 280px circle maps to this many source pixels
    const srcVisibleSize = containerSize / totalScale;
    
    // Center of the source image, adjusted by drag offset
    const srcCenterX = (natW / 2) - (cropOffset.x / totalScale);
    const srcCenterY = (natH / 2) - (cropOffset.y / totalScale);
    
    const sx = srcCenterX - srcVisibleSize / 2;
    const sy = srcCenterY - srcVisibleSize / 2;
    
    ctx.drawImage(img, sx, sy, srcVisibleSize, srcVisibleSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    
    const compressedData = canvas.toDataURL('image/jpeg', 0.85);
    
    const updatedUser = { ...user, profileImage: compressedData };
    setUser(updatedUser);
    localStorage.setItem('bookLodgeUser', JSON.stringify({ ...updatedUser, room: roomData }));
    
    setShowCropModal(false);
    setCropImageSrc(null);
  };

  const handleCropMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingCrop(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - cropOffset.x, y: clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e) => {
    if (!isDraggingCrop) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setCropOffset({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
  };

  const handleRemoveProfileImage = () => {
    const updatedUser = { ...user, profileImage: null };
    setUser(updatedUser);
    localStorage.setItem('bookLodgeUser', JSON.stringify({ ...updatedUser, room: roomData }));
  };

  const ProfileImage = ({ size = 100, fontSize = '2.5rem' }) => {
    const initial = (user?.name || '?')[0].toUpperCase();
    
    if (user?.profileImage) {
      return (
        <div style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          overflow: 'hidden', border: '2px solid rgba(212, 175, 55, 0.5)', flexShrink: 0
        }}>
          <img src={user.profileImage} alt={user.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      );
    }
    
    return (
      <div style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        background: 'rgba(212, 175, 55, 0.15)', border: '2px solid rgba(212, 175, 55, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Cinzel', fontSize: fontSize, color: '#D4AF37', flexShrink: 0
      }}>
        {initial}
      </div>
    );
  };

  // Remove uploaded PDF from WIP
  const handleRemoveWipPdf = (category, itemId) => {
    setRoomData(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === itemId
          ? { ...item, uploadedPdf: null, embedType: '' }
          : item
      )
    }));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Extract Google Doc ID from URL
  const extractGoogleDocId = (url) => {
    if (!url) return '';
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  // Get embed URL for Google Doc
  const getGoogleDocEmbedUrl = (docId) => {
    return `https://docs.google.com/document/d/${docId}/preview`;
  };

  // Beta reader signup handlers
  const handleBetaSignupClick = (wip) => {
    setCurrentWipForBeta(wip);
    setShowBetaModal(true);
    setBetaSignupData({ name: '', email: '', consent: false });
  };

  const handleBetaSignupSubmit = () => {
    if (!betaSignupData.name.trim() || !betaSignupData.email.trim() || !betaSignupData.consent) {
      return;
    }

    const newBetaReader = {
      id: Date.now(),
      name: betaSignupData.name.trim(),
      email: betaSignupData.email.trim(),
      wipId: currentWipForBeta.id,
      wipTitle: currentWipForBeta.title,
      signedUpAt: new Date().toISOString()
    };

    const pdfData = currentWipForBeta.uploadedPdf.data;
    const pdfName = currentWipForBeta.uploadedPdf.name;

    setRoomData(prev => ({
      ...prev,
      betaReaders: [...(prev.betaReaders || []), newBetaReader]
    }));

    setShowBetaModal(false);
    setBetaSignupData({ name: '', email: '', consent: false });
    setCurrentWipForBeta(null);

    // Download the PDF
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = pdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    setShowDownloadSuccess(true);
    setTimeout(() => {
      setShowDownloadSuccess(false);
    }, 4000);
  };

  // Export beta readers to CSV
  const handleExportBetaReaders = () => {
    if (!roomData.betaReaders || roomData.betaReaders.length === 0) return;

    const csvContent = [
      ['Name', 'Email', 'WIP Title', 'Signed Up'],
      ...roomData.betaReaders.map(reader => [
        reader.name,
        reader.email,
        reader.wipTitle,
        new Date(reader.signedUpAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `beta-readers-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRemoveBetaReader = (readerId) => {
    setRoomData(prev => ({
      ...prev,
      betaReaders: prev.betaReaders.filter(r => r.id !== readerId)
    }));
  };

  // Nomination handlers
  const handleNominate = (type, id, itemOwnerId) => {
    // Can't nominate your own work
    if (user && itemOwnerId === user.id) return;
    
    const nominationKey = `${type}-${id}`;
    const alreadyNominated = nominations.some(n => n.key === nominationKey);
    
    if (alreadyNominated) return; // Already nominated
    
    const newNomination = {
      key: nominationKey,
      type: type, // 'publishedWork', 'wip', 'pro'
      id: id,
      timestamp: Date.now()
    };
    
    const updatedNominations = [...nominations, newNomination];
    setNominations(updatedNominations);
    localStorage.setItem('bookLodgeNominations', JSON.stringify(updatedNominations));
  };

  const hasNominated = (type, id) => {
    const nominationKey = `${type}-${id}`;
    return nominations.some(n => n.key === nominationKey);
  };

  const getNominationCount = (type, id) => {
    // In phase 1, we can't count across all users (no backend)
    // So we'll show if current user has nominated
    return hasNominated(type, id) ? 1 : 0;
  };

  // Reading modal handlers
  const handleReadClick = (piece, category) => {
    setCurrentReading({ piece, category });
    setShowReadModal(true);
    setHasJoinedReaderList(false);
    setReaderSignup({ name: '', email: '' });
  };

  const handleJoinReaderList = () => {
    if (!readerSignup.name.trim() || !readerSignup.email.trim()) return;
    
    const newReader = {
      id: Date.now(),
      name: readerSignup.name,
      email: readerSignup.email,
      pieceTitle: currentReading.piece.title,
      category: currentReading.category,
      date: new Date().toISOString()
    };
    
    setRoomData(prev => ({
      ...prev,
      readerList: [...prev.readerList, newReader]
    }));
    
    setHasJoinedReaderList(true);
  };

  const handleSkipAndRead = () => {
    setHasJoinedReaderList(true);
  };

  const exportReaderList = () => {
    if (!roomData.readerList || roomData.readerList.length === 0) {
      showToast('No readers to export yet!');
      return;
    }
    
    const csvContent = [
      ['Name', 'Email', 'Piece Read', 'Category', 'Date'].join(','),
      ...roomData.readerList.map(reader => 
        [reader.name, reader.email, reader.pieceTitle, reader.category, new Date(reader.date).toLocaleDateString()].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reader-list.csv';
    a.click();
  };

  // ========== READING CIRCLES HANDLERS ==========
  const saveCircles = (updated) => {
    setReadingCircles(updated);
    localStorage.setItem('bookLodgeCircles', JSON.stringify(updated));
  };

  const handleCreateCircle = () => {
    if (!newCircle.name.trim() || !newCircle.bookTitle.trim()) return;
    const circle = {
      id: Date.now(), ...newCircle,
      hostId: user.id, hostName: user.name,
      members: [{ id: user.id, name: user.name, role: 'host' }],
      pendingRequests: [], discussion: [],
      createdAt: new Date().toISOString()
    };
    saveCircles([...readingCircles, circle]);
    setNewCircle({ name: '', description: '', bookTitle: '', privacy: 'public', meetingDate: '', meetingTime: '', meetingLink: '' });
    setShowCreateCircle(false);
    setActiveCircleId(circle.id);
  };

  const handleUpdateCircle = (circleId, updates) => {
    saveCircles(readingCircles.map(c => c.id === circleId ? { ...c, ...updates } : c));
    setEditingCircleId(null);
  };

  const handleDeleteCircle = (circleId) => {
    if (!confirm('Are you sure you want to delete this Reading Circle?')) return;
    saveCircles(readingCircles.filter(c => c.id !== circleId));
    setActiveCircleId(null);
  };

  const handleJoinCircle = (circleId) => {
    saveCircles(readingCircles.map(c => {
      if (c.id !== circleId) return c;
      if (c.privacy === 'public') {
        if (c.members.some(m => m.id === user.id)) return c;
        return { ...c, members: [...c.members, { id: user.id, name: user.name, role: 'member' }] };
      } else {
        if (c.pendingRequests.some(r => r.id === user.id)) return c;
        return { ...c, pendingRequests: [...c.pendingRequests, { id: user.id, name: user.name, requestedAt: new Date().toISOString() }] };
      }
    }));
  };

  const handleApproveRequest = (circleId, requesterId) => {
    saveCircles(readingCircles.map(c => {
      if (c.id !== circleId) return c;
      const req = c.pendingRequests.find(r => r.id === requesterId);
      if (!req) return c;
      return { ...c, members: [...c.members, { id: req.id, name: req.name, role: 'member' }], pendingRequests: c.pendingRequests.filter(r => r.id !== requesterId) };
    }));
  };

  const handleDenyRequest = (circleId, requesterId) => {
    saveCircles(readingCircles.map(c => c.id !== circleId ? c : { ...c, pendingRequests: c.pendingRequests.filter(r => r.id !== requesterId) }));
  };

  const handleLeaveCircle = (circleId) => {
    saveCircles(readingCircles.map(c => c.id !== circleId ? c : { ...c, members: c.members.filter(m => m.id !== user.id) }));
  };

  const handlePostDiscussion = (circleId) => {
    if (!circleDiscussionInput.trim()) return;
    saveCircles(readingCircles.map(c => {
      if (c.id !== circleId) return c;
      return { ...c, discussion: [...c.discussion, { id: Date.now(), userId: user.id, userName: user.name, text: circleDiscussionInput.trim(), timestamp: new Date().toISOString() }] };
    }));
    setCircleDiscussionInput('');
  };

  // ========== SILENT BOOK CLUB HANDLERS ==========
  const saveSilentEvents = (updated) => {
    setSilentClubEvents(updated);
    localStorage.setItem('bookLodgeSilentEvents', JSON.stringify(updated));
  };

  const handleCreateSilentEvent = () => {
    if (!newSilentEvent.name.trim() || !newSilentEvent.date) return;
    const evt = {
      id: Date.now(), ...newSilentEvent,
      hostId: user.id, hostName: user.name,
      attendees: [{ id: user.id, name: user.name, role: 'host' }],
      pendingRequests: [], createdAt: new Date().toISOString()
    };
    saveSilentEvents([...silentClubEvents, evt]);
    setNewSilentEvent({ name: '', date: '', time: '', privacy: 'public', location: '' });
    setShowCreateSilentEvent(false);
    setActiveSilentEventId(evt.id);
  };

  const handleUpdateSilentEvent = (eventId, updates) => {
    saveSilentEvents(silentClubEvents.map(e => e.id === eventId ? { ...e, ...updates } : e));
    setEditingSilentEventId(null);
  };

  const handleDeleteSilentEvent = (eventId) => {
    if (!confirm('Are you sure you want to cancel this event?')) return;
    saveSilentEvents(silentClubEvents.filter(e => e.id !== eventId));
    setActiveSilentEventId(null);
  };

  const handleRsvpSilentEvent = (eventId) => {
    saveSilentEvents(silentClubEvents.map(e => {
      if (e.id !== eventId) return e;
      if (e.privacy === 'public') {
        if (e.attendees.some(a => a.id === user.id)) return e;
        return { ...e, attendees: [...e.attendees, { id: user.id, name: user.name, role: 'attendee' }] };
      } else {
        if ((e.pendingRequests || []).some(r => r.id === user.id)) return e;
        return { ...e, pendingRequests: [...(e.pendingRequests || []), { id: user.id, name: user.name, requestedAt: new Date().toISOString() }] };
      }
    }));
  };

  const handleApproveSilentRequest = (eventId, requesterId) => {
    saveSilentEvents(silentClubEvents.map(e => {
      if (e.id !== eventId) return e;
      const req = (e.pendingRequests || []).find(r => r.id === requesterId);
      if (!req) return e;
      return { ...e, attendees: [...e.attendees, { id: req.id, name: req.name, role: 'attendee' }], pendingRequests: e.pendingRequests.filter(r => r.id !== requesterId) };
    }));
  };

  const handleDenySilentRequest = (eventId, requesterId) => {
    saveSilentEvents(silentClubEvents.map(e => e.id !== eventId ? e : { ...e, pendingRequests: (e.pendingRequests || []).filter(r => r.id !== requesterId) }));
  };

  const handleUnrsvpSilentEvent = (eventId) => {
    saveSilentEvents(silentClubEvents.map(e => e.id !== eventId ? e : { ...e, attendees: e.attendees.filter(a => a.id !== user.id) }));
  };

  const formatEventDate = (dateStr, timeStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr + (timeStr ? 'T' + timeStr : ''));
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let result = d.toLocaleDateString('en-US', options);
    if (timeStr) result += ' at ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return result;
  };

  const handleShareEvent = (title, description) => {
    const url = window.location.origin;
    const shareText = `${title}\n${description}\n\nJoin me at The Book Lodge:`;
    const fullText = `${shareText} ${url}`;
    
    const copyFallback = () => {
      const ta = document.createElement('textarea');
      ta.value = fullText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Event details copied to clipboard! Share it with your friends.');
    };
    
    if (navigator.share) {
      navigator.share({ title, text: shareText, url }).catch(() => {});
    } else if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(fullText).then(() => {
        showToast('Event details copied to clipboard! Share it with your friends.');
      }).catch(copyFallback);
    } else {
      copyFallback();
    }
  };

  const myCircles = readingCircles.filter(c => c.hostId === user?.id);
  const mySilentEvents = silentClubEvents.filter(e => e.hostId === user?.id);

  // Connection request handlers
  const handleConnectionRequest = (targetUser) => {
    setConnectionTargetUser(targetUser);
    setShowConnectionRequest(true);
    setConnectionRequestData({ name: '', email: '', message: '' });
  };

  const handleSubmitConnectionRequest = async () => {
    if (!connectionRequestData.name.trim() || !connectionRequestData.email.trim()) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('requester_name', connectionRequestData.name);
      formData.append('requester_email', connectionRequestData.email);
      formData.append('message', connectionRequestData.message || 'No message provided');
      formData.append('target_user', connectionTargetUser.name);
      formData.append('_subject', `Book Lodge Connection Request from ${connectionRequestData.name}`);
      formData.append('_cc', 'thebooklodge.housekeeping@gmail.com'); // You get a copy too
      
      await fetch(`https://formsubmit.co/${connectionTargetUser.email}`, {
        method: 'POST',
        body: formData
      });
      
      showToast(`Your connection request has been sent to ${connectionTargetUser.name}!`);
      setShowConnectionRequest(false);
      setConnectionRequestData({ name: '', email: '', message: '' });
      setConnectionTargetUser(null);
    } catch (error) {
      console.error('Error sending connection request:', error);
      showToast('Connection request sent! They will receive your message shortly.');
      setShowConnectionRequest(false);
      setConnectionRequestData({ name: '', email: '', message: '' });
      setConnectionTargetUser(null);
    }
  };

  return (
    <div className="book-lodge">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@300;400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          /* Remove blinking cursor from non-input elements */
          caret-color: transparent;
        }

        input, textarea, [contenteditable] {
          caret-color: #D4AF37;
        }

        /* Remove text selection highlight on clickable elements */
        button, a, [role="button"] {
          user-select: none;
          -webkit-user-select: none;
          outline: none;
        }

        button:focus, a:focus {
          outline: none;
        }

        /* Book Lists */
        .book-list-section {
          max-width: 750px;
          margin: 2rem auto;
        }

        .book-list-card {
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .book-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .book-item:last-child {
          border-bottom: none;
        }

        .book-cover {
          width: 36px;
          height: 52px;
          object-fit: cover;
          border-radius: 3px;
          background: rgba(212, 175, 55, 0.1);
          flex-shrink: 0;
        }

        .book-search-results {
          background: rgba(10, 10, 10, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          margin-top: 0.5rem;
          overflow: hidden;
          max-height: 300px;
          overflow-y: auto;
        }

        .book-search-result {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .book-search-result:hover {
          background: rgba(212, 175, 55, 0.1);
        }

        body {
          overflow-x: hidden;
        }

        .book-lodge {
          min-height: 100vh;
          background: #0a0a0a;
          background-image: url('/lodge-bg.jpg');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
          font-family: 'Cormorant Garamond', serif;
          color: #E8E8E8;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
          padding: 1rem 2rem;
          z-index: 1000;
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
        }

        .branding {
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 768px) {
          .branding {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }

        .logo {
          font-family: 'Cinzel', serif;
          font-size: 1.8rem;
          color: #D4AF37;
          letter-spacing: 0.15em;
          margin-bottom: 0.2rem;
          white-space: nowrap;
        }

        .tagline {
          font-size: 0.9rem;
          color: #C0C0C0;
          font-style: italic;
          letter-spacing: 0.05em;
        }

        .nav {
          display: flex;
          gap: 2rem;
          align-items: center;
          margin-top: 3rem;
        }

        .nav-link {
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          color: #D4AF37;
          text-decoration: none;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem;
          border-bottom: 2px solid transparent;
          text-transform: uppercase;
          white-space: nowrap;
          user-select: none;
          outline: none;
          -webkit-user-select: none;
        }

        .nav-link:focus {
          outline: none;
        }

        .nav-link:hover,
        .nav-link.active {
          border-bottom: 2px solid #D4AF37;
        }

        .user-badge {
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          color: #D4AF37;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Content */
        .content {
          padding-top: 200px;
          min-height: 100vh;
        }

        /* Concierge */
        .concierge {
          max-width: 900px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .concierge-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .concierge-welcome {
          font-size: 0.95rem;
          color: #D4AF37;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 1.5rem;
          font-weight: 300;
        }

        .concierge-greeting {
          font-family: 'Cinzel', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          color: #E8E8E8;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
          white-space: nowrap;
        }

        .greeting-break {
          display: inline;
        }

        .concierge-intro {
          font-size: 1.2rem;
          color: #C0C0C0;
          font-weight: 300;
          line-height: 1.7;
          max-width: 650px;
          margin: 0 auto;
        }

        .chat-container {
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 2rem;
          max-height: 55vh;
          overflow-y: auto;
          margin-bottom: 1.5rem;
        }

        .message {
          margin-bottom: 1.5rem;
          padding: 1rem 1.2rem;
          border-radius: 8px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          background: rgba(212, 175, 55, 0.15);
          border-left: 3px solid #D4AF37;
          margin-left: 3rem;
        }

        .message.assistant {
          background: rgba(60, 55, 50, 0.4);
          border-left: 3px solid rgba(212, 175, 55, 0.5);
          margin-right: 3rem;
        }

        .message-content {
          font-size: 1.05rem;
          line-height: 1.7;
          white-space: pre-wrap;
        }

        .loading-dots {
          display: flex;
          gap: 0.5rem;
          padding: 1rem;
        }

        .loading-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D4AF37;
          animation: pulse 1.4s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }

        .input-section {
          display: flex;
          gap: 1rem;
        }

        .chat-input {
          flex: 1;
          padding: 1rem 1.5rem;
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          color: #E8E8E8;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .chat-input:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);
        }

        .send-button {
          padding: 1rem 2rem;
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 8px;
          color: #D4AF37;
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }

        .send-button:hover:not(:disabled) {
          background: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .subscription-status {
          text-align: center;
          margin-top: 1rem;
        }

        .trial-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(212, 175, 55, 0.15);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #D4AF37;
          font-size: 0.9rem;
        }

        .trial-expired {
          color: #ff6b6b;
          font-size: 0.9rem;
        }

        .message-counter {
          text-align: center;
          font-size: 0.9rem;
          color: #C0C0C0;
          margin-top: 1rem;
        }

        .counter-warning {
          color: #D4AF37;
          font-weight: 500;
        }

        .concierge-footer {
          text-align: center;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          color: #D4AF37;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 2rem;
          opacity: 0.8;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #888;
        }

        .empty-state-title {
          font-family: 'Cinzel', serif;
          font-size: 1.5rem;
          color: #D4AF37;
          margin-bottom: 1rem;
        }

        /* Guest Room */
        .guest-room {
          max-width: 1000px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .room-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .room-title {
          font-family: 'Cinzel', serif;
          font-size: clamp(2rem, 5vw, 3rem);
          color: #D4AF37;
          letter-spacing: 0.15em;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .room-name {
          font-size: 1.8rem;
          color: #E8E8E8;
          margin-bottom: 0.5rem;
        }

        .room-type {
          font-size: 0.95rem;
          color: #C0C0C0;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 1rem;
          fontFamily: 'Cinzel';
        }

        .room-bio {
          font-size: 1.1rem;
          color: #C0C0C0;
          max-width: 700px;
          margin: 0 auto 1.5rem;
          line-height: 1.6;
        }

        .profile-share-section {
          margin: 2rem auto;
          padding: 1.5rem;
          background: rgba(212, 175, 55, 0.1);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          max-width: 600px;
        }

        .share-label {
          font-family: 'Cinzel', serif;
          color: #D4AF37;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          text-align: center;
        }

        .share-link-container {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        .share-link-input {
          flex: 1;
          min-width: 200px;
          padding: 0.8rem 1rem;
          background: rgba(10, 10, 10, 0.8);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 6px;
          color: #D4AF37;
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.95rem;
          text-align: center;
        }

        .share-note {
          text-align: center;
          font-size: 0.85rem;
          color: #C0C0C0;
          margin-top: 0.8rem;
        }

        .room-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .btn {
          padding: 0.8rem 2rem;
          background: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.4);
          border-radius: 8px;
          color: #D4AF37;
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }

        .btn:hover {
          background: rgba(212, 175, 55, 0.3);
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: rgba(100, 100, 100, 0.2);
          border-color: rgba(150, 150, 150, 0.4);
          color: #C0C0C0;
        }

        .btn-primary {
          background: rgba(212, 175, 55, 0.3);
          border-color: #D4AF37;
          font-size: 1rem;
          padding: 1rem 2rem;
        }

        .room-section {
          margin-bottom: 4rem;
        }

        .section-title {
          font-family: 'Cinzel', serif;
          font-size: 1.8rem;
          color: #D4AF37;
          letter-spacing: 0.1em;
          margin-bottom: 2rem;
          text-align: center;
          text-transform: uppercase;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }

        .item-card {
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 2rem;
          transition: all 0.3s ease;
        }

        .item-card:hover {
          border-color: #D4AF37;
          transform: translateY(-5px);
        }

        .item-title {
          font-family: 'Cinzel', serif;
          font-size: 1.3rem;
          color: #D4AF37;
          margin-bottom: 0.5rem;
        }

        .item-author {
          font-size: 1rem;
          color: #C0C0C0;
          font-style: italic;
          margin-bottom: 0.5rem;
        }

        .item-description {
          font-size: 1rem;
          color: #C0C0C0;
          line-height: 1.6;
          margin-bottom: 1rem;
        }

        .item-link {
          color: #D4AF37;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .item-link:hover {
          text-decoration: underline;
        }

        /* Edit Mode */
        .edit-section {
          background: rgba(20, 20, 20, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-family: 'Cinzel', serif;
          color: #D4AF37;
          font-size: 0.9rem;
          letter-spacing: 0.1em;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(10, 10, 10, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 6px;
          color: #E8E8E8;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .form-textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
        }

        .item-edit-card {
          background: rgba(30, 30, 30, 0.6);
          border: 1px solid rgba(212, 175, 55, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          position: relative;
        }

        .remove-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(200, 50, 50, 0.3);
          border: 1px solid rgba(200, 50, 50, 0.5);
          color: #ff6b6b;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .modal {
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          padding: 3rem;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-title {
          font-family: 'Cinzel', serif;
          font-size: 2rem;
          color: #D4AF37;
          text-align: center;
          margin-bottom: 0.5rem;
          letter-spacing: 0.1em;
        }

        .modal-subtitle {
          text-align: center;
          color: #C0C0C0;
          margin-bottom: 2rem;
          font-style: italic;
        }

        .reservation-progress {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(212, 175, 55, 0.3);
          transition: all 0.3s ease;
        }

        .progress-dot.active {
          background: #D4AF37;
          transform: scale(1.3);
        }

        .role-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .role-option {
          padding: 1.5rem;
          background: rgba(20, 20, 20, 0.6);
          border: 2px solid rgba(212, 175, 55, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .role-option:hover {
          border-color: #D4AF37;
          transform: translateY(-2px);
        }

        .role-option.selected {
          background: rgba(212, 175, 55, 0.2);
          border-color: #D4AF37;
        }

        .role-name {
          font-family: 'Cinzel', serif;
          font-size: 1.2rem;
          color: #D4AF37;
          margin-bottom: 0.5rem;
        }

        .role-features {
          font-size: 0.9rem;
          color: #C0C0C0;
          line-height: 1.6;
        }

        .btn-note {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.75rem;
          color: #C0C0C0;
          font-weight: 300;
          letter-spacing: normal;
          margin-top: 0.3rem;
          text-transform: none;
        }

        /* Upgrade Modal */
        .upgrade-modal {
          max-width: 600px;
        }

        .pricing-box {
          background: rgba(212, 175, 55, 0.1);
          border: 2px solid #D4AF37;
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
          text-align: center;
        }

        .pricing-amount {
          font-family: 'Cinzel', serif;
          font-size: 3rem;
          color: #D4AF37;
          margin-bottom: 0.5rem;
        }

        .pricing-period {
          font-size: 1.2rem;
          color: #C0C0C0;
        }

        .pricing-features {
          list-style: none;
          padding: 0;
          margin: 1.5rem 0;
          text-align: left;
        }

        .pricing-features li {
          padding: 0.5rem 0;
          color: #E8E8E8;
          font-size: 1rem;
        }

        /* Visibility Toggle Styles */
        .visibility-toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid;
        }

        .visibility-toggle.private {
          background: rgba(100, 100, 100, 0.2);
          border-color: rgba(150, 150, 150, 0.4);
          color: #C0C0C0;
        }

        .visibility-toggle.public {
          background: rgba(212, 175, 55, 0.2);
          border-color: rgba(212, 175, 55, 0.4);
          color: #D4AF37;
        }

        .visibility-toggle:hover {
          transform: translateY(-1px);
        }

        .visibility-icon {
          font-size: 1rem;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 0.75rem 1rem 0.5rem;
          }

          .header-content {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }

          .logo {
            font-size: 1.2rem;
          }
          
          .tagline {
            font-size: 0.7rem;
          }

          .branding img {
            height: 80px;
          }

          .nav {
            display: none;
          }

          .content {
            padding-top: 160px;
          }
          
          .message.user {
            margin-left: 0.5rem;
          }
          
          .message.assistant {
            margin-right: 0.5rem;
          }
          
          .items-grid {
            grid-template-columns: 1fr;
          }

          .concierge {
            padding: 1.5rem 1rem;
          }

          .concierge-greeting {
            font-size: 1.6rem;
            white-space: normal;
          }

          .greeting-break {
            display: block;
          }

          .guest-room {
            padding: 1.5rem 1rem;
          }

          .hamburger-btn {
            display: block;
          }
        }

        /* Hamburger button - hidden on desktop */
        .hamburger-btn {
          display: none !important;
        }

        @media (max-width: 768px) {
          .hamburger-btn {
            display: block !important;
          }
        }

        /* Full-screen mobile menu */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(10, 10, 10, 0.97);
          z-index: 2000;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
        }

        .mobile-menu.open {
          display: flex;
        }

        .mobile-menu-link {
          font-family: 'Cinzel', serif;
          font-size: 1.4rem;
          color: #D4AF37;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 1.2rem 2rem;
          border-bottom: 1px solid rgba(212, 175, 55, 0.15);
          width: 80%;
          text-align: center;
          transition: all 0.3s ease;
          user-select: none;
        }

        .mobile-menu-link:active {
          background: rgba(212, 175, 55, 0.1);
        }

        .mobile-menu-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: transparent;
          border: none;
          color: #D4AF37;
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
          padding: 0.5rem;
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="branding">
            <img 
              src="/booklodge-logo.png" 
              alt="The Book Lodge" 
              style={{
                height: '150px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
          
          {/* Sign In button - shown when logged out */}
          {!user && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => { setSignInData({ email: '', password: '' }); setSignInError(''); setShowSignIn(true); }}
                style={{
                  padding: '0.35rem 0.9rem',
                  background: 'transparent',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '4px',
                  color: '#D4AF37',
                  cursor: 'pointer',
                  fontFamily: 'Cinzel',
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(212, 175, 55, 0.15)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
              >
                Sign In
              </button>
            </div>
          )}

          {/* User Info - Top Right Corner */}
          {user && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '0.4rem'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <ProfileImage size={24} fontSize="0.75rem" />
                <div style={{
                  fontFamily: 'Cinzel',
                  fontSize: '0.75rem',
                  color: '#D4AF37',
                  letterSpacing: '0.05em',
                  whiteSpace: 'nowrap'
                }}>
                  {user.name}
                  {user.isPaid && user.userType === 'pro' && (
                    <span style={{
                      marginLeft: '0.5rem',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '4px',
                      fontSize: '0.65rem'
                    }}>PRO</span>
                  )}
                </div>
              </div>
              <button 
                onClick={handleLogout}
                style={{
                  padding: '0.25rem 0.6rem',
                  background: 'transparent',
                  border: '1px solid rgba(150, 150, 150, 0.3)',
                  borderRadius: '4px',
                  color: '#C0C0C0',
                  cursor: 'pointer',
                  fontFamily: 'Cinzel',
                  fontSize: '0.65rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = 'rgba(212, 175, 55, 0.5)';
                  e.target.style.color = '#D4AF37';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = 'rgba(150, 150, 150, 0.3)';
                  e.target.style.color = '#C0C0C0';
                }}
              >
                Logout
              </button>
            </div>
          )}

          {/* Nav - desktop only */}
          {!isMobile && (
            <div className="nav">
              <a className={`nav-link ${currentRoom === 0 ? 'active' : ''}`} onClick={() => setCurrentRoom(0)}>Concierge</a>
              <a className={`nav-link ${currentRoom === 1 ? 'active' : ''}`} onClick={() => setCurrentRoom(1)}>Guest Room</a>
              <a className={`nav-link ${currentRoom === 2 ? 'active' : ''}`} onClick={() => setCurrentRoom(2)}>Fireside Lounge</a>
              <a className={`nav-link ${currentRoom === 3 ? 'active' : ''}`} onClick={() => setCurrentRoom(3)}>Library</a>
            </div>
          )}

          {/* Hamburger button - mobile only, top left */}
          {isMobile && (
            <button
              onClick={() => setShowMobileMenu(true)}
              style={{
                position: 'fixed',
                top: '1.2rem',
                left: '1rem',
                zIndex: 1001,
                background: 'transparent',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '6px',
                padding: '0.5rem 0.8rem',
                cursor: 'pointer',
                color: '#D4AF37',
                fontSize: '1.4rem',
                lineHeight: 1
              }}
            >
              ☰
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${showMobileMenu ? 'open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setShowMobileMenu(false)}>✕</button>
        <div className="mobile-menu-link" onClick={() => { setCurrentRoom(0); setShowMobileMenu(false); }}>Concierge</div>
        <div className="mobile-menu-link" onClick={() => { setCurrentRoom(1); setShowMobileMenu(false); }}>Guest Room</div>
        <div className="mobile-menu-link" onClick={() => { setCurrentRoom(2); setShowMobileMenu(false); }}>Fireside Lounge</div>
        <div className="mobile-menu-link" onClick={() => { setCurrentRoom(3); setShowMobileMenu(false); }}>Library</div>
      </div>

      {/* Main Content */}
      <div className="content">
        {currentRoom === 0 && (
          <div className="concierge">
            <div className="concierge-header">
              <p className="concierge-welcome">Home to writers, readers, and pros.</p>
              <h1 className="concierge-greeting">
                <span style={{whiteSpace: 'nowrap'}}>Hello, Lodger.</span>
                <span className="greeting-break"> </span>
                <span style={{whiteSpace: 'nowrap'}}>Welcome Home.</span>
              </h1>
            </div>

            <div className="chat-container">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <p className="empty-state-title">Hello, I'm Wells</p>
                  <p style={{marginBottom: '1rem'}}>
                    I'm your literary companion. Whether you're here to write, read, or work in the industry—I'm here to support your journey. How can I help you today?
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}
                      ref={index === messages.length - 1 ? latestMessageRef : null}
                    >
                      <div className="message-content">{message.content}</div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="loading-dots" ref={latestMessageRef}>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="input-section">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask Wells for writing encouragement, book recs, and more..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isLoading}
              />
              <button 
                className="send-button"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                Send
              </button>
            </div>
            
            {/* Status indicator */}
            {user && (
              <div className="subscription-status">
                {trialDaysRemaining !== null && trialDaysRemaining > 0 && !user.isPaid && (
                  <div className="trial-badge">
                    ✨ {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left in your trial • <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setShowUpgradeModal(true)}>Reserve Your Room</span>
                  </div>
                )}
                {trialDaysRemaining === 0 && !user.isPaid && (
                  <div className="trial-expired">
                    Trial ended • <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => setShowUpgradeModal(true)}>Reserve Your Room</span>
                  </div>
                )}
                {user.isPaid && user.userType !== 'pro' && (
                  <div className="message-counter">
                    {messageCount}/{getMessageLimit()} messages this month
                    {messageCount >= getMessageLimit() - 20 && messageCount < getMessageLimit() && (
                      <span className="counter-warning"> • Running low!</span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {!user && (
              <div className="message-counter">
                {messageCount}/3 free messages • <span style={{cursor: 'pointer', textDecoration: 'underline'}} onClick={() => { setReservationStep(0); setShowReservation(true); }}>Reserve your room for more</span>
              </div>
            )}
            
            <p className="concierge-footer">Your Literary Companion</p>

            {/* Housekeeping Button */}
            <div style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingBottom: '1rem',
              cursor: 'pointer',
              color: '#D4AF37',
              fontFamily: 'Cinzel',
              letterSpacing: '0.1em',
              fontSize: '0.85rem',
              textDecoration: 'underline',
              transition: 'opacity 0.3s ease',
              opacity: 0.7
            }}
            onClick={() => setShowFeedback(true)}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              HOUSEKEEPING
            </div>
          </div>
        )}

        {currentRoom === 1 && !user && (
          <div className="guest-room">
            <div className="room-header">
              <h1 className="room-title">GUEST ROOM</h1>
              <p style={{fontSize: '1.2rem', color: '#C0C0C0', maxWidth: '700px', margin: '0 auto 1rem', lineHeight: 1.6}}>
                Welcome to your Guest Room. Every guest at The Book Lodge has their own room.
              </p>
              <p style={{fontSize: '1.1rem', color: '#C0C0C0', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6}}>
                Your room is where you showcase your work, keep your reading lists, and make yourself at home.
              </p>
              <p style={{fontSize: '1.15rem', color: '#D4AF37', marginBottom: '2rem'}}>
                Tell me, are you a reader, writer, or industry professional?
              </p>
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto 3rem'}}>
                <div 
                  onClick={() => {
                    setReservationData({...reservationData, userType: 'reader', proRole: ''});
                    setReservationStep(1);
                    setShowReservation(true);
                  }}
                  style={{
                    padding: '2rem',
                    background: 'rgba(20, 20, 20, 0.6)',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3 style={{fontFamily: 'Cinzel', fontSize: '1.3rem', color: '#D4AF37', marginBottom: '1rem', textAlign: 'center'}}>Reader</h3>
                  <p style={{color: '#C0C0C0', lineHeight: 1.6, fontSize: '0.95rem', textAlign: 'center'}}>
                    Discover books, track your reading, and share recommendations with fellow book lovers.
                  </p>
                </div>
                
                <div 
                  onClick={() => {
                    setReservationData({...reservationData, userType: 'writer', proRole: ''});
                    setReservationStep(1);
                    setShowReservation(true);
                  }}
                  style={{
                    padding: '2rem',
                    background: 'rgba(20, 20, 20, 0.6)',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3 style={{fontFamily: 'Cinzel', fontSize: '1.3rem', color: '#D4AF37', marginBottom: '1rem', textAlign: 'center'}}>Writer</h3>
                  <p style={{color: '#C0C0C0', lineHeight: 1.6, fontSize: '0.95rem', textAlign: 'center'}}>
                    Showcase your work, track your projects, and connect with readers and industry professionals.
                  </p>
                </div>
                
                <div 
                  onClick={() => {
                    setReservationData({...reservationData, userType: 'pro'});
                    setReservationStep(1);
                    setShowReservation(true);
                  }}
                  style={{
                    padding: '2rem',
                    background: 'rgba(20, 20, 20, 0.6)',
                    border: '2px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#D4AF37';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3 style={{fontFamily: 'Cinzel', fontSize: '1.3rem', color: '#D4AF37', marginBottom: '1rem', textAlign: 'center'}}>Industry Pro</h3>
                  <p style={{color: '#C0C0C0', lineHeight: 1.6, fontSize: '0.95rem', textAlign: 'center'}}>
                    Showcase your professional work and connect with writers seeking your expertise.
                  </p>
                </div>
              </div>
            </div>

            {/* Preview sections - what their room could look like */}
            <div style={{opacity: 0.4}}>
              <div className="room-section">
                <h2 className="section-title">Favorite Books</h2>
                <div className="items-grid">
                  <div className="item-card" style={{opacity: 0.5}}>
                    <h3 className="item-title">Your books will appear here</h3>
                    <p className="item-description">Share the stories that moved you</p>
                  </div>
                  <div className="item-card" style={{opacity: 0.3}}>
                    <h3 className="item-title">Build your collection</h3>
                    <p className="item-description">Track what you love</p>
                  </div>
                </div>
              </div>

              <div className="room-section">
                <h2 className="section-title">Published Works</h2>
                <div className="items-grid">
                  <div className="item-card" style={{opacity: 0.5}}>
                    <h3 className="item-title">Your work will shine here</h3>
                    <p className="item-description">Showcase what you've created</p>
                  </div>
                  <div className="item-card" style={{opacity: 0.3}}>
                    <h3 className="item-title">Share your stories</h3>
                    <p className="item-description">Let readers discover you</p>
                  </div>
                </div>
              </div>

              <div className="room-section">
                <h2 className="section-title">Works in Progress</h2>
                <div className="items-grid">
                  <div className="item-card" style={{opacity: 0.5}}>
                    <h3 className="item-title">Track your projects</h3>
                    <p className="item-description">Keep your WIPs organized</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRoom === 1 && user && (
          <div className="guest-room">
            {!user.isPaid && trialDaysRemaining === 0 ? (
              <div className="room-locked" style={{maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem'}}>
                <h1 className="room-title">GUEST ROOM</h1>
                <div style={{background: 'rgba(20, 20, 20, 0.6)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '12px', padding: '3rem 2rem'}}>
                  <div style={{fontSize: '4rem', marginBottom: '1.5rem'}}>🔒</div>
                  <h2 style={{fontFamily: 'Cinzel', color: '#D4AF37', marginBottom: '1rem'}}>
                    Your trial has ended
                  </h2>
                  <p style={{color: '#C0C0C0', marginBottom: '2rem', lineHeight: 1.6}}>
                    Reserve your room to keep your Guest Room and continue chatting with Wells.
                  </p>
                  <button className="btn btn-primary" onClick={() => setShowUpgradeModal(true)}>
                    Reserve Your Room
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="room-header">
                  <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem'}}>
                    <ProfileImage size={120} fontSize="3rem" />
                  </div>
                  <div className="room-name">{user.name}'s</div>
                  <h1 className="room-title">GUEST ROOM</h1>
                  <div className="room-type">
                    {user.userType === 'writer' && 'WRITER'}
                    {user.userType === 'reader' && 'READER'}
                    {user.userType === 'pro' && `${(user.proRole || 'Industry Professional').toUpperCase()}`}
                    {user.isPaid && user.userType === 'pro' && (
                      <span style={{
                        marginLeft: '0.8rem',
                        padding: '0.3rem 0.8rem',
                        background: 'rgba(212, 175, 55, 0.2)',
                        border: '1px solid rgba(212, 175, 55, 0.5)',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        letterSpacing: '0.1em',
                        fontFamily: 'Cinzel'
                      }}>VERIFIED PRO</span>
                    )}
                  </div>
                  {user.bio && <div className="room-bio">{user.bio}</div>}

                  {/* At-a-Glance Identity Card */}
                  {((user.genres && user.genres.length > 0) || (user.themes && user.themes.length > 0) || (user.lookingFor && user.lookingFor.length > 0)) && (
                    <div style={{
                      maxWidth: '750px',
                      margin: '1.5rem auto',
                      padding: '2rem',
                      background: 'rgba(20, 20, 20, 0.5)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '12px'
                    }}>
                      {user.genres && user.genres.length > 0 && (
                        <div style={{marginBottom: '1.2rem'}}>
                          <div style={{
                            fontFamily: 'Cinzel', fontSize: '0.75rem', color: '#D4AF37',
                            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.6rem'
                          }}>
                            {user.userType === 'reader' ? 'Genres I Love' : user.userType === 'pro' ? 'Genres I Work In' : 'Genres I Write'}
                          </div>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.4rem'}}>
                            {user.genres.map(genre => (
                              <span key={genre} style={{
                                padding: '0.3rem 0.8rem', background: 'rgba(212, 175, 55, 0.12)',
                                border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px',
                                fontSize: '0.85rem', color: '#D4AF37'
                              }}>{genre}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.themes && user.themes.length > 0 && (
                        <div style={{marginBottom: '1.2rem'}}>
                          <div style={{
                            fontFamily: 'Cinzel', fontSize: '0.75rem', color: '#C0C0C0',
                            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.6rem'
                          }}>
                            Themes & Tropes
                          </div>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.4rem'}}>
                            {user.themes.map(theme => (
                              <span key={theme} style={{
                                padding: '0.3rem 0.8rem', background: 'rgba(192, 192, 192, 0.08)',
                                border: '1px solid rgba(192, 192, 192, 0.25)', borderRadius: '20px',
                                fontSize: '0.85rem', color: '#C0C0C0'
                              }}>{theme}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {user.lookingFor && user.lookingFor.length > 0 && (
                        <div>
                          <div style={{
                            fontFamily: 'Cinzel', fontSize: '0.75rem', color: '#D4AF37',
                            letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.6rem'
                          }}>
                            {user.userType === 'pro' ? 'Open To' : 'Looking For'}
                          </div>
                          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.4rem'}}>
                            {user.lookingFor.map(item => (
                              <span key={item} style={{
                                padding: '0.3rem 0.8rem', background: 'rgba(120, 140, 90, 0.15)',
                                border: '1px solid rgba(120, 140, 90, 0.4)', borderRadius: '20px',
                                fontSize: '0.85rem', color: '#9BA97C'
                              }}>{item}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Website - visible to all users */}
                  {roomData.website && (
                    <div style={{textAlign: 'center', margin: '1.5rem auto', maxWidth: '750px'}}>
                      <a 
                        href={roomData.website.startsWith('http') ? roomData.website : `https://${roomData.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.6rem',
                          padding: '0.8rem 1.8rem',
                          background: 'rgba(212, 175, 55, 0.1)',
                          border: '1px solid rgba(212, 175, 55, 0.4)',
                          borderRadius: '8px',
                          color: '#D4AF37',
                          textDecoration: 'none',
                          fontSize: '1.05rem',
                          fontFamily: 'Cinzel',
                          letterSpacing: '0.05em',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; }}
                      >
                        Visit My Website →
                      </a>
                    </div>
                  )}

                  {user.isPaid && (
                    <>
                      <div className="profile-share-section">
                        <div className="share-label">Your Profile Link:</div>
                        <div className="share-link-container">
                          <input 
                            type="text" 
                            className="share-link-input" 
                            value={getProfileUrl()} 
                            readOnly 
                          />
                          <button className="btn" style={{padding: '0.8rem 1.5rem'}} onClick={copyProfileLink}>
                            📋 Copy
                          </button>
                        </div>
                        <p className="share-note">Share this link to showcase your work</p>
                      </div>
                    </>
                  )}

                  <div className="room-actions">
                    {!isEditingRoom ? (
                      <>
                        <button className="btn" onClick={() => setIsEditingRoom(true)}>
                          Edit Room
                        </button>
                        <button className="btn btn-secondary" onClick={() => setShowShareRoom(true)} style={{marginLeft: '0.75rem'}}>
                          🔗 Share Room
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="btn" onClick={handleSaveRoom}>
                          Save Changes
                        </button>
                        <button className="btn btn-secondary" onClick={() => setIsEditingRoom(false)}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditingRoom ? (
                  <div>
                    {/* Edit Name Section */}
                    <div className="edit-section">
                      <h3 className="section-title">Your Name</h3>
                      <div className="form-group">
                        <label className="form-label">Display Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={user.name}
                          onChange={(e) => {
                            const updatedUser = { ...user, name: e.target.value };
                            setUser(updatedUser);
                          }}
                          placeholder="Your name"
                          style={{textAlign: 'center', fontSize: '1.1rem'}}
                        />
                        <p style={{color: '#888', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center'}}>
                          This is how your name appears on your room
                        </p>
                      </div>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="edit-section" style={{textAlign: 'center'}}>
                      <h3 className="section-title">Profile Image</h3>
                      <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem'}}>
                        <ProfileImage size={120} fontSize="3rem" />
                      </div>
                      {user.profileImage ? (
                        <div style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
                          <label className="btn" style={{cursor: 'pointer', display: 'inline-block'}}>
                            Change Photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageUpload}
                              style={{display: 'none'}}
                            />
                          </label>
                          <button 
                            className="btn btn-secondary"
                            onClick={handleRemoveProfileImage}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="btn" style={{cursor: 'pointer', display: 'inline-block'}}>
                          Upload Photo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            style={{display: 'none'}}
                          />
                        </label>
                      )}
                      <p style={{color: '#888', fontSize: '0.85rem', marginTop: '0.8rem'}}>
                        Square images work best. We'll crop and resize automatically.
                      </p>
                    </div>

                    {/* Edit Bio Section */}
                    <div className="edit-section">
                      <h3 className="section-title">
                        {user.userType === 'writer' ? 'Why You Write' : user.userType === 'reader' ? 'Why You Read' : 'Why You Do What You Do'}
                      </h3>
                      <div className="form-group">
                        <label className="form-label">Your Story</label>
                        <textarea
                          className="form-textarea"
                          value={user.bio || ''}
                          onChange={(e) => {
                            const updatedUser = { ...user, bio: e.target.value };
                            setUser(updatedUser);
                          }}
                          placeholder={user.userType === 'writer' 
                            ? "What drives you to write? What's your mission?" 
                            : user.userType === 'reader'
                            ? "What draws you to books? What are you looking for?"
                            : "What drives your work in the literary world?"}
                          style={{minHeight: '120px'}}
                        />
                        <p style={{color: '#888', fontSize: '0.85rem', marginTop: '0.5rem', textAlign: 'center'}}>
                          This appears on your profile in the Fireside Lounge
                        </p>
                      </div>
                    </div>

                    {getRoomSections().map(section => (
                      <div key={section.key} className="edit-section">
                        <h3 className="section-title">{section.title}</h3>
                        
                        {(roomData[section.key] || []).map(item => (
                          <div key={item.id} className="item-edit-card">
                            <button 
                              className="remove-button"
                              onClick={() => removeItem(section.key, item.id)}
                            >
                              Remove
                            </button>
                            
                            {/* Visibility Toggle - Only for WIP items */}
                            {section.key === 'wips' && (
                              <div style={{marginBottom: '1rem'}}>
                                <label className="form-label">Visibility</label>
                                <div
                                  className={`visibility-toggle ${item.visibility || 'private'}`}
                                  onClick={() => toggleItemVisibility(section.key, item.id)}
                                >
                                  <span className="visibility-icon">
                                    {(item.visibility || 'private') === 'private' ? '🔒' : '🌐'}
                                  </span>
                                  <span>
                                    {(item.visibility || 'private') === 'private' ? 'Private - Only you can see' : 'Public - Visible to all'}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {section.fields.includes('title') && (
                              <div className="form-group">
                                <label className="form-label">Title</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={item.title}
                                  onChange={(e) => updateItem(section.key, item.id, 'title', e.target.value)}
                                  placeholder="Title"
                                />
                              </div>
                            )}
                            
                            {section.fields.includes('author') && (
                              <div className="form-group">
                                <label className="form-label">Author</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={item.author}
                                  onChange={(e) => updateItem(section.key, item.id, 'author', e.target.value)}
                                  placeholder="Author name"
                                />
                              </div>
                            )}
                            
                            {section.fields.includes('description') && (
                              <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                  className="form-textarea"
                                  value={item.description}
                                  onChange={(e) => updateItem(section.key, item.id, 'description', e.target.value)}
                                  placeholder="Description or notes"
                                />
                              </div>
                            )}
                            
                            {section.fields.includes('link') && (
                              <div className="form-group">
                                <label className="form-label">Link (Optional)</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={item.link}
                                  onChange={(e) => updateItem(section.key, item.id, 'link', e.target.value)}
                                  placeholder="https://..."
                                />
                              </div>
                            )}
                            
                            {/* Content field for Short Stories, Poetry, Essays */}
                            {section.fields.includes('content') && (
                              <div className="form-group">
                                <label className="form-label">
                                  {section.key === 'poetry' ? 'Poem' : section.key === 'shortStories' ? 'Story' : 'Article'} Content
                                </label>
                                <textarea
                                  className="form-textarea"
                                  value={item.content || ''}
                                  onChange={(e) => updateItem(section.key, item.id, 'content', e.target.value)}
                                  placeholder="Paste or type your work here..."
                                  style={{minHeight: '400px', fontFamily: 'Georgia, serif', lineHeight: 1.8}}
                                />
                                <p style={{fontSize: '0.85rem', color: '#888', marginTop: '0.5rem'}}>
                                  Readers will see the first 100 words, then can click to read the full piece.
                                </p>
                              </div>
                            )}
                            
                            {/* Cover Image Upload - For Published Works and WIPs */}
                            {(section.key === 'publishedWorks' || section.key === 'wips') && (
                              <div className="form-group">
                                <label className="form-label">Book Cover (Optional)</label>
                                {item.coverImage ? (
                                  <div style={{
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '8px',
                                    padding: '1rem'
                                  }}>
                                    <img 
                                      src={item.coverImage.data} 
                                      alt="Book cover"
                                      style={{
                                        width: '100%',
                                        maxWidth: '200px',
                                        height: 'auto',
                                        borderRadius: '4px',
                                        marginBottom: '0.5rem',
                                        display: 'block',
                                        marginLeft: 'auto',
                                        marginRight: 'auto'
                                      }}
                                    />
                                    <button
                                      onClick={() => handleRemoveCoverImage(section.key, item.id)}
                                      style={{
                                        background: 'rgba(200, 50, 50, 0.2)',
                                        border: '1px solid rgba(200, 50, 50, 0.4)',
                                        borderRadius: '6px',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        color: '#ff6b6b',
                                        width: '100%'
                                      }}
                                    >
                                      Remove Cover
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleCoverImageUpload(e, section.key, item.id)}
                                      style={{ display: 'none' }}
                                      id={`cover-upload-${item.id}`}
                                    />
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => document.getElementById(`cover-upload-${item.id}`).click()}
                                      style={{width: '100%'}}
                                    >
                                      Upload Book Cover
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                            
                            {/* PDF Upload - Only for WIP items */}
                            {section.key === 'wips' && (
                              <div className="form-group">
                                <label className="form-label">Upload PDF (Optional)</label>
                                {item.uploadedPdf ? (
                                  <div style={{
                                    background: 'rgba(212, 175, 55, 0.1)',
                                    border: '1px solid rgba(212, 175, 55, 0.3)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    marginBottom: '0.5rem'
                                  }}>
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                      <div>
                                        <div style={{color: '#D4AF37', marginBottom: '0.3rem'}}>📄 {item.uploadedPdf.name}</div>
                                        <div style={{fontSize: '0.85rem', color: '#888'}}>{formatFileSize(item.uploadedPdf.size)}</div>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveWipPdf(section.key, item.id)}
                                        style={{
                                          background: 'rgba(200, 50, 50, 0.2)',
                                          border: '1px solid rgba(200, 50, 50, 0.4)',
                                          borderRadius: '6px',
                                          padding: '0.5rem',
                                          cursor: 'pointer',
                                          color: '#ff6b6b'
                                        }}
                                      >
                                        Remove PDF
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <input
                                      type="file"
                                      accept="application/pdf"
                                      onChange={(e) => handleWipPdfUpload(e, section.key, item.id)}
                                      style={{ display: 'none' }}
                                      id={`pdf-upload-${item.id}`}
                                    />
                                    <button
                                      className="btn btn-secondary"
                                      onClick={() => document.getElementById(`pdf-upload-${item.id}`).click()}
                                      style={{width: '100%'}}
                                    >
                                      Upload PDF
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <button className="btn" onClick={() => addItem(section.key)}>
                          + Add Item
                        </button>
                      </div>
                    ))}

                    <div className="edit-section">
                      <h3 className="section-title">Your Website</h3>
                      <div className="form-group">
                        <label className="form-label">Website URL (Optional)</label>
                        <input
                          type="text"
                          className="form-input"
                          value={roomData.website || ''}
                          onChange={(e) => setRoomData({...roomData, website: e.target.value})}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                      {roomData.website && (
                        <div style={{marginTop: '1rem', textAlign: 'center'}}>
                          <p style={{color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem'}}>Preview:</p>
                          <a 
                            href={roomData.website.startsWith('http') ? roomData.website : `https://${roomData.website}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              padding: '0.8rem 1.8rem',
                              background: 'rgba(212, 175, 55, 0.1)',
                              border: '1px solid rgba(212, 175, 55, 0.4)',
                              borderRadius: '8px',
                              color: '#D4AF37',
                              textDecoration: 'none',
                              fontSize: '1.05rem',
                              fontFamily: 'Cinzel',
                              letterSpacing: '0.05em'
                            }}
                          >
                            Visit My Website →
                          </a>
                        </div>
                      )}
                    </div>

                    {/* I Would Like to Meet - Edit Mode */}
                    <div className="edit-section">
                      <h3 className="section-title">I Would Like to Meet</h3>
                      {user.userType === 'reader' ? (
                        <>
                          <p style={{
                            color: '#C0C0C0', textAlign: 'center', marginBottom: '1rem', 
                            lineHeight: 1.7, fontStyle: 'italic'
                          }}>
                            You're not just a reader here — you're a discoverer. The Lodge is home to debut novelists, indie authors, poets finding their voice, and storytellers who are writing the books you haven't found yet.
                          </p>
                          <p style={{
                            color: '#D4AF37', textAlign: 'center', marginBottom: '1.5rem', 
                            lineHeight: 1.7, fontFamily: 'Cinzel', fontSize: '0.95rem', letterSpacing: '0.05em'
                          }}>
                            Writers are waiting to hear from you.
                          </p>
                          <p style={{
                            color: '#C0C0C0', textAlign: 'center', marginBottom: '1.5rem', 
                            lineHeight: 1.7, fontSize: '0.95rem'
                          }}>
                            What kind of voices are you looking for? What stories do you wish existed? Who would you love to sit across from at the fireside?
                          </p>
                          <div className="form-group">
                            <label className="form-label">Voices I'm Seeking</label>
                            <textarea
                              className="form-textarea"
                              value={roomData.lookingToMeet || ''}
                              onChange={(e) => setRoomData({...roomData, lookingToMeet: e.target.value})}
                              placeholder={"e.g., I'm drawn to literary fiction with a spiritual undercurrent — writers exploring faith, doubt, and beauty. I'd love to find debut authors in historical fiction, poets who write about the ordinary sacred, or anyone writing the kind of quiet, powerful stories that stay with you for years."}
                              style={{minHeight: '150px', lineHeight: 1.7}}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <p style={{
                            color: '#C0C0C0', textAlign: 'center', marginBottom: '1.5rem', 
                            lineHeight: 1.6, fontStyle: 'italic'
                          }}>
                            The Lodge is full of incredible people — writers, developmental editors, cover designers, critique partners, beta readers, agents, and more. 
                            Who are you hoping to meet here? What kind of connections would help your journey?
                          </p>
                          <div className="form-group">
                            <label className="form-label">Who I'm Looking For</label>
                            <textarea
                              className="form-textarea"
                              value={roomData.lookingToMeet || ''}
                              onChange={(e) => setRoomData({...roomData, lookingToMeet: e.target.value})}
                              placeholder={"e.g., I'm looking for a critique partner who writes literary fiction, a developmental editor experienced with historical novels, or fellow writers exploring themes of identity and belonging. I'd also love to connect with cover designers who specialize in clean, classic aesthetics."}
                              style={{minHeight: '150px', lineHeight: 1.7}}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Beta Readers List - Only for Writers */}
                    {user.userType === 'writer' && roomData.betaReaders && roomData.betaReaders.length > 0 && (
                      <div className="edit-section">
                        <h3 className="section-title">Beta Readers</h3>
                        <p style={{color: '#C0C0C0', marginBottom: '1rem', textAlign: 'center'}}>
                          People who signed up to read your work
                        </p>
                        
                        <button 
                          className="btn"
                          onClick={handleExportBetaReaders}
                          style={{width: '100%', marginBottom: '1.5rem'}}
                        >
                          Download as CSV
                        </button>

                        <div style={{display: 'grid', gap: '1rem'}}>
                          {roomData.betaReaders.map(reader => (
                            <div key={reader.id} style={{
                              background: 'rgba(20, 20, 20, 0.6)',
                              border: '1px solid rgba(212, 175, 55, 0.2)',
                              borderRadius: '8px',
                              padding: '1rem',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <div>
                                <div style={{color: '#D4AF37', marginBottom: '0.3rem'}}>{reader.name}</div>
                                <div style={{fontSize: '0.9rem', color: '#C0C0C0', marginBottom: '0.2rem'}}>{reader.email}</div>
                                <div style={{fontSize: '0.8rem', color: '#888'}}>
                                  {reader.wipTitle} • {new Date(reader.signedUpAt).toLocaleDateString()}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveBetaReader(reader.id)}
                                style={{
                                  background: 'rgba(200, 50, 50, 0.2)',
                                  border: '1px solid rgba(200, 50, 50, 0.4)',
                                  borderRadius: '6px',
                                  padding: '0.5rem',
                                  cursor: 'pointer',
                                  color: '#ff6b6b'
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reader List - People who read short stories/poetry/essays */}
                    {user.userType === 'writer' && roomData.readerList && roomData.readerList.length > 0 && (
                      <div className="edit-section">
                        <h3 className="section-title">Reader List</h3>
                        <p style={{color: '#C0C0C0', marginBottom: '1rem', textAlign: 'center'}}>
                          Readers who accessed your stories, poems, and essays
                        </p>
                        
                        <button 
                          className="btn"
                          onClick={exportReaderList}
                          style={{width: '100%', marginBottom: '1.5rem'}}
                        >
                          Download as CSV
                        </button>

                        <div style={{display: 'grid', gap: '1rem'}}>
                          {roomData.readerList.map(reader => (
                            <div key={reader.id} style={{
                              background: 'rgba(20, 20, 20, 0.6)',
                              border: '1px solid rgba(212, 175, 55, 0.2)',
                              borderRadius: '8px',
                              padding: '1rem'
                            }}>
                              <div style={{color: '#D4AF37', marginBottom: '0.3rem'}}>{reader.name}</div>
                              <div style={{fontSize: '0.9rem', color: '#C0C0C0', marginBottom: '0.2rem'}}>{reader.email}</div>
                              <div style={{fontSize: '0.8rem', color: '#888'}}>
                                Read: "{reader.pieceTitle}" • {new Date(reader.date).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ========== BOOK CLUBS SECTION (Edit Mode) ========== */}
                    <div className="edit-section">
                      <h3 className="section-title">Book Clubs</h3>
                      <p style={{color: '#C0C0C0', marginBottom: '1.5rem', textAlign: 'center', lineHeight: 1.6}}>
                        Host reading circles and silent book club events from your room.
                      </p>

                      {/* My Reading Circles */}
                      <div style={{marginBottom: '2rem'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                          <label className="form-label" style={{margin: 0}}>My Reading Circles</label>
                          <button className="btn" onClick={() => setShowCreateCircle(true)} style={{padding: '0.4rem 1rem', fontSize: '0.8rem'}}>
                            + New Circle
                          </button>
                        </div>

                        {myCircles.length === 0 ? (
                          <p style={{color: '#888', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem'}}>
                            No reading circles yet. Create one to gather readers around a book.
                          </p>
                        ) : (
                          <div style={{display: 'grid', gap: '1rem'}}>
                            {myCircles.map(circle => (
                              <div key={circle.id} className="item-edit-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                  <div>
                                    <div style={{fontFamily: 'Cinzel', fontSize: '1.1rem', color: '#D4AF37', marginBottom: '0.3rem'}}>{circle.name}</div>
                                    <div style={{fontSize: '0.9rem', color: '#C0C0C0', fontStyle: 'italic'}}>Reading: {circle.bookTitle}</div>
                                    <div style={{fontSize: '0.85rem', color: '#888', marginTop: '0.3rem'}}>
                                      {circle.members.length} member{circle.members.length !== 1 ? 's' : ''} · {circle.privacy}
                                      {circle.meetingDate && (' · Next: ' + formatEventDate(circle.meetingDate, circle.meetingTime))}
                                    </div>
                                    {circle.pendingRequests.length > 0 && (
                                      <div style={{fontSize: '0.85rem', color: '#D4AF37', marginTop: '0.3rem'}}>
                                        {circle.pendingRequests.length} pending request{circle.pendingRequests.length !== 1 ? 's' : ''}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button className="btn" onClick={(e) => { e.stopPropagation(); handleShareEvent(
                                      circle.name,
                                      `Reading Circle: "${circle.bookTitle}"${circle.meetingDate ? '\n' + formatEventDate(circle.meetingDate, circle.meetingTime) : ''}${circle.description ? '\n' + circle.description : ''}`
                                    ); }} style={{padding: '0.3rem 0.8rem', fontSize: '0.75rem'}}>
                                      Share
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setActiveCircleId(circle.id)} style={{padding: '0.3rem 0.8rem', fontSize: '0.75rem'}}>
                                      Manage
                                    </button>
                                    <button onClick={() => handleDeleteCircle(circle.id)} style={{
                                      padding: '0.3rem 0.8rem', fontSize: '0.75rem', background: 'rgba(200,50,50,0.2)', border: '1px solid rgba(200,50,50,0.4)', borderRadius: '6px', color: '#ff6b6b', cursor: 'pointer'
                                    }}>
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* My Silent Book Club Events */}
                      <div>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                          <label className="form-label" style={{margin: 0}}>My Silent Book Club Events</label>
                          <button className="btn" onClick={() => setShowCreateSilentEvent(true)} style={{padding: '0.4rem 1rem', fontSize: '0.8rem'}}>
                            + New Event
                          </button>
                        </div>

                        {mySilentEvents.length === 0 ? (
                          <p style={{color: '#888', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '1rem'}}>
                            No events yet. Host a quiet gathering of readers.
                          </p>
                        ) : (
                          <div style={{display: 'grid', gap: '1rem'}}>
                            {mySilentEvents.map(evt => (
                              <div key={evt.id} className="item-edit-card">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                  <div>
                                    <div style={{fontFamily: 'Cinzel', fontSize: '1.1rem', color: '#D4AF37', marginBottom: '0.3rem'}}>{evt.name}</div>
                                    <div style={{fontSize: '0.85rem', color: '#888'}}>
                                      {evt.attendees.length} attending · {evt.privacy}
                                      {evt.date && (' · ' + formatEventDate(evt.date, evt.time))}
                                    </div>
                                    {evt.location && (
                                      <div style={{fontSize: '0.85rem', color: '#C0C0C0', marginTop: '0.2rem'}}>
                                        {evt.location.startsWith('http') ? 'Online' : evt.location}
                                      </div>
                                    )}
                                    {(evt.pendingRequests || []).length > 0 && (
                                      <div style={{fontSize: '0.85rem', color: '#D4AF37', marginTop: '0.3rem'}}>
                                        {evt.pendingRequests.length} pending request{evt.pendingRequests.length !== 1 ? 's' : ''}
                                      </div>
                                    )}
                                  </div>
                                  <div style={{display: 'flex', gap: '0.5rem'}}>
                                    <button className="btn" onClick={(e) => { e.stopPropagation(); handleShareEvent(
                                      evt.name,
                                      `Silent Book Club${evt.date ? '\n' + formatEventDate(evt.date, evt.time) : ''}${evt.location ? '\n' + (evt.location.startsWith('http') ? 'Online Event' : evt.location) : ''}\nBring your own book and read in good company.`
                                    ); }} style={{padding: '0.3rem 0.8rem', fontSize: '0.75rem'}}>
                                      Share
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setActiveSilentEventId(evt.id)} style={{padding: '0.3rem 0.8rem', fontSize: '0.75rem'}}>
                                      Manage
                                    </button>
                                    <button onClick={() => handleDeleteSilentEvent(evt.id)} style={{
                                      padding: '0.3rem 0.8rem', fontSize: '0.75rem', background: 'rgba(200,50,50,0.2)', border: '1px solid rgba(200,50,50,0.4)', borderRadius: '6px', color: '#ff6b6b', cursor: 'pointer'
                                    }}>
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {getRoomSections().map(section => {
                      // Filter out private items for public viewing (WIPs only)
                      const allItems = roomData[section.key] || [];
                      const publicItems = section.key === 'wips' 
                        ? allItems.filter(item => item.visibility === 'public')
                        : allItems;
                      
                      if (!publicItems || publicItems.length === 0) return null;
                      
                      return (
                        <div key={section.key} className="room-section">
                          <h2 className="section-title">{section.title}</h2>
                          <div className="items-grid">
                            {publicItems.map(item => (
                              <div key={item.id} className="item-card" style={{
                                position: 'relative',
                                paddingTop: (section.key === 'publishedWorks' || section.key === 'wips') ? '3rem' : '1.5rem'
                              }}>
                                {/* Star Nomination Button - Only for Published Works & WIPs */}
                                {(section.key === 'publishedWorks' || section.key === 'wips' || section.key === 'shortStories' || section.key === 'poetry' || section.key === 'essays') && (
                                  <button
                                    onClick={() => handleNominate(section.key, item.id, user?.id)}
                                    disabled={!user || hasNominated(section.key, item.id) || user.id === user?.id}
                                    style={{
                                      position: 'absolute',
                                      top: '1rem',
                                      right: '1rem',
                                      background: hasNominated(section.key, item.id) ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                                      border: '1px solid rgba(212, 175, 55, 0.5)',
                                      borderRadius: '50%',
                                      width: '40px',
                                      height: '40px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: hasNominated(section.key, item.id) || !user ? 'default' : 'pointer',
                                      transition: 'all 0.3s ease',
                                      fontSize: '1.3rem'
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!hasNominated(section.key, item.id) && user) {
                                        e.target.style.background = 'rgba(212, 175, 55, 0.2)';
                                        e.target.style.transform = 'scale(1.1)';
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!hasNominated(section.key, item.id)) {
                                        e.target.style.background = 'transparent';
                                        e.target.style.transform = 'scale(1)';
                                      }
                                    }}
                                    title={!user ? 'Sign in to nominate' : hasNominated(section.key, item.id) ? 'Already nominated!' : 'Nominate as Rising Star'}
                                  >
                                    {hasNominated(section.key, item.id) ? '⭐' : '☆'}
                                  </button>
                                )}
                                
                                {/* Show cover image for Published Works and WIPs */}
                                {(section.key === 'publishedWorks' || section.key === 'wips') && item.coverImage && (
                                  <img 
                                    src={item.coverImage.data} 
                                    alt={item.title}
                                    style={{
                                      width: '100%',
                                      height: 'auto',
                                      borderRadius: '4px',
                                      marginBottom: '1rem'
                                    }}
                                  />
                                )}
                                
                                <h3 className="item-title">{item.title}</h3>
                                {item.author && <div className="item-author">by {item.author}</div>}
                                {item.description && <p className="item-description">{item.description}</p>}
                                
                                {/* Show preview and Read button for Short Stories, Poetry, Essays */}
                                {(section.key === 'shortStories' || section.key === 'poetry' || section.key === 'essays') && item.content && (
                                  <div>
                                    <p className="item-description" style={{
                                      fontFamily: 'Georgia, serif',
                                      lineHeight: 1.8,
                                      fontStyle: section.key === 'poetry' ? 'italic' : 'normal'
                                    }}>
                                      {item.content.split(' ').slice(0, 100).join(' ')}
                                      {item.content.split(' ').length > 100 && '...'}
                                    </p>
                                    <button
                                      className="btn btn-primary"
                                      onClick={() => handleReadClick(item, section.key)}
                                      style={{marginTop: '1.5rem', width: '100%'}}
                                    >
                                      Read Full {section.key === 'poetry' ? 'Poem' : section.key === 'shortStories' ? 'Story' : 'Article'}
                                    </button>
                                  </div>
                                )}
                                
                                {/* Show PDF button for WIPs with uploaded PDFs */}
                                {section.key === 'wips' && item.uploadedPdf && (
                                  <div style={{marginTop: '1.5rem'}}>
                                    <div style={{textAlign: 'center'}}>
                                      <button
                                        className="btn btn-primary"
                                        onClick={() => handleBetaSignupClick(item)}
                                      >
                                        Read Beta Copy
                                      </button>
                                    </div>
                                    <p style={{fontSize: '0.85rem', color: '#888', marginTop: '1rem', textAlign: 'center'}}>
                                      {item.uploadedPdf.name} • {formatFileSize(item.uploadedPdf.size)}
                                    </p>
                                  </div>
                                )}
                                
                                {item.link && (
                                  <button 
                                    onClick={() => window.open(item.link, '_blank')}
                                    className="item-link"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      padding: 0,
                                      font: 'inherit'
                                    }}
                                  >
                                    View →
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* ========== BOOK CLUBS SECTION (View Mode) ========== */}
                    {(myCircles.length > 0 || mySilentEvents.length > 0) && (
                      <div className="room-section">
                        <h2 className="section-title">Book Clubs</h2>

                        {/* Reading Circles */}
                        {myCircles.length > 0 && (
                          <div style={{marginBottom: '2.5rem'}}>
                            <h3 style={{fontFamily: 'Cinzel', fontSize: '1.1rem', color: '#C0C0C0', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.5rem'}}>
                              Reading Circles
                            </h3>
                            <div className="items-grid">
                              {myCircles.map(circle => (
                                <div key={circle.id} className="item-card" style={{cursor: 'pointer'}} onClick={() => setActiveCircleId(circle.id)}>
                                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                                    <span style={{
                                      fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                                      background: circle.privacy === 'public' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100, 100, 100, 0.25)',
                                      color: circle.privacy === 'public' ? '#D4AF37' : '#999',
                                      border: `1px solid ${circle.privacy === 'public' ? 'rgba(212, 175, 55, 0.3)' : 'rgba(100, 100, 100, 0.4)'}`,
                                      textTransform: 'uppercase', fontFamily: 'Cinzel', letterSpacing: '0.05em'
                                    }}>{circle.privacy}</span>
                                    <span style={{fontSize: '0.85rem', color: '#888'}}>{circle.members.length} member{circle.members.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  <h3 className="item-title" style={{marginTop: '0.5rem'}}>{circle.name}</h3>
                                  <div className="item-author">Reading: {circle.bookTitle}</div>
                                  {circle.description && <p className="item-description" style={{marginTop: '0.5rem'}}>{circle.description}</p>}
                                  {circle.meetingDate && (
                                    <div style={{marginTop: '0.75rem', fontSize: '0.85rem', color: '#D4AF37'}}>
                                      Next: {formatEventDate(circle.meetingDate, circle.meetingTime)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Silent Book Club Events */}
                        {mySilentEvents.length > 0 && (
                          <div>
                            <h3 style={{fontFamily: 'Cinzel', fontSize: '1.1rem', color: '#C0C0C0', letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.5rem'}}>
                              Silent Book Club
                            </h3>
                            <div className="items-grid">
                              {mySilentEvents.map(evt => (
                                <div key={evt.id} className="item-card" style={{cursor: 'pointer'}} onClick={() => setActiveSilentEventId(evt.id)}>
                                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem'}}>
                                    <span style={{
                                      fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                                      background: evt.privacy === 'public' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100, 100, 100, 0.25)',
                                      color: evt.privacy === 'public' ? '#D4AF37' : '#999',
                                      border: `1px solid ${evt.privacy === 'public' ? 'rgba(212, 175, 55, 0.3)' : 'rgba(100, 100, 100, 0.4)'}`,
                                      textTransform: 'uppercase', fontFamily: 'Cinzel', letterSpacing: '0.05em'
                                    }}>{evt.privacy}</span>
                                    <span style={{fontSize: '0.85rem', color: '#888'}}>{evt.attendees.length} attending</span>
                                  </div>
                                  <h3 className="item-title" style={{marginTop: '0.5rem'}}>{evt.name}</h3>
                                  {evt.date && (
                                    <div style={{marginTop: '0.5rem', fontSize: '0.85rem', color: '#D4AF37'}}>
                                      {formatEventDate(evt.date, evt.time)}
                                    </div>
                                  )}
                                  {evt.location && (
                                    <div style={{marginTop: '0.3rem', fontSize: '0.85rem', color: '#C0C0C0'}}>
                                      {evt.location.startsWith('http') ? 'Online Event' : evt.location}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* I Would Like to Meet - View Mode */}
                    {roomData.lookingToMeet && (
                      <div className="room-section">
                        <h2 className="section-title">
                          {user.userType === 'reader' ? 'Voices I\'m Seeking' : 'I Would Like to Meet'}
                        </h2>
                        <div style={{
                          background: 'rgba(20, 20, 20, 0.6)',
                          border: '1px solid rgba(212, 175, 55, 0.3)',
                          borderRadius: '12px',
                          padding: '2.5rem',
                          maxWidth: '700px',
                          margin: '0 auto',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            fontSize: '2rem',
                            marginBottom: '1rem'
                          }}>{user.userType === 'reader' ? '📖' : '🤝'}</div>
                          <p style={{
                            fontSize: '1.1rem',
                            color: '#E8E8E8',
                            lineHeight: 1.8,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {roomData.lookingToMeet}
                          </p>
                        </div>
                      </div>
                    )}

                    {getRoomSections().every(section => !roomData[section.key] || roomData[section.key].length === 0) && myCircles.length === 0 && mySilentEvents.length === 0 && !roomData.lookingToMeet && (
                      <div className="empty-state">
                        <p className="empty-state-title">Your room awaits</p>
                        <p>Click "Edit Room" to start showcasing your {user.userType === 'writer' ? 'work' : user.userType === 'reader' ? 'favorite books and the voices you\'re seeking' : 'portfolio'}</p>
                        {user.userType === 'reader' && (
                          <div style={{
                            marginTop: '2rem',
                            background: 'rgba(212, 175, 55, 0.08)',
                            border: '1px solid rgba(212, 175, 55, 0.25)',
                            borderRadius: '10px',
                            padding: '1.5rem',
                            maxWidth: '500px',
                            margin: '2rem auto 0'
                          }}>
                            <p style={{
                              fontFamily: 'Cinzel',
                              color: '#D4AF37',
                              fontSize: '0.85rem',
                              letterSpacing: '0.08em',
                              marginBottom: '0.5rem'
                            }}>Don't forget</p>
                            <p style={{fontSize: '0.95rem', color: '#C0C0C0', lineHeight: 1.6}}>
                              As you explore writers' rooms, nominate the work that moves you. Your voice helps shape what gets published next.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* BOOK LISTS SECTION */}
                  <div className="book-list-section">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                      <h2 style={{fontFamily: 'Cinzel', fontSize: '1.1rem', color: '#D4AF37', letterSpacing: '0.1em'}}>
                        MY BOOK LISTS
                      </h2>
                      <button
                        className="btn"
                        onClick={() => setShowAddList(true)}
                        style={{fontSize: '0.8rem', padding: '0.4rem 0.9rem'}}
                      >
                        + New List
                      </button>
                    </div>

                    {/* Create new list input */}
                    {showAddList && (
                      <div className="book-list-card" style={{marginBottom: '1rem'}}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="List name (e.g. Fiction, Nonfiction, Kids...)"
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleCreateList()}
                          autoFocus
                          style={{marginBottom: '0.75rem'}}
                        />
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button className="btn" onClick={handleCreateList} style={{fontSize: '0.8rem'}}>Create</button>
                          <button className="btn btn-secondary" onClick={() => { setShowAddList(false); setNewListName(''); }} style={{fontSize: '0.8rem'}}>Cancel</button>
                        </div>
                      </div>
                    )}

                    {bookLists.length === 0 && !showAddList && (
                      <div style={{textAlign: 'center', padding: '2rem', color: '#888', fontStyle: 'italic'}}>
                        Create your first book list — track what you've read, want to read, or love.
                      </div>
                    )}

                    {bookLists.map(list => (
                      <div key={list.id} className="book-list-card">
                        {/* List header */}
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
                            <h3
                              style={{fontFamily: 'Cinzel', fontSize: '1rem', color: '#E8E8E8', cursor: 'pointer'}}
                              onClick={() => setActiveListId(activeListId === list.id ? null : list.id)}
                            >
                              {list.name}
                              <span style={{fontSize: '0.75rem', color: '#888', marginLeft: '0.5rem'}}>
                                ({list.books.length} book{list.books.length !== 1 ? 's' : ''})
                              </span>
                            </h3>
                            <span
                              className={`visibility-toggle ${list.isPublic ? 'public' : 'private'}`}
                              onClick={() => handleToggleListVisibility(list.id)}
                              style={{fontSize: '0.7rem'}}
                            >
                              {list.isPublic ? '🌐 Public' : '🔒 Private'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteList(list.id)}
                            style={{background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem'}}
                          >✕</button>
                        </div>

                        {/* Books in list */}
                        {activeListId === list.id && (
                          <>
                            {list.books.map(book => (
                              <div key={book.id} className="book-item">
                                {book.coverUrl ? (
                                  <img src={book.coverUrl} alt={book.title} className="book-cover" />
                                ) : (
                                  <div className="book-cover" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'}}>📚</div>
                                )}
                                <div style={{flex: 1}}>
                                  <div style={{
                                    color: book.read ? '#888' : '#E8E8E8',
                                    textDecoration: book.read ? 'line-through' : 'none',
                                    fontSize: '0.95rem'
                                  }}>{book.title}</div>
                                  {book.author && <div style={{color: '#888', fontSize: '0.8rem'}}>{book.author}</div>}
                                </div>
                                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                                  <button
                                    onClick={() => handleToggleBookRead(list.id, book.id)}
                                    style={{
                                      background: book.read ? 'rgba(212,175,55,0.2)' : 'transparent',
                                      border: '1px solid rgba(212,175,55,0.4)',
                                      borderRadius: '4px',
                                      color: '#D4AF37',
                                      cursor: 'pointer',
                                      fontSize: '0.75rem',
                                      padding: '0.2rem 0.5rem',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {book.read ? '✓ Read' : 'Mark Read'}
                                  </button>
                                  <button
                                    onClick={() => handleRemoveBookFromList(list.id, book.id)}
                                    style={{background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '1rem'}}
                                  >✕</button>
                                </div>
                              </div>
                            ))}

                            {/* Book search */}
                            <div style={{marginTop: '1rem'}}>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Search for a book to add..."
                                value={bookSearch}
                                onChange={(e) => handleBookSearch(e.target.value)}
                                style={{fontSize: '0.9rem'}}
                              />
                              {bookSearchLoading && <div style={{color: '#888', fontSize: '0.85rem', padding: '0.5rem'}}>Searching...</div>}
                              {bookSearchResults.length > 0 && (
                                <div className="book-search-results">
                                  {bookSearchResults.map((result, i) => (
                                    <div
                                      key={i}
                                      className="book-search-result"
                                      onClick={() => handleAddBookToList(list.id, {
                                        title: result.title,
                                        author: result.author_name?.[0] || '',
                                        coverUrl: result.cover_i ? `https://covers.openlibrary.org/b/id/${result.cover_i}-S.jpg` : null
                                      })}
                                    >
                                      {result.cover_i ? (
                                        <img
                                          src={`https://covers.openlibrary.org/b/id/${result.cover_i}-S.jpg`}
                                          alt={result.title}
                                          style={{width: '28px', height: '40px', objectFit: 'cover', borderRadius: '2px'}}
                                        />
                                      ) : (
                                        <div style={{width: '28px', height: '40px', background: 'rgba(212,175,55,0.1)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>📚</div>
                                      )}
                                      <div>
                                        <div style={{color: '#E8E8E8', fontSize: '0.9rem'}}>{result.title}</div>
                                        {result.author_name?.[0] && <div style={{color: '#888', fontSize: '0.8rem'}}>{result.author_name[0]}</div>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {activeListId !== list.id && list.books.length > 0 && (
                          <div
                            style={{color: '#D4AF37', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.25rem'}}
                            onClick={() => setActiveListId(list.id)}
                          >
                            View books →
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Share Room Modal */}
      {showShareRoom && (
        <div className="modal-overlay" onClick={() => setShowShareRoom(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '480px', textAlign: 'center'}}>
            <h2 className="modal-title">Share Your Room</h2>
            <p style={{color: '#C0C0C0', marginBottom: '1.5rem', lineHeight: 1.6}}>
              Invite friends and family to see your room. Anyone who visits via your link will receive a 7-day free trial to join The Book Lodge.
            </p>
            <div style={{
              background: 'rgba(212, 175, 55, 0.08)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1.5rem',
              wordBreak: 'break-all',
              fontSize: '0.85rem',
              color: '#D4AF37',
              fontFamily: 'monospace'
            }}>
              {`${window.location.origin}?room=${encodeURIComponent(user?.name || '')}&invite=true`}
            </div>
            <div style={{display: 'flex', gap: '0.75rem', justifyContent: 'center'}}>
              <button className="btn btn-primary" onClick={handleShareRoom}>
                {shareRoomCopied ? '✓ Copied!' : 'Copy Link'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowShareRoom(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

        {/* FIRESIDE LOUNGE */}
        {currentRoom === 2 && !user && (
          <div className="guest-room">
            <div className="room-header">
              <h1 className="room-title">FIRESIDE LOUNGE</h1>
              <p style={{fontSize: '1.2rem', color: '#C0C0C0', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6}}>
                Meet other Lodgers. Connect with fellow readers, writers, and industry professionals.
              </p>
            </div>

            {/* Wells Welcome */}
            <div style={{
              background: 'rgba(20, 20, 20, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '700px',
              margin: '0 auto 3rem',
              textAlign: 'center'
            }}>
              <h3 style={{
                fontFamily: 'Cinzel',
                fontSize: '1.1rem',
                color: '#D4AF37',
                marginBottom: '1rem',
                letterSpacing: '0.1em'
              }}>
                WELLS, YOUR LITERARY COMPANION
              </h3>
              <p style={{
                fontSize: '1.1rem',
                color: '#C0C0C0',
                lineHeight: 1.7,
                fontStyle: 'italic',
                marginBottom: '1.5rem'
              }}>
                Welcome to the Fireside Lounge. Once you've reserved your room, I can help you find fellow Lodgers who share your literary interests — whether you're looking for critique partners, beta readers, or just someone who loves the same books you do.
              </p>
              <button className="btn btn-primary" onClick={() => { setReservationStep(0); setShowReservation(true); }}>
                Reserve Your Room
              </button>
            </div>

            {/* Grayed-out preview of what's inside */}
            <div style={{opacity: 0.35}}>
              <div style={{marginBottom: '3rem'}}>
                <h2 style={{
                  fontFamily: 'Cinzel', fontSize: '1.8rem', color: '#D4AF37',
                  textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '0.1em'
                }}>
                  RISING STARS
                </h2>
                <p style={{textAlign: 'center', color: '#C0C0C0', fontSize: '1rem', marginBottom: '2rem'}}>
                  Works nominated by the Book Lodge community
                </p>
                <div className="items-grid">
                  <div className="item-card" style={{opacity: 0.6}}>
                    <h3 className="item-title">Community favorites</h3>
                    <p className="item-description">Discover what other Lodgers are reading and recommending</p>
                  </div>
                  <div className="item-card" style={{opacity: 0.4}}>
                    <h3 className="item-title">Nominate great work</h3>
                    <p className="item-description">Help rising authors get the recognition they deserve</p>
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{
                  fontFamily: 'Cinzel', fontSize: '1.5rem', color: '#D4AF37',
                  textAlign: 'center', marginBottom: '2rem', letterSpacing: '0.1em'
                }}>
                  LODGER DIRECTORY
                </h2>
                <div className="items-grid">
                  <div className="item-card" style={{opacity: 0.5}}>
                    <h3 className="item-title">Readers & Writers</h3>
                    <p className="item-description">Browse profiles and find your people</p>
                  </div>
                  <div className="item-card" style={{opacity: 0.3}}>
                    <h3 className="item-title">Industry Professionals</h3>
                    <p className="item-description">Connect with editors, agents, designers, and more</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentRoom === 2 && user && (
          <div className="guest-room">
            <div className="room-header">
              <h1 className="room-title">FIRESIDE LOUNGE</h1>
              <p style={{fontSize: '1.2rem', color: '#C0C0C0', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6}}>
                Meet other Lodgers. Connect with fellow readers, writers, and industry professionals.
              </p>
            </div>

            {/* Wells Chat Box */}
            <div style={{
              background: 'rgba(20, 20, 20, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '3rem',
              maxWidth: '700px',
              margin: '0 auto 3rem'
            }}>
              <h3 style={{
                fontFamily: 'Cinzel',
                fontSize: '1.1rem',
                color: '#D4AF37',
                textAlign: 'center',
                marginBottom: '1.5rem',
                letterSpacing: '0.1em'
              }}>
                ASK WELLS
              </h3>
              
              <p style={{
                fontFamily: 'Cormorant Garamond',
                fontSize: '1.1rem',
                color: '#C0C0C0',
                lineHeight: 1.6,
                textAlign: 'center',
                marginBottom: '1.5rem',
                fontStyle: 'italic'
              }}>
                Looking for advice on connecting with someone? Need help finding the right lodger? Ask me anything.
              </p>

              <div className="input-section" style={{marginTop: '1.5rem'}}>
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask Wells for connection advice, genre recommendations, or anything else..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <button 
                  className="send-button"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputValue.trim()}
                >
                  Send
                </button>
              </div>

              {/* Show latest Wells message if exists */}
              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(212, 175, 55, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}>
                  <div style={{
                    fontFamily: 'Cormorant Garamond',
                    fontSize: '1rem',
                    color: '#E8E8E8',
                    lineHeight: 1.6
                  }}>
                    {messages[messages.length - 1].content}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="loading-dots" style={{marginTop: '1rem', textAlign: 'center'}}>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              )}
            </div>

            {/* Rising Stars Section */}
            <div style={{marginBottom: '4rem'}}>
              <h2 style={{
                fontFamily: 'Cinzel',
                fontSize: '1.8rem',
                color: '#D4AF37',
                textAlign: 'center',
                marginBottom: '0.5rem',
                letterSpacing: '0.1em'
              }}>
                ⭐ RISING STARS ⭐
              </h2>
              <p style={{
                textAlign: 'center',
                color: '#C0C0C0',
                fontSize: '1rem',
                marginBottom: '2rem'
              }}>
                Works nominated by the Book Lodge community
              </p>
              
              <div className="items-grid">
                {/* Sample Rising Star Work 1 */}
                <div className="item-card" style={{position: 'relative', paddingTop: '3rem'}}>
                  <button
                    onClick={() => handleNominate('publishedWork', 'sample-1', 999)}
                    disabled={hasNominated('publishedWork', 'sample-1')}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: hasNominated('publishedWork', 'sample-1') ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                      border: '1px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: hasNominated('publishedWork', 'sample-1') ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '1.3rem'
                    }}
                    title={hasNominated('publishedWork', 'sample-1') ? 'Already nominated!' : 'Nominate as Rising Star'}
                  >
                    {hasNominated('publishedWork', 'sample-1') ? '⭐' : '☆'}
                  </button>
                  
                  <h3 className="item-title">Echoes of Grace</h3>
                  <div className="item-author">by Sarah Mitchell</div>
                  <p className="item-description">
                    A powerful story of redemption and faith in a broken world. When darkness threatens, one woman's journey back to light illuminates the path for us all.
                  </p>
                  <div style={{
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    color: '#D4AF37',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    Christian Fiction • Redemption • Hope & Healing
                  </div>
                </div>

                {/* Sample Rising Star Work 2 */}
                <div className="item-card" style={{position: 'relative', paddingTop: '3rem'}}>
                  <button
                    onClick={() => handleNominate('wip', 'sample-2', 998)}
                    disabled={hasNominated('wip', 'sample-2')}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: hasNominated('wip', 'sample-2') ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                      border: '1px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: hasNominated('wip', 'sample-2') ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '1.3rem'
                    }}
                    title={hasNominated('wip', 'sample-2') ? 'Already nominated!' : 'Nominate as Rising Star'}
                  >
                    {hasNominated('wip', 'sample-2') ? '⭐' : '☆'}
                  </button>
                  
                  <h3 className="item-title">The Warrior's Prayer</h3>
                  <div className="item-author">by Michael Chen</div>
                  <p className="item-description">
                    A young soldier discovers that the greatest battles aren't fought with weapons, but with faith. A gripping tale of identity and moral courage.
                  </p>
                  <div style={{
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    color: '#D4AF37',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    Fantasy • Identity & Belonging • Power & Corruption
                  </div>
                </div>

                {/* Sample Rising Star Work 3 */}
                <div className="item-card" style={{position: 'relative', paddingTop: '3rem'}}>
                  <button
                    onClick={() => handleNominate('publishedWork', 'sample-3', 997)}
                    disabled={hasNominated('publishedWork', 'sample-3')}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: hasNominated('publishedWork', 'sample-3') ? 'rgba(212, 175, 55, 0.3)' : 'transparent',
                      border: '1px solid rgba(212, 175, 55, 0.5)',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: hasNominated('publishedWork', 'sample-3') ? 'default' : 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '1.3rem'
                    }}
                    title={hasNominated('publishedWork', 'sample-3') ? 'Already nominated!' : 'Nominate as Rising Star'}
                  >
                    {hasNominated('publishedWork', 'sample-3') ? '⭐' : '☆'}
                  </button>
                  
                  <h3 className="item-title">Letters to My Daughter</h3>
                  <div className="item-author">by Grace Williams</div>
                  <p className="item-description">
                    A mother's love letters guide her teen daughter through the storms of adolescence, grief, and discovering her own purpose.
                  </p>
                  <div style={{
                    marginTop: '1rem',
                    fontSize: '0.85rem',
                    color: '#D4AF37',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    YA/Teen • Coming of Age • Family
                  </div>
                </div>
              </div>
            </div>

            {/* ========== LODGER DIRECTORY ========== */}
            <div style={{marginBottom: '3rem'}}>
              <h2 style={{
                fontFamily: 'Cinzel', fontSize: '1.5rem', color: '#D4AF37',
                textAlign: 'center', marginBottom: '0.5rem', letterSpacing: '0.1em'
              }}>
                LODGER DIRECTORY
              </h2>
              <p style={{textAlign: 'center', color: '#C0C0C0', fontSize: '1rem', marginBottom: '2rem'}}>
                Find your people. Filter by type, genre, theme, or what they're looking for.
              </p>

              {/* Search bar */}
              <div style={{maxWidth: '600px', margin: '0 auto 1.5rem'}}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name, genre, theme..."
                  value={directorySearchText}
                  onChange={(e) => setDirectorySearchText(e.target.value)}
                  style={{width: '100%', textAlign: 'center'}}
                />
              </div>

              {/* User type filter tabs */}
              <div style={{
                display: 'flex', justifyContent: 'center', gap: '0.5rem',
                marginBottom: '1.5rem', flexWrap: 'wrap'
              }}>
                {[
                  { key: 'all', label: 'All Lodgers' },
                  { key: 'reader', label: 'Readers' },
                  { key: 'writer', label: 'Writers' },
                  { key: 'pro', label: 'Pros' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setDirectoryFilter(tab.key)}
                    style={{
                      padding: '0.5rem 1.2rem', borderRadius: '20px', cursor: 'pointer',
                      fontFamily: 'Cinzel', fontSize: '0.8rem', letterSpacing: '0.05em',
                      transition: 'all 0.3s ease',
                      background: directoryFilter === tab.key ? 'rgba(212, 175, 55, 0.3)' : 'rgba(40, 40, 40, 0.5)',
                      border: `1px solid ${directoryFilter === tab.key ? '#D4AF37' : 'rgba(80, 80, 80, 0.5)'}`,
                      color: directoryFilter === tab.key ? '#D4AF37' : '#C0C0C0'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Dropdown filters row */}
              <div style={{
                display: 'flex', gap: '0.75rem', justifyContent: 'center',
                marginBottom: '2rem', flexWrap: 'wrap', maxWidth: '700px', margin: '0 auto 2rem'
              }}>
                <select
                  value={directoryGenreFilter}
                  onChange={(e) => setDirectoryGenreFilter(e.target.value)}
                  className="form-input"
                  style={{flex: '1', minWidth: '160px', maxWidth: '200px', textAlign: 'center', cursor: 'pointer'}}
                >
                  <option value="">Any Genre</option>
                  {['Literary Fiction', 'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller / Suspense', 'Horror', 'Historical Fiction', 'Contemporary Fiction', 'Dystopian', 'Magical Realism', 'Women\'s Fiction', 'Christian Fiction', 'Faith-Based', 'YA / Teen', 'Memoir', 'Poetry', 'Romantasy', 'Cozy Mystery', 'Dark Academia'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <select
                  value={directoryThemeFilter}
                  onChange={(e) => setDirectoryThemeFilter(e.target.value)}
                  className="form-input"
                  style={{flex: '1', minWidth: '160px', maxWidth: '200px', textAlign: 'center', cursor: 'pointer'}}
                >
                  <option value="">Any Theme</option>
                  {['Redemption', 'Good vs Evil', 'Faith & Doubt', 'Grief & Loss', 'Found Family', 'Forbidden Love', 'Coming of Age', 'Identity & Belonging', 'Mental Health', 'Slow Burn Romance', 'Enemies to Lovers', 'Moral Ambiguity', 'Healing & Recovery', 'Second Chances', 'Power & Corruption', 'Spiritual Journey', 'Friendship', 'Survival', 'Hope Against Odds'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>

                <select
                  value={directoryLookingForFilter}
                  onChange={(e) => setDirectoryLookingForFilter(e.target.value)}
                  className="form-input"
                  style={{flex: '1', minWidth: '160px', maxWidth: '200px', textAlign: 'center', cursor: 'pointer'}}
                >
                  <option value="">Looking For...</option>
                  {['Beta Readers', 'Critique Partners', 'Writing Buddies', 'Book Club', 'Cover Designer', 'Developmental Editor', 'Copy Editor', 'Literary Agent', 'Publisher', 'New Authors to Follow', 'Reading Buddies', 'ARC / Early Reader Copies'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Active filters display */}
              {(directoryGenreFilter || directoryThemeFilter || directoryLookingForFilter || directorySearchText) && (
                <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                  <div style={{display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center'}}>
                    <span style={{color: '#888', fontSize: '0.85rem'}}>Filtering by:</span>
                    {directorySearchText && (
                      <span onClick={() => setDirectorySearchText('')} style={{
                        padding: '0.2rem 0.6rem', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                        borderRadius: '12px', fontSize: '0.8rem', color: '#D4AF37', cursor: 'pointer'
                      }}>"{directorySearchText}" ×</span>
                    )}
                    {directoryGenreFilter && (
                      <span onClick={() => setDirectoryGenreFilter('')} style={{
                        padding: '0.2rem 0.6rem', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)',
                        borderRadius: '12px', fontSize: '0.8rem', color: '#D4AF37', cursor: 'pointer'
                      }}>{directoryGenreFilter} ×</span>
                    )}
                    {directoryThemeFilter && (
                      <span onClick={() => setDirectoryThemeFilter('')} style={{
                        padding: '0.2rem 0.6rem', background: 'rgba(192,192,192,0.12)', border: '1px solid rgba(192,192,192,0.3)',
                        borderRadius: '12px', fontSize: '0.8rem', color: '#C0C0C0', cursor: 'pointer'
                      }}>{directoryThemeFilter} ×</span>
                    )}
                    {directoryLookingForFilter && (
                      <span onClick={() => setDirectoryLookingForFilter('')} style={{
                        padding: '0.2rem 0.6rem', background: 'rgba(120,140,90,0.15)', border: '1px solid rgba(120,140,90,0.3)',
                        borderRadius: '12px', fontSize: '0.8rem', color: '#9BA97C', cursor: 'pointer'
                      }}>{directoryLookingForFilter} ×</span>
                    )}
                    <button onClick={() => { setDirectoryGenreFilter(''); setDirectoryThemeFilter(''); setDirectoryLookingForFilter(''); setDirectorySearchText(''); }} style={{
                      background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline'
                    }}>Clear all</button>
                  </div>
                </div>
              )}

              {/* Directory cards */}
              <div className="items-grid" style={{marginBottom: '2rem'}}>

                {/* Current user's own card — always shown */}
                {(directoryFilter === 'all' || directoryFilter === user.userType) && (
                  <div className="item-card" style={{
                    border: '2px solid rgba(212, 175, 55, 0.5)',
                    background: 'rgba(212, 175, 55, 0.05)',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute', top: '1rem', right: '1rem',
                      fontSize: '0.7rem', color: '#D4AF37', fontFamily: 'Cinzel', letterSpacing: '0.1em',
                      padding: '0.15rem 0.5rem', background: 'rgba(212,175,55,0.2)', borderRadius: '4px'
                    }}>YOU</div>
                    <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1rem'}}>
                      <ProfileImage size={70} fontSize="1.8rem" />
                    </div>
                    <h3 className="item-title" style={{textAlign: 'center'}}>{user.name}</h3>
                    <div style={{
                      fontSize: '0.8rem', color: '#C0C0C0', textTransform: 'uppercase',
                      letterSpacing: '0.15em', marginBottom: '0.75rem', fontFamily: 'Cinzel', textAlign: 'center'
                    }}>
                      {user.userType === 'pro' ? (user.proRole || 'Industry Professional').toUpperCase() : user.userType.toUpperCase()}
                    </div>
                    
                    {user.genres && user.genres.length > 0 && (
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem', justifyContent: 'center'}}>
                        {user.genres.slice(0, 4).map(g => (
                          <span key={g} style={{
                            padding: '0.15rem 0.5rem', background: 'rgba(212,175,55,0.12)',
                            border: '1px solid rgba(212,175,55,0.3)', borderRadius: '12px',
                            fontSize: '0.75rem', color: '#D4AF37'
                          }}>{g}</span>
                        ))}
                        {user.genres.length > 4 && <span style={{fontSize: '0.75rem', color: '#888'}}>+{user.genres.length - 4}</span>}
                      </div>
                    )}

                    {user.themes && user.themes.length > 0 && (
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem', justifyContent: 'center'}}>
                        {user.themes.slice(0, 3).map(t => (
                          <span key={t} style={{
                            padding: '0.15rem 0.5rem', background: 'rgba(192,192,192,0.08)',
                            border: '1px solid rgba(192,192,192,0.2)', borderRadius: '12px',
                            fontSize: '0.75rem', color: '#C0C0C0'
                          }}>{t}</span>
                        ))}
                        {user.themes.length > 3 && <span style={{fontSize: '0.75rem', color: '#888'}}>+{user.themes.length - 3}</span>}
                      </div>
                    )}

                    {user.lookingFor && user.lookingFor.length > 0 && (
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.6rem', justifyContent: 'center'}}>
                        {user.lookingFor.slice(0, 3).map(l => (
                          <span key={l} style={{
                            padding: '0.15rem 0.5rem', background: 'rgba(120,140,90,0.12)',
                            border: '1px solid rgba(120,140,90,0.3)', borderRadius: '12px',
                            fontSize: '0.75rem', color: '#9BA97C'
                          }}>{l}</span>
                        ))}
                        {user.lookingFor.length > 3 && <span style={{fontSize: '0.75rem', color: '#888'}}>+{user.lookingFor.length - 3}</span>}
                      </div>
                    )}
                    
                    {user.bio && (
                      <p className="item-description" style={{textAlign: 'center', fontSize: '0.9rem'}}>
                        {user.bio.length > 120 ? user.bio.substring(0, 120) + '...' : user.bio}
                      </p>
                    )}
                    <div style={{
                      marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(212, 175, 55, 0.1)',
                      borderRadius: '6px', fontSize: '0.8rem', color: '#C0C0C0', textAlign: 'center'
                    }}>
                      This is how others will see you
                    </div>
                  </div>
                )}

                {/* Placeholder for future Supabase-powered Lodger cards */}
                {/* When connected, replace this with: lodgers.filter(...).map(lodger => <LodgerCard />) */}
              </div>

              <div className="empty-state" style={{marginTop: '1rem'}}>
                <p className="empty-state-title">More Lodgers Coming Soon</p>
                <p style={{marginBottom: '1rem'}}>
                  As the Book Lodge community grows, this directory will fill with readers, writers, and professionals to connect with. Your filters will help you find exactly who you're looking for.
                </p>
                
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const inviteText = `I've been hanging out in The Book Lodge - a literary community for readers, writers, and industry pros. Come find your people!`;
                    const url = window.location.origin;
                    const fullText = `${inviteText} ${url}`;
                    
                    if (navigator.share) {
                      navigator.share({
                        title: 'Join me at The Book Lodge',
                        text: inviteText,
                        url: url
                      }).catch(() => {});
                    } else if (navigator.clipboard && window.isSecureContext) {
                      navigator.clipboard.writeText(fullText).then(() => {
                        showToast('Invite copied to clipboard! Share it with your literary friends.');
                      });
                    } else {
                      // Final fallback — select from a temporary textarea
                      const ta = document.createElement('textarea');
                      ta.value = fullText;
                      ta.style.position = 'fixed';
                      ta.style.opacity = '0';
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand('copy');
                      document.body.removeChild(ta);
                      showToast('Invite copied to clipboard! Share it with your literary friends.');
                    }
                  }}
                  style={{marginTop: '0.5rem'}}
                >
                  Invite Friends to the Lodge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIBRARY */}
        {currentRoom === 3 && !user && (
          <div className="guest-room">
            <div className="room-header">
              <h1 className="room-title">THE LIBRARY</h1>
              <p style={{fontSize: '1.2rem', color: '#C0C0C0', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6}}>
                Your resource hub for craft, publishing, and literary excellence
              </p>
            </div>

            <div style={{
              background: 'rgba(20, 20, 20, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '3rem',
              maxWidth: '700px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontFamily: 'Cinzel',
                fontSize: '1.5rem',
                color: '#D4AF37',
                marginBottom: '1rem',
                letterSpacing: '0.1em'
              }}>
                COMING SOON
              </h2>
              <p style={{
                fontSize: '1.2rem',
                color: '#C0C0C0',
                lineHeight: 1.8,
                marginBottom: '1.5rem'
              }}>
                The Library will be your treasure trove of resources:
              </p>
              <div style={{
                textAlign: 'left',
                maxWidth: '500px',
                margin: '0 auto 2rem',
                fontSize: '1.1rem',
                color: '#E8E8E8',
                lineHeight: 2
              }}>
                <div style={{marginBottom: '0.75rem'}}>Writing courses & tutorials</div>
                <div style={{marginBottom: '0.75rem'}}>Publishing guides & templates</div>
                <div style={{marginBottom: '0.75rem'}}>Craft resources & tools</div>
                <div style={{marginBottom: '0.75rem'}}>Featured works from our community</div>
                <div style={{marginBottom: '0.75rem'}}>Industry insights & opportunities</div>
              </div>
              <p style={{
                fontStyle: 'italic',
                color: '#888',
                fontSize: '0.95rem',
                marginBottom: '2rem'
              }}>
                Building something beautiful takes time.
              </p>
              <p style={{
                fontSize: '1.05rem',
                color: '#D4AF37',
                marginBottom: '1.5rem'
              }}>
                Reserve your room now to be among the first welcomed in.
              </p>
              <button className="btn btn-primary" onClick={() => { setReservationStep(0); setShowReservation(true); }}>
                Reserve Your Room
              </button>
            </div>
          </div>
        )}

        {currentRoom === 3 && user && (
          <div className="guest-room">
            <div className="room-header">
              <h1 className="room-title">THE LIBRARY</h1>
              <p style={{fontSize: '1.2rem', color: '#C0C0C0', maxWidth: '700px', margin: '0 auto 2rem', lineHeight: 1.6}}>
                Your resource hub for craft, publishing, and literary excellence
              </p>
            </div>

            <div style={{
              background: 'rgba(20, 20, 20, 0.6)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '12px',
              padding: '3rem',
              maxWidth: '700px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              <h2 style={{
                fontFamily: 'Cinzel',
                fontSize: '1.5rem',
                color: '#D4AF37',
                marginBottom: '1rem',
                letterSpacing: '0.1em'
              }}>
                COMING SOON
              </h2>
              <p style={{
                fontFamily: 'Cormorant Garamond',
                fontSize: '1.2rem',
                color: '#C0C0C0',
                lineHeight: 1.8,
                marginBottom: '1.5rem'
              }}>
                The Library will be your treasure trove of resources:
              </p>
              <div style={{
                textAlign: 'left',
                maxWidth: '500px',
                margin: '0 auto 2rem',
                fontSize: '1.1rem',
                color: '#E8E8E8',
                lineHeight: 2
              }}>
                <div style={{marginBottom: '0.75rem'}}>Writing courses & tutorials</div>
                <div style={{marginBottom: '0.75rem'}}>Publishing guides & templates</div>
                <div style={{marginBottom: '0.75rem'}}>Craft resources & tools</div>
                <div style={{marginBottom: '0.75rem'}}>⭐ Featured works from our community</div>
                <div style={{marginBottom: '0.75rem'}}>Industry insights & opportunities</div>
              </div>
              <p style={{
                fontStyle: 'italic',
                color: '#888',
                fontSize: '0.95rem'
              }}>
                Building something beautiful takes time. Stay tuned for updates!
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {showReservation && (
        <div className="modal-overlay" onClick={() => setShowReservation(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={reservationStep >= 5 ? {maxWidth: '720px'} : {}}>
            {reservationStep === 0 && (
              <>
                <h2 className="modal-title">Welcome to The Book Lodge</h2>
                <p className="modal-subtitle">Tell us — who are you?</p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
                  {[
                    { type: 'reader', label: 'Reader', desc: 'Discover books, track your reading, and find your next favorite author.' },
                    { type: 'writer', label: 'Writer', desc: 'Showcase your work, connect with readers, and find your literary community.' },
                    { type: 'pro', label: 'Industry Professional', desc: 'Showcase your expertise and connect with writers seeking your services.' }
                  ].map(option => (
                    <div
                      key={option.type}
                      onClick={() => {
                        setReservationData({...reservationData, userType: option.type, proRole: option.type === 'pro' ? reservationData.proRole : ''});
                        handleReservationNext();
                      }}
                      style={{
                        padding: '1.5rem',
                        background: reservationData.userType === option.type ? 'rgba(212, 175, 55, 0.15)' : 'rgba(20, 20, 20, 0.6)',
                        border: `2px solid ${reservationData.userType === option.type ? '#D4AF37' : 'rgba(212, 175, 55, 0.2)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = reservationData.userType === option.type ? '#D4AF37' : 'rgba(212, 175, 55, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <h3 style={{fontFamily: 'Cinzel', fontSize: '1.2rem', color: '#D4AF37', marginBottom: '0.5rem'}}>{option.label}</h3>
                      <p style={{color: '#C0C0C0', fontSize: '0.9rem', lineHeight: 1.5}}>{option.desc}</p>
                    </div>
                  ))}
                </div>
                <p style={{textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#888'}}>
                  Already have a room?{' '}
                  <span
                    onClick={() => { setShowReservation(false); setSignInData({ email: '', password: '' }); setSignInError(''); setShowSignIn(true); }}
                    style={{color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline'}}
                  >
                    Sign in
                  </span>
                </p>
              </>
            )}

            {reservationStep === 1 && (
              <>
                <h2 className="modal-title">What's your name?</h2>
                <p className="modal-subtitle">Let's get to know you</p>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    value={reservationData.name}
                    onChange={(e) => setReservationData({...reservationData, name: e.target.value})}
                    placeholder="Your name"
                    autoFocus
                    style={{fontSize: '1.1rem', textAlign: 'center'}}
                  />
                </div>
                
                {/* Terms of Service */}
                <div className="form-group" style={{marginTop: '1.5rem'}}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    color: '#C0C0C0',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    textAlign: 'left'
                  }}>
                    <input
                      type="checkbox"
                      checked={reservationData.agreedToTerms || false}
                      onChange={(e) => setReservationData({...reservationData, agreedToTerms: e.target.checked})}
                      style={{
                        marginTop: '0.25rem',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    />
                    <span>
                      I agree to the Terms of Service. Book Lodge is a community for good, true, and beautiful work. Explicit sexual content, pornography, erotica, and gratuitously violent content are prohibited.
                    </span>
                  </label>
                </div>
                
                <button 
                  className="btn btn-primary"
                  onClick={handleReservationNext}
                  disabled={!reservationData.name.trim() || !reservationData.agreedToTerms}
                >
                  Continue
                </button>
              </>
            )}

            {reservationStep === 2 && (
              <>
                <h2 className="modal-title">And your email?</h2>
                <p className="modal-subtitle">So we can keep your room secure</p>
                <div className="form-group">
                  <input
                    type="email"
                    className="form-input"
                    value={reservationData.email}
                    onChange={(e) => setReservationData({...reservationData, email: e.target.value})}
                    placeholder="your@email.com"
                    autoFocus
                    style={{fontSize: '1.1rem', textAlign: 'center'}}
                  />
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleReservationNext}
                  disabled={!reservationData.email.trim()}
                >
                  Continue
                </button>
              </>
            )}

            {reservationStep === 3 && (
              <>
                <h2 className="modal-title">Create your room key</h2>
                <p className="modal-subtitle">Choose a password to keep your room secure</p>
                <div className="form-group">
                  <input
                    type="password"
                    className="form-input"
                    value={reservationData.password}
                    onChange={(e) => setReservationData({...reservationData, password: e.target.value})}
                    placeholder="Create a password"
                    autoFocus
                    style={{fontSize: '1.1rem', textAlign: 'center'}}
                  />
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleReservationNext}
                  disabled={!reservationData.password.trim()}
                >
                  Continue
                </button>
              </>
            )}

            {reservationStep === 4 && reservationData.userType === 'pro' && (
              <>
                <h2 className="modal-title">What's your role?</h2>
                <p className="modal-subtitle">Help writers find the right professional</p>
                <div className="form-group">
                  <select 
                    className="form-select"
                    value={reservationData.proRole}
                    onChange={(e) => setReservationData({...reservationData, proRole: e.target.value})}
                    style={{fontSize: '1.05rem'}}
                  >
                    <option value="">Select your role...</option>
                    <option value="agent">Literary Agent</option>
                    <option value="editor">Developmental Editor</option>
                    <option value="copyeditor">Copy Editor / Proofreader</option>
                    <option value="designer">Cover Designer</option>
                    <option value="formatter">Book Formatter / Interior Designer</option>
                    <option value="publisher">Publisher</option>
                    <option value="ghostwriter">Ghostwriter</option>
                    <option value="publicist">Book Publicist / PR</option>
                    <option value="marketer">Book Marketer / Ads Specialist</option>
                    <option value="socialmedia">Social Media / Author Platform Specialist</option>
                    <option value="narrator">Audiobook Narrator / Producer</option>
                    <option value="translator">Literary Translator</option>
                    <option value="illustrator">Illustrator</option>
                    <option value="booktrailer">Book Trailer / Video Producer</option>
                    <option value="coach">Writing Coach / Book Coach</option>
                    <option value="sensitivity">Sensitivity / Authenticity Reader</option>
                    <option value="rights">Rights Manager / Foreign Rights</option>
                    <option value="other">Other Book Professional</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Why You Do What You Do (Optional)</label>
                  <textarea
                    className="form-textarea"
                    value={reservationData.bio}
                    onChange={(e) => setReservationData({...reservationData, bio: e.target.value})}
                    placeholder="What drives your work in the literary world?"
                  />
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleReservationNext}
                  disabled={!reservationData.proRole}
                >
                  Continue
                </button>
              </>
            )}

            {reservationStep === 4 && reservationData.userType !== 'pro' && (
              <>
                <h2 className="modal-title">Almost there!</h2>
                <p className="modal-subtitle">Share your story</p>
                <div className="form-group">
                  <label className="form-label">
                    {reservationData.userType === 'writer' ? 'Why You Write' : 'Why You Read'}
                  </label>
                  <textarea
                    className="form-textarea"
                    value={reservationData.bio}
                    onChange={(e) => setReservationData({...reservationData, bio: e.target.value})}
                    placeholder={reservationData.userType === 'writer' 
                      ? "What drives you to write? What's your mission? (Optional)" 
                      : "What draws you to books? What are you looking for? (Optional)"}
                  />
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={handleReservationNext}
                >
                  Continue
                </button>
              </>
            )}

            {reservationStep === 5 && (
              <>
                <h2 className="modal-title">Help us connect you</h2>
                <p className="modal-subtitle" style={{marginBottom: '2rem'}}>So Wells can introduce you to the right Lodgers</p>
                
                {/* Genres */}
                <div className="form-group">
                  <label className="form-label">
                    {reservationData.userType === 'reader' ? 'Genres I Love' : 'Genres I Write/Read'}
                  </label>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                    {['Literary Fiction', 'Fantasy', 'Sci-Fi', 'Romance', 'Mystery', 'Thriller / Suspense', 'Horror', 'Historical Fiction', 'Contemporary Fiction', 'Dystopian', 'Magical Realism', 'Women\'s Fiction', 'Christian Fiction', 'Faith-Based', 'YA / Teen', 'Middle Grade', 'Children\'s', 'Memoir', 'Biography', 'Self-Help', 'True Crime', 'Narrative Nonfiction', 'Poetry', 'Essay / Creative Nonfiction', 'Short Stories', 'Graphic Novels / Comics', 'Romantasy', 'Cozy Mystery', 'Dark Academia', 'Afrofuturism', 'Westerns', 'Satire / Humor'].map(genre => (
                      <label key={genre} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                        <input
                          type="checkbox"
                          checked={reservationData.genres.includes(genre)}
                          onChange={(e) => {
                            const newGenres = e.target.checked
                              ? [...reservationData.genres, genre]
                              : reservationData.genres.filter(g => g !== genre);
                            setReservationData({...reservationData, genres: newGenres});
                          }}
                        />
                        <span style={{color: '#C0C0C0', fontSize: '0.95rem'}}>{genre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Themes */}
                <div className="form-group">
                  <label className="form-label">Themes I'm Interested In (Optional)</label>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                    {['Redemption', 'Good vs Evil', 'Faith & Doubt', 'Grief & Loss', 'Found Family', 'Forbidden Love', 'Coming of Age', 'Identity & Belonging', 'Social Justice', 'Mental Health', 'Slow Burn Romance', 'Enemies to Lovers', 'Chosen One', 'Unreliable Narrator', 'Moral Ambiguity', 'Healing & Recovery', 'Sacrifice', 'Second Chances', 'Power & Corruption', 'Nature & Solitude', 'Cultural Heritage', 'Immigration & Diaspora', 'War & Its Aftermath', 'Spiritual Journey', 'The Sacred & Mundane', 'Motherhood / Fatherhood', 'Friendship', 'Survival', 'Time & Memory', 'Hope Against Odds'].map(theme => (
                      <label key={theme} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                        <input
                          type="checkbox"
                          checked={reservationData.themes.includes(theme)}
                          onChange={(e) => {
                            const newThemes = e.target.checked
                              ? [...reservationData.themes, theme]
                              : reservationData.themes.filter(t => t !== theme);
                            setReservationData({...reservationData, themes: newThemes});
                          }}
                        />
                        <span style={{color: '#C0C0C0', fontSize: '0.95rem'}}>{theme}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* What they're looking for - Writers */}
                {reservationData.userType === 'writer' && (
                  <div className="form-group">
                    <label className="form-label">I'm Looking For (Optional)</label>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem'}}>
                      {['Beta Readers', 'Critique Partners', 'Writing Buddies', 'Accountability Partner', 'Cover Designer', 'Developmental Editor', 'Copy Editor', 'Literary Agent', 'Publisher', 'Formatter', 'Sensitivity Reader', 'Book Club'].map(need => (
                        <label key={need} style={{display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'}}>
                          <input
                            type="checkbox"
                            checked={reservationData.lookingFor.includes(need)}
                            onChange={(e) => {
                              const newLookingFor = e.target.checked
                                ? [...reservationData.lookingFor, need]
                                : reservationData.lookingFor.filter(l => l !== need);
                              setReservationData({...reservationData, lookingFor: newLookingFor});
                            }}
                            style={{flexShrink: 0}}
                          />
                          <span style={{color: '#C0C0C0', fontSize: '0.9rem'}}>{need}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* What they're looking for - Pros */}
                {reservationData.userType === 'pro' && (
                  <div className="form-group">
                    <label className="form-label">I'm Looking For (Optional)</label>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                      {['Authors Seeking My Services', 'Referral Partners', 'Collaboration Partners', 'Testimonials & Case Studies', 'Speaking & Teaching Opportunities', 'Industry Connections', 'Mentorship Opportunities', 'Writers to Champion'].map(need => (
                        <label key={need} style={{display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'}}>
                          <input
                            type="checkbox"
                            checked={reservationData.lookingFor.includes(need)}
                            onChange={(e) => {
                              const newLookingFor = e.target.checked
                                ? [...reservationData.lookingFor, need]
                                : reservationData.lookingFor.filter(l => l !== need);
                              setReservationData({...reservationData, lookingFor: newLookingFor});
                            }}
                            style={{flexShrink: 0}}
                          />
                          <span style={{color: '#C0C0C0', fontSize: '0.9rem'}}>{need}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* What they're looking for - Readers */}
                {reservationData.userType === 'reader' && (
                  <div className="form-group">
                    <label className="form-label">I'm Looking For (Optional)</label>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                      {['New Authors to Follow', 'Book Club', 'Reading Buddies', 'ARC / Early Reader Copies', 'Author Events & Signings', 'Behind-the-Scenes Access'].map(need => (
                        <label key={need} style={{display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer'}}>
                          <input
                            type="checkbox"
                            checked={reservationData.lookingFor.includes(need)}
                            onChange={(e) => {
                              const newLookingFor = e.target.checked
                                ? [...reservationData.lookingFor, need]
                                : reservationData.lookingFor.filter(l => l !== need);
                              setReservationData({...reservationData, lookingFor: newLookingFor});
                            }}
                            style={{flexShrink: 0}}
                          />
                          <span style={{color: '#C0C0C0', fontSize: '0.9rem'}}>{need}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  className="btn btn-primary"
                  onClick={handleReservationComplete}
                  disabled={reservationData.genres.length === 0}
                >
                  Welcome Home
                </button>
                
                <p style={{fontSize: '0.85rem', color: '#888', marginTop: '1rem', textAlign: 'center'}}>
                  Select at least one genre to continue
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && user && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Reserve Your Room</h2>
            <p className="modal-subtitle">Keep your room and continue your journey</p>
            
            <div className="pricing-box">
              <div className="pricing-amount">${getUserPrice()}</div>
              <div className="pricing-period">/month</div>
              
              <ul className="pricing-features">
                {user.userType === 'reader' && (
                  <>
                    <li>📚 50 messages/month with Wells</li>
                    <li>🏠 Your Guest Room portfolio</li>
                    <li>🔗 Shareable profile link</li>
                  </>
                )}
                {user.userType === 'writer' && (
                  <>
                    <li>✍️ 150 messages/month with Wells</li>
                    <li>📚 All Reader features</li>
                    <li>🏠 Showcase works & WIPs</li>
                    <li>🔗 Shareable profile link</li>
                    <li>🤝 Connect with pros</li>
                  </>
                )}
                {user.userType === 'pro' && (
                  <>
                    <li>💬 Unlimited messages with Wells</li>
                    <li>📚 All Reader & Writer features</li>
                    <li>🏆 Professional badge</li>
                    <li>🔗 Featured in Pro directory</li>
                    <li>⭐ Priority support</li>
                  </>
                )}
              </ul>
            </div>

            <button className="btn btn-primary">
              Subscribe Now
              <div className="btn-note">Payment setup coming soon</div>
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => setShowUpgradeModal(false)}
              style={{marginTop: '1rem', width: '100%'}}
            >
              Maybe Later
            </button>
            
            <p style={{textAlign: 'center', fontSize: '0.85rem', color: '#888', marginTop: '1.5rem'}}>
              Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      )}

      {/* Beta Reader Signup Modal */}
      {showBetaModal && currentWipForBeta && (
        <div className="modal-overlay" onClick={() => setShowBetaModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Read Beta Copy</h2>
            <p className="modal-subtitle">Join the beta readers for "{currentWipForBeta.title}"</p>
            
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                value={betaSignupData.name}
                onChange={(e) => setBetaSignupData({...betaSignupData, name: e.target.value})}
                placeholder="First name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Email</label>
              <input
                type="email"
                className="form-input"
                value={betaSignupData.email}
                onChange={(e) => setBetaSignupData({...betaSignupData, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                cursor: 'pointer',
                color: '#C0C0C0',
                fontSize: '0.95rem',
                lineHeight: 1.5
              }}>
                <input
                  type="checkbox"
                  checked={betaSignupData.consent}
                  onChange={(e) => setBetaSignupData({...betaSignupData, consent: e.target.checked})}
                  style={{
                    marginTop: '0.25rem',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer'
                  }}
                />
                <span>
                  I understand that by providing my email, I am giving permission for the author to contact me regarding this work and future updates. The author will not share my information with third parties.
                </span>
              </label>
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleBetaSignupSubmit}
              disabled={!betaSignupData.name.trim() || !betaSignupData.email.trim() || !betaSignupData.consent}
              style={{width: '100%', marginBottom: '1rem'}}
            >
              Download Beta Copy
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => setShowBetaModal(false)}
              style={{width: '100%'}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Download Success Notification */}
      {showDownloadSuccess && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: 'rgba(46, 204, 113, 0.95)',
          border: '1px solid rgba(46, 204, 113, 0.5)',
          borderRadius: '12px',
          padding: '1.5rem 2rem',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 9999,
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            fontFamily: 'Cinzel',
            fontSize: '1.1rem',
            color: '#fff',
            marginBottom: '0.3rem',
            letterSpacing: '0.05em'
          }}>
            PDF Downloaded!
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond',
            fontSize: '0.95rem',
            color: 'rgba(255, 255, 255, 0.9)'
          }}>
            Check your Downloads folder
          </div>
        </div>
      )}

      {/* Housekeeping Feedback Modal */}
      {showFeedback && (
        <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">HOUSEKEEPING</h2>
            <p className="modal-subtitle">Would you like to provide feedback on the BOOK LODGE experience or ask for more useful features?</p>
            
            <div className="form-group">
              <textarea
                className="form-textarea"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you'd like cleaned up, changed, or added..."
                style={{minHeight: '200px'}}
                autoFocus
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={async () => {
                try {
                  // Send feedback via FormSubmit
                  const formData = new FormData();
                  formData.append('message', feedbackText);
                  formData.append('user', user ? user.email : 'Anonymous');
                  formData.append('userType', user ? user.userType : 'Guest');
                  formData.append('_subject', 'Book Lodge Feedback');
                  
                  await fetch('https://formsubmit.co/thebooklodge.housekeeping@gmail.com', {
                    method: 'POST',
                    body: formData
                  });
                  
                  showToast('Thank you for your feedback! We appreciate your input.');
                  setFeedbackText('');
                  setShowFeedback(false);
                } catch (error) {
                  console.error('Error submitting feedback:', error);
                  showToast('Feedback submitted! (Note: You may see a confirmation page on first use)');
                  setFeedbackText('');
                  setShowFeedback(false);
                }
              }}
              disabled={!feedbackText.trim()}
              style={{width: '100%', marginBottom: '1rem'}}
            >
              Submit Feedback
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setFeedbackText('');
                setShowFeedback(false);
              }}
              style={{width: '100%'}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Connection Request Modal */}
      {showConnectionRequest && connectionTargetUser && (
        <div className="modal-overlay" onClick={() => setShowConnectionRequest(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Request to Connect</h2>
            <p className="modal-subtitle">Send a connection request to {connectionTargetUser.name}</p>
            
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input
                type="text"
                className="form-input"
                value={connectionRequestData.name}
                onChange={(e) => setConnectionRequestData({...connectionRequestData, name: e.target.value})}
                placeholder="First name"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Email</label>
              <input
                type="email"
                className="form-input"
                value={connectionRequestData.email}
                onChange={(e) => setConnectionRequestData({...connectionRequestData, email: e.target.value})}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Message (Optional)</label>
              <textarea
                className="form-textarea"
                value={connectionRequestData.message}
                onChange={(e) => setConnectionRequestData({...connectionRequestData, message: e.target.value})}
                placeholder="Introduce yourself or mention why you'd like to connect..."
                style={{minHeight: '100px'}}
              />
            </div>

            <button 
              className="btn btn-primary"
              onClick={handleSubmitConnectionRequest}
              disabled={!connectionRequestData.name.trim() || !connectionRequestData.email.trim()}
              style={{width: '100%', marginBottom: '1rem'}}
            >
              Send Connection Request
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowConnectionRequest(false);
                setConnectionRequestData({ name: '', email: '', message: '' });
                setConnectionTargetUser(null);
              }}
              style={{width: '100%'}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reading Modal for Short Stories/Poetry/Essays */}
      {showReadModal && currentReading && (
        <div className="modal-overlay" onClick={() => setShowReadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px', maxHeight: '90vh', overflow: 'auto'}}>
            
            {!hasJoinedReaderList ? (
              <>
                <h2 className="modal-title">{currentReading.piece.title}</h2>
                {currentReading.piece.author && (
                  <p className="modal-subtitle">by {currentReading.piece.author}</p>
                )}
                
                <div style={{
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <p style={{
                    fontFamily: 'Cinzel',
                    fontSize: '1rem',
                    color: '#D4AF37',
                    marginBottom: '1rem',
                    textAlign: 'center',
                    letterSpacing: '0.05em'
                  }}>
                    Join {user?.name || 'this author'}'s Reader List
                  </p>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#C0C0C0',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                  }}>
                    Stay updated with new stories, poems, and essays
                  </p>
                  
                  <div className="form-group">
                    <input
                      type="text"
                      className="form-input"
                      value={readerSignup.name}
                      onChange={(e) => setReaderSignup({...readerSignup, name: e.target.value})}
                      placeholder="Your first name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-input"
                      value={readerSignup.email}
                      onChange={(e) => setReaderSignup({...readerSignup, email: e.target.value})}
                      placeholder="Your email"
                    />
                  </div>
                  
                  <button
                    className="btn btn-primary"
                    onClick={handleJoinReaderList}
                    disabled={!readerSignup.name.trim() || !readerSignup.email.trim()}
                    style={{width: '100%', marginBottom: '1rem'}}
                  >
                    Join & Read
                  </button>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={handleSkipAndRead}
                    style={{width: '100%'}}
                  >
                    Skip & Read
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="modal-title">{currentReading.piece.title}</h2>
                {currentReading.piece.author && (
                  <p className="modal-subtitle" style={{marginBottom: '2rem'}}>by {currentReading.piece.author}</p>
                )}
                
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: '#E8E8E8',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '2rem',
                  fontStyle: currentReading.category === 'poetry' ? 'italic' : 'normal'
                }}>
                  {currentReading.piece.content}
                </div>
                
                <div style={{
                  borderTop: '1px solid rgba(212, 175, 55, 0.3)',
                  paddingTop: '1rem',
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#888'
                }}>
                  © {new Date().getFullYear()} {currentReading.piece.author || user?.name}. All Rights Reserved.
                </div>
                
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReadModal(false)}
                  style={{width: '100%', marginTop: '1.5rem'}}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ====== CREATE READING CIRCLE MODAL ====== */}
      {showCreateCircle && (
        <div className="modal-overlay" onClick={() => setShowCreateCircle(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '550px'}}>
            <h2 className="modal-title">Create a Reading Circle</h2>
            <p className="modal-subtitle">Gather readers around a shared book</p>

            <div className="form-group">
              <label className="form-label">Circle Name</label>
              <input type="text" className="form-input" value={newCircle.name} onChange={(e) => setNewCircle({...newCircle, name: e.target.value})} placeholder="e.g. The Wednesday Night Readers" autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea className="form-textarea" value={newCircle.description} onChange={(e) => setNewCircle({...newCircle, description: e.target.value})} placeholder="What's your circle about?" style={{minHeight: '80px'}} />
            </div>
            <div className="form-group">
              <label className="form-label">Book Title</label>
              <input type="text" className="form-input" value={newCircle.bookTitle} onChange={(e) => setNewCircle({...newCircle, bookTitle: e.target.value})} placeholder="What are you reading?" />
            </div>
            <div className="form-group">
              <label className="form-label">Privacy</label>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                {['public', 'private', 'invite'].map(opt => (
                  <button key={opt} onClick={() => setNewCircle({...newCircle, privacy: opt})} style={{
                    flex: 1, padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize',
                    fontFamily: 'Cinzel', fontSize: '0.8rem', letterSpacing: '0.05em', transition: 'all 0.3s ease',
                    background: newCircle.privacy === opt ? 'rgba(212, 175, 55, 0.3)' : 'rgba(40, 40, 40, 0.5)',
                    border: `1px solid ${newCircle.privacy === opt ? '#D4AF37' : 'rgba(80, 80, 80, 0.5)'}`,
                    color: newCircle.privacy === opt ? '#D4AF37' : '#C0C0C0'
                  }}>
                    {opt === 'invite' ? 'Invite Only' : opt}
                  </button>
                ))}
              </div>
              <p style={{fontSize: '0.8rem', color: '#888', marginTop: '0.5rem'}}>
                {newCircle.privacy === 'public' && 'Anyone can join this circle.'}
                {newCircle.privacy === 'private' && 'Members must request to join.'}
                {newCircle.privacy === 'invite' && 'Members must be invited by the host.'}
              </p>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label className="form-label">Next Meeting Date</label>
                <input type="date" className="form-input" value={newCircle.meetingDate} onChange={(e) => setNewCircle({...newCircle, meetingDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Meeting Time</label>
                <input type="time" className="form-input" value={newCircle.meetingTime} onChange={(e) => setNewCircle({...newCircle, meetingTime: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Meeting Link (Optional)</label>
              <input type="url" className="form-input" value={newCircle.meetingLink} onChange={(e) => setNewCircle({...newCircle, meetingLink: e.target.value})} placeholder="https://zoom.us/..." />
            </div>
            <button className="btn btn-primary" onClick={handleCreateCircle} disabled={!newCircle.name.trim() || !newCircle.bookTitle.trim()} style={{width: '100%', marginBottom: '1rem'}}>
              Create Circle
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreateCircle(false)} style={{width: '100%'}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ====== CREATE SILENT BOOK CLUB EVENT MODAL ====== */}
      {showCreateSilentEvent && (
        <div className="modal-overlay" onClick={() => setShowCreateSilentEvent(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <h2 className="modal-title">Silent Book Club</h2>
            <p className="modal-subtitle">Host a quiet gathering of readers</p>
            <div style={{
              padding: '1rem', background: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.15)',
              borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center'
            }}>
              <p style={{fontSize: '0.9rem', color: '#C0C0C0', lineHeight: 1.6, fontStyle: 'italic'}}>
                Everyone brings their own book and reads in quiet companionship. No assigned reading, no discussion required.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Event Name</label>
              <input type="text" className="form-input" value={newSilentEvent.name} onChange={(e) => setNewSilentEvent({...newSilentEvent, name: e.target.value})} placeholder="e.g. Sunday Evening Silent Read" autoFocus />
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-input" value={newSilentEvent.date} onChange={(e) => setNewSilentEvent({...newSilentEvent, date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-input" value={newSilentEvent.time} onChange={(e) => setNewSilentEvent({...newSilentEvent, time: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Privacy</label>
              <div style={{display: 'flex', gap: '0.5rem'}}>
                {['public', 'private'].map(opt => (
                  <button key={opt} onClick={() => setNewSilentEvent({...newSilentEvent, privacy: opt})} style={{
                    flex: 1, padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize',
                    fontFamily: 'Cinzel', fontSize: '0.85rem', letterSpacing: '0.05em', transition: 'all 0.3s ease',
                    background: newSilentEvent.privacy === opt ? 'rgba(212, 175, 55, 0.3)' : 'rgba(40, 40, 40, 0.5)',
                    border: `1px solid ${newSilentEvent.privacy === opt ? '#D4AF37' : 'rgba(80, 80, 80, 0.5)'}`,
                    color: newSilentEvent.privacy === opt ? '#D4AF37' : '#C0C0C0'
                  }}>{opt}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location / Meeting Link (Optional)</label>
              <input type="text" className="form-input" value={newSilentEvent.location} onChange={(e) => setNewSilentEvent({...newSilentEvent, location: e.target.value})} placeholder="Physical address or https://zoom.us/..." />
              <p style={{fontSize: '0.8rem', color: '#888', marginTop: '0.5rem'}}>Enter a physical location or paste a virtual meeting link</p>
            </div>
            <button className="btn btn-primary" onClick={handleCreateSilentEvent} disabled={!newSilentEvent.name.trim() || !newSilentEvent.date} style={{width: '100%', marginBottom: '1rem'}}>
              Create Event
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCreateSilentEvent(false)} style={{width: '100%'}}>Cancel</button>
          </div>
        </div>
      )}

      {/* ====== READING CIRCLE DETAIL MODAL ====== */}
      {activeCircleId && (() => {
        const circle = readingCircles.find(c => c.id === activeCircleId);
        if (!circle) return null;
        const isHost = user && circle.hostId === user.id;
        const isMember = user && circle.members.some(m => m.id === user.id);
        const hasPending = user && circle.pendingRequests.some(r => r.id === user.id);
        const isEditing = editingCircleId === circle.id;

        return (
          <div className="modal-overlay" onClick={() => { setActiveCircleId(null); setEditingCircleId(null); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '650px', maxHeight: '90vh', overflow: 'auto'}}>

              {/* Header row */}
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                <span style={{
                  fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                  background: circle.privacy === 'public' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(100,100,100,0.25)',
                  color: circle.privacy === 'public' ? '#D4AF37' : '#999',
                  border: `1px solid ${circle.privacy === 'public' ? 'rgba(212,175,55,0.3)' : 'rgba(100,100,100,0.4)'}`,
                  textTransform: 'uppercase', fontFamily: 'Cinzel', letterSpacing: '0.05em'
                }}>{circle.privacy}</span>
                {isHost && (
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="btn btn-secondary" onClick={() => setEditingCircleId(isEditing ? null : circle.id)} style={{padding: '0.3rem 0.8rem', fontSize: '0.75rem'}}>
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                    <button onClick={() => handleDeleteCircle(circle.id)} style={{
                      padding: '0.3rem 0.8rem', fontSize: '0.75rem', background: 'rgba(200,50,50,0.2)',
                      border: '1px solid rgba(200,50,50,0.4)', borderRadius: '6px', color: '#ff6b6b', cursor: 'pointer'
                    }}>Delete</button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Circle Name</label>
                    <input type="text" className="form-input" defaultValue={circle.name} id="edit-circle-name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-textarea" defaultValue={circle.description} id="edit-circle-desc" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Book Title</label>
                    <input type="text" className="form-input" defaultValue={circle.bookTitle} id="edit-circle-book" />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div className="form-group">
                      <label className="form-label">Next Meeting Date</label>
                      <input type="date" className="form-input" defaultValue={circle.meetingDate} id="edit-circle-date" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Meeting Time</label>
                      <input type="time" className="form-input" defaultValue={circle.meetingTime} id="edit-circle-time" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meeting Link</label>
                    <input type="url" className="form-input" defaultValue={circle.meetingLink} id="edit-circle-link" placeholder="https://..." />
                  </div>
                  <button className="btn btn-primary" onClick={() => {
                    handleUpdateCircle(circle.id, {
                      name: document.getElementById('edit-circle-name').value,
                      description: document.getElementById('edit-circle-desc').value,
                      bookTitle: document.getElementById('edit-circle-book').value,
                      meetingDate: document.getElementById('edit-circle-date').value,
                      meetingTime: document.getElementById('edit-circle-time').value,
                      meetingLink: document.getElementById('edit-circle-link').value
                    });
                  }} style={{width: '100%'}}>Save Changes</button>
                </div>
              ) : (
                <div>
                  <h2 className="modal-title" style={{textAlign: 'left'}}>{circle.name}</h2>
                  <div style={{fontSize: '1.1rem', color: '#E8E8E8', marginBottom: '0.5rem', fontStyle: 'italic'}}>Reading: {circle.bookTitle}</div>
                  {circle.description && <p style={{fontSize: '1rem', color: '#C0C0C0', lineHeight: 1.6, marginBottom: '1rem'}}>{circle.description}</p>}
                  <div style={{fontSize: '0.95rem', color: '#C0C0C0', marginBottom: '0.4rem'}}>Hosted by <span style={{color: '#D4AF37'}}>{circle.hostName}</span></div>
                  {circle.meetingDate && (
                    <div style={{fontSize: '0.95rem', color: '#E8E8E8', marginBottom: '1rem'}}>
                      Next Meeting: {formatEventDate(circle.meetingDate, circle.meetingTime)}
                    </div>
                  )}
                  {circle.meetingLink && (
                    <a href={circle.meetingLink} target="_blank" rel="noopener noreferrer" style={{
                      display: 'inline-block', padding: '0.5rem 1.2rem', background: 'rgba(212,175,55,0.2)',
                      border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', color: '#D4AF37',
                      textDecoration: 'none', fontFamily: 'Cinzel', fontSize: '0.8rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', marginBottom: '1rem'
                    }}>Join Meeting →</a>
                  )}

                  {/* Share button */}
                  <div style={{marginTop: circle.meetingLink ? '0.5rem' : '1rem', marginBottom: '0.5rem'}}>
                    <button className="btn" onClick={() => handleShareEvent(
                      circle.name,
                      `Reading Circle: "${circle.bookTitle}"${circle.meetingDate ? '\n' + formatEventDate(circle.meetingDate, circle.meetingTime) : ''}${circle.description ? '\n' + circle.description : ''}`
                    )} style={{padding: '0.5rem 1.2rem', fontSize: '0.8rem'}}>
                      Share Invite
                    </button>
                  </div>

                  {/* Members list */}
                  <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(212,175,55,0.15)'}}>
                    <div style={{fontFamily: 'Cinzel', fontSize: '0.8rem', color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase'}}>
                      Members ({circle.members.length})
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.4rem'}}>
                      {circle.members.map(m => (
                        <span key={m.id} style={{
                          padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem',
                          background: m.role === 'host' ? 'rgba(212,175,55,0.2)' : 'rgba(60,60,60,0.5)',
                          color: m.role === 'host' ? '#D4AF37' : '#C0C0C0',
                          border: `1px solid ${m.role === 'host' ? 'rgba(212,175,55,0.4)' : 'rgba(80,80,80,0.5)'}`
                        }}>{m.name}{m.role === 'host' ? ' (Host)' : ''}</span>
                      ))}
                    </div>
                  </div>

                  {/* Join/Leave */}
                  {user && !isMember && !hasPending && (
                    <button className="btn btn-primary" onClick={() => handleJoinCircle(circle.id)} style={{width: '100%', marginTop: '1.5rem'}}>
                      {circle.privacy === 'public' ? 'Join Circle' : 'Request to Join'}
                    </button>
                  )}
                  {hasPending && !isMember && (
                    <p style={{marginTop: '1rem', textAlign: 'center', color: '#C0C0C0', fontStyle: 'italic', fontSize: '0.9rem'}}>Your request is pending.</p>
                  )}
                  {isMember && !isHost && (
                    <button className="btn btn-secondary" onClick={() => handleLeaveCircle(circle.id)} style={{width: '100%', marginTop: '1.5rem'}}>Leave Circle</button>
                  )}

                  {/* Pending requests (host) */}
                  {isHost && circle.pendingRequests.length > 0 && (
                    <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(212,175,55,0.15)'}}>
                      <div style={{fontFamily: 'Cinzel', fontSize: '0.8rem', color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase'}}>
                        Pending Requests ({circle.pendingRequests.length})
                      </div>
                      {circle.pendingRequests.map(req => (
                        <div key={req.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(60,60,60,0.3)'}}>
                          <span style={{color: '#E8E8E8'}}>{req.name}</span>
                          <div style={{display: 'flex', gap: '0.4rem'}}>
                            <button className="btn" onClick={() => handleApproveRequest(circle.id, req.id)} style={{padding: '0.25rem 0.6rem', fontSize: '0.7rem'}}>Approve</button>
                            <button className="btn btn-secondary" onClick={() => handleDenyRequest(circle.id, req.id)} style={{padding: '0.25rem 0.6rem', fontSize: '0.7rem'}}>Deny</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discussion thread */}
                  {isMember && (
                    <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(212,175,55,0.15)'}}>
                      <div style={{fontFamily: 'Cinzel', fontSize: '0.8rem', color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase', textAlign: 'center'}}>
                        Discussion
                      </div>
                      {circle.discussion.length === 0 ? (
                        <p style={{textAlign: 'center', color: '#888', fontStyle: 'italic', marginBottom: '1rem', fontSize: '0.9rem'}}>No messages yet.</p>
                      ) : (
                        <div style={{maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem'}}>
                          {circle.discussion.map(post => (
                            <div key={post.id} style={{
                              padding: '0.8rem', background: post.userId === user.id ? 'rgba(212,175,55,0.08)' : 'rgba(40,40,40,0.4)',
                              borderRadius: '8px', marginBottom: '0.5rem',
                              borderLeft: `3px solid ${post.userId === user.id ? 'rgba(212,175,55,0.5)' : 'rgba(80,80,80,0.5)'}`
                            }}>
                              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem'}}>
                                <span style={{fontSize: '0.8rem', color: '#D4AF37', fontFamily: 'Cinzel'}}>{post.userName}</span>
                                <span style={{fontSize: '0.75rem', color: '#666'}}>{new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                              </div>
                              <div style={{fontSize: '0.95rem', color: '#E8E8E8', lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>{post.text}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <input type="text" className="form-input" value={circleDiscussionInput}
                          onChange={(e) => setCircleDiscussionInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handlePostDiscussion(circle.id)}
                          placeholder="Share your thoughts..." style={{flex: 1}} />
                        <button className="btn" onClick={() => handlePostDiscussion(circle.id)} disabled={!circleDiscussionInput.trim()} style={{padding: '0.6rem 1.2rem'}}>Post</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-secondary" onClick={() => { setActiveCircleId(null); setEditingCircleId(null); }} style={{width: '100%', marginTop: '1.5rem'}}>Close</button>
            </div>
          </div>
        );
      })()}

      {/* ====== SILENT EVENT DETAIL MODAL ====== */}
      {activeSilentEventId && (() => {
        const evt = silentClubEvents.find(e => e.id === activeSilentEventId);
        if (!evt) return null;
        const isHost = user && evt.hostId === user.id;
        const isAttending = user && evt.attendees.some(a => a.id === user.id);
        const hasPending = user && (evt.pendingRequests || []).some(r => r.id === user.id);
        const isEditing = editingSilentEventId === evt.id;

        return (
          <div className="modal-overlay" onClick={() => { setActiveSilentEventId(null); setEditingSilentEventId(null); }}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '550px', maxHeight: '90vh', overflow: 'auto'}}>

              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                <span style={{
                  fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px',
                  background: evt.privacy === 'public' ? 'rgba(212,175,55,0.15)' : 'rgba(100,100,100,0.25)',
                  color: evt.privacy === 'public' ? '#D4AF37' : '#999',
                  border: `1px solid ${evt.privacy === 'public' ? 'rgba(212,175,55,0.3)' : 'rgba(100,100,100,0.4)'}`,
                  textTransform: 'uppercase', fontFamily: 'Cinzel', letterSpacing: '0.05em'
                }}>{evt.privacy}</span>
                {isHost && (
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button className="btn btn-secondary" onClick={() => setEditingSilentEventId(isEditing ? null : evt.id)} style={{padding: '0.3rem 0.8rem', fontSize: '0.75rem'}}>
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                    <button onClick={() => handleDeleteSilentEvent(evt.id)} style={{
                      padding: '0.3rem 0.8rem', fontSize: '0.75rem', background: 'rgba(200,50,50,0.2)',
                      border: '1px solid rgba(200,50,50,0.4)', borderRadius: '6px', color: '#ff6b6b', cursor: 'pointer'
                    }}>Cancel Event</button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div>
                  <div className="form-group">
                    <label className="form-label">Event Name</label>
                    <input type="text" className="form-input" defaultValue={evt.name} id="edit-silent-name" />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input type="date" className="form-input" defaultValue={evt.date} id="edit-silent-date" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <input type="time" className="form-input" defaultValue={evt.time} id="edit-silent-time" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location / Meeting Link</label>
                    <input type="text" className="form-input" defaultValue={evt.location} id="edit-silent-loc" placeholder="Address or https://..." />
                  </div>
                  <button className="btn btn-primary" onClick={() => {
                    handleUpdateSilentEvent(evt.id, {
                      name: document.getElementById('edit-silent-name').value,
                      date: document.getElementById('edit-silent-date').value,
                      time: document.getElementById('edit-silent-time').value,
                      location: document.getElementById('edit-silent-loc').value
                    });
                  }} style={{width: '100%'}}>Save Changes</button>
                </div>
              ) : (
                <div>
                  <h2 className="modal-title" style={{textAlign: 'left'}}>{evt.name}</h2>
                  <div style={{fontSize: '0.95rem', color: '#C0C0C0', marginBottom: '0.4rem'}}>Hosted by <span style={{color: '#D4AF37'}}>{evt.hostName}</span></div>
                  {evt.date && (
                    <div style={{fontSize: '1rem', color: '#E8E8E8', marginBottom: '0.75rem'}}>
                      {formatEventDate(evt.date, evt.time)}
                    </div>
                  )}
                  {evt.location && (
                    <div style={{marginBottom: '1rem'}}>
                      {evt.location.startsWith('http') ? (
                        <a href={evt.location} target="_blank" rel="noopener noreferrer" style={{
                          display: 'inline-block', padding: '0.5rem 1.2rem', background: 'rgba(212,175,55,0.2)',
                          border: '1px solid rgba(212,175,55,0.4)', borderRadius: '8px', color: '#D4AF37',
                          textDecoration: 'none', fontFamily: 'Cinzel', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase'
                        }}>Join Online →</a>
                      ) : (
                        <div style={{fontSize: '0.95rem', color: '#C0C0C0'}}>Location: {evt.location}</div>
                      )}
                    </div>
                  )}

                  {/* Share button */}
                  <div style={{marginBottom: '0.5rem'}}>
                    <button className="btn" onClick={() => handleShareEvent(
                      evt.name,
                      `Silent Book Club${evt.date ? '\n' + formatEventDate(evt.date, evt.time) : ''}${evt.location ? '\n' + (evt.location.startsWith('http') ? 'Online Event' : evt.location) : ''}\nBring your own book and read in good company.`
                    )} style={{padding: '0.5rem 1.2rem', fontSize: '0.8rem'}}>
                      Share Invite
                    </button>
                  </div>

                  {/* Attendees */}
                  <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(212,175,55,0.15)'}}>
                    <div style={{fontFamily: 'Cinzel', fontSize: '0.8rem', color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase'}}>
                      Attendees ({evt.attendees.length})
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.4rem'}}>
                      {evt.attendees.map(a => (
                        <span key={a.id} style={{
                          padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.85rem',
                          background: a.role === 'host' ? 'rgba(212,175,55,0.2)' : 'rgba(60,60,60,0.5)',
                          color: a.role === 'host' ? '#D4AF37' : '#C0C0C0',
                          border: `1px solid ${a.role === 'host' ? 'rgba(212,175,55,0.4)' : 'rgba(80,80,80,0.5)'}`
                        }}>{a.name}{a.role === 'host' ? ' (Host)' : ''}</span>
                      ))}
                    </div>
                  </div>

                  {/* RSVP/Leave */}
                  {user && !isAttending && !hasPending && (
                    <button className="btn btn-primary" onClick={() => handleRsvpSilentEvent(evt.id)} style={{width: '100%', marginTop: '1.5rem'}}>
                      {evt.privacy === 'public' ? 'RSVP' : 'Request to Attend'}
                    </button>
                  )}
                  {hasPending && !isAttending && (
                    <p style={{marginTop: '1rem', textAlign: 'center', color: '#C0C0C0', fontStyle: 'italic', fontSize: '0.9rem'}}>Your request is pending.</p>
                  )}
                  {isAttending && !isHost && (
                    <button className="btn btn-secondary" onClick={() => handleUnrsvpSilentEvent(evt.id)} style={{width: '100%', marginTop: '1.5rem'}}>Cancel RSVP</button>
                  )}

                  {/* Pending requests (host) */}
                  {isHost && (evt.pendingRequests || []).length > 0 && (
                    <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(212,175,55,0.15)'}}>
                      <div style={{fontFamily: 'Cinzel', fontSize: '0.8rem', color: '#D4AF37', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase'}}>
                        Pending Requests ({evt.pendingRequests.length})
                      </div>
                      {evt.pendingRequests.map(req => (
                        <div key={req.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(60,60,60,0.3)'}}>
                          <span style={{color: '#E8E8E8'}}>{req.name}</span>
                          <div style={{display: 'flex', gap: '0.4rem'}}>
                            <button className="btn" onClick={() => handleApproveSilentRequest(evt.id, req.id)} style={{padding: '0.25rem 0.6rem', fontSize: '0.7rem'}}>Approve</button>
                            <button className="btn btn-secondary" onClick={() => handleDenySilentRequest(evt.id, req.id)} style={{padding: '0.25rem 0.6rem', fontSize: '0.7rem'}}>Deny</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button className="btn btn-secondary" onClick={() => { setActiveSilentEventId(null); setEditingSilentEventId(null); }} style={{width: '100%', marginTop: '1.5rem'}}>Close</button>
            </div>
          </div>
        );
      })()}

      {/* ====== TOAST NOTIFICATION ====== */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 20, 20, 0.95)',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          borderRadius: '10px',
          padding: '1rem 2rem',
          color: '#E8E8E8',
          fontSize: '0.95rem',
          zIndex: 10000,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.3s ease',
          maxWidth: '90vw',
          textAlign: 'center'
        }}>
          <span style={{color: '#D4AF37', marginRight: '0.5rem'}}>✓</span>
          {toastMessage}
        </div>
      )}

      {/* ====== SIGN IN MODAL ====== */}
      {showSignIn && (
        <div className="modal-overlay" onClick={() => setShowSignIn(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '420px'}}>
            <h2 className="modal-title">Welcome Back</h2>
            <p className="modal-subtitle">Sign in to your room</p>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={signInData.email}
                onChange={(e) => { setSignInData({...signInData, email: e.target.value}); setSignInError(''); }}
                placeholder="your@email.com"
                autoFocus
                style={{fontSize: '1rem', textAlign: 'center'}}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={signInData.password}
                onChange={(e) => { setSignInData({...signInData, password: e.target.value}); setSignInError(''); }}
                placeholder="Your password"
                style={{fontSize: '1rem', textAlign: 'center'}}
                onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              />
            </div>

            {/* Forgot Password link */}
            <div style={{textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.5rem'}}>
              <span
                onClick={() => { setShowSignIn(false); setForgotEmail(''); setForgotPasswordStep('form'); setShowForgotPassword(true); }}
                style={{
                  color: '#D4AF37',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  fontFamily: 'Cormorant Garamond',
                  fontStyle: 'italic',
                  opacity: 0.85,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.opacity = 1}
                onMouseLeave={(e) => e.target.style.opacity = 0.85}
              >
                Forgot your room key?
              </span>
            </div>

            {signInError && (
              <div style={{
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 100, 100, 0.1)',
                border: '1px solid rgba(255, 100, 100, 0.3)',
                borderRadius: '8px',
                color: '#ff8080',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                {signInError}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSignIn}
              disabled={!signInData.email.trim() || !signInData.password.trim()}
              style={{width: '100%', marginBottom: '1rem'}}
            >
              Sign In
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowSignIn(false)}
              style={{width: '100%', marginBottom: '1.5rem'}}
            >
              Cancel
            </button>

            <p style={{textAlign: 'center', fontSize: '0.9rem', color: '#888'}}>
              New to the Lodge?{' '}
              <span
                onClick={() => { setShowSignIn(false); setReservationStep(0); setShowReservation(true); }}
                style={{color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline'}}
              >
                Reserve your room
              </span>
            </p>
          </div>
        </div>
      )}

      {/* ====== FORGOT PASSWORD MODAL ====== */}
      {showForgotPassword && (
        <div className="modal-overlay" onClick={handleForgotPasswordClose}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '420px'}}>

            {forgotPasswordStep === 'form' && (
              <>
                <h2 className="modal-title">Reset Room Key</h2>
                <p className="modal-subtitle" style={{lineHeight: 1.6}}>
                  Enter the email address on your account and we'll send you a link to create a new password.
                </p>

                <div className="form-group" style={{marginTop: '1.5rem'}}>
                  <label className="form-label">Your Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    autoFocus
                    style={{fontSize: '1rem', textAlign: 'center'}}
                    onKeyDown={(e) => e.key === 'Enter' && forgotEmail.trim() && handleForgotPasswordSubmit()}
                  />
                </div>

                {/* Backend note visible only in dev — remove before production */}
                <div style={{
                  margin: '0 0 1.5rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(212, 175, 55, 0.05)',
                  border: '1px dashed rgba(212, 175, 55, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  color: '#888',
                  fontStyle: 'italic'
                }}>
                  {/* 🔧 BACKEND TODO: Wire handleForgotPasswordSubmit() to POST /api/auth/forgot-password
                  with { email }. Generate a secure token, store with expiry (e.g. 1hr), 
                  email a reset link to the user. Never confirm whether email exists. */}
                  🔧 Backend hookup point — see code comment in handleForgotPasswordSubmit()
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleForgotPasswordSubmit}
                  disabled={!forgotEmail.trim()}
                  style={{width: '100%', marginBottom: '1rem'}}
                >
                  Send Reset Link
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleForgotPasswordClose}
                  style={{width: '100%'}}
                >
                  Cancel
                </button>
              </>
            )}

            {forgotPasswordStep === 'sent' && (
              <>
                <div style={{textAlign: 'center', padding: '1rem 0'}}>
                  <div style={{fontSize: '3rem', marginBottom: '1.5rem'}}>✉️</div>
                  <h2 className="modal-title">Check Your Inbox</h2>
                  <p style={{
                    color: '#C0C0C0',
                    fontSize: '1.05rem',
                    lineHeight: 1.7,
                    marginBottom: '0.75rem'
                  }}>
                    If an account exists for <strong style={{color: '#D4AF37'}}>{forgotEmail}</strong>, we've sent a password reset link.
                  </p>
                  <p style={{
                    color: '#888',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    marginBottom: '2rem',
                    fontStyle: 'italic'
                  }}>
                    The link will expire in 1 hour. Check your spam folder if you don't see it.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={handleForgotPasswordClose}
                    style={{width: '100%', marginBottom: '1rem'}}
                  >
                    Back to Sign In
                  </button>

                  <p style={{fontSize: '0.88rem', color: '#888'}}>
                    Didn't receive it?{' '}
                    <span
                      onClick={() => { setForgotPasswordStep('form'); setForgotEmail(''); }}
                      style={{color: '#D4AF37', cursor: 'pointer', textDecoration: 'underline'}}
                    >
                      Try again
                    </span>
                  </p>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ====== PROFILE IMAGE CROP MODAL ====== */}
      {showCropModal && cropImageSrc && (
        <div className="modal-overlay" onClick={() => { setShowCropModal(false); setCropImageSrc(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '420px', textAlign: 'center'}}>
            <h2 className="modal-title">Crop Your Photo</h2>
            <p style={{color: '#C0C0C0', fontSize: '0.9rem', marginBottom: '1.5rem'}}>
              Drag to reposition. Use the slider to zoom.
            </p>

            {/* Crop area */}
            <div style={{
              width: '280px', height: '280px', borderRadius: '50%',
              overflow: 'hidden', margin: '0 auto 1.5rem',
              border: '3px solid rgba(212, 175, 55, 0.6)',
              position: 'relative', cursor: isDraggingCrop ? 'grabbing' : 'grab',
              background: '#111', touchAction: 'none'
            }}
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
              onTouchStart={handleCropMouseDown}
              onTouchMove={handleCropMouseMove}
              onTouchEnd={handleCropMouseUp}
            >
              <img
                ref={cropImgRef}
                src={cropImageSrc}
                alt="Crop preview"
                draggable={false}
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  transform: `translate(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px)) scale(${cropZoom})`,
                  maxWidth: 'none', maxHeight: 'none',
                  width: '280px', height: 'auto',
                  userSelect: 'none', pointerEvents: 'none'
                }}
                onLoad={(e) => {
                  // If image is taller than wide, set width to container; otherwise set height
                  const img = e.target;
                  if (img.naturalWidth > img.naturalHeight) {
                    img.style.width = 'auto';
                    img.style.height = '280px';
                  } else {
                    img.style.width = '280px';
                    img.style.height = 'auto';
                  }
                }}
              />
            </div>

            {/* Zoom slider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              maxWidth: '280px', margin: '0 auto 1.5rem'
            }}>
              <span style={{color: '#888', fontSize: '0.85rem', fontFamily: 'Cinzel'}}>−</span>
              <input
                type="range"
                min="0.5" max="3" step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                style={{
                  flex: 1, accentColor: '#D4AF37',
                  height: '4px', cursor: 'pointer'
                }}
              />
              <span style={{color: '#888', fontSize: '0.85rem', fontFamily: 'Cinzel'}}>+</span>
            </div>

            {/* Reset position */}
            <button 
              className="btn btn-secondary" 
              onClick={() => { setCropOffset({ x: 0, y: 0 }); setCropZoom(1); }}
              style={{marginBottom: '1rem', padding: '0.4rem 1rem', fontSize: '0.8rem'}}
            >
              Reset Position
            </button>

            <div style={{display: 'flex', gap: '0.75rem'}}>
              <button className="btn btn-primary" onClick={handleCropConfirm} style={{flex: 1}}>
                Save Photo
              </button>
              <button className="btn btn-secondary" onClick={() => { setShowCropModal(false); setCropImageSrc(null); }} style={{flex: 1}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLodgeApp;
