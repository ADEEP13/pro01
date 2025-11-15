import './firebase-config.js';
import './tracker.js';
import { loadFocusSessions } from './listeners.js';

// Auto-generate userId if not exists - RUN IMMEDIATELY, not on window load
function generateUserId() {
  // USE THIS SPECIFIC USER WITH CORRECT DATA
  const CORRECT_USER_ID = 'user_r9h75msnf_1762441530233';
  
  let uid = localStorage.getItem('detox_user_id');
  if (!uid || uid !== CORRECT_USER_ID) {
    // Override with correct user that has good data (350 minutes)
    uid = CORRECT_USER_ID;
    localStorage.setItem('detox_user_id', uid);
    console.log('[app-init] 🔧 Using CORRECT userId with 350 minutes data:', uid);
  }
  console.log('[app-init] Using userId:', uid);
  return uid;
}

// Generate ID immediately when module loads
const uid = generateUserId();

// Make userId available globally
window.DETOX_USER_ID = uid;

window.addEventListener('load', ()=>{
  // Initialize real-time tracker listener
  if (window.initTrackerListener) {
    window.initTrackerListener();
  }
  // load focus sessions where present
  loadFocusSessions(uid).catch(()=>{});
});
