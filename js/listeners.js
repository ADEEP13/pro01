import { db } from './firebase-config.js';
import { doc, onSnapshot, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

function getUserId() {
  let id = localStorage.getItem('detox_user_id');
  if (!id) {
    id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('detox_user_id', id);
    console.log('listeners.js generated userId:', id);
  }
  console.log('listeners.js using userId:', id);
  return id;
}

function formatMinutes(mins) {
  const h = Math.floor(mins/60);
  const m = mins%60;
  return h>0 ? `${h}h ${m}m` : `${m}m`;
}

function updateUsageUI(data) {
  const screenEl = document.querySelector('[data-screen-time]') || document.getElementById('screenTime');
  if (screenEl) screenEl.textContent = formatMinutes(data.totalScreenTime || 0);
  
  const focusEl = document.querySelector('[data-focus-sessions]') || document.getElementById('focusSessions');
  if (focusEl) focusEl.textContent = (data.focusSessions || Math.round((data.totalScreenTime||0)/25));
  
  const prodEl = document.querySelector('[data-productive-score]');
  if (prodEl) prodEl.textContent = (data.productiveScore!=null? data.productiveScore + '%':'—');
  
  const weeklyEl = document.querySelector('[data-weekly-goal]');
  if (weeklyEl) weeklyEl.textContent = (data.weeklyProgressPercent!=null? data.weeklyProgressPercent + '%':'—');
  
  // Update website breakdown
  const breakdownEl = document.getElementById('usageBreakdown');
  if (breakdownEl && data.websiteTimeBreakdown) {
    breakdownEl.innerHTML = Object.entries(data.websiteTimeBreakdown)
      .sort((a, b) => b[1] - a[1]) // Sort by time descending
      .map(([site, mins]) => {
        const hours = Math.floor(mins / 60);
        const m = mins % 60;
        const timeStr = hours > 0 ? `${hours}h ${m}m` : `${m}m`;
        return `<div class="flex justify-between p-2 bg-gray-100 rounded"><span>${site}</span><span>${timeStr}</span></div>`;
      })
      .join('');
  } else if (breakdownEl && data.usageBreakdown) {
    breakdownEl.innerHTML = Object.entries(data.usageBreakdown)
      .map(([k,v])=>`<div>${k}: ${formatMinutes(v)}</div>`)
      .join('');
  }
  
  // Update number of websites
  const websitesEl = document.getElementById('numberOfWebsites');
  if (websitesEl) websitesEl.textContent = data.numberOfWebsites || 0;
}

export function initRealtimeListeners(userId=null) {
  const uid = userId || getUserId();
  // Convert UTC date to local date by adding the timezone offset
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * -60 * 1000;
  const localDate = new Date(now.getTime() + offsetMs);
  
  const today = localDate.getUTCFullYear() + '-' + 
                String(localDate.getUTCMonth() + 1).padStart(2, '0') + '-' + 
                String(localDate.getUTCDate()).padStart(2, '0');
  // New structure: users/{userId}/daily/{date}
  const ref = doc(db, 'users', uid, 'daily', today);
  
  console.log('[listeners] Setting up real-time listener for:', {userId: uid, date: today});
  
  const unsub = onSnapshot(ref, snap => {
    if (!snap.exists()) { 
      console.log('[listeners] No data yet');
      updateUsageUI({}); 
      return; 
    }
    console.log('[listeners] Data received:', snap.data());
    updateUsageUI(snap.data());
  }, err => console.warn('[listeners] onSnapshot error', err));
  
  // Also listen for custom event from tracker
  window.addEventListener('usageUpdated', (e) => {
    console.log('[listeners] Usage updated event:', e.detail);
    updateUsageUI(e.detail);
  });
  
  return unsub;
}

export async function loadFocusSessions(userId=null) {
  const uid = userId || getUserId();
  // sessions stored under collection 'sessions' with subcollection uid or documents; try both
  const container = document.querySelector('[data-focus-history]');
  if (!container) return;
  container.innerHTML = '';
  // try collection sessions/{uid}/list
  try {
    const q = collection(db, 'sessions', uid, 'list');
    const snaps = await getDocs(q);
    snaps.forEach(d => {
      const s = d.data();
      const el = document.createElement('div');
      el.textContent = `${s.startTime || ''} — ${s.duration || 0} min`;
      container.appendChild(el);
    });
  } catch(e){
    // fallback: query sessions where userId == uid
    try {
      const q2 = collection(db, 'sessions');
      const all = await getDocs(q2);
      all.forEach(d=>{
        const s = d.data();
        if (s.userId === uid) {
          const el = document.createElement('div');
          el.textContent = `${s.startTime || ''} — ${s.duration || 0} min`;
          container.appendChild(el);
        }
      });
    } catch(e2){ console.warn(e2); }
  }
}
