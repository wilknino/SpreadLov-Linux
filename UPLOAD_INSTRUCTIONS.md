# SpreadLov - File Upload Instructions
**Date:** October 20, 2025 @ 6:40 PM

---

## ✅ **FILES TO UPLOAD TO LINUX CLOUD VM**

You MUST upload these 3 files to your Linux cloud VM to enable background notifications:

### **1. android-background-handler.ts**
- **From Replit:** `client/src/lib/android-background-handler.ts`
- **Upload to VM:** `/opt/spreadlov/client/src/lib/android-background-handler.ts`
- **Purpose:** Handles Android app lifecycle events (background/foreground)
- **Status:** ✅ NEW FILE - Must be uploaded

### **2. App.tsx** 
- **From Replit:** `client/src/App.tsx`
- **Upload to VM:** `/opt/spreadlov/client/src/App.tsx`
- **Purpose:** Initializes Android background handler
- **Status:** ✅ UPDATED - Replace your old version
- **Changes made:**
  - Added import: `import { initAndroidBackgroundHandler } from "./lib/android-background-handler";`
  - Added useEffect hook to initialize handler
  - Total: 3 lines added

### **3. chat-page.tsx**
- **From Replit:** `client/src/pages/chat-page.tsx`
- **Upload to VM:** `/opt/spreadlov/client/src/pages/chat-page.tsx`
- **Purpose:** Tracks which chat is currently open
- **Status:** ✅ UPDATED - Replace your old version
- **Changes made:**
  - Added import: `import { setCurrentChatUser } from "@/lib/android-background-handler";`
  - Added `setCurrentChatUser(chatUser.id)` when opening chat
  - Added `setCurrentChatUser(null)` when closing chat
  - Total: 4 lines added

---

## 📱 **ANDROID FILES (All in android/updatedfiles/ folder)**

All Android files are ready in the `android/updatedfiles/` folder for easy upload:

### **Files for Push Notifications:**

| File Name | Size | Upload to Android Studio |
|-----------|------|-------------------------|
| `MyFirebaseMessagingService.kt` | 6.9 KB | `app/src/main/java/com/spreadlov/app/` |
| `MainActivity_Updated.kt` | 15.4 KB | `app/src/main/java/com/spreadlov/app/` **RENAME to MainActivity.kt** |
| `WebViewInterface.kt` | 4.6 KB | `app/src/main/java/com/spreadlov/app/` |
| `IntentUtils.kt` | 1.3 KB | `app/src/main/java/com/spreadlov/app/` |
| `activity_main.xml` | 1.1 KB | `app/src/main/res/layout/` |

**Other files in android/updatedfiles/ (for reference):**
- `MainActivity_NOTIFICATION_FIX.kt` - Alternative version (use MainActivity_Updated.kt instead)
- `MainActivity.kt` - Old version (for reference)
- `GoogleAuthActivity.kt` - Google OAuth files (keep if using)
- `AboutActivity.kt`, `OfflineActivity.kt` - Extra activities (keep if using)
- `WebViewClientHelper.kt` - Helper class (keep if using)
- `activity_offline.xml` - Offline layout (keep if using)

---

## 📝 **QUICK UPLOAD GUIDE**

### **For Linux Cloud VM:**

1. **SSH into your VM:**
   ```bash
   ssh ubuntu@your-vm-address
   ```

2. **Upload the 3 website files:**
   ```bash
   # Option 1: Use SCP from your local machine
   scp client/src/lib/android-background-handler.ts ubuntu@your-vm:/opt/spreadlov/client/src/lib/
   scp client/src/App.tsx ubuntu@your-vm:/opt/spreadlov/client/src/
   scp client/src/pages/chat-page.tsx ubuntu@your-vm:/opt/spreadlov/client/src/pages/
   
   # Option 2: Upload via SFTP client (FileZilla, WinSCP, etc.)
   # Connect to your VM and drag-and-drop the files
   ```

3. **Rebuild your website:**
   ```bash
   cd /opt/spreadlov
   npm run build
   pm2 restart all
   ```

4. **Verify it's running:**
   ```bash
   pm2 logs spreadlov --lines 50
   ```
   You should see: `✅ PostgreSQL notification listener started`

---

### **For Android Studio:**

1. **Download files from Replit:**
   - Go to `android/updatedfiles/` folder
   - Download these 5 files:
     - MyFirebaseMessagingService.kt
     - MainActivity_Updated.kt
     - WebViewInterface.kt
     - IntentUtils.kt
     - activity_main.xml

2. **Copy to Android Studio:**
   - Open your Android Studio project
   - Copy Kotlin files to `app/src/main/java/com/spreadlov/app/`
   - **Important:** Rename `MainActivity_Updated.kt` → `MainActivity.kt`
   - Copy `activity_main.xml` to `app/src/main/res/layout/`

