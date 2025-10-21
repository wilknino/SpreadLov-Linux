// Android Background Handler
// This file handles app lifecycle events from the Android WebView
// to properly manage chat window state for push notifications

import { useEffect } from 'react';

// Track current chat state
let currentOpenChatUserId: string | null = null;
let isAndroidApp = false;

// Detect if running in Android WebView
export function detectAndroidApp() {
  isAndroidApp = typeof (window as any).Android !== 'undefined';
  return isAndroidApp;
}

// Store current chat user ID
export function setCurrentChatUser(userId: string | null) {
  currentOpenChatUserId = userId;
  console.log('[AndroidBackgroundHandler] Current chat user:', userId);
}

// Get current chat user ID
export function getCurrentChatUser() {
  return currentOpenChatUserId;
}

// Initialize Android background handler
export function initAndroidBackgroundHandler() {
  if (typeof window === 'undefined') return;

  detectAndroidApp();

  if (!isAndroidApp) {
    console.log('[AndroidBackgroundHandler] Not running in Android app');
    return;
  }

  console.log('[AndroidBackgroundHandler] Initializing for Android app');

  // Listen for app going to background
  window.addEventListener('appGoingToBackground', () => {
    console.log('[AndroidBackgroundHandler] App going to background');
    
    // Close any open chat windows
    if (currentOpenChatUserId && (window as any).ws && (window as any).ws.readyState === 1) {
      console.log('[AndroidBackgroundHandler] Closing chat window with user:', currentOpenChatUserId);
      
      (window as any).ws.send(JSON.stringify({
        type: 'closeChatWindow',
        otherUserId: currentOpenChatUserId,
      }));
      
      console.log('[AndroidBackgroundHandler] Chat window closed');
    }
  });

  // Listen for app returning to foreground
  window.addEventListener('appReturningToForeground', () => {
    console.log('[AndroidBackgroundHandler] App returning to foreground');
    
    // Reopen chat window if user is still on chat page
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/chat/') && (window as any).ws && (window as any).ws.readyState === 1) {
      // Extract user ID from URL
      const userId = currentPath.split('/chat/')[1];
      if (userId) {
        console.log('[AndroidBackgroundHandler] Reopening chat window with user:', userId);
        
        (window as any).ws.send(JSON.stringify({
          type: 'openChatWindow',
          userId: userId,
        }));
        
        currentOpenChatUserId = userId;
        console.log('[AndroidBackgroundHandler] Chat window reopened');
      }
    }
  });

  console.log('[AndroidBackgroundHandler] Event listeners registered');
}

// React hook for Android background handling
export function useAndroidBackgroundHandler() {
  useEffect(() => {
    initAndroidBackgroundHandler();
  }, []);
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).AndroidBackgroundHandler = {
    setCurrentChatUser,
    getCurrentChatUser,
    detectAndroidApp,
  };
}
