/* ==========================================================================
   PulseConnect / Tribes - Core Mobile App Logic & State Manager
   ========================================================================== */

// --- Global Application State ---
const state = {
  activeTab: 'tab-chat',
  inviteCode: 'TRIBES-8849',
  isAuthenticated: true, // Default authenticated for demo
  isGuest: false,        // Guest Mode (Uninvited read-only view)
  currentUserIndex: 0,
  reviews: [],           // Preserved user exit reviews
  
  // Group Members (Privacy: Emails & Phones are private, never displayed!)
  members: [
    { id: 1, name: 'Alex Rivera', handle: '@alex_vibes', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', email: 'alex@tribe.com', phone: '+1-555-0192' },
    { id: 2, name: 'Sarah Jenkins', handle: '@sarah_j', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', email: 'sarah@tribe.com', phone: '+1-555-0144' },
    { id: 3, name: 'Jordan Lee', handle: '@jordan_l', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', email: 'jordan@tribe.com', phone: '+1-555-0177' },
    { id: 4, name: 'Priya Patel', handle: '@priya_p', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', email: 'priya@tribe.com', phone: '+1-555-0188' }
  ],

  // Chat Messages
  messages: [
    {
      id: 1,
      senderId: 2,
      text: "Hey everyone! Exciting weekend ahead. Don't forget to vote on the dinner poll! @alex_vibes @jordan_l",
      time: "2:15 PM",
      type: "text"
    },
    {
      id: 2,
      senderId: 3,
      text: "Just recorded a quick voice update on the beach meetup details 🎧",
      time: "2:18 PM",
      type: "voice",
      duration: "0:14"
    },
    {
      id: 3,
      senderId: 4,
      text: "Check out this venue location for Saturday!",
      time: "2:22 PM",
      type: "media",
      mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80"
    }
  ],

  // Group Polls (Active 7 Days)
  polls: [
    {
      id: 101,
      question: "Where should we grab dinner this Friday?",
      createdAt: Date.now() - 86400000,
      expiresAt: Date.now() + (6 * 86400000),
      options: [
        { id: 1, text: "Tacos & Margaritas", votes: [1, 2] },
        { id: 2, text: "Sunset Rooftop Pizza", votes: [3] },
        { id: 3, text: "Cozy Japanese Ramen", votes: [4] }
      ]
    }
  ],

  // Meetups & Events (Max 3/Week Limit Rule - Previewable by Guests!)
  events: [
    {
      id: 201,
      title: "Saturday Beach Chill",
      tagline: "Sunset drinks, volleyball & beach bonfire",
      dateTime: "2026-07-25T16:00",
      location: "Santa Monica Pier, Pier Ave, Santa Monica, CA",
      description: "Bring towels, snacks, and extra warm layer for the evening bonfire!",
      poster: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
      isDraft: false,
      weekNumber: 30
    },
    {
      id: 202,
      title: "Sunday Coffee & Boardgames",
      tagline: "Lazy morning mocha & Catan",
      dateTime: "2026-07-26T11:00",
      location: "Blue Bottle Coffee, 315 S Broadway, Los Angeles, CA",
      description: "Relaxed boardgame session. We have 4 games prepped!",
      poster: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80",
      isDraft: false,
      weekNumber: 30
    }
  ],

  draftEvents: [
    {
      id: 203,
      title: "Sunset Rooftop Lounge",
      tagline: "Cocktails & city views",
      dateTime: "2026-08-01T19:00",
      location: "Mama Shelter Rooftop, Selma Ave, Hollywood, CA",
      description: "Queued draft meetup from week 30 limit. Ready for week 31 publish!",
      isDraft: true,
      creatorId: 1
    }
  ],

  // Scheduled Calls with RSVP Ringing
  calls: [
    {
      id: 301,
      title: "Weekend Trip Planning Call",
      scheduledTime: "2026-07-24T18:00",
      rsvps: {
        1: 'OK',
        2: 'OK',
        3: 'NOT_OK',
        4: 'OK'
      },
      isOngoing: true
    }
  ],

  // Safety Taps State per Event
  safetyTaps: {
    201: {
      1: { rsvp: true, reached: true, safeHome: false },
      2: { rsvp: true, reached: true, safeHome: true },
      3: { rsvp: true, reached: false, safeHome: false },
      4: { rsvp: false, reached: false, safeHome: false }
    }
  }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  initNavigation();
  initAuthFlow();
  initUserSwitcher();
  initGuestModeHandlers();
  initSignoutReviewFlow();

  renderChat();
  renderCalendar();
  renderEventsList();
  renderSafetyTaps();
  renderCalls();

  initChatInputs();
  initModalTriggers();
});

// --- Guest Mode Handlers (Uninvited Read-Only Meetup View) ---
function initGuestModeHandlers() {
  const btnGuest = document.getElementById('btn-guest-preview');
  const banner = document.getElementById('guest-mode-banner');
  const btnUnlock = document.getElementById('btn-unlock-guest');
  const gateOverlay = document.getElementById('auth-gate-overlay');

  if (btnGuest) {
    btnGuest.addEventListener('click', () => {
      state.isGuest = true;
      gateOverlay.classList.add('hidden');
      banner.classList.remove('hidden');

      // Switch automatically to Meetups tab
      switchTab('tab-events');
      applyGuestRestrictions();
      showNotification("Entered Guest Mode. You can preview Meetups & Posters!");
    });
  }

  if (btnUnlock) {
    btnUnlock.addEventListener('click', () => {
      openAuthGate();
    });
  }
}

function applyGuestRestrictions() {
  const lockedElements = document.querySelectorAll('.action-lock-guest');
  lockedElements.forEach(el => {
    el.addEventListener('click', (e) => {
      if (state.isGuest) {
        e.preventDefault();
        e.stopPropagation();
        alert("🔒 Guest Mode Limit: Please enter an Invite Code to unlock Chat, Voting, Calls, and Safety Taps!");
        openAuthGate();
      }
    }, true);
  });
}

function openAuthGate() {
  const gateOverlay = document.getElementById('auth-gate-overlay');
  document.getElementById('auth-step-invite').classList.remove('hidden');
  document.getElementById('auth-step-method').classList.add('hidden');
  document.getElementById('auth-step-otp').classList.add('hidden');
  document.getElementById('auth-step-icebreaker').classList.add('hidden');
  gateOverlay.classList.remove('hidden');
}

// --- Signout Review & Silent Exit Workflow ---
function initSignoutReviewFlow() {
  const btnOpen = document.getElementById('btn-open-signout-review');
  const modal = document.getElementById('modal-signout-review');
  const btnSubmit = document.getElementById('btn-submit-signout-review');
  const inputReview = document.getElementById('input-signout-review');

  if (btnOpen) {
    btnOpen.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      const reviewText = inputReview.value.trim();
      if (!reviewText) {
        alert("Please write a quick review/reason before leaving the group.");
        return;
      }

      const currentUser = getCurrentUser();

      // Log review silently
      state.reviews.push({
        userId: currentUser.id,
        userName: currentUser.name,
        text: reviewText,
        timestamp: Date.now()
      });

      // Clear input & close modal
      inputReview.value = '';
      modal.classList.remove('active');

      // CRITICAL RULE: NO signout message is posted to chat!
      // Past chat messages, poll votes, and safety records remain intact.

      // Reset state and show onboarding gate as a new/returning user
      state.isAuthenticated = false;
      state.isGuest = false;

      openAuthGate();
      showNotification("You have signed out. Your past messages remain saved in the group.");
    });
  }
}

// --- User Switcher Handler ---
function initUserSwitcher() {
  const switchBtn = document.getElementById('user-switch-btn');
  if (!switchBtn) return;

  switchBtn.addEventListener('click', () => {
    if (state.isGuest) {
      alert("In Guest Mode. Enter invite code to switch member profiles.");
      openAuthGate();
      return;
    }

    state.currentUserIndex = (state.currentUserIndex + 1) % state.members.length;
    const currentUser = getCurrentUser();
    
    document.getElementById('current-user-avatar').src = currentUser.avatar;
    document.getElementById('current-user-name').textContent = currentUser.name.split(' ')[0];
    
    // Profile updates
    document.getElementById('profile-picture').src = currentUser.avatar;
    document.getElementById('profile-display-name').textContent = currentUser.name;
    document.getElementById('profile-handle').textContent = currentUser.handle;

    renderChat();
    renderSafetyTaps();
    renderCalls();

    showNotification(`Switched user view to ${currentUser.name}`);
  });
}

function getCurrentUser() {
  return state.members[state.currentUserIndex];
}

// --- Navigation Tabs ---
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(targetTabId) {
  const navItems = document.querySelectorAll('.nav-item');
  const tabViews = document.querySelectorAll('.tab-view');

  navItems.forEach(n => {
    if (n.getAttribute('data-tab') === targetTabId) {
      n.classList.add('active');
    } else {
      n.classList.remove('active');
    }
  });

  tabViews.forEach(v => {
    if (v.id === targetTabId) {
      v.classList.add('active');
    } else {
      v.classList.remove('active');
    }
  });

  state.activeTab = targetTabId;
}

// --- Auth & Invite Gate ---
function initAuthFlow() {
  const gateOverlay = document.getElementById('auth-gate-overlay');
  const stepInvite = document.getElementById('auth-step-invite');
  const stepMethod = document.getElementById('auth-step-method');
  const stepOtp = document.getElementById('auth-step-otp');
  const stepIcebreaker = document.getElementById('auth-step-icebreaker');
  const banner = document.getElementById('guest-mode-banner');

  // Verify Invite Code
  document.getElementById('btn-submit-invite').addEventListener('click', () => {
    const code = document.getElementById('input-invite-code').value.trim().toUpperCase();
    if (code === 'TRIBES-8849' || code === 'TRIBES') {
      stepInvite.classList.add('hidden');
      stepMethod.classList.remove('hidden');
    } else {
      alert('Invalid Invite Code! Please enter TRIBES-8849');
    }
  });

  // Method toggle (Email / Phone)
  const btnEmail = document.getElementById('btn-opt-email');
  const btnPhone = document.getElementById('btn-opt-phone');
  const inputLabel = document.getElementById('auth-input-label');
  const inputContact = document.getElementById('input-contact');

  btnEmail.addEventListener('click', () => {
    btnEmail.style.borderColor = 'var(--primary)';
    btnPhone.style.borderColor = 'var(--border-glass)';
    inputLabel.textContent = 'Enter Email Address';
    inputContact.placeholder = 'alex@example.com';
  });

  btnPhone.addEventListener('click', () => {
    btnPhone.style.borderColor = 'var(--primary)';
    btnEmail.style.borderColor = 'var(--border-glass)';
    inputLabel.textContent = 'Enter Mobile Phone Number';
    inputContact.placeholder = '+1 (555) 019-2834';
  });

  // Send 6-Digit OTP
  document.getElementById('btn-send-otp').addEventListener('click', () => {
    if (!inputContact.value.trim()) {
      alert('Please enter your email or phone number');
      return;
    }
    document.getElementById('otp-sent-to-text').textContent = `We sent a 6-digit verification code to ${inputContact.value}`;
    stepMethod.classList.add('hidden');
    stepOtp.classList.remove('hidden');
  });

  // Verify OTP Code
  document.getElementById('btn-verify-otp').addEventListener('click', () => {
    stepOtp.classList.add('hidden');
    stepIcebreaker.classList.remove('hidden');
  });

  // Submit Icebreaker & Enter App
  document.getElementById('btn-submit-icebreaker').addEventListener('click', () => {
    const vibe = document.getElementById('select-icebreaker-vibe').value;
    const currentUser = getCurrentUser();
    
    // Authenticated user
    state.isGuest = false;
    state.isAuthenticated = true;
    banner.classList.add('hidden');

    state.messages.push({
      id: Date.now(),
      senderId: currentUser.id,
      text: `👋 Just joined the tribe! Current vibe: ${vibe}`,
      time: getCurrentTimeStr(),
      type: "text"
    });

    gateOverlay.classList.add('hidden');
    renderChat();
    showNotification(`Welcome to Tribes, ${currentUser.name}!`);
  });
}

// --- Group Chat Component ---
function renderChat() {
  const list = document.getElementById('chat-messages-list');
  const currentUser = getCurrentUser();
  if (!list) return;

  list.innerHTML = '';

  state.messages.forEach(msg => {
    const sender = state.members.find(m => m.id === msg.senderId) || state.members[0];
    const isSelf = msg.senderId === currentUser.id;

    const row = document.createElement('div');
    row.className = `msg-row ${isSelf ? 'self' : ''}`;

    let bodyContent = '';

    if (msg.type === 'text') {
      let formattedText = msg.text.replace(/(@\w+)/g, '<span class="mention-tag">$1</span>');
      bodyContent = `<div>${formattedText}</div>`;
    } else if (msg.type === 'voice') {
      bodyContent = `
        <div>${msg.text}</div>
        <div class="voice-note-card">
          <button class="icon-btn" style="width:28px;height:28px;border-radius:50%;background:var(--primary);color:white;border:none;"><i data-lucide="play" style="width:12px;height:12px;"></i></button>
          <div class="waveform">
            <div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div><div class="wave-bar"></div>
          </div>
          <span style="font-size:0.7rem;color:var(--text-muted);">${msg.duration}</span>
        </div>
      `;
    } else if (msg.type === 'media') {
      bodyContent = `
        <div>${msg.text}</div>
        <img src="${msg.mediaUrl}" style="width:100%;max-height:180px;object-fit:cover;border-radius:12px;margin-top:6px;" alt="Media">
      `;
    }

    row.innerHTML = `
      <img src="${sender.avatar}" class="msg-avatar" alt="${sender.name}">
      <div class="msg-bubble">
        <div class="msg-header">
          <span class="msg-author">${sender.name}</span>
          <span class="msg-time">${msg.time}</span>
        </div>
        ${bodyContent}
      </div>
    `;

    list.appendChild(row);
  });

  renderPollsInChat(list);

  list.scrollTop = list.scrollHeight;
  if (window.lucide) lucide.createIcons();
}

function renderPollsInChat(container) {
  state.polls.forEach(poll => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

    const pollCard = document.createElement('div');
    pollCard.className = 'poll-card';
    
    let optionsHtml = poll.options.map(opt => {
      const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
      return `
        <div class="poll-option action-lock-guest" onclick="votePoll(${poll.id}, ${opt.id})">
          <div class="poll-progress" style="width: ${pct}%;"></div>
          <span class="poll-opt-text">${opt.text}</span>
          <span class="poll-opt-percent">${pct}% (${opt.votes.length})</span>
        </div>
      `;
    }).join('');

    pollCard.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span class="pinned-tag">ACTIVE POLL (1 WK)</span>
        <span style="font-size:0.7rem;color:var(--text-muted);"><i data-lucide="clock" style="width:10px;height:10px;display:inline;"></i> Expires in 6 days</span>
      </div>
      <div class="poll-question">${poll.question}</div>
      <div>${optionsHtml}</div>
    `;

    container.appendChild(pollCard);
  });
}

function votePoll(pollId, optionId) {
  if (state.isGuest) {
    alert("Guest Mode: Please enter invite code to vote in polls!");
    openAuthGate();
    return;
  }

  const poll = state.polls.find(p => p.id === pollId);
  if (!poll) return;

  const currentUser = getCurrentUser();
  
  poll.options.forEach(opt => {
    opt.votes = opt.votes.filter(id => id !== currentUser.id);
  });

  const selectedOpt = poll.options.find(o => o.id === optionId);
  if (selectedOpt) {
    selectedOpt.votes.push(currentUser.id);
  }

  renderChat();
  showNotification(`Voted for "${selectedOpt.text}"`);
}

function initChatInputs() {
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('btn-send-msg');
  const mentionsMenu = document.getElementById('mentions-menu');

  input.addEventListener('input', (e) => {
    if (state.isGuest) return;
    const val = input.value;
    const lastWord = val.split(' ').pop();

    if (lastWord.startsWith('@')) {
      showMentionsMenu(lastWord.slice(1));
    } else {
      mentionsMenu.classList.remove('active');
    }
  });

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  document.getElementById('btn-voice-note').addEventListener('click', () => {
    if (state.isGuest) {
      alert("Guest Mode: Enter invite code to send voice notes!");
      openAuthGate();
      return;
    }
    const currentUser = getCurrentUser();
    state.messages.push({
      id: Date.now(),
      senderId: currentUser.id,
      text: "🎤 Voice Note (0:12)",
      time: getCurrentTimeStr(),
      type: "voice",
      duration: "0:12"
    });
    renderChat();
    showNotification("Voice note recorded and sent!");
  });
}

function showMentionsMenu(query) {
  const menu = document.getElementById('mentions-menu');
  menu.innerHTML = '';

  const filtered = state.members.filter(m => m.name.toLowerCase().includes(query.toLowerCase()) || m.handle.toLowerCase().includes(query.toLowerCase()));

  if (filtered.length === 0) {
    menu.classList.remove('active');
    return;
  }

  filtered.forEach(m => {
    const item = document.createElement('div');
    item.className = 'mention-item';
    item.innerHTML = `
      <img src="${m.avatar}" style="width:24px;height:24px;border-radius:50%;" alt="${m.name}">
      <span><strong>${m.name}</strong> <small style="color:var(--accent-cyan);">${m.handle}</small></span>
    `;
    item.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      const words = input.value.split(' ');
      words.pop();
      words.push(m.handle);
      input.value = words.join(' ') + ' ';
      menu.classList.remove('active');
      input.focus();
    });
    menu.appendChild(item);
  });

  menu.classList.add('active');
}

function sendMessage() {
  if (state.isGuest) {
    alert("Guest Mode: Enter invite code to post messages!");
    openAuthGate();
    return;
  }

  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const currentUser = getCurrentUser();
  state.messages.push({
    id: Date.now(),
    senderId: currentUser.id,
    text: text,
    time: getCurrentTimeStr(),
    type: "text"
  });

  input.value = '';
  document.getElementById('mentions-menu').classList.remove('active');
  renderChat();
}

// --- Calendar & Events Component (Previewable by Uninvited Guests!) ---
function renderCalendar() {
  const grid = document.getElementById('calendar-grid-days');
  if (!grid) return;

  grid.innerHTML = '';

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  days.forEach(d => {
    const h = document.createElement('div');
    h.className = 'cal-day-header';
    h.textContent = d;
    grid.appendChild(h);
  });

  const meetupDays = [25, 26];

  for (let i = 1; i <= 31; i++) {
    const cell = document.createElement('div');
    const hasMeetup = meetupDays.includes(i);
    cell.className = `cal-cell ${hasMeetup ? 'has-meetup' : ''}`;
    cell.textContent = i;
    
    if (hasMeetup) {
      cell.title = "Scheduled Meetup";
    }

    grid.appendChild(cell);
  }
}

function renderEventsList() {
  const list = document.getElementById('events-list');
  if (!list) return;

  list.innerHTML = '';

  state.events.forEach(evt => {
    const card = document.createElement('div');
    card.className = 'event-card';

    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.location)}`;

    card.innerHTML = `
      <div class="event-title">${evt.title}</div>
      <div class="event-tagline">${evt.tagline}</div>
      ${evt.poster ? `<img src="${evt.poster}" style="width:100%;height:130px;object-fit:cover;border-radius:10px;margin-bottom:8px;" alt="Poster">` : ''}
      <div class="event-meta">
        <span><i data-lucide="calendar" style="width:12px;height:12px;display:inline;"></i> ${evt.dateTime.replace('T', ' ')}</span>
        <span><i data-lucide="clock" style="width:12px;height:12px;display:inline;"></i> 2 hrs</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text-sub);margin-bottom:8px;">${evt.description}</div>
      
      <a href="${mapUrl}" target="_blank" rel="noopener noreferrer" class="map-btn">
        <i data-lucide="map-pin"></i> Open Directions in Maps
      </a>
    `;

    list.appendChild(card);
  });

  const draftCard = document.getElementById('drafts-queue-card');
  if (state.draftEvents.length > 0) {
    draftCard.classList.remove('hidden');
    document.getElementById('draft-title-text').textContent = state.draftEvents[0].title;
  } else {
    draftCard.classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

// --- Safety Taps Component ---
function renderSafetyTaps() {
  const matrixList = document.getElementById('safety-matrix-list');
  if (!matrixList) return;

  matrixList.innerHTML = '';
  const currentEvtId = 201;
  const tapsData = state.safetyTaps[currentEvtId] || {};

  state.members.forEach(member => {
    const mData = tapsData[member.id] || { rsvp: false, reached: false, safeHome: false };

    let statusText = 'Pending';
    let badgeClass = 'badge-pending';

    if (mData.safeHome) {
      statusText = 'Safe at Home 🏠';
      badgeClass = 'badge-safe';
    } else if (mData.reached) {
      statusText = 'Arrived at Venue 📍';
      badgeClass = 'badge-reached';
    } else if (mData.rsvp) {
      statusText = 'RSVP Verified ✅';
      badgeClass = 'badge-rsvp';
    }

    const row = document.createElement('div');
    row.className = 'matrix-row';
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <img src="${member.avatar}" style="width:30px;height:30px;border-radius:50%;" alt="${member.name}">
        <div>
          <div style="font-weight:700;font-size:0.85rem;">${member.name}</div>
          <div style="font-size:0.7rem;color:var(--accent-cyan);">${member.handle}</div>
        </div>
      </div>
      <span class="badge-tag ${badgeClass}">${statusText}</span>
    `;

    matrixList.appendChild(row);
  });

  const currentUser = getCurrentUser();
  const uData = tapsData[currentUser.id] || { rsvp: false, reached: false, safeHome: false };

  const btnRsvp = document.getElementById('btn-tap-rsvp');
  const btnReached = document.getElementById('btn-tap-reached');
  const btnSafe = document.getElementById('btn-tap-safe');

  btnRsvp.disabled = uData.rsvp;
  btnRsvp.innerHTML = uData.rsvp ? `<i data-lucide="check"></i> RSVP VERIFIED` : `<i data-lucide="check-circle-2"></i> TAP TO RSVP (ATTENDING)`;

  btnReached.disabled = uData.reached;
  btnReached.innerHTML = uData.reached ? `<i data-lucide="check"></i> ARRIVED AT VENUE` : `<i data-lucide="map-pin"></i> TAP WHEN YOU ARRIVE`;

  btnSafe.disabled = uData.safeHome;
  btnSafe.innerHTML = uData.safeHome ? `<i data-lucide="shield-check"></i> SAFE AT HOME VERIFIED` : `<i data-lucide="shield-check"></i> TAP WHEN SAFE AT HOME`;

  btnRsvp.onclick = () => {
    if (state.isGuest) { alert("Guest Mode: Enter invite code to RSVP!"); openAuthGate(); return; }
    if (!tapsData[currentUser.id]) tapsData[currentUser.id] = {};
    tapsData[currentUser.id].rsvp = true;
    renderSafetyTaps();
    showNotification("RSVP verified for meetup!");
  };

  btnReached.onclick = () => {
    if (state.isGuest) { alert("Guest Mode: Enter invite code to check in!"); openAuthGate(); return; }
    if (!tapsData[currentUser.id]) tapsData[currentUser.id] = {};
    tapsData[currentUser.id].reached = true;
    renderSafetyTaps();
    showNotification("Marked as arrived at venue!");
  };

  btnSafe.onclick = () => {
    if (state.isGuest) { alert("Guest Mode: Enter invite code to mark Safe Home!"); openAuthGate(); return; }
    if (!tapsData[currentUser.id]) tapsData[currentUser.id] = {};
    tapsData[currentUser.id].safeHome = true;
    renderSafetyTaps();
    showNotification("Safe Home verified! Group has been notified.");
  };

  if (window.lucide) lucide.createIcons();
}

// --- Group Calls Component ---
function renderCalls() {
  const list = document.getElementById('scheduled-calls-list');
  if (!list) return;

  list.innerHTML = '';
  const currentUser = getCurrentUser();

  state.calls.forEach(call => {
    const userRsvp = call.rsvps[currentUser.id] || 'NONE';

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg-card);border:1px solid var(--border-glass);padding:14px;border-radius:16px;margin-bottom:12px;';
    
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-weight:800;font-size:0.95rem;">${call.title}</span>
        <span class="badge-tag ${userRsvp === 'OK' ? 'badge-safe' : 'badge-pending'}">Your Status: ${userRsvp}</span>
      </div>
      <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:12px;">
        <i data-lucide="clock" style="width:12px;height:12px;display:inline;"></i> Scheduled for ${call.scheduledTime.replace('T', ' ')}
      </div>

      <div style="display:flex;gap:10px;">
        <button class="btn-secondary action-lock-guest" onclick="respondCallRsvp(${call.id}, 'OK')" style="flex:1;${userRsvp === 'OK' ? 'border-color:var(--accent-emerald);color:var(--accent-emerald);' : ''}">
          <i data-lucide="check"></i> OK (Ring Me)
        </button>
        <button class="btn-secondary action-lock-guest" onclick="respondCallRsvp(${call.id}, 'NOT_OK')" style="flex:1;${userRsvp === 'NOT_OK' ? 'border-color:var(--accent-rose);color:var(--accent-rose);' : ''}">
          <i data-lucide="x"></i> Not OK (Skip Ring)
        </button>
      </div>

      <button class="btn-primary action-lock-guest" onclick="simulateCallRinging(${call.id})" style="margin-top:10px;font-size:0.8rem;padding:8px;">
        <i data-lucide="play"></i> Test Ringer Logic (Simulate Start)
      </button>
    `;

    list.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function respondCallRsvp(callId, status) {
  if (state.isGuest) { alert("Guest Mode: Enter invite code to RSVP for calls!"); openAuthGate(); return; }
  const call = state.calls.find(c => c.id === callId);
  if (!call) return;

  const currentUser = getCurrentUser();
  call.rsvps[currentUser.id] = status;

  renderCalls();
  showNotification(status === 'OK' ? "RSVP'd OK! App will ring you when call starts." : "RSVP'd Not OK. Ringer disabled for this call.");
}

function simulateCallRinging(callId) {
  if (state.isGuest) { alert("Guest Mode: Enter invite code to join calls!"); openAuthGate(); return; }
  const call = state.calls.find(c => c.id === callId);
  if (!call) return;

  const currentUser = getCurrentUser();
  const userRsvp = call.rsvps[currentUser.id];

  if (userRsvp === 'NOT_OK') {
    showNotification(`Ringer muted for ${currentUser.name} (Selected Not OK). Call is live in app for manual join anytime!`);
  } else {
    const ringModal = document.getElementById('call-ring-modal');
    document.getElementById('ring-call-title').textContent = call.title;
    ringModal.classList.remove('hidden');
  }
}

// --- Modals & Sheet Handlers ---
function initModalTriggers() {
  document.getElementById('invite-share-btn').addEventListener('click', copyInviteCode);
  document.getElementById('btn-copy-code-profile').addEventListener('click', copyInviteCode);

  document.getElementById('btn-ring-decline').addEventListener('click', () => {
    document.getElementById('call-ring-modal').classList.add('hidden');
  });

  document.getElementById('btn-ring-accept').addEventListener('click', () => {
    document.getElementById('call-ring-modal').classList.add('hidden');
    document.getElementById('call-room-modal').classList.remove('hidden');
  });

  document.getElementById('btn-join-ongoing-call').addEventListener('click', () => {
    if (state.isGuest) { alert("Guest Mode: Enter invite code to join call room!"); openAuthGate(); return; }
    document.getElementById('call-room-modal').classList.remove('hidden');
  });

  document.getElementById('btn-end-call').addEventListener('click', () => {
    document.getElementById('call-room-modal').classList.add('hidden');
  });

  document.getElementById('btn-minimize-call').addEventListener('click', () => {
    document.getElementById('call-room-modal').classList.add('hidden');
  });

  setupModalSheet('btn-open-schedule-call', 'modal-schedule-call');
  setupModalSheet('btn-open-create-event', 'modal-create-event');
  setupModalSheet('btn-create-poll', 'modal-create-poll');

  document.getElementById('btn-submit-schedule-call').addEventListener('click', () => {
    const title = document.getElementById('input-call-title').value.trim() || 'Group Catchup';
    const time = document.getElementById('input-call-time').value || '2026-07-25T18:00';

    state.calls.push({
      id: Date.now(),
      title: title,
      scheduledTime: time,
      rsvps: { 1: 'OK' }
    });

    closeAllModals();
    renderCalls();
    showNotification("Group call scheduled! Members notified for OK / Not OK RSVP.");
  });

  document.getElementById('btn-submit-create-event').addEventListener('click', () => {
    const title = document.getElementById('input-event-title').value.trim() || 'New Group Meetup';
    const tagline = document.getElementById('input-event-tagline').value.trim() || 'Fun gathering with the crew';
    const datetime = document.getElementById('input-event-datetime').value || '2026-07-25T16:00';
    const location = document.getElementById('input-event-location').value.trim() || 'Los Angeles, CA';
    const desc = document.getElementById('input-event-desc').value.trim() || 'See you guys there!';

    if (state.events.length >= 3) {
      state.draftEvents.push({
        id: Date.now(),
        title: title,
        tagline: tagline,
        dateTime: datetime,
        location: location,
        description: desc,
        isDraft: true,
        creatorId: getCurrentUser().id
      });

      closeAllModals();
      renderEventsList();
      alert("Weekly meetup limit (3/3) reached! Your event has been saved to your Draft Queue and can be published to the calendar next week.");
    } else {
      state.events.push({
        id: Date.now(),
        title: title,
        tagline: tagline,
        dateTime: datetime,
        location: location,
        description: desc,
        isDraft: false,
        poster: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&auto=format&fit=crop&q=80"
      });

      closeAllModals();
      renderEventsList();
      showNotification("Meetup added to Group Calendar!");
    }
  });

  document.getElementById('btn-submit-create-poll').addEventListener('click', () => {
    const q = document.getElementById('input-poll-question').value.trim();
    const opt1 = document.getElementById('input-poll-opt1').value.trim();
    const opt2 = document.getElementById('input-poll-opt2').value.trim();

    if (!q || !opt1 || !opt2) {
      alert("Please provide a question and at least 2 options.");
      return;
    }

    state.polls.push({
      id: Date.now(),
      question: q,
      createdAt: Date.now(),
      expiresAt: Date.now() + (7 * 86400000),
      options: [
        { id: 1, text: opt1, votes: [] },
        { id: 2, text: opt2, votes: [] }
      ]
    });

    closeAllModals();
    renderChat();
    showNotification("Poll pinned in group chat!");
  });

  document.getElementById('btn-publish-draft').addEventListener('click', () => {
    if (state.draftEvents.length > 0) {
      const draft = state.draftEvents.shift();
      draft.isDraft = false;
      state.events.push(draft);
      renderEventsList();
      showNotification(`Published "${draft.title}" to group calendar!`);
    }
  });
}

function setupModalSheet(triggerId, modalId) {
  const btn = document.getElementById(triggerId);
  const modal = document.getElementById(modalId);

  if (btn && modal) {
    btn.addEventListener('click', () => {
      if (state.isGuest) {
        alert("Guest Mode: Enter invite code to perform this action!");
        openAuthGate();
        return;
      }
      modal.classList.add('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
}

// --- Helpers ---
function copyInviteCode() {
  navigator.clipboard.writeText('TRIBES-8849').then(() => {
    showNotification("Invite code TRIBES-8849 copied to clipboard!");
  }).catch(() => {
    showNotification("Invite Code: TRIBES-8849");
  });
}

function getCurrentTimeStr() {
  const d = new Date();
  let hrs = d.getHours();
  let mins = d.getMinutes();
  const ampm = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12 || 12;
  mins = mins < 10 ? '0' + mins : mins;
  return `${hrs}:${mins} ${ampm}`;
}

function showNotification(msg) {
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed;top:60px;left:50%;transform:translateX(-50%);background:var(--primary);color:white;padding:10px 18px;border-radius:20px;font-size:0.8rem;font-weight:700;box-shadow:0 4px 16px rgba(0,0,0,0.4);z-index:200;animation:fadeIn 0.2s ease;';
  banner.textContent = msg;
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 3000);
}