3. **Update AndroidManifest.xml** (see makechange1.txt for details)

4. **Update build.gradle** (see makechange1.txt for dependencies)

5. **Build and install**

---

## ⚡ **WHAT EACH FILE DOES**

### **Website Files:**

**android-background-handler.ts:**
- Detects when Android app is running
- Listens for "app going to background" event from Android
- Closes chat windows when app goes to background
- Reopens chat windows when app comes back to foreground

**App.tsx (3 lines added):**
```typescript
// Line 1: Import
import { initAndroidBackgroundHandler } from "./lib/android-background-handler";

// Lines 2-3: Initialize in useEffect
useEffect(() => {
  initAndroidBackgroundHandler();
}, []);
```

**chat-page.tsx (4 lines added):**
```typescript
// Line 1: Import
import { setCurrentChatUser } from "@/lib/android-background-handler";

// Line 2: Track when chat opens
setCurrentChatUser(chatUser.id);

// Line 3: Clear when chat closes
setCurrentChatUser(null);
```

### **Android Files:**

**MyFirebaseMessagingService.kt:**
- Receives push notifications from Firebase Cloud Messaging
- Displays notifications with title, message, and sender photo
- Handles deep links (opens correct screen when tapped)
- Registers FCM token with server

**MainActivity_Updated.kt:**
- Detects when app goes to background (Home button pressed)
- Detects when app comes to foreground (app opened)
- Sends events to website via JavaScript bridge
- Manages WebView lifecycle

**WebViewInterface.kt:**
- JavaScript bridge between website and Android app
- Exposes functions to website (like handleFCMToken)
- Allows website to communicate with Android

**IntentUtils.kt:**
- Helper class for opening deep links
- Navigates to correct screen when notification is tapped

**activity_main.xml:**
- Layout file for MainActivity
- Contains WebView, SwipeRefreshLayout, ProgressBar

---

## 🎯 **HOW IT ALL WORKS TOGETHER**

### **When User Presses Home Button on Android:**

1. **Android:** `MainActivity.onPause()` detects app going to background
2. **Android:** Sends event to website: `appGoingToBackground`
3. **Website:** `android-background-handler.ts` receives event
4. **Website:** Checks if chat is open via `getCurrentChatUser()`
5. **Website:** Sends `closeChatWindow` to WebSocket server
6. **Server:** Marks chat as CLOSED in memory
7. ✅ **Result:** Server will now create notifications for new messages!

### **When New Message Arrives:**

1. **Server:** Checks: Is receiver actively chatting?
2. **Server:** NO (chat was closed in step 6 above)
3. **Server:** Creates notification in database
4. **PostgreSQL:** Trigger fires → sends event to notification listener
5. **Notification Listener:** Fetches FCM token for receiver
6. **FCM Service:** Sends push notification to Firebase
7. **Firebase:** Delivers to Android device
8. **Android:** `MyFirebaseMessagingService` receives notification
9. **Android:** Displays notification with title, message, photo
10. ✅ **User sees notification on Android!**

---

## ✅ **VERIFICATION CHECKLIST**

Before testing, make sure:

**On Linux Cloud VM:**
- [ ] Uploaded `android-background-handler.ts` to `/opt/spreadlov/client/src/lib/`
- [ ] Uploaded `App.tsx` to `/opt/spreadlov/client/src/`
- [ ] Uploaded `chat-page.tsx` to `/opt/spreadlov/client/src/pages/`
- [ ] Ran `npm run build`
- [ ] Ran `pm2 restart all`
- [ ] Verified server is running (pm2 logs)

**On Replit (for testing):**
- [ ] Firebase credentials added to Secrets
- [ ] Server shows: "✅ Firebase Admin initialized successfully"
- [ ] Server shows: "✅ PostgreSQL notification listener started"

**On Android Studio:**
- [ ] Downloaded 5 files from `android/updatedfiles/`
- [ ] Copied files to correct locations
- [ ] Renamed `MainActivity_Updated.kt` → `MainActivity.kt`
- [ ] Updated `AndroidManifest.xml`
- [ ] Updated `build.gradle`
- [ ] Added `google-services.json`
- [ ] Built successfully
- [ ] Installed on phone

---

## 📖 **DETAILED GUIDE**

For complete step-by-step instructions, see:
- **makechange1.txt** - Full guide with all 3 notification types, troubleshooting, testing procedures

---

## 🚀 **YOU'RE ALMOST DONE!**

Just upload the 3 website files to your Linux VM, copy the 5 Android files, and you'll have full push notification support for all 3 types:
- ✅ Profile View notifications
- ✅ Profile Like notifications
- ✅ Message notifications

All working perfectly in the background! 🎉
