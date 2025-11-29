PKC Korean Learning v1.2

Access the web app immediately via the link below:

https://pkc0412.github.io/PKC-Korean-Learning/

This project is a Korean learning PWA (Progressive Web App) created by PKC as a toy project leveraging generative AI.

It is designed to be installed like a native app on the web, works partially offline,

and provides a lightweight and fast Korean learning experience.

This is an All-in-One Web App for learning Korean.

The current difficulty level ranges from Absolute Beginner to Low-Intermediate.

It is structured to let you learn in a single flow: Hangul → Words → Grammar → Sentences → Flashcards → Quiz.

This project is built as a fully static web app (PWA) and can be run directly on GitHub Pages.

You can install it on your home screen to use it like an app, and it offers fast loading times along with partial offline support.

---

✍️ Creator & Contact
If you have any questions, bug reports, or suggestions, please contact me below.

Creator: PKC

Blog: https://pkc0412.tistory.com/

Email: pkc0412@gmail.com

---

📜 License

This project follows a Dual License Policy.

Non-Commercial & Open Source Use

GPLv3 License applies.

Free to use for personal, academic, and non-profit projects.

Commercial Use

To include this in commercial or closed-source products, a separate commercial license is required.

Contact: pkc0412@gmail.com

---

What you can do

Use freely

Analyze / Improve the code

Fork to create other projects

Redistribute open source (Original author attribution required)

⚠️ Disclaimer

Does not guarantee the stability level of fully commercial software.

Some features may not work properly in certain environments.

No 24-hour customer support (Personal project).

🚀 Deployment URL (GitHub: https://github.com/PKC0412/PKC-Korean-Learning)

---

📱 PWA Installation Guide

PKC Korean Learning supports PWA (Progressive Web App).

---

✅ Android (Chrome)

Access the app in your browser.

Menu (⋮) → "Add to Home screen".

"PKC Korean" icon created → Run it like an app.

---

✅ iPhone (Safari)

Access the app in Safari.

Tap the Share button (⬆️).

Tap "Add to Home Screen".

Run it like an app from your home screen.

Since iOS is WebKit-based, some PWA features may be limited.

---

✅ macOS (Chrome / Edge)

Click the "Install" button on the right side of the address bar.

The app icon will be added to the Dock.

Features after installation

App mode execution without an address bar.

Fast loading speed.

Partial offline usage available (based on cached data).

---

📁 Project Structure (Latest)

PKC-Korean-Learning/

├─ index.html

├─ manifest.webmanifest

├─ service-worker.js

├─ favicon.ico

├─ assets/

│  ├─ icons/

│  │  ├─ icon-192.png

│  │  └─ icon-512.png

│  ├─ audio/

│  └─ images/

├─ css/

├─ js/

├─ data/

└─ locales/

---

🎧 Audio Pronunciation Troubleshooting Guide

The pronunciation feature in this app uses the browser's built-in TTS (Web Speech API / speechSynthesis).

This means it doesn't play audio files but instead calls the Korean voice engine installed on your device.

Since behavior varies by device, the following issues may occur.

---

❗ Common Issues

The first pronunciation doesn't play, but it works from the second one onwards.

No sound at all on iPhone when tapped.

Safari ignores the first call due to auto-play restrictions.

Korean voice (ko-KR) is not installed on the device.

No sound due to the Silent Mode switch (side of iPhone).

---

✅ Solution (iOS)

Turn off Silent Mode (Switch on the side of the iPhone).

Turn up the volume.

Go to Settings → Accessibility → Spoken Content → Voices and download a Korean voice.

If the first pronunciation doesn't work, try tapping the button twice.

---

✅ Solution (macOS)

System Settings → Accessibility → Spoken Content → Install Korean voice.

Latest versions of Chrome or Safari are recommended.

You can check via DevTools console:

speechSynthesis.getVoices().filter(v => v.lang.includes('ko'))

If you see one or more Korean voices, it should play normally.

---

🔎 Summary

Pronunciation playback may behave differently depending on the device environment.

iOS is particularly prone to issues due to silent mode/first call restrictions.

It mostly works normally with button interactions (user gestures).

🛠 Local Development (Optional)

Since it can be run directly on GitHub Pages, a local server is not mandatory.

To test locally:

python -m http.server 8000

In your browser, visit:

http://localhost:8000

---

🌐 GitHub Pages Deployment Method

1. Clone Repo

git clone [https://github.com/PKC0412/PKC-Korean-Learning.git]

---

2. Copy Project Files & Commit

git add .

git commit -m "init: PKC Korean Learning PWA"

git push

---

3. Enable Pages

Go to GitHub Repo → Settings → Pages

Source: Deploy from a branch

Branch: main

Folder: / (root)

---

4. Access Deployment URL

[https://pkc0412.github.io/PKC-Korean-Learning/]

---

Known Issues

Q. Language switching suddenly doesn't work.

A. Refreshing the browser (F5) often solves this.

Q. Pronunciation doesn't play.

A. It is highly likely related to iOS/Safari/Silent Mode. Please refer to the audio troubleshooting guide above.

---

Future Development Plans

If this project proves useful to users, I plan to provide more materials and difficulty levels. I also plan to introduce an AI Tutor in the future.

Please make good use of it!
