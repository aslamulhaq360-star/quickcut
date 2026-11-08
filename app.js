/* =========================================================
   QuickCut • Modern Mobile-First Video Editor Web App
   Pure React 18 (No JSX) • Client-Side Local Operations Only
   ========================================================= */

(function () {
  'use strict';

  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('React or ReactDOM is not loaded.');
    return;
  }

  const { useState, useEffect, useRef } = React;
  const e = React.createElement;

  // Helper: Format seconds to HH:MM:SS
  function formatHHMMSS(totalSeconds, includeTenths) {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const tenths = Math.floor((totalSeconds % 1) * 10);

    const pad = function (n) { return String(n).padStart(2, '0'); };
    const base = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
    return includeTenths ? base + '.' + tenths : base;
  }

  // Quick SVG Icon generator
  function svgIcon(pathData, width, height, fill) {
    return e('svg', {
      viewBox: '0 0 24 24',
      style: { width: width || 24, height: height || 24, fill: fill || 'currentColor' }
    }, e('path', { d: pathData }));
  }

  const ICONS = {
    scissors: 'M19 3L13 9l2 2 6-6V3h-2zm-8.8 8.8l-1.4-1.4L4.2 15A3 3 0 1 0 6 18c0-.7-.2-1.4-.6-2l3.4-3.4 1.4 1.4-3.4 3.4a3 3 0 1 0 1.8 1.8l3.4-3.4zM4.5 19.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-2.7-7.3l1.4-1.4 6 6v2h-2l-5.4-6.6z',
    cutRemove: 'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
    split: 'M11 2v20h2V2h-2zM4 11h5V9H4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5v-2H4v-2zm16-2h-5v2h5v2h-5v2h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z',
    video: 'M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zm2 14H4V8h16v10z',
    gallery: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    play: 'M8 5v14l11-7z',
    pause: 'M6 19h4V5H6v14zm8-14v14h4V5h-4z',
    back1s: 'M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
    forward1s: 'M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z',
    filmTrack: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 7h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z',
    download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    share: 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z',
    check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    shield: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
    cloudOff: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3z',
    camera: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
    alert: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
    installApp: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
    info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
    close: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    offline: 'M23.64 7c-.45-.34-4.93-3.66-11.64-3.66-6.72 0-11.2 3.32-11.64 3.66L12 21.5 23.64 7z'
  };

  // Helper: Detect best browser-supported video MIME type and codec for mobile
  function getBestSupportedMimeType() {
    const types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm'
    ];
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
      for (let i = 0; i < types.length; i++) {
        if (MediaRecorder.isTypeSupported(types[i])) {
          return types[i];
        }
      }
    }
    return 'video/webm';
  }

  // Helper: Robust download trigger for Android mobile browsers & WebViews
  function triggerDownload(url, filename) {
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 250);
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  function QuickCutApp() {
    // Original Video State
    const [videoSrc, setVideoSrc] = useState(null);
    const [videoInfo, setVideoInfo] = useState({ name: '', size: '', duration: 0 });
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [generalVideoError, setGeneralVideoError] = useState(null);
    const [downloadToast, setDownloadToast] = useState(null);

    // Editing Mode: 'trim', 'cut', or 'split'
    const [editMode, setEditMode] = useState('trim');

    // Trimming & Selection State
    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);
    const [isPreviewingSelection, setIsPreviewingSelection] = useState(false);

    // Cut Video (Remove Section) State
    const [isPreviewingCut, setIsPreviewingCut] = useState(false);
    const [isCutting, setIsCutting] = useState(false);
    const [cutProgress, setCutProgress] = useState(0);
    const [cutPhase, setCutPhase] = useState('');
    const [cutError, setCutError] = useState(null);
    const [cutResult, setCutResult] = useState(null); // { url, blob, file, duration, size, name, removedRangeStr }

    // Split Video State
    const [splitPoint, setSplitPoint] = useState(0);
    const [isSplitting, setIsSplitting] = useState(false);
    const [splitProgress, setSplitProgress] = useState(0);
    const [splitPhase, setSplitPhase] = useState('');
    const [splitError, setSplitError] = useState(null);
    const [splitResult, setSplitResult] = useState(null); // { part1: {...}, part2: {...} }

    // Real Trim Processing State
    const [isTrimming, setIsTrimming] = useState(false);
    const [trimProgress, setTrimProgress] = useState(0);
    const [trimError, setTrimError] = useState(null);

    // Trimmed Output State: { url, blob, file, duration, size, name }
    const [trimmedVideo, setTrimmedVideo] = useState(null);

    // Language Toggle: 'both', 'bn', 'en'
    const [langMode, setLangMode] = useState('both');

    // PWA Installation & Offline State
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBanner, setShowInstallBanner] = useState(true);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    // Element Refs
    const videoRef = useRef(null);
    const trimmedVideoRef = useRef(null);
    const cutVideoRef = useRef(null);
    const splitPart1Ref = useRef(null);
    const splitPart2Ref = useRef(null);
    const fileInputRef = useRef(null);
    const timelineRef = useRef(null);

    // Optimization & Cancellation Refs
    const activeRecorderRef = useRef(null);
    const activeCheckIntervalRef = useRef(null);
    const isCancelledRef = useRef(false);

    // Dynamic Refs to avoid stale closures in event listeners
    const isPreviewingSelectionRef = useRef(isPreviewingSelection);
    isPreviewingSelectionRef.current = isPreviewingSelection;

    const isPreviewingCutRef = useRef(isPreviewingCut);
    isPreviewingCutRef.current = isPreviewingCut;

    const startTimeRef = useRef(startTime);
    startTimeRef.current = startTime;
    const endTimeRef = useRef(endTime);
    endTimeRef.current = endTime;

    const splitPointRef = useRef(splitPoint);
    splitPointRef.current = splitPoint;

    const durationRef = useRef(duration);
    durationRef.current = duration;

    // Cleanup object URLs on unmount
    useEffect(function () {
      return function () {
        if (videoSrc && videoSrc.startsWith('blob:')) {
          URL.revokeObjectURL(videoSrc);
        }
        if (trimmedVideo && trimmedVideo.url) {
          URL.revokeObjectURL(trimmedVideo.url);
        }
        if (cutResult && cutResult.url) {
          URL.revokeObjectURL(cutResult.url);
        }
        if (splitResult) {
          if (splitResult.part1 && splitResult.part1.url) URL.revokeObjectURL(splitResult.part1.url);
          if (splitResult.part2 && splitResult.part2.url) URL.revokeObjectURL(splitResult.part2.url);
        }
      };
    }, [videoSrc, trimmedVideo, cutResult, splitResult]);

    // PWA Event Listeners (Installation prompt, Standalone check, Online/Offline)
    useEffect(function () {
      // Check if launched as standalone PWA
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      if (isStandalone) {
        setIsAppInstalled(true);
      }

      // Android beforeinstallprompt event capture
      const handleBeforeInstall = function (e) {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBanner(true);
      };

      const handleAppInstalled = function () {
        setIsAppInstalled(true);
        setShowInstallBanner(false);
        setDeferredPrompt(null);
        setDownloadToast(langMode === 'en' ? 'QuickCut installed successfully!' : 'QuickCut সফলভাবে ইনস্টল হয়েছে!');
        setTimeout(function () { setDownloadToast(null); }, 3500);
      };

      const handleOnline = function () { setIsOffline(false); };
      const handleOffline = function () { setIsOffline(true); };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', handleAppInstalled);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return function () {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('appinstalled', handleAppInstalled);
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }, [langMode]);

    // Handle App Installation (Triggers native Android prompt or opens simple instructions)
    const handleInstallApp = function () {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choiceResult) {
          if (choiceResult.outcome === 'accepted') {
            setIsAppInstalled(true);
            setShowInstallBanner(false);
          }
          setDeferredPrompt(null);
        }).catch(function (err) {
          console.warn('Install prompt error:', err);
        });
      } else {
        // Automatic prompt not available yet; show instructions modal
        setShowInstallModal(true);
      }
    };

    // Cancel in-progress processing (Trim, Cut, or Split)
    const handleCancelProcessing = function () {
      isCancelledRef.current = true;
      if (activeCheckIntervalRef.current) {
        clearInterval(activeCheckIntervalRef.current);
        activeCheckIntervalRef.current = null;
      }
      if (activeRecorderRef.current) {
        try {
          if (activeRecorderRef.current.state !== 'inactive') {
            activeRecorderRef.current.stop();
          }
        } catch (e) {
          console.warn('Recorder stop on cancel:', e);
        }
        activeRecorderRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = startTimeRef.current || 0;
      }
      setIsTrimming(false);
      setIsCutting(false);
      setIsSplitting(false);
      setTrimProgress(0);
      setCutProgress(0);
      setSplitProgress(0);
    };

    // Download Handler with feedback toast
    const handleDownloadVideo = function (url, filename, label) {
      triggerDownload(url, filename);
      setDownloadToast((langMode === 'en' ? 'Downloading ' : 'ডাউনলোড শুরু হয়েছে: ') + (label || filename));
      setTimeout(function () {
        setDownloadToast(null);
      }, 3000);
    };

    // Handle Local Video Selection (MP4, WebM, MOV) with 1GB Support & Memory Warnings
    const handleFileSelect = function (ev) {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;

      handleCancelProcessing();

      // Revoke previous URLs to free up memory before loading new video
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
      if (trimmedVideo && trimmedVideo.url) {
        URL.revokeObjectURL(trimmedVideo.url);
        setTrimmedVideo(null);
      }
      if (cutResult && cutResult.url) {
        URL.revokeObjectURL(cutResult.url);
        setCutResult(null);
      }
      if (splitResult) {
        if (splitResult.part1 && splitResult.part1.url) URL.revokeObjectURL(splitResult.part1.url);
        if (splitResult.part2 && splitResult.part2.url) URL.revokeObjectURL(splitResult.part2.url);
        setSplitResult(null);
      }

      setTrimError(null);
      setCutError(null);
      setSplitError(null);
      setGeneralVideoError(null);
      setIsPreviewingSelection(false);
      setIsPreviewingCut(false);

      const sizeBytes = file.size;
      const sizeMb = (sizeBytes / (1024 * 1024)).toFixed(1);
      const isOver1GB = sizeBytes > 1024 * 1024 * 1024; // 1 GB limit
      const isLargeFile = sizeBytes > 350 * 1024 * 1024; // >350 MB advisory threshold for mobile RAM

      if (isOver1GB) {
        setGeneralVideoError(langMode === 'en'
          ? 'Selected file (' + sizeMb + ' MB) exceeds the 1 GB limit. Please choose a video under 1 GB.'
          : 'নির্বাচিত ফাইলটি (' + sizeMb + ' MB) ১ জিবি সীমার চেয়ে বড়। অনুগ্রহ করে ১ জিবির নিচের ভিডিও নির্বাচন করুন।');
        return;
      }

      const objectUrl = URL.createObjectURL(file);

      setVideoInfo({
        name: file.name,
        size: sizeMb >= 1000 ? (sizeBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB' : sizeMb + ' MB',
        sizeBytes: sizeBytes,
        sizeMb: parseFloat(sizeMb),
        isLargeFile: isLargeFile,
        duration: 0,
        resolution: ''
      });
      setVideoSrc(objectUrl);
      setIsPlaying(false);
      setIsPreviewingSelection(false);
    };

    // Video Loaded Metadata Handler (Captures resolution & duration)
    const handleLoadedMetadata = function () {
      if (!videoRef.current) return;
      const vid = videoRef.current;
      const dur = vid.duration || 0;
      const width = vid.videoWidth || 0;
      const height = vid.videoHeight || 0;
      const resStr = width > 0 && height > 0 ? width + 'x' + height : '';

      setDuration(dur);
      setStartTime(0);
      setEndTime(dur > 0 ? Math.min(dur, 10) : 10);
      setSplitPoint(dur > 0 ? Number((dur / 2).toFixed(1)) : 5);
      setCurrentTime(0);
      setVideoInfo(function (prev) {
        return Object.assign({}, prev, {
          duration: dur,
          resolution: resStr
        });
      });
    };

    // Time Update Listener (Handles Selection Preview & Cut Transition Preview)
    const handleTimeUpdate = function () {
      if (!videoRef.current) return;
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);

      // Selection Preview in Trim mode: auto-stops at endTime
      if (isPreviewingSelectionRef.current) {
        if (curr >= endTimeRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = startTimeRef.current;
          setIsPlaying(false);
          setIsPreviewingSelection(false);
        }
      }

      // Cut Preview in Cut mode: skips over the cut-out section to show seamless joined transition
      if (isPreviewingCutRef.current) {
        if (curr >= startTimeRef.current && curr < endTimeRef.current) {
          // Instantly jump across the removed section
          videoRef.current.currentTime = endTimeRef.current;
        } else if (curr >= durationRef.current || (endTimeRef.current < durationRef.current && curr >= Math.min(durationRef.current, endTimeRef.current + 3.0))) {
          // Finished previewing cut transition
          videoRef.current.pause();
          videoRef.current.currentTime = Math.max(0, startTimeRef.current - 2.0);
          setIsPlaying(false);
          setIsPreviewingCut(false);
        }
      }
    };

    const isProcessing = isTrimming || isCutting || isSplitting;

    // Play / Pause Toggle for Original Video
    const togglePlay = function () {
      if (isProcessing) return;
      if (!videoRef.current) return;
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsPreviewingSelection(false);
        setIsPreviewingCut(false);
      }
    };

    // Preview Cut: plays up to startTime, seamlessly skips to endTime, previewing the joined cut
    const handlePreviewCut = function () {
      if (isProcessing) return;
      if (!videoRef.current || duration <= 0) return;

      if (isPreviewingCut) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsPreviewingCut(false);
        return;
      }

      // Start 2 seconds before cut point so user hears/sees the transition clearly
      const cuePoint = Math.max(0, startTime - 2.0);
      videoRef.current.currentTime = cuePoint;
      videoRef.current.play().then(function () {
        setIsPlaying(true);
        setIsPreviewingCut(true);
        setIsPreviewingSelection(false);
      }).catch(function (err) {
        console.warn('Cut preview error:', err);
      });
    };

    // Preview Selection: plays from startTime to endTime, then stops
    const handlePreviewSelection = function () {
      if (isProcessing) return;
      if (!videoRef.current || duration <= 0) return;

      if (isPreviewingSelection) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsPreviewingSelection(false);
        return;
      }

      videoRef.current.currentTime = startTime;
      videoRef.current.play().then(function () {
        setIsPlaying(true);
        setIsPreviewingSelection(true);
      }).catch(function (err) {
        console.warn('Playback error:', err);
      });
    };

    // Seek Stepper
    const stepSeek = function (delta) {
      if (isProcessing) return;
      if (!videoRef.current) return;
      const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    };

    // Set Current Video Time as Start Time
    const setAsStart = function () {
      if (isProcessing) return;
      const newStart = Math.min(currentTime, Math.max(0, endTime - 0.2));
      setStartTime(Number(newStart.toFixed(1)));
    };

    // Set Current Video Time as End Time
    const setAsEnd = function () {
      if (isProcessing) return;
      const newEnd = Math.max(currentTime, Math.min(duration, startTime + 0.2));
      setEndTime(Number(newEnd.toFixed(1)));
    };

    // Set Current Video Time as Split Point
    const setAsSplitPoint = function () {
      if (isProcessing) return;
      const newSplit = Math.max(0.2, Math.min(duration - 0.2, currentTime));
      setSplitPoint(Number(newSplit.toFixed(1)));
    };

    // Steppers for Start Time
    const adjustStartTime = function (delta) {
      if (isProcessing) return;
      setStartTime(function (prev) {
        const next = Math.max(0, Math.min(endTime - 0.2, prev + delta));
        return Number(next.toFixed(1));
      });
    };

    // Steppers for End Time
    const adjustEndTime = function (delta) {
      if (isProcessing) return;
      setEndTime(function (prev) {
        const next = Math.max(startTime + 0.2, Math.min(duration, prev + delta));
        return Number(next.toFixed(1));
      });
    };

    // Steppers for Split Point
    const adjustSplitPoint = function (delta) {
      if (isProcessing) return;
      setSplitPoint(function (prev) {
        const next = Math.max(0.2, Math.min(duration - 0.2, prev + delta));
        return Number(next.toFixed(1));
      });
    };

    // Direct HH:MM:SS text change for Start Time
    const handleStartTimeChange = function (field, val) {
      if (isProcessing) return;
      const num = parseInt(val, 10) || 0;
      let h = Math.floor(startTime / 3600);
      let m = Math.floor((startTime % 3600) / 60);
      let s = Math.floor(startTime % 60);

      if (field === 'h') h = Math.max(0, num);
      if (field === 'm') m = Math.max(0, Math.min(59, num));
      if (field === 's') s = Math.max(0, Math.min(59, num));

      const total = (h * 3600) + (m * 60) + s;
      const validStart = Math.max(0, Math.min(endTime - 0.2, total));
      setStartTime(Number(validStart.toFixed(1)));
    };

    // Direct HH:MM:SS text change for End Time
    const handleEndTimeChange = function (field, val) {
      if (isProcessing) return;
      const num = parseInt(val, 10) || 0;
      let h = Math.floor(endTime / 3600);
      let m = Math.floor((endTime % 3600) / 60);
      let s = Math.floor(endTime % 60);

      if (field === 'h') h = Math.max(0, num);
      if (field === 'm') m = Math.max(0, Math.min(59, num));
      if (field === 's') s = Math.max(0, Math.min(59, num));

      const total = (h * 3600) + (m * 60) + s;
      const validEnd = Math.max(startTime + 0.2, Math.min(duration, total));
      setEndTime(Number(validEnd.toFixed(1)));
    };

    // Direct HH:MM:SS text change for Split Point
    const handleSplitPointChange = function (field, val) {
      if (isProcessing) return;
      const num = parseInt(val, 10) || 0;
      let h = Math.floor(splitPoint / 3600);
      let m = Math.floor((splitPoint % 3600) / 60);
      let s = Math.floor(splitPoint % 60);

      if (field === 'h') h = Math.max(0, num);
      if (field === 'm') m = Math.max(0, Math.min(59, num));
      if (field === 's') s = Math.max(0, Math.min(59, num));

      const total = (h * 3600) + (m * 60) + s;
      const validSplit = Math.max(0.2, Math.min(duration - 0.2, total));
      setSplitPoint(Number(validSplit.toFixed(1)));
    };

    // Interactive Dragging on Timeline (Supports Trim & Split)
    const startDragging = function (ev, dragType) {
      if (isProcessing) return;
      ev.preventDefault();
      ev.stopPropagation();

      const onPointerMove = function (moveEvent) {
        if (!timelineRef.current || durationRef.current <= 0) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clientX = moveEvent.clientX || (moveEvent.touches && moveEvent.touches[0] ? moveEvent.touches[0].clientX : 0);
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const targetSec = ratio * durationRef.current;

        if (dragType === 'start') {
          const validStart = Math.max(0, Math.min(endTimeRef.current - 0.2, targetSec));
          setStartTime(Number(validStart.toFixed(1)));
          if (videoRef.current) videoRef.current.currentTime = validStart;
        } else if (dragType === 'end') {
          const validEnd = Math.max(startTimeRef.current + 0.2, Math.min(durationRef.current, targetSec));
          setEndTime(Number(validEnd.toFixed(1)));
          if (videoRef.current) videoRef.current.currentTime = validEnd;
        } else if (dragType === 'split') {
          const validSplit = Math.max(0.2, Math.min(durationRef.current - 0.2, targetSec));
          setSplitPoint(Number(validSplit.toFixed(1)));
          if (videoRef.current) videoRef.current.currentTime = validSplit;
        } else if (dragType === 'track') {
          if (videoRef.current) videoRef.current.currentTime = targetSec;
          setCurrentTime(targetSec);
        }
      };

      const onPointerUp = function () {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('touchmove', onPointerMove, { passive: false });
      window.addEventListener('touchend', onPointerUp);
    };

    // Sample Video Generator (1-tap instant test)
    const handleLoadSampleVideo = function () {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      const stream = canvas.captureStream(30);

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      let audioCtx = null;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const dst = audioCtx.createMediaStreamDestination();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.connect(dst);
        osc.start();
        const audioTrack = dst.stream.getAudioTracks()[0];
        if (audioTrack) stream.addTrack(audioTrack);
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks = [];
      mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = function () {
        if (audioCtx) audioCtx.close();
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoInfo({
          name: 'QuickCut_Sample_10s.webm',
          size: '1.2 MB',
          duration: 10
        });
        setVideoSrc(url);
      };

      mediaRecorder.start();

      let frame = 0;
      const totalFrames = 30 * 10;
      const interval = setInterval(function () {
        frame++;
        const progress = frame / totalFrames;
        const sec = (frame / 30).toFixed(1);

        const grad = ctx.createLinearGradient(0, 0, 640, 360);
        grad.addColorStop(0, '#0284C7');
        grad.addColorStop(0.5, '#0369A1');
        grad.addColorStop(1, '#059669');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 640, 360);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 30px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QuickCut • নমুনা ভিডিও', 320, 160);

        ctx.fillStyle = '#BAE6FD';
        ctx.font = 'bold 44px monospace';
        ctx.fillText('00:00:' + String(Math.floor(sec)).padStart(2, '0'), 320, 225);

        ctx.fillStyle = '#10B981';
        ctx.fillRect(60, 280, 520 * progress, 14);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(60, 280, 520, 14);

        if (frame >= totalFrames) {
          clearInterval(interval);
          mediaRecorder.stop();
        }
      }, 1000 / 30);
    };

    // =========================================================
    // REAL VIDEO TRIM IMPLEMENTATION (100% Client-Side Local)
    // =========================================================
    const handleTrimVideo = function () {
      if (isProcessing) return;
      if (!videoRef.current || duration <= 0) return;
      const cutDuration = endTime - startTime;
      if (cutDuration < 0.3) {
        alert(langMode === 'en'
          ? 'Please select at least 0.5s duration.'
          : 'শুরু ও শেষের সময়ের মধ্যে অন্তত ০.৫ সেকেন্ডের ব্যবধান রাখুন।');
        return;
      }

      // Memory cleanup: release previous trimmed video URL
      if (trimmedVideo && trimmedVideo.url) {
        URL.revokeObjectURL(trimmedVideo.url);
        setTrimmedVideo(null);
      }

      isCancelledRef.current = false;
      setTrimError(null);
      setIsTrimming(true);
      setTrimProgress(5);
      setIsPreviewingSelection(false);

      const video = videoRef.current;
      video.pause();
      video.currentTime = startTime;

      try {
        const stream = video.captureStream
          ? video.captureStream()
          : (video.mozCaptureStream ? video.mozCaptureStream() : null);

        if (!stream) {
          throw new Error(langMode === 'en'
            ? 'Browser stream capture is not supported on this device. Please try with Chrome or an updated browser.'
            : 'ব্রাউজার সরাসরি ভিডিও স্ট্রিম ক্যাপচার সমর্থন করছে না। অনুগ্রহ করে ক্রোম ব্রাউজার ব্যবহার করুন।');
        }

        // Ensure audio sync & unmuted playback during recording
        video.muted = false;
        video.volume = 0.5;
        stream.getAudioTracks().forEach(function (track) {
          track.enabled = true;
        });

        const mimeType = getBestSupportedMimeType();
        const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
        
        // Mobile-optimized bitrate settings
        const recorderOptions = {
          mimeType: mimeType,
          videoBitsPerSecond: 2800000,
          audioBitsPerSecond: 128000
        };

        let recorder;
        try {
          recorder = new MediaRecorder(stream, recorderOptions);
        } catch (recErr) {
          recorder = new MediaRecorder(stream, { mimeType: mimeType });
        }
        activeRecorderRef.current = recorder;

        const recordedChunks = [];

        recorder.ondataavailable = function (e) {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        recorder.onstop = function () {
          if (isCancelledRef.current) {
            recordedChunks.length = 0;
            return;
          }

          const blob = new Blob(recordedChunks, { type: mimeType });
          // Release chunk references immediately to free up mobile memory
          recordedChunks.length = 0;

          const url = URL.createObjectURL(blob);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
          const filename = 'QuickCut_Trimmed_' + timestamp + ext;
          const file = new File([blob], filename, { type: mimeType });
          const sizeStr = (blob.size / (1024 * 1024)).toFixed(2) + ' MB';

          setTrimmedVideo({
            url: url,
            blob: blob,
            file: file,
            duration: cutDuration,
            size: sizeStr,
            name: filename,
            rangeStr: formatHHMMSS(startTime) + ' - ' + formatHHMMSS(endTime)
          });

          setIsTrimming(false);
          setTrimProgress(100);
          activeRecorderRef.current = null;

          setTimeout(function () {
            const resultEl = document.getElementById('trimmed-result-section');
            if (resultEl && resultEl.scrollIntoView) {
              resultEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 200);
        };

        recorder.onerror = function (event) {
          console.error('Recorder error during trim:', event.error);
          setIsTrimming(false);
          activeRecorderRef.current = null;
          setTrimError(langMode === 'en'
            ? 'Device memory limit reached during recording. Try trimming a shorter range or closing background apps.'
            : 'রেকর্ডিংকালে ডিভাইসের মেমোরি সীমাবদ্ধতা দেখা দিয়েছে। অপেক্ষাকৃত ছোট অংশ ট্রিম করুন বা অন্যান্য ভারী অ্যাপ বন্ধ করুন।');
        };

        video.play().then(function () {
          recorder.start(100);

          const checkInterval = setInterval(function () {
            if (isCancelledRef.current || !video) {
              clearInterval(checkInterval);
              activeCheckIntervalRef.current = null;
              return;
            }

            const currentElapsed = Math.max(0, video.currentTime - startTime);
            const pct = Math.min(95, Math.floor((currentElapsed / cutDuration) * 90) + 5);
            setTrimProgress(pct);

            if (video.currentTime >= endTime || video.ended) {
              clearInterval(checkInterval);
              activeCheckIntervalRef.current = null;
              if (recorder.state === 'recording') {
                recorder.stop();
              }
              video.pause();
            }
          }, 80);

          activeCheckIntervalRef.current = checkInterval;
        }).catch(function (err) {
          setIsTrimming(false);
          activeRecorderRef.current = null;
          setTrimError(langMode === 'en'
            ? 'Playback error during trimming (memory or decoder limit): ' + err.message
            : 'ট্রিম করার সময় প্লেব্যাক ত্রুটি (মেমোরি বা ডিকোডার সীমাবদ্ধতা): ' + err.message);
        });

      } catch (err) {
        console.error('Trim error:', err);
        setIsTrimming(false);
        activeRecorderRef.current = null;
        setTrimError(langMode === 'en'
          ? 'Unable to process video segment: ' + (err.message || 'Device out of memory')
          : 'ভিডিও অংশটি প্রসেস করা সম্ভব হয়নি: ' + (err.message || 'ডিভাইসে পর্যাপ্ত মেমোরি নেই'));
      }
    };

    // =========================================================
    // REAL VIDEO CUT IMPLEMENTATION (100% Client-Side Local)
    // Removes [startTime → endTime], joins [0 → startTime] + [endTime → duration]
    // =========================================================
    const handleCutVideo = function () {
      if (isProcessing) return;
      if (!videoRef.current || duration <= 0) return;
      const removeDuration = endTime - startTime;
      if (removeDuration < 0.2) {
        alert(langMode === 'en'
          ? 'Please select a valid section of at least 0.3s to remove.'
          : 'বাদ দেওয়ার জন্য অন্তত ০.৩ সেকেন্ডের অংশ নির্বাচন করুন।');
        return;
      }

      const keptDuration = startTime + Math.max(0, duration - endTime);
      if (keptDuration < 0.3) {
        alert(langMode === 'en'
          ? 'Cannot remove the entire video. Please leave at least some video to keep.'
          : 'পুরো ভিডিও বাদ দেওয়া যাবে না। কিছু অংশ অবশিষ্ট রাখুন।');
        return;
      }

      // Memory cleanup: release previous cut video URL
      if (cutResult && cutResult.url) {
        URL.revokeObjectURL(cutResult.url);
        setCutResult(null);
      }

      isCancelledRef.current = false;
      setCutError(null);
      setIsCutting(true);
      setCutProgress(5);
      setCutPhase(langMode === 'en' ? 'Preparing cut & join...' : 'অংশ বাদ দিয়ে ভিডিও প্রস্তুত হচ্ছে...');
      setIsPreviewingSelection(false);
      setIsPreviewingCut(false);

      const video = videoRef.current;
      video.pause();

      try {
        const stream = video.captureStream
          ? video.captureStream()
          : (video.mozCaptureStream ? video.mozCaptureStream() : null);

        if (!stream) {
          throw new Error(langMode === 'en'
            ? 'Browser stream capture is not supported on this device.'
            : 'ব্রাউজার ভিডিও স্ট্রিম ক্যাপচার সমর্থন করছে না।');
        }

        // Audio sync preservation
        video.muted = false;
        video.volume = 0.5;
        stream.getAudioTracks().forEach(function (track) {
          track.enabled = true;
        });

        const mimeType = getBestSupportedMimeType();
        const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = 'QuickCut_Cut_' + timestamp + ext;

        let recorder;
        try {
          recorder = new MediaRecorder(stream, {
            mimeType: mimeType,
            videoBitsPerSecond: 2800000,
            audioBitsPerSecond: 128000
          });
        } catch (e) {
          recorder = new MediaRecorder(stream, { mimeType: mimeType });
        }
        activeRecorderRef.current = recorder;

        const recordedChunks = [];

        recorder.ondataavailable = function (e) {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        recorder.onstop = function () {
          if (isCancelledRef.current) {
            recordedChunks.length = 0;
            return;
          }

          const blob = new Blob(recordedChunks, { type: mimeType });
          // Clear chunk array to avoid mobile memory leaks
          recordedChunks.length = 0;

          const url = URL.createObjectURL(blob);
          const file = new File([blob], filename, { type: mimeType });
          const sizeStr = (blob.size / (1024 * 1024)).toFixed(2) + ' MB';

          setCutResult({
            url: url,
            blob: blob,
            file: file,
            duration: keptDuration,
            size: sizeStr,
            name: filename,
            removedRangeStr: formatHHMMSS(startTime) + ' - ' + formatHHMMSS(endTime)
          });

          setIsCutting(false);
          setCutProgress(100);
          activeRecorderRef.current = null;

          setTimeout(function () {
            const resultEl = document.getElementById('cut-result-section');
            if (resultEl && resultEl.scrollIntoView) {
              resultEl.scrollIntoView({ behavior: 'smooth' });
            }
          }, 200);
        };

        recorder.onerror = function (event) {
          console.error('Recorder error during cut:', event.error);
          setIsCutting(false);
          activeRecorderRef.current = null;
          setCutError(langMode === 'en'
            ? 'Memory limit reached while recording cut sections. Try cutting a smaller range or closing background tabs.'
            : 'অংশ বাদ দিয়ে রেকর্ড করার সময় মেমোরি সীমা পূর্ণ হয়েছে। অপেক্ষাকৃত ছোট অংশ ট্রিম/কাট করুন।');
        };

        const hasPart1 = startTime > 0.15;
        const hasPart2 = endTime < duration - 0.15;

        if (hasPart1 && hasPart2) {
          // Middle cut: record [0 -> startTime], jump to endTime, record [endTime -> duration]
          video.currentTime = 0;
          video.play().then(function () {
            recorder.start(100);
            setCutPhase(langMode === 'en' ? 'Recording Part 1 (before cut)...' : 'প্রথম অংশ রেকর্ড হচ্ছে...');

            let jumped = false;
            const checkInterval = setInterval(function () {
              if (isCancelledRef.current || !video) {
                clearInterval(checkInterval);
                activeCheckIntervalRef.current = null;
                return;
              }

              if (!jumped) {
                const p1Ratio = Math.min(1, video.currentTime / startTime);
                const pct = Math.min(48, Math.floor(p1Ratio * 45) + 5);
                setCutProgress(pct);

                if (video.currentTime >= startTime) {
                  jumped = true;
                  if (typeof recorder.pause === 'function') {
                    try { recorder.pause(); } catch (e) {}
                  }
                  video.pause();
                  setCutPhase(langMode === 'en' ? 'Joining Part 2 (after cut)...' : 'পরবর্তী অংশ জোড়া লাগানো হচ্ছে...');

                  const onSeeked = function () {
                    video.removeEventListener('seeked', onSeeked);
                    if (isCancelledRef.current) return;
                    if (typeof recorder.resume === 'function') {
                      try { recorder.resume(); } catch (e) {}
                    }
                    video.play().catch(function (err) {
                      console.warn('Play error on jump:', err);
                    });
                  };

                  video.addEventListener('seeked', onSeeked);
                  video.currentTime = endTime;
                }
              } else {
                // Recording Part 2: endTime -> duration
                const p2Elapsed = Math.max(0, video.currentTime - endTime);
                const p2Dur = Math.max(0.1, duration - endTime);
                const p2Ratio = Math.min(1, p2Elapsed / p2Dur);
                const pct = Math.min(96, Math.floor(p2Ratio * 45) + 50);
                setCutProgress(pct);

                if (video.currentTime >= duration || video.ended) {
                  clearInterval(checkInterval);
                  activeCheckIntervalRef.current = null;
                  if (recorder.state === 'recording' || recorder.state === 'paused') {
                    recorder.stop();
                  }
                  video.pause();
                }
              }
            }, 80);

            activeCheckIntervalRef.current = checkInterval;
          }).catch(function (err) {
            setIsCutting(false);
            activeRecorderRef.current = null;
            setCutError(langMode === 'en' ? 'Playback error: ' + err.message : 'প্লেব্যাক ত্রুটি: ' + err.message);
          });

        } else if (hasPart1 && !hasPart2) {
          // End cut: only record [0 -> startTime]
          video.currentTime = 0;
          video.play().then(function () {
            recorder.start(100);
            setCutPhase(langMode === 'en' ? 'Keeping video before cut point...' : 'কাট পয়েন্টের পূর্বের অংশ রাখা হচ্ছে...');

            const checkInterval = setInterval(function () {
              if (isCancelledRef.current || !video) {
                clearInterval(checkInterval);
                activeCheckIntervalRef.current = null;
                return;
              }
              const pRatio = Math.min(1, video.currentTime / startTime);
              setCutProgress(Math.min(95, Math.floor(pRatio * 90) + 5));

              if (video.currentTime >= startTime || video.ended) {
                clearInterval(checkInterval);
                activeCheckIntervalRef.current = null;
                if (recorder.state === 'recording') recorder.stop();
                video.pause();
              }
            }, 80);

            activeCheckIntervalRef.current = checkInterval;
          }).catch(function (err) {
            setIsCutting(false);
            activeRecorderRef.current = null;
            setCutError(langMode === 'en' ? 'Playback error: ' + err.message : 'প্লেব্যাক ত্রুটি: ' + err.message);
          });

        } else {
          // Beginning cut: only record [endTime -> duration]
          video.currentTime = endTime;
          video.play().then(function () {
            recorder.start(100);
            setCutPhase(langMode === 'en' ? 'Keeping video after cut point...' : 'কাট পয়েন্টের পরের অংশ রাখা হচ্ছে...');

            const remDur = Math.max(0.1, duration - endTime);
            const checkInterval = setInterval(function () {
              if (isCancelledRef.current || !video) {
                clearInterval(checkInterval);
                activeCheckIntervalRef.current = null;
                return;
              }
              const elapsed = Math.max(0, video.currentTime - endTime);
              const pRatio = Math.min(1, elapsed / remDur);
              setCutProgress(Math.min(95, Math.floor(pRatio * 90) + 5));

              if (video.currentTime >= duration || video.ended) {
                clearInterval(checkInterval);
                activeCheckIntervalRef.current = null;
                if (recorder.state === 'recording') recorder.stop();
                video.pause();
              }
            }, 80);

            activeCheckIntervalRef.current = checkInterval;
          }).catch(function (err) {
            setIsCutting(false);
            activeRecorderRef.current = null;
            setCutError(langMode === 'en' ? 'Playback error: ' + err.message : 'প্লেব্যাক ত্রুটি: ' + err.message);
          });
        }

      } catch (err) {
        console.error('Cut video error:', err);
        setIsCutting(false);
        activeRecorderRef.current = null;
        setCutError(err.message || 'Error occurred while cutting video.');
      }
    };

    // =========================================================
    // REAL VIDEO SPLIT IMPLEMENTATION (100% Client-Side Local)
    // =========================================================
    const handleSplitVideo = function () {
      if (isProcessing) return;
      if (!videoRef.current || duration <= 0) return;
      if (splitPoint <= 0.3 || splitPoint >= duration - 0.3) {
        alert(langMode === 'en'
          ? 'Please pick a split point between start and end of the video.'
          : 'ভিডিওর শুরু ও শেষের মাঝে একটি স্প্লিট পয়েন্ট নির্বাচন করুন।');
        return;
      }

      // Memory cleanup: revoke previous split part URLs
      if (splitResult) {
        if (splitResult.part1 && splitResult.part1.url) URL.revokeObjectURL(splitResult.part1.url);
        if (splitResult.part2 && splitResult.part2.url) URL.revokeObjectURL(splitResult.part2.url);
        setSplitResult(null);
      }

      isCancelledRef.current = false;
      setSplitError(null);
      setIsSplitting(true);
      setSplitProgress(5);
      setSplitPhase(langMode === 'en' ? 'Processing Part 1...' : 'অংশ ১ তৈরি হচ্ছে...');
      setIsPreviewingSelection(false);

      const video = videoRef.current;
      video.pause();

      try {
        const stream = video.captureStream
          ? video.captureStream()
          : (video.mozCaptureStream ? video.mozCaptureStream() : null);

        if (!stream) {
          throw new Error(langMode === 'en'
            ? 'Browser stream capture not supported on this device.'
            : 'ব্রাউজার ভিডিও স্ট্রিম ক্যাপচার সমর্থন করছে না।');
        }

        // Audio sync preservation
        video.muted = false;
        video.volume = 0.5;
        stream.getAudioTracks().forEach(function (track) {
          track.enabled = true;
        });

        const mimeType = getBestSupportedMimeType();
        const ext = mimeType.includes('mp4') ? '.mp4' : '.webm';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

        // Helper to record a specific segment [segStart, segEnd]
        const recordSegment = function (segStart, segEnd, onProgress) {
          return new Promise(function (resolve, reject) {
            if (isCancelledRef.current) {
              reject(new Error('Cancelled'));
              return;
            }

            video.currentTime = segStart;
            let recorder;
            try {
              recorder = new MediaRecorder(stream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2800000,
                audioBitsPerSecond: 128000
              });
            } catch (e) {
              recorder = new MediaRecorder(stream, { mimeType: mimeType });
            }
            activeRecorderRef.current = recorder;
            const chunks = [];

            recorder.ondataavailable = function (e) {
              if (e.data && e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = function () {
              if (isCancelledRef.current) {
                chunks.length = 0;
                reject(new Error('Cancelled'));
                return;
              }
              const blob = new Blob(chunks, { type: mimeType });
              chunks.length = 0;
              resolve(blob);
            };

            recorder.onerror = function (event) {
              console.error('Recorder error during split segment:', event.error);
              reject(new Error(langMode === 'en'
                ? 'Device memory limit reached while splitting segment.'
                : 'স্প্লিট সেগমেন্ট রেকর্ডকালে মেমোরি সীমাবদ্ধতা দেখা দিয়েছে।'));
            };

            video.play().then(function () {
              recorder.start(100);
              const segDur = segEnd - segStart;
              const checkInterval = setInterval(function () {
                if (isCancelledRef.current || !video) {
                  clearInterval(checkInterval);
                  activeCheckIntervalRef.current = null;
                  return;
                }
                const elapsed = Math.max(0, video.currentTime - segStart);
                const progressRatio = Math.min(1, elapsed / segDur);
                if (onProgress) onProgress(progressRatio);

                if (video.currentTime >= segEnd || video.ended) {
                  clearInterval(checkInterval);
                  activeCheckIntervalRef.current = null;
                  if (recorder.state === 'recording') recorder.stop();
                  video.pause();
                }
              }, 80);

              activeCheckIntervalRef.current = checkInterval;
            }).catch(function (err) {
              reject(err);
            });
          });
        };

        // Record Part 1 (0 to splitPoint)
        recordSegment(0, splitPoint, function (ratio) {
          const pct = Math.min(48, Math.floor(ratio * 45) + 5);
          setSplitProgress(pct);
        }).then(function (blob1) {
          if (isCancelledRef.current) return;
          // Part 1 complete!
          setSplitProgress(50);
          setSplitPhase(langMode === 'en' ? 'Processing Part 2...' : 'অংশ ২ তৈরি হচ্ছে...');

          // Record Part 2 (splitPoint to duration)
          return recordSegment(splitPoint, duration, function (ratio) {
            const pct = Math.min(96, Math.floor(ratio * 45) + 50);
            setSplitProgress(pct);
          }).then(function (blob2) {
            if (isCancelledRef.current) return;
            // Both parts complete!
            const url1 = URL.createObjectURL(blob1);
            const url2 = URL.createObjectURL(blob2);
            const filename1 = 'QuickCut_Part1_' + timestamp + ext;
            const filename2 = 'QuickCut_Part2_' + timestamp + ext;
            const file1 = new File([blob1], filename1, { type: mimeType });
            const file2 = new File([blob2], filename2, { type: mimeType });

            setSplitResult({
              part1: {
                url: url1,
                blob: blob1,
                file: file1,
                name: filename1,
                duration: splitPoint,
                size: (blob1.size / (1024 * 1024)).toFixed(2) + ' MB',
                rangeStr: '00:00:00 - ' + formatHHMMSS(splitPoint)
              },
              part2: {
                url: url2,
                blob: blob2,
                file: file2,
                name: filename2,
                duration: duration - splitPoint,
                size: (blob2.size / (1024 * 1024)).toFixed(2) + ' MB',
                rangeStr: formatHHMMSS(splitPoint) + ' - ' + formatHHMMSS(duration)
              }
            });

            setIsSplitting(false);
            setSplitProgress(100);
            activeRecorderRef.current = null;

            setTimeout(function () {
              const resEl = document.getElementById('split-results-section');
              if (resEl && resEl.scrollIntoView) {
                resEl.scrollIntoView({ behavior: 'smooth' });
              }
            }, 200);
          });
        }).catch(function (err) {
          if (isCancelledRef.current || err.message === 'Cancelled') return;
          console.error('Split error:', err);
          setIsSplitting(false);
          activeRecorderRef.current = null;
          setSplitError(langMode === 'en'
            ? 'Error during video splitting: ' + (err.message || 'Unknown error')
            : 'ভিডিও ভাগ করার সময় ত্রুটি: ' + (err.message || 'অজানা সমস্যা'));
        });

      } catch (err) {
        console.error('Split initiation error:', err);
        setIsSplitting(false);
        activeRecorderRef.current = null;
        setSplitError(err.message || 'Error occurred while splitting video locally.');
      }
    };

    // Share video file via Web Share API with robust Android fallback to download
    const shareVideoFile = function (file, url, title) {
      if (!file) return;

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: title || 'QuickCut Video',
          text: 'Created locally with QuickCut Video Editor'
        }).catch(function (err) {
          if (err.name !== 'AbortError') {
            console.warn('Share error, falling back to download:', err);
            handleDownloadVideo(url, file.name, title);
          }
        });
      } else if (navigator.share) {
        navigator.share({
          title: title || 'QuickCut Video',
          text: 'Created locally with QuickCut Video Editor'
        }).catch(function (err) {
          if (err.name !== 'AbortError') {
            handleDownloadVideo(url, file.name, title);
          }
        });
      } else {
        // Fallback directly to Android download
        handleDownloadVideo(url, file.name, title);
      }
    };

    const selectedDuration = Math.max(0, endTime - startTime);
    const part1Duration = Math.max(0, splitPoint);
    const part2Duration = Math.max(0, duration - splitPoint);

    const startPercent = duration > 0 ? (startTime / duration) * 100 : 0;
    const endPercent = duration > 0 ? (endTime / duration) * 100 : 100;
    const splitPercent = duration > 0 ? (splitPoint / duration) * 100 : 50;
    const playheadPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Header Element
    const headerNode = e('header', { className: 'app-header' },
      e('div', { className: 'logo-group' },
        e('div', { className: 'logo-badge', title: 'QuickCut' },
          svgIcon(ICONS.scissors, 26, 26, '#FFFFFF')
        ),
        e('div', { className: 'title-wrap' },
          e('h1', null, 'QuickCut'),
          e('div', { className: 'subtitle' },
            e('span', null, 'আধুনিক ভিডিও এডিটর'),
            e('span', null, '•'),
            e('span', null, 'Video Editor')
          )
        )
      ),
      e('div', { className: 'lang-switch' },
        e('button', {
          className: 'lang-btn ' + (langMode === 'both' ? 'active' : ''),
          onClick: function () { setLangMode('both'); },
          title: 'উভয় ভাষা / Both'
        }, 'BN/EN'),
        e('button', {
          className: 'lang-btn ' + (langMode === 'bn' ? 'active' : ''),
          onClick: function () { setLangMode('bn'); },
          title: 'বাংলা'
        }, 'বাংলা'),
        e('button', {
          className: 'lang-btn ' + (langMode === 'en' ? 'active' : ''),
          onClick: function () { setLangMode('en'); },
          title: 'English'
        }, 'EN')
      )
    );

    // Hidden File Input
    const fileInputNode = e('input', {
      type: 'file',
      ref: fileInputRef,
      accept: 'video/mp4,video/webm,video/quicktime,video/*',
      className: 'hidden-file-input',
      onChange: handleFileSelect
    });

    // 1. Initial State: Large "Select Video" Card
    const uploadCardNode = e('section', {
      className: 'upload-card',
      onClick: function () {
        if (fileInputRef.current) fileInputRef.current.click();
      }
    },
      e('div', { className: 'upload-icon-ring' },
        svgIcon(ICONS.video, 40, 40, '#0284C7')
      ),
      e('div', { className: 'upload-text' },
        e('h2', null,
          langMode !== 'en' ? 'ভিডিও নির্বাচন করুন' : '',
          langMode === 'both' ? ' / ' : '',
          langMode !== 'bn' ? 'Select Video' : ''
        ),
        e('p', null,
          langMode !== 'en' ? 'গ্যালারি থেকে ১ জিবি পর্যন্ত যেকোনো MP4, WebM বা MOV ভিডিও বাছুন' : '',
          langMode === 'both' ? ' • ' : '',
          langMode !== 'bn' ? 'Supports local videos up to 1 GB (MP4, WebM, MOV)' : ''
        )
      ),
      e('button', {
        type: 'button',
        className: 'gallery-btn-cta',
        onClick: function (ev) {
          ev.stopPropagation();
          if (fileInputRef.current) fileInputRef.current.click();
        }
      },
        svgIcon(ICONS.gallery, 24, 24, '#FFFFFF'),
        e('span', null,
          langMode !== 'en' ? 'ভিডিও নির্বাচন করুন' : '',
          langMode === 'both' ? ' / ' : '',
          langMode !== 'bn' ? 'Select Video' : ''
        )
      ),
      e('button', {
        type: 'button',
        className: 'sample-video-link',
        onClick: function (ev) {
          ev.stopPropagation();
          handleLoadSampleVideo();
        }
      },
        e('span', null, '▶'),
        e('span', null,
          langMode !== 'en' ? 'নমুনা ভিডিও দিয়ে পরীক্ষা করুন' : '',
          langMode === 'both' ? ' / ' : '',
          langMode !== 'bn' ? 'Try Sample Video' : ''
        )
      ),
      e('a', {
        href: './QuickCut_Offline_App.zip',
        download: 'QuickCut_Offline_App.zip',
        className: 'sample-video-link',
        style: { marginTop: 4, color: '#059669', borderColor: '#A7F3D0', background: '#ECFDF5' },
        onClick: function (ev) {
          ev.stopPropagation();
        }
      },
        svgIcon(ICONS.download, 16, 16, '#059669'),
        e('span', null,
          langMode !== 'en' ? 'ফোনের জন্য অফলাইন জিপ ডাউনলোড (ZIP Download)' : '',
          langMode === 'both' ? ' • ' : '',
          langMode !== 'bn' ? 'Download Offline ZIP' : ''
        )
      )
    );

    // 2. Video Preview Section (Responsive Player)
    let videoSectionNode = null;
    if (videoSrc) {
      videoSectionNode = e('section', { className: 'video-card' },
        e('div', { className: 'video-wrapper' },
          isPreviewingSelection ? e('div', { className: 'range-active-badge' },
            e('span', { className: 'pulse-dot' }),
            e('span', null,
              langMode !== 'en' ? 'সিলেকশন প্রিভিউ চলছে' : '',
              langMode === 'both' ? ' • ' : '',
              langMode !== 'bn' ? 'Previewing Selection' : ''
            )
          ) : null,
          isPreviewingCut ? e('div', { className: 'range-active-badge', style: { background: '#FFF1F2', borderColor: '#FECDD3', color: '#E11D48' } },
            e('span', { className: 'pulse-dot', style: { background: '#E11D48' } }),
            e('span', null,
              langMode !== 'en' ? 'কাটার অংশ প্রিভিউ চলছে' : '',
              langMode === 'both' ? ' • ' : '',
              langMode !== 'bn' ? 'Previewing Cut Transition' : ''
            )
          ) : null,
          generalVideoError ? e('div', { className: 'video-error-banner' },
            svgIcon(ICONS.alert, 22, 22, '#DC2626'),
            e('span', null, generalVideoError)
          ) : null,
          e('video', {
            ref: videoRef,
            src: videoSrc,
            playsInline: true,
            'webkit-playsinline': 'true',
            onLoadedMetadata: handleLoadedMetadata,
            onTimeUpdate: handleTimeUpdate,
            onEnded: function () { setIsPlaying(false); },
            onError: function (err) {
              console.warn('Video load/playback error:', err);
              setGeneralVideoError(langMode === 'en'
                ? 'Selected video format could not be decoded. Try another video (MP4/WebM).'
                : 'ভিডিওটি ডিকোড করতে সমস্যা হয়েছে। অনুগ্রহ করে অন্য MP4 বা WebM ফাইল নির্বাচন করুন।');
            },
            onClick: togglePlay
          })
        ),
        e('div', { className: 'video-meta-bar' },
          e('div', { className: 'file-info' },
            e('span', { className: 'file-name', title: videoInfo.name }, videoInfo.name),
            e('div', { className: 'video-meta-tags' },
              videoInfo.size ? e('span', {
                className: 'video-meta-chip ' + (videoInfo.sizeMb > 700 ? 'size-danger' : (videoInfo.sizeMb > 350 ? 'size-warning' : ''))
              }, '📦 ' + videoInfo.size) : null,
              videoInfo.resolution ? e('span', { className: 'video-meta-chip' }, '📺 ' + videoInfo.resolution) : null,
              duration > 0 ? e('span', { className: 'video-meta-chip' }, '⏱️ ' + formatHHMMSS(duration)) : null
            )
          ),
          e('button', {
            className: 'change-video-btn',
            onClick: function () { if (fileInputRef.current) fileInputRef.current.click(); }
          },
            e('span', null, langMode === 'en' ? 'Change Video' : 'ভিডিও পরিবর্তন')
          )
        ),
        // Large File RAM Advisory Warning for Mobile
        videoInfo.isLargeFile ? e('div', {
          className: 'large-video-warning-box ' + (videoInfo.sizeMb > 700 ? 'danger-level' : '')
        },
          svgIcon(ICONS.alert, 18, 18, videoInfo.sizeMb > 700 ? '#DC2626' : '#D97706'),
          e('div', null,
            e('strong', null,
              langMode !== 'en'
                ? (videoInfo.sizeMb > 700 ? 'ভারী ফাইল সতর্কতা (>700 MB): ' : 'বড় ভিডিও সতর্কতা (>350 MB): ')
                : (videoInfo.sizeMb > 700 ? 'Large Video Warning (>700 MB): ' : 'Large File Notice (>350 MB): ')
            ),
            langMode !== 'en'
              ? 'মোবাইল ব্রাউজারের র‍্যামের (RAM) ওপর নির্ভর করে প্রসেসিংয়ে কিছুটা সময় লাগতে পারে। ক্রোম ব্রাউজারে অন্যান্য ভারী ট্যাব বন্ধ রাখলে দ্রুত ও মসৃণ কাজ করবে।'
              : 'Processing large files depends on available Android RAM. Close background apps or heavy tabs for best speed.'
          )
        ) : null,
        e('div', { className: 'playback-bar' },
          e('div', { className: 'playback-center' },
            e('button', { className: 'ctrl-btn', onClick: function () { stepSeek(-0.1); }, title: '-0.1s' },
              e('span', { style: { fontSize: '0.75rem', fontWeight: 'bold' } }, '-0.1s')
            ),
            e('button', { className: 'ctrl-btn', onClick: function () { stepSeek(-1.0); }, title: '-1s' },
              svgIcon(ICONS.back1s, 20, 20, 'currentColor')
            ),
            e('button', {
              className: 'ctrl-btn play-pause-btn',
              onClick: togglePlay,
              title: isPlaying ? 'Pause' : 'Play'
            },
              svgIcon(isPlaying ? ICONS.pause : ICONS.play, 24, 24, '#FFFFFF')
            ),
            e('button', { className: 'ctrl-btn', onClick: function () { stepSeek(1.0); }, title: '+1s' },
              svgIcon(ICONS.forward1s, 20, 20, 'currentColor')
            ),
            e('button', { className: 'ctrl-btn', onClick: function () { stepSeek(0.1); }, title: '+0.1s' },
              e('span', { style: { fontSize: '0.75rem', fontWeight: 'bold' } }, '+0.1s')
            )
          ),
          e('div', { className: 'time-display' },
            e('span', { className: 'time-current' }, formatHHMMSS(currentTime)),
            e('span', { className: 'time-total' }, '/ ' + formatHHMMSS(duration))
          )
        )
      );
    }

    // 3. Mode Switcher (Trim, Cut & Split Tabs)
    let modeSwitcherNode = null;
    if (videoSrc) {
      modeSwitcherNode = e('div', { className: 'mode-switcher-wrap' },
        e('button', {
          className: 'mode-tab-btn ' + (editMode === 'trim' ? 'active' : ''),
          disabled: isProcessing,
          onClick: function () { if (!isProcessing) setEditMode('trim'); }
        },
          svgIcon(ICONS.scissors, 18, 18, 'currentColor'),
          e('span', null, langMode !== 'en' ? 'ভিডিও ট্রিম' : 'Trim Video'),
          langMode === 'both' ? e('span', { style: { fontSize: '0.75rem', opacity: 0.8 } }, '/ Trim') : null
        ),
        e('button', {
          className: 'mode-tab-btn cut-tab ' + (editMode === 'cut' ? 'active cut-tab' : ''),
          disabled: isProcessing,
          onClick: function () { if (!isProcessing) setEditMode('cut'); }
        },
          svgIcon(ICONS.cutRemove, 18, 18, 'currentColor'),
          e('span', null, langMode !== 'en' ? 'অংশ বাদ দিন' : 'Cut Video'),
          langMode === 'both' ? e('span', { style: { fontSize: '0.75rem', opacity: 0.8 } }, '/ Cut') : null
        ),
        e('button', {
          className: 'mode-tab-btn split-tab ' + (editMode === 'split' ? 'active split-tab' : ''),
          disabled: isProcessing,
          onClick: function () { if (!isProcessing) setEditMode('split'); }
        },
          svgIcon(ICONS.split, 18, 18, 'currentColor'),
          e('span', null, langMode !== 'en' ? 'ভিডিও স্প্লিট' : 'Split Video'),
          langMode === 'both' ? e('span', { style: { fontSize: '0.75rem', opacity: 0.8 } }, '/ Split') : null
        )
      );
    }

    // 4. Timeline Section: Render either Trim Timeline OR Split Timeline
    let timelineSectionNode = null;
    if (videoSrc) {
      if (editMode === 'trim') {
        // --- TRIM TIMELINE ---
        timelineSectionNode = e('section', { className: 'timeline-card' },
          e('div', { className: 'timeline-header' },
            e('div', { className: 'timeline-title' },
              svgIcon(ICONS.filmTrack, 20, 20, '#059669'),
              e('span', null,
                langMode !== 'en' ? 'টাইমলাইন ও সময় নির্বাচন' : '',
                langMode === 'both' ? ' / ' : '',
                langMode !== 'bn' ? 'Timeline & Selection' : ''
              )
            ),
            e('div', { className: 'duration-pills' },
              e('div', { className: 'duration-pill total' },
                (langMode === 'en' ? 'Total' : 'মোট') + ': ' + formatHHMMSS(duration)
              ),
              e('div', { className: 'duration-pill trimmed' },
                '✂ ' + (langMode === 'en' ? 'Selected' : 'নির্বাচিত') + ': ' + formatHHMMSS(selectedDuration)
              )
            )
          ),

          // Interactive Dual-Handle Timeline Track
          e('div', {
            ref: timelineRef,
            className: 'timeline-track-container',
            onPointerDown: function (ev) { startDragging(ev, 'track'); }
          },
            e('div', { className: 'timeline-film-ticks' }),
            e('div', {
              className: 'timeline-selected-range',
              style: { left: startPercent + '%', width: Math.max(0, endPercent - startPercent) + '%' }
            }),
            e('div', {
              className: 'timeline-playhead',
              style: { left: playheadPercent + '%' }
            }),
            e('div', {
              className: 'range-handle start-handle',
              style: { left: startPercent + '%' },
              onPointerDown: function (ev) { startDragging(ev, 'start'); }
            },
              e('div', { className: 'handle-bar' }, e('div', { className: 'handle-grip' })),
              e('div', { className: 'handle-label-tag' }, (langMode === 'en' ? 'Start' : 'শুরু') + ' ' + formatHHMMSS(startTime))
            ),
            e('div', {
              className: 'range-handle end-handle',
              style: { left: endPercent + '%' },
              onPointerDown: function (ev) { startDragging(ev, 'end'); }
            },
              e('div', { className: 'handle-bar' }, e('div', { className: 'handle-grip' })),
              e('div', { className: 'handle-label-tag' }, (langMode === 'en' ? 'End' : 'শেষ') + ' ' + formatHHMMSS(endTime))
            )
          ),

          // Start & End Time Fields
          e('div', { className: 'time-inputs-grid' },
            // Start Time Box
            e('div', { className: 'time-box start-box' },
              e('div', { className: 'time-box-header' },
                e('div', { className: 'time-box-title' },
                  langMode !== 'en' ? e('span', { className: 'bn' }, 'শুরুর সময়') : null,
                  langMode !== 'bn' ? e('span', { className: 'en' }, 'Start Time') : null
                ),
                e('button', {
                  className: 'set-current-btn',
                  onClick: setAsStart,
                  title: 'Set current video playback position as Start Time'
                },
                  e('span', null, '📍'),
                  e('span', null, langMode === 'en' ? 'Set Current' : 'বর্তমান সময়')
                )
              ),
              e('div', { className: 'hms-row' },
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 23,
                    className: 'hms-input',
                    value: String(Math.floor(startTime / 3600)).padStart(2, '0'),
                    onChange: function (ev) { handleStartTimeChange('h', ev.target.value); }
                  }),
                  e('label', null, 'HH')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor((startTime % 3600) / 60)).padStart(2, '0'),
                    onChange: function (ev) { handleStartTimeChange('m', ev.target.value); }
                  }),
                  e('label', null, 'MM')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor(startTime % 60)).padStart(2, '0'),
                    onChange: function (ev) { handleStartTimeChange('s', ev.target.value); }
                  }),
                  e('label', null, 'SS')
                )
              ),
              e('div', { className: 'stepper-row' },
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(-1.0); } }, '-1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(-0.1); } }, '-0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(0.1); } }, '+0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(1.0); } }, '+1s')
              )
            ),

            // End Time Box
            e('div', { className: 'time-box end-box' },
              e('div', { className: 'time-box-header' },
                e('div', { className: 'time-box-title' },
                  langMode !== 'en' ? e('span', { className: 'bn' }, 'শেষের সময়') : null,
                  langMode !== 'bn' ? e('span', { className: 'en' }, 'End Time') : null
                ),
                e('button', {
                  className: 'set-current-btn',
                  onClick: setAsEnd,
                  title: 'Set current video playback position as End Time'
                },
                  e('span', null, '📍'),
                  e('span', null, langMode === 'en' ? 'Set Current' : 'বর্তমান সময়')
                )
              ),
              e('div', { className: 'hms-row' },
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 23,
                    className: 'hms-input',
                    value: String(Math.floor(endTime / 3600)).padStart(2, '0'),
                    onChange: function (ev) { handleEndTimeChange('h', ev.target.value); }
                  }),
                  e('label', null, 'HH')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor((endTime % 3600) / 60)).padStart(2, '0'),
                    onChange: function (ev) { handleEndTimeChange('m', ev.target.value); }
                  }),
                  e('label', null, 'MM')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor(endTime % 60)).padStart(2, '0'),
                    onChange: function (ev) { handleEndTimeChange('s', ev.target.value); }
                  }),
                  e('label', null, 'SS')
                )
              ),
              e('div', { className: 'stepper-row' },
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(-1.0); } }, '-1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(-0.1); } }, '-0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(0.1); } }, '+0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(1.0); } }, '+1s')
              )
            )
          )
        );
      } else if (editMode === 'cut') {
        // --- CUT TIMELINE (REMOVE SECTION) ---
        const cutRemoveDuration = Math.max(0, endTime - startTime);
        const cutKeptDuration = startTime + Math.max(0, duration - endTime);

        timelineSectionNode = e('section', { className: 'timeline-card', style: { borderColor: '#FECDD3' } },
          e('div', { className: 'timeline-header' },
            e('div', { className: 'timeline-title' },
              svgIcon(ICONS.cutRemove, 20, 20, '#E11D48'),
              e('span', null,
                langMode !== 'en' ? 'অংশ বাদ দেওয়ার রেঞ্জ' : '',
                langMode === 'both' ? ' / ' : '',
                langMode !== 'bn' ? 'Cut (Remove Section)' : ''
              )
            ),
            e('div', { className: 'duration-pills' },
              e('div', { className: 'duration-pill total' },
                (langMode === 'en' ? 'Total' : 'মোট') + ': ' + formatHHMMSS(duration)
              ),
              e('div', { className: 'duration-pill', style: { background: '#FFF1F2', border: '1px solid #FECDD3', color: '#E11D48' } },
                '- ' + (langMode === 'en' ? 'Remove' : 'বাদ যাবে') + ': ' + formatHHMMSS(cutRemoveDuration)
              ),
              e('div', { className: 'duration-pill trimmed' },
                '✓ ' + (langMode === 'en' ? 'Remaining' : 'অবশিষ্ট') + ': ' + formatHHMMSS(cutKeptDuration)
              )
            )
          ),

          // Interactive Timeline Track (Kept Left + Cut Middle + Kept Right)
          e('div', {
            ref: timelineRef,
            className: 'timeline-track-container',
            onPointerDown: function (ev) { startDragging(ev, 'track'); }
          },
            e('div', { className: 'timeline-film-ticks' }),
            // Kept Left Zone
            e('div', {
              className: 'timeline-cut-kept-left',
              style: { width: startPercent + '%' }
            }),
            // Cut-Out Range (Striped Red Hazard Pattern)
            e('div', {
              className: 'timeline-cut-out-range',
              style: { left: startPercent + '%', width: Math.max(0, endPercent - startPercent) + '%' }
            }),
            // Kept Right Zone
            e('div', {
              className: 'timeline-cut-kept-right',
              style: { width: Math.max(0, 100 - endPercent) + '%' }
            }),
            // Playhead
            e('div', {
              className: 'timeline-playhead',
              style: { left: playheadPercent + '%' }
            }),
            // Cut Start Handle
            e('div', {
              className: 'range-handle cut-start-handle',
              style: { left: startPercent + '%' },
              onPointerDown: function (ev) { startDragging(ev, 'start'); }
            },
              e('div', { className: 'handle-bar' }, e('div', { className: 'handle-grip' })),
              e('div', { className: 'handle-label-tag' }, (langMode === 'en' ? 'Cut Start' : 'বর্জন শুরু') + ' ' + formatHHMMSS(startTime))
            ),
            // Cut End Handle
            e('div', {
              className: 'range-handle cut-end-handle',
              style: { left: endPercent + '%' },
              onPointerDown: function (ev) { startDragging(ev, 'end'); }
            },
              e('div', { className: 'handle-bar' }, e('div', { className: 'handle-grip' })),
              e('div', { className: 'handle-label-tag' }, (langMode === 'en' ? 'Cut End' : 'বর্জন শেষ') + ' ' + formatHHMMSS(endTime))
            )
          ),

          // Start & End Time Input Boxes for Cut Range
          e('div', { className: 'time-inputs-grid' },
            // Cut Start Time Box
            e('div', { className: 'time-box start-box', style: { borderLeft: '4px solid #E11D48' } },
              e('div', { className: 'time-box-header' },
                e('div', { className: 'time-box-title' },
                  langMode !== 'en' ? e('span', { className: 'bn', style: { color: '#E11D48' } }, 'বর্জন শুরুর সময়') : null,
                  langMode !== 'bn' ? e('span', { className: 'en', style: { color: '#E11D48' } }, 'Cut Start') : null
                ),
                e('button', {
                  className: 'set-current-btn',
                  style: { color: '#E11D48', borderColor: '#FECDD3' },
                  onClick: setAsStart,
                  title: 'Set current video position as Cut Start'
                },
                  e('span', null, '📍'),
                  e('span', null, langMode === 'en' ? 'Set Current' : 'বর্তমান সময়')
                )
              ),
              e('div', { className: 'hms-row' },
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 23,
                    className: 'hms-input',
                    value: String(Math.floor(startTime / 3600)).padStart(2, '0'),
                    onChange: function (ev) { handleStartTimeChange('h', ev.target.value); }
                  }),
                  e('label', null, 'HH')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor((startTime % 3600) / 60)).padStart(2, '0'),
                    onChange: function (ev) { handleStartTimeChange('m', ev.target.value); }
                  }),
                  e('label', null, 'MM')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor(startTime % 60)).padStart(2, '0'),
                    onChange: function (ev) { handleStartTimeChange('s', ev.target.value); }
                  }),
                  e('label', null, 'SS')
                )
              ),
              e('div', { className: 'stepper-row' },
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(-1.0); } }, '-1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(-0.1); } }, '-0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(0.1); } }, '+0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustStartTime(1.0); } }, '+1s')
              )
            ),

            // Cut End Time Box
            e('div', { className: 'time-box end-box', style: { borderLeft: '4px solid #E11D48' } },
              e('div', { className: 'time-box-header' },
                e('div', { className: 'time-box-title' },
                  langMode !== 'en' ? e('span', { className: 'bn', style: { color: '#E11D48' } }, 'বর্জন শেষের সময়') : null,
                  langMode !== 'bn' ? e('span', { className: 'en', style: { color: '#E11D48' } }, 'Cut End') : null
                ),
                e('button', {
                  className: 'set-current-btn',
                  style: { color: '#E11D48', borderColor: '#FECDD3' },
                  onClick: setAsEnd,
                  title: 'Set current video position as Cut End'
                },
                  e('span', null, '📍'),
                  e('span', null, langMode === 'en' ? 'Set Current' : 'বর্তমান সময়')
                )
              ),
              e('div', { className: 'hms-row' },
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 23,
                    className: 'hms-input',
                    value: String(Math.floor(endTime / 3600)).padStart(2, '0'),
                    onChange: function (ev) { handleEndTimeChange('h', ev.target.value); }
                  }),
                  e('label', null, 'HH')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor((endTime % 3600) / 60)).padStart(2, '0'),
                    onChange: function (ev) { handleEndTimeChange('m', ev.target.value); }
                  }),
                  e('label', null, 'MM')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor(endTime % 60)).padStart(2, '0'),
                    onChange: function (ev) { handleEndTimeChange('s', ev.target.value); }
                  }),
                  e('label', null, 'SS')
                )
              ),
              e('div', { className: 'stepper-row' },
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(-1.0); } }, '-1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(-0.1); } }, '-0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(0.1); } }, '+0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustEndTime(1.0); } }, '+1s')
              )
            )
          ),

          // Cut Breakdown Summary Box
          e('div', {
            style: {
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
              background: '#FFF1F2',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid #FECDD3',
              fontSize: '0.8rem'
            }
          },
            e('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
              e('strong', { style: { color: '#059669' } }, langMode === 'en' ? 'Kept 1' : 'রাখা হবে ১'),
              e('span', { style: { color: '#047857', fontWeight: 'bold' } },
                '00:00 → ' + formatHHMMSS(startTime)
              )
            ),
            e('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center' } },
              e('strong', { style: { color: '#E11D48' } }, langMode === 'en' ? 'Cut Out ❌' : 'বাদ যাবে ❌'),
              e('span', { style: { color: '#BE123C', fontWeight: 'bold' } },
                formatHHMMSS(cutRemoveDuration)
              )
            ),
            e('div', { style: { display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'right' } },
              e('strong', { style: { color: '#059669' } }, langMode === 'en' ? 'Kept 2' : 'রাখা হবে ২'),
              e('span', { style: { color: '#047857', fontWeight: 'bold' } },
                formatHHMMSS(endTime) + ' → ' + formatHHMMSS(duration)
              )
            )
          )
        );
      } else {
        // --- SPLIT TIMELINE ---
        timelineSectionNode = e('section', { className: 'timeline-card' },
          e('div', { className: 'timeline-header' },
            e('div', { className: 'timeline-title' },
              svgIcon(ICONS.split, 20, 20, '#D97706'),
              e('span', null,
                langMode !== 'en' ? 'স্প্লিট পয়েন্ট নির্বাচন করুন' : '',
                langMode === 'both' ? ' / ' : '',
                langMode !== 'bn' ? 'Choose Split Point' : ''
              )
            ),
            // Show Resulting Parts Duration
            e('div', { className: 'duration-pills' },
              e('div', { className: 'duration-pill total' },
                (langMode === 'en' ? 'Part 1' : 'অংশ ১') + ': ' + formatHHMMSS(part1Duration)
              ),
              e('div', { className: 'duration-pill trimmed', style: { borderColor: '#D97706', color: '#D97706', background: '#FEF3C7' } },
                (langMode === 'en' ? 'Part 2' : 'অংশ ২') + ': ' + formatHHMMSS(part2Duration)
              )
            )
          ),

          // Interactive Split Timeline Track
          e('div', {
            ref: timelineRef,
            className: 'timeline-track-container',
            onPointerDown: function (ev) { startDragging(ev, 'track'); }
          },
            e('div', { className: 'timeline-film-ticks' }),
            // Part 1 Zone Highlight (Left of split point)
            e('div', {
              className: 'split-part1-zone',
              style: { width: splitPercent + '%' }
            }),
            // Part 2 Zone Highlight (Right of split point)
            e('div', {
              className: 'split-part2-zone',
              style: { left: splitPercent + '%', width: (100 - splitPercent) + '%' }
            }),
            // Current Video Playhead
            e('div', {
              className: 'timeline-playhead',
              style: { left: playheadPercent + '%' }
            }),
            // Split Point Draggable Handle
            e('div', {
              className: 'range-handle split-handle',
              style: { left: splitPercent + '%' },
              onPointerDown: function (ev) { startDragging(ev, 'split'); }
            },
              e('div', { className: 'handle-bar' }, e('div', { className: 'handle-grip' })),
              e('div', { className: 'handle-label-tag' },
                (langMode === 'en' ? 'Split' : 'স্প্লিট') + ' ' + formatHHMMSS(splitPoint)
              )
            )
          ),

          // Split Point HH:MM:SS Field & Quick Controls
          e('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 } },
            e('div', { className: 'time-box', style: { borderLeft: '4px solid #D97706' } },
              e('div', { className: 'time-box-header' },
                e('div', { className: 'time-box-title' },
                  langMode !== 'en' ? e('span', { className: 'bn' }, 'ভাগ করার সময় (Split Point)') : null,
                  langMode !== 'bn' ? e('span', { className: 'en' }, 'Split Point (HH:MM:SS)') : null
                ),
                e('button', {
                  className: 'set-current-btn',
                  style: { color: '#D97706', borderColor: '#FDE68A' },
                  onClick: setAsSplitPoint,
                  title: 'Set current video playback position as Split Point'
                },
                  e('span', null, '📍'),
                  e('span', null, langMode === 'en' ? 'Set Current' : 'বর্তমান সময় সেট করুন')
                )
              ),
              // HH:MM:SS Inputs for Split Point
              e('div', { className: 'hms-row' },
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 23,
                    className: 'hms-input',
                    value: String(Math.floor(splitPoint / 3600)).padStart(2, '0'),
                    onChange: function (ev) { handleSplitPointChange('h', ev.target.value); }
                  }),
                  e('label', null, 'HH')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor((splitPoint % 3600) / 60)).padStart(2, '0'),
                    onChange: function (ev) { handleSplitPointChange('m', ev.target.value); }
                  }),
                  e('label', null, 'MM')
                ),
                e('span', { className: 'hms-colon' }, ':'),
                e('div', { className: 'hms-unit' },
                  e('input', {
                    type: 'number',
                    min: 0,
                    max: 59,
                    className: 'hms-input',
                    value: String(Math.floor(splitPoint % 60)).padStart(2, '0'),
                    onChange: function (ev) { handleSplitPointChange('s', ev.target.value); }
                  }),
                  e('label', null, 'SS')
                )
              ),
              // Steppers for Split Point
              e('div', { className: 'stepper-row' },
                e('button', { className: 'step-btn', onClick: function () { adjustSplitPoint(-1.0); } }, '-1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustSplitPoint(-0.1); } }, '-0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustSplitPoint(0.1); } }, '+0.1s'),
                e('button', { className: 'step-btn', onClick: function () { adjustSplitPoint(1.0); } }, '+1s')
              )
            ),

            // Split Parts Duration Summary Card
            e('div', {
              style: {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '0.82rem'
              }
            },
              e('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
                e('strong', { style: { color: '#0284C7' } }, langMode === 'en' ? 'Part 1 (00:00 → Split)' : 'অংশ ১ (০০:০০ → স্প্লিট)'),
                e('span', { style: { color: 'var(--text-secondary)', fontWeight: 'bold' } },
                  '00:00:00 → ' + formatHHMMSS(splitPoint) + ' (' + formatHHMMSS(part1Duration) + ')'
                )
              ),
              e('div', { style: { display: 'flex', flexDirection: 'column', gap: 2 } },
                e('strong', { style: { color: '#059669' } }, langMode === 'en' ? 'Part 2 (Split → End)' : 'অংশ ২ (স্প্লিট → শেষ)'),
                e('span', { style: { color: 'var(--text-secondary)', fontWeight: 'bold' } },
                  formatHHMMSS(splitPoint) + ' → ' + formatHHMMSS(duration) + ' (' + formatHHMMSS(part2Duration) + ')'
                )
              )
            )
          )
        );
      }
    }

    // 5. Actions Area (Trim Mode Actions vs Split Mode Actions)
    let actionSectionNode = null;
    if (videoSrc) {
      if (editMode === 'trim') {
        // --- TRIM ACTIONS ---
        actionSectionNode = e('div', { className: 'action-cards-wrap' },
          // Preview Selection Button
          e('button', {
            className: 'preview-range-btn ' + (isPreviewingSelection ? 'is-previewing' : ''),
            disabled: isProcessing,
            onClick: handlePreviewSelection
          },
            svgIcon(isPreviewingSelection ? ICONS.pause : ICONS.play, 24, 24, 'currentColor'),
            e('div', { className: 'btn-dual-text' },
              e('span', { className: 'bn' },
                isPreviewingSelection
                  ? (langMode !== 'en' ? 'প্রিভিউ বন্ধ করুন' : 'Stop Preview')
                  : (langMode !== 'en' ? 'সিলেকশন প্রিভিউ (' + formatHHMMSS(selectedDuration) + ')' : 'Preview Selection (' + formatHHMMSS(selectedDuration) + ')')
              ),
              langMode === 'both' && !isPreviewingSelection
                ? e('span', { className: 'en' }, 'Preview Selection (' + formatHHMMSS(selectedDuration) + ')')
                : null
            )
          ),

          // Trim Video Button
          !isTrimming ? e('button', {
            className: 'cut-export-btn',
            disabled: isProcessing,
            onClick: handleTrimVideo,
            title: 'Trim Video locally'
          },
            svgIcon(ICONS.scissors, 26, 26, '#FFFFFF'),
            e('div', { className: 'btn-dual-text' },
              langMode !== 'en' ? e('span', { className: 'bn' }, 'ভিডিও ট্রিম করুন (' + formatHHMMSS(selectedDuration) + ')') : null,
              langMode !== 'bn' ? e('span', { className: 'en' }, 'Trim Video (' + formatHHMMSS(selectedDuration) + ')') : null
            )
          ) : null,

          // Trimming Progress Indicator with Cancel Button
          isTrimming ? e('div', { className: 'export-card' },
            e('div', { className: 'export-header' },
              e('strong', null, langMode !== 'en' ? 'ভিডিও ট্রিম করা হচ্ছে...' : 'Trimming Video...'),
              e('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                e('span', { style: { fontWeight: 'bold', color: '#0284C7' } }, trimProgress + '%'),
                e('button', {
                  type: 'button',
                  className: 'cancel-proc-btn',
                  onClick: handleCancelProcessing,
                  title: 'Cancel processing'
                }, langMode === 'en' ? 'Cancel' : 'বাতিল')
              )
            ),
            e('div', { className: 'export-progress-track' },
              e('div', { className: 'export-progress-bar', style: { width: trimProgress + '%' } })
            ),
            e('small', { style: { color: 'var(--text-secondary)' } },
              langMode !== 'en'
                ? 'ডিভাইসে সরাসরি লোকাল প্রসেসিং হচ্ছে (কোনো সার্ভার আপলোড নেই)'
                : 'Processing locally on your device (0 server uploads)'
            )
          ) : null,

          // Error card
          trimError ? e('div', { className: 'trim-error-card' },
            svgIcon(ICONS.alert, 24, 24, '#DC2626'),
            e('span', null, trimError)
          ) : null
        );
      } else if (editMode === 'cut') {
        // --- CUT ACTIONS ---
        const cutRemoveDuration = Math.max(0, endTime - startTime);
        const cutKeptDuration = startTime + Math.max(0, duration - endTime);

        actionSectionNode = e('div', { className: 'action-cards-wrap' },
          // Preview Cut Button
          e('button', {
            className: 'cut-preview-btn ' + (isPreviewingCut ? 'is-previewing' : ''),
            disabled: isProcessing,
            onClick: handlePreviewCut
          },
            svgIcon(isPreviewingCut ? ICONS.pause : ICONS.play, 24, 24, 'currentColor'),
            e('div', { className: 'btn-dual-text' },
              e('span', { className: 'bn' },
                isPreviewingCut
                  ? (langMode !== 'en' ? 'প্রিভিউ বন্ধ করুন' : 'Stop Preview')
                  : (langMode !== 'en' ? 'কাটার অংশ প্রিভিউ দেখুন (Preview Cut)' : 'Preview Cut Transition')
              ),
              langMode === 'both' && !isPreviewingCut
                ? e('span', { className: 'en' }, 'Preview Cut Transition (Skips ' + formatHHMMSS(cutRemoveDuration) + ')')
                : null
            )
          ),

          // Clearly Visible "Cut Video / অংশ বাদ দিন" Button
          !isCutting ? e('button', {
            className: 'cut-action-btn',
            disabled: isProcessing,
            onClick: handleCutVideo,
            title: 'Cut Video and join remaining parts'
          },
            svgIcon(ICONS.scissors, 26, 26, '#FFFFFF'),
            e('div', { className: 'btn-dual-text' },
              langMode !== 'en' ? e('span', { className: 'bn' }, 'ভিডিও কাটুন / অংশ বাদ দিন (' + formatHHMMSS(cutKeptDuration) + ')') : null,
              langMode !== 'bn' ? e('span', { className: 'en' }, 'Cut Video / Remove Section (' + formatHHMMSS(cutKeptDuration) + ')') : null
            )
          ) : null,

          // Cut Progress Indicator Card with Cancel Button
          isCutting ? e('div', { className: 'export-card', style: { borderColor: '#E11D48' } },
            e('div', { className: 'export-header' },
              e('strong', { style: { color: '#BE123C' } }, cutPhase || 'Processing Cut...'),
              e('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                e('span', { style: { fontWeight: 'bold', color: '#E11D48' } }, cutProgress + '%'),
                e('button', {
                  type: 'button',
                  className: 'cancel-proc-btn',
                  onClick: handleCancelProcessing,
                  title: 'Cancel processing'
                }, langMode === 'en' ? 'Cancel' : 'বাতিল')
              )
            ),
            e('div', { className: 'export-progress-track' },
              e('div', {
                className: 'export-progress-bar',
                style: { width: cutProgress + '%', background: 'linear-gradient(135deg, #E11D48 0%, #059669 100%)' }
              })
            ),
            e('small', { style: { color: 'var(--text-secondary)' } },
              langMode !== 'en'
                ? 'ডিভাইসে অংশ বাদ দিয়ে ভিডিও যুক্ত করা হচ্ছে (কোনো সার্ভার আপলোড নেই)'
                : 'Cutting section & joining remaining video locally (0 server uploads)'
            )
          ) : null,

          // Cut Error Card with Retry
          cutError ? e('div', { className: 'trim-error-card' },
            svgIcon(ICONS.alert, 24, 24, '#DC2626'),
            e('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
              e('span', null, cutError),
              e('button', {
                style: {
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: 'fit-content'
                },
                onClick: handleCutVideo
              }, langMode === 'en' ? 'Retry Cut' : 'আবার চেষ্টা করুন')
            )
          ) : null
        );
      } else {
        // --- SPLIT ACTIONS ---
        actionSectionNode = e('div', { className: 'action-cards-wrap' },
          // Clearly Visible "Split Video" Button
          !isSplitting ? e('button', {
            className: 'split-action-btn',
            disabled: isProcessing,
            onClick: handleSplitVideo,
            title: 'Split Video into 2 parts'
          },
            svgIcon(ICONS.split, 26, 26, '#FFFFFF'),
            e('div', { className: 'btn-dual-text' },
              langMode !== 'en' ? e('span', { className: 'bn' }, 'ভিডিও ভাগ করুন (Split Video)') : null,
              langMode !== 'bn' ? e('span', { className: 'en' }, 'Split Video into 2 Parts') : null
            )
          ) : null,

          // Split Progress Indicator Card with Cancel Button
          isSplitting ? e('div', { className: 'export-card', style: { borderColor: '#D97706' } },
            e('div', { className: 'export-header' },
              e('strong', { style: { color: '#B45309' } }, splitPhase || 'Processing Split...'),
              e('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                e('span', { style: { fontWeight: 'bold', color: '#D97706' } }, splitProgress + '%'),
                e('button', {
                  type: 'button',
                  className: 'cancel-proc-btn',
                  onClick: handleCancelProcessing,
                  title: 'Cancel processing'
                }, langMode === 'en' ? 'Cancel' : 'বাতিল')
              )
            ),
            e('div', { className: 'export-progress-track' },
              e('div', {
                className: 'export-progress-bar',
                style: { width: splitProgress + '%', background: 'linear-gradient(135deg, #D97706 0%, #059669 100%)' }
              })
            ),
            e('small', { style: { color: 'var(--text-secondary)' } },
              langMode !== 'en'
                ? 'ডিভাইসে ২টি অংশ তৈরি হচ্ছে (কোনো সার্ভার আপলোড নেই)'
                : 'Generating 2 video parts locally on device (0 server uploads)'
            )
          ) : null,

          // Split Error Card with Retry
          splitError ? e('div', { className: 'trim-error-card' },
            svgIcon(ICONS.alert, 24, 24, '#DC2626'),
            e('div', { style: { display: 'flex', flexDirection: 'column', gap: 4 } },
              e('span', null, splitError),
              e('button', {
                style: {
                  background: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  width: 'fit-content'
                },
                onClick: handleSplitVideo
              }, langMode === 'en' ? 'Retry Split' : 'আবার চেষ্টা করুন')
            )
          ) : null
        );
      }
    }

    // 6. Trimmed Output Result (if trimmed)
    let trimmedOutputNode = null;
    if (trimmedVideo) {
      trimmedOutputNode = e('section', { id: 'trimmed-result-section', className: 'trimmed-result-card' },
        e('div', { className: 'trimmed-header' },
          e('div', { className: 'trimmed-badge' },
            svgIcon(ICONS.check, 18, 18, 'currentColor'),
            e('span', null,
              langMode !== 'en' ? 'ভিডিও ট্রিম সফল হয়েছে!' : '',
              langMode === 'both' ? ' / ' : '',
              langMode !== 'bn' ? 'Trimmed Successfully!' : ''
            )
          )
        ),

        // Dedicated Video Player
        e('div', { className: 'trimmed-video-player-wrap' },
          e('video', {
            ref: trimmedVideoRef,
            src: trimmedVideo.url,
            controls: true,
            playsInline: true,
            'webkit-playsinline': 'true'
          })
        ),

        // Stats
        e('div', { className: 'trimmed-stats-grid' },
          e('div', { className: 'trimmed-stat-item' },
            e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Duration' : 'নতুন দৈর্ঘ্য'),
            e('span', { className: 'trimmed-stat-value', style: { color: '#059669' } }, formatHHMMSS(trimmedVideo.duration))
          ),
          e('div', { className: 'trimmed-stat-item' },
            e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Size' : 'ফাইল সাইজ'),
            e('span', { className: 'trimmed-stat-value' }, trimmedVideo.size)
          ),
          e('div', { className: 'trimmed-stat-item' },
            e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Cut Range' : 'কাটা রেঞ্জ'),
            e('span', { className: 'trimmed-stat-value' }, trimmedVideo.rangeStr)
          )
        ),

        // Actions
        e('div', { className: 'trimmed-actions-row' },
          e('button', {
            type: 'button',
            onClick: function () { handleDownloadVideo(trimmedVideo.url, trimmedVideo.name, langMode === 'en' ? 'Trimmed Video' : 'ট্রিম করা ভিডিও'); },
            className: 'save-video-btn'
          },
            svgIcon(ICONS.download, 22, 22, '#FFFFFF'),
            e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 } },
              e('span', null, langMode !== 'en' ? 'ভিডিও সেভ করুন' : 'Save Video'),
              langMode === 'both' ? e('span', { style: { fontSize: '0.72rem', opacity: 0.9 } }, 'Save Video') : null
            )
          ),
          e('button', {
            type: 'button',
            className: 'share-video-btn',
            onClick: function () { shareVideoFile(trimmedVideo.file, trimmedVideo.url, 'QuickCut Trimmed Video'); }
          },
            svgIcon(ICONS.share, 20, 20, '#0284C7'),
            e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 } },
              e('span', null, langMode !== 'en' ? 'শেয়ার' : 'Share'),
              langMode === 'both' ? e('span', { style: { fontSize: '0.72rem', opacity: 0.85 } }, 'Share') : null
            )
          )
        ),

        // Edit Again button
        e('button', {
          type: 'button',
          className: 'edit-again-btn',
          onClick: function () {
            const timelineEl = document.querySelector('.timeline-card');
            if (timelineEl && timelineEl.scrollIntoView) {
              timelineEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        },
          e('span', null, '✂'),
          e('span', null, langMode !== 'en' ? 'অন্য অংশ ট্রিম করুন / আবার কাটুন' : 'Trim Another Part')
        )
      );
    }

    // 7. Cut Output Result Section (Joined Video Player, Stats & Save/Share)
    let cutOutputNode = null;
    if (cutResult) {
      cutOutputNode = e('section', { id: 'cut-result-section', className: 'cut-result-card' },
        e('div', { className: 'trimmed-header' },
          e('div', { className: 'cut-badge' },
            svgIcon(ICONS.check, 18, 18, 'currentColor'),
            e('span', null,
              langMode !== 'en' ? 'অংশ বাদ দিয়ে ভিডিও প্রস্তুত!' : '',
              langMode === 'both' ? ' / ' : '',
              langMode !== 'bn' ? 'Cut & Joined Successfully!' : ''
            )
          )
        ),

        // Dedicated Video Player for Cut Result
        e('div', { className: 'trimmed-video-player-wrap' },
          e('video', {
            ref: cutVideoRef,
            src: cutResult.url,
            controls: true,
            playsInline: true,
            'webkit-playsinline': 'true'
          })
        ),

        // Stats: New Duration, File Size, Cut Section Removed
        e('div', { className: 'trimmed-stats-grid' },
          e('div', { className: 'trimmed-stat-item' },
            e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Final Duration' : 'নতুন দৈর্ঘ্য'),
            e('span', { className: 'trimmed-stat-value', style: { color: '#059669' } }, formatHHMMSS(cutResult.duration))
          ),
          e('div', { className: 'trimmed-stat-item' },
            e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'File Size' : 'ফাইল সাইজ'),
            e('span', { className: 'trimmed-stat-value' }, cutResult.size)
          ),
          e('div', { className: 'trimmed-stat-item' },
            e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Removed Section' : 'বাদ দেওয়া অংশ'),
            e('span', { className: 'trimmed-stat-value', style: { color: '#E11D48' } }, cutResult.removedRangeStr)
          )
        ),

        // Actions: Save Video & Share
        e('div', { className: 'trimmed-actions-row' },
          e('button', {
            type: 'button',
            onClick: function () { handleDownloadVideo(cutResult.url, cutResult.name, langMode === 'en' ? 'Cut Video' : 'কাটা ভিডিও'); },
            className: 'save-video-btn',
            style: { background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)' }
          },
            svgIcon(ICONS.download, 22, 22, '#FFFFFF'),
            e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 } },
              e('span', null, langMode !== 'en' ? 'ভিডিও সেভ করুন' : 'Save Video'),
              langMode === 'both' ? e('span', { style: { fontSize: '0.72rem', opacity: 0.9 } }, 'Save Video') : null
            )
          ),
          e('button', {
            type: 'button',
            className: 'share-video-btn',
            style: { borderColor: '#E11D48', color: '#E11D48' },
            onClick: function () { shareVideoFile(cutResult.file, cutResult.url, 'QuickCut Cut Video'); }
          },
            svgIcon(ICONS.share, 20, 20, '#E11D48'),
            e('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.1 } },
              e('span', null, langMode !== 'en' ? 'শেয়ার' : 'Share'),
              langMode === 'both' ? e('span', { style: { fontSize: '0.72rem', opacity: 0.85 } }, 'Share') : null
            )
          )
        ),

        // Cut Another Section Button
        e('button', {
          type: 'button',
          className: 'edit-again-btn',
          onClick: function () {
            const timelineEl = document.querySelector('.timeline-card');
            if (timelineEl && timelineEl.scrollIntoView) {
              timelineEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        },
          e('span', null, '✂❌'),
          e('span', null, langMode !== 'en' ? 'অন্য অংশ কাটুন / আবার অংশ বাদ দিন' : 'Cut Another Section')
        )
      );
    }

    // 8. Split Output Results Section (Requirement 3: PREVIEW BOTH PARTS)
    let splitOutputNode = null;
    if (splitResult) {
      splitOutputNode = e('section', { id: 'split-results-section', className: 'split-results-container' },
        e('div', { className: 'split-results-header' },
          e('div', { className: 'split-results-title' },
            svgIcon(ICONS.split, 24, 24, '#D97706'),
            e('span', null,
              langMode !== 'en' ? 'ভিডিও স্প্লিট ফলাফল (২টি অংশ)' : '',
              langMode === 'both' ? ' / ' : '',
              langMode !== 'bn' ? 'Split Video Results (2 Parts)' : ''
            )
          )
        ),

        e('div', { className: 'split-parts-grid' },
          // PART 1 CARD
          e('div', { className: 'split-part-card part-1' },
            e('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
              e('div', { className: 'split-badge part-1' },
                svgIcon(ICONS.video, 16, 16, '#0284C7'),
                e('span', null, langMode !== 'en' ? 'অংশ ১ / Part 1' : 'Part 1')
              ),
              e('span', { style: { fontSize: '0.82rem', fontWeight: 'bold', color: '#0284C7' } },
                formatHHMMSS(splitResult.part1.duration)
              )
            ),

            // Video Player for Part 1
            e('div', { className: 'trimmed-video-player-wrap' },
              e('video', {
                ref: splitPart1Ref,
                src: splitResult.part1.url,
                controls: true,
                playsInline: true,
                'webkit-playsinline': 'true'
              })
            ),

            // Part 1 Stats
            e('div', { className: 'trimmed-stats-grid' },
              e('div', { className: 'trimmed-stat-item' },
                e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Duration' : 'দৈর্ঘ্য'),
                e('span', { className: 'trimmed-stat-value', style: { color: '#0284C7' } }, formatHHMMSS(splitResult.part1.duration))
              ),
              e('div', { className: 'trimmed-stat-item' },
                e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Size' : 'সাইজ'),
                e('span', { className: 'trimmed-stat-value' }, splitResult.part1.size)
              ),
              e('div', { className: 'trimmed-stat-item' },
                e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Range' : 'রেঞ্জ'),
                e('span', { className: 'trimmed-stat-value' }, splitResult.part1.rangeStr)
              )
            ),

            // Part 1 Save & Share Buttons
            e('div', { className: 'trimmed-actions-row' },
              e('button', {
                type: 'button',
                onClick: function () { handleDownloadVideo(splitResult.part1.url, splitResult.part1.name, langMode === 'en' ? 'Part 1' : 'অংশ ১'); },
                className: 'save-video-btn'
              },
                svgIcon(ICONS.download, 20, 20, '#FFFFFF'),
                e('span', null, langMode !== 'en' ? 'অংশ ১ সেভ করুন' : 'Save Part 1')
              ),
              e('button', {
                type: 'button',
                className: 'share-video-btn',
                onClick: function () { shareVideoFile(splitResult.part1.file, splitResult.part1.url, 'QuickCut Part 1'); }
              },
                svgIcon(ICONS.share, 18, 18, '#0284C7'),
                e('span', null, langMode !== 'en' ? 'শেয়ার' : 'Share')
              )
            )
          ),

          // PART 2 CARD
          e('div', { className: 'split-part-card part-2' },
            e('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
              e('div', { className: 'split-badge part-2' },
                svgIcon(ICONS.video, 16, 16, '#059669'),
                e('span', null, langMode !== 'en' ? 'অংশ ২ / Part 2' : 'Part 2')
              ),
              e('span', { style: { fontSize: '0.82rem', fontWeight: 'bold', color: '#059669' } },
                formatHHMMSS(splitResult.part2.duration)
              )
            ),

            // Video Player for Part 2
            e('div', { className: 'trimmed-video-player-wrap' },
              e('video', {
                ref: splitPart2Ref,
                src: splitResult.part2.url,
                controls: true,
                playsInline: true,
                'webkit-playsinline': 'true'
              })
            ),

            // Part 2 Stats
            e('div', { className: 'trimmed-stats-grid' },
              e('div', { className: 'trimmed-stat-item' },
                e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Duration' : 'দৈর্ঘ্য'),
                e('span', { className: 'trimmed-stat-value', style: { color: '#059669' } }, formatHHMMSS(splitResult.part2.duration))
              ),
              e('div', { className: 'trimmed-stat-item' },
                e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Size' : 'সাইজ'),
                e('span', { className: 'trimmed-stat-value' }, splitResult.part2.size)
              ),
              e('div', { className: 'trimmed-stat-item' },
                e('span', { className: 'trimmed-stat-label' }, langMode === 'en' ? 'Range' : 'রেঞ্জ'),
                e('span', { className: 'trimmed-stat-value' }, splitResult.part2.rangeStr)
              )
            ),

            // Part 2 Save & Share Buttons
            e('div', { className: 'trimmed-actions-row' },
              e('button', {
                type: 'button',
                onClick: function () { handleDownloadVideo(splitResult.part2.url, splitResult.part2.name, langMode === 'en' ? 'Part 2' : 'অংশ ২'); },
                className: 'save-video-btn',
                style: { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
              },
                svgIcon(ICONS.download, 20, 20, '#FFFFFF'),
                e('span', null, langMode !== 'en' ? 'অংশ ২ সেভ করুন' : 'Save Part 2')
              ),
              e('button', {
                type: 'button',
                className: 'share-video-btn',
                style: { borderColor: '#059669', color: '#059669' },
                onClick: function () { shareVideoFile(splitResult.part2.file, splitResult.part2.url, 'QuickCut Part 2'); }
              },
                svgIcon(ICONS.share, 18, 18, '#059669'),
                e('span', null, langMode !== 'en' ? 'শেয়ার' : 'Share')
              )
            )
          )
        ),

        // Split Again Button
        e('button', {
          type: 'button',
          className: 'edit-again-btn',
          onClick: function () {
            const timelineEl = document.querySelector('.timeline-card');
            if (timelineEl && timelineEl.scrollIntoView) {
              timelineEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        },
          e('span', null, '⚡'),
          e('span', null, langMode !== 'en' ? 'নতুন পয়েন্টে আবার ভাগ করুন' : 'Split Again at Different Point')
        )
      );
    }

    // PWA Install Banner Node
    let pwaInstallBannerNode = null;
    if (!isAppInstalled && showInstallBanner) {
      pwaInstallBannerNode = e('div', { className: 'pwa-install-banner' },
        e('div', { className: 'pwa-install-info' },
          e('div', { className: 'pwa-install-icon' },
            svgIcon(ICONS.scissors, 20, 20, '#FFFFFF')
          ),
          e('div', { className: 'pwa-install-text' },
            e('span', { className: 'pwa-install-title' },
              langMode !== 'en' ? 'QuickCut ইনস্টল করুন' : 'Install QuickCut'
            ),
            e('span', { className: 'pwa-install-desc' },
              langMode !== 'en' ? 'অফলাইনে সরাসরি ব্যবহার করুন • 0MB ইন্টারনেট' : 'Fast, offline video editing app'
            )
          )
        ),
        e('div', { className: 'pwa-install-actions' },
          e('button', {
            type: 'button',
            className: 'pwa-install-cta-btn',
            onClick: handleInstallApp,
            title: 'Install QuickCut'
          },
            svgIcon(ICONS.installApp, 16, 16, '#FFFFFF'),
            e('span', null, langMode !== 'en' ? 'ইনস্টল' : 'Install')
          ),
          e('button', {
            type: 'button',
            className: 'pwa-install-close-btn',
            onClick: function () { setShowInstallBanner(false); },
            title: 'Close banner'
          },
            svgIcon(ICONS.close, 18, 18, '#64748B')
          )
        )
      );
    }

    // PWA Install Modal (When automatic beforeinstallprompt is not directly triggered by browser)
    let pwaModalNode = null;
    if (showInstallModal) {
      pwaModalNode = e('div', {
        className: 'pwa-modal-overlay',
        onClick: function (ev) {
          if (ev.target === ev.currentTarget) setShowInstallModal(false);
        }
      },
        e('div', { className: 'pwa-modal-card' },
          e('div', { className: 'pwa-modal-header' },
            e('div', { className: 'pwa-modal-title' },
              svgIcon(ICONS.scissors, 22, 22, '#0284C7'),
              e('span', null, langMode !== 'en' ? 'QuickCut ইনস্টল করার নিয়ম' : 'How to Install QuickCut')
            ),
            e('button', {
              type: 'button',
              className: 'pwa-install-close-btn',
              onClick: function () { setShowInstallModal(false); }
            },
              svgIcon(ICONS.close, 20, 20, '#64748B')
            )
          ),
          e('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
            e('div', { className: 'pwa-modal-step' },
              e('div', { className: 'pwa-step-num' }, '১'),
              e('div', { className: 'pwa-step-text' },
                e('strong', null, langMode !== 'en' ? 'ব্রাউজার মেনু খুলুন: ' : 'Open Browser Menu: '),
                langMode !== 'en'
                  ? 'ক্রোম বা আপনার অ্যান্ড্রয়েড ব্রাউজারের উপরে ডানদিকের তিনটি ডট (⋮) মেনুতে চাপুন।'
                  : 'Tap the three dots (⋮) menu in Chrome or your Android browser.'
              )
            ),
            e('div', { className: 'pwa-modal-step' },
              e('div', { className: 'pwa-step-num' }, '২'),
              e('div', { className: 'pwa-step-text' },
                e('strong', null, langMode !== 'en' ? '"Install app" বা "Add to Home screen" চাপুন: ' : 'Tap "Install app" or "Add to Home screen": '),
                langMode !== 'en'
                  ? 'মেনু থেকে "Install app" বা "হোম স্ক্রিনে যোগ করুন" নির্বাচন করুন।'
                  : 'Select "Install app" or "Add to Home screen" from the menu options.'
              )
            ),
            e('div', { className: 'pwa-modal-step' },
              e('div', { className: 'pwa-step-num' }, '৩'),
              e('div', { className: 'pwa-step-text' },
                e('strong', null, langMode !== 'en' ? 'অফলাইনে কাজ করবে: ' : 'Offline Ready: '),
                langMode !== 'en'
                  ? 'ইনস্টল করার পর ইন্টারনেট ছাড়া যেকোনো সময় ভিডিও ট্রিম, কাট ও স্প্লিট করতে পারবেন।'
                  : 'Once installed, trim, cut, and split your videos anytime without an internet connection.'
              )
            )
          ),
          e('button', {
            type: 'button',
            className: 'pwa-modal-close-cta',
            onClick: function () { setShowInstallModal(false); }
          }, langMode === 'en' ? 'Got It / Close' : 'বুঝেছি / বন্ধ করুন')
        )
      );
    }

    // 8. Footer Feature Badges (Mobile-first, No Login, Zero Uploads)
    const footerNode = e('footer', { className: 'app-footer-badges' },
      e('div', { className: 'feature-pill' },
        svgIcon(ICONS.shield, 20, 20, '#0284C7'),
        e('span', null, '১০০% নিরাপদ / 100% Private')
      ),
      e('div', { className: 'feature-pill' },
        svgIcon(ICONS.cloudOff, 20, 20, '#059669'),
        e('span', null, 'নো ক্লাউড / Zero Uploads')
      ),
      e('div', { className: 'feature-pill' },
        svgIcon(ICONS.offline, 20, 20, '#0284C7'),
        e('span', null, 'অফলাইন সমর্থিত / Offline Ready')
      )
    );

    return e('div', { className: 'app-container' },
      headerNode,
      fileInputNode,
      pwaInstallBannerNode,
      pwaModalNode,
      downloadToast ? e('div', { className: 'download-toast' },
        svgIcon(ICONS.check, 20, 20, '#059669'),
        e('span', null, downloadToast)
      ) : null,
      !videoSrc ? uploadCardNode : null,
      videoSectionNode,
      modeSwitcherNode,
      timelineSectionNode,
      actionSectionNode,
      trimmedOutputNode,
      cutOutputNode,
      splitOutputNode,
      footerNode
    );
  }

  // Register PWA Service Worker
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').then(function (registration) {
          console.log('QuickCut ServiceWorker registered successfully with scope:', registration.scope);
          // Check for service worker updates safely
          registration.onupdatefound = function () {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = function () {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('New QuickCut version available. It will be used on next refresh.');
                }
              };
            }
          };
        }).catch(function (error) {
          console.warn('ServiceWorker registration error:', error);
        });
      });
    }
  }

  // Mount React App into #root
  function mountApp() {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element #root not found.');
      return;
    }
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(e(QuickCutApp));
      registerServiceWorker();
      console.log('QuickCut PWA React app mounted successfully with Trim, Split, Cut & Offline support.');
    } catch (err) {
      console.error('Error mounting QuickCut React app:', err);
      rootElement.innerHTML = '<div style="padding: 24px; text-align: center; font-family: sans-serif;">' +
        '<h1 style="color: #0284C7;">QuickCut</h1>' +
        '<p style="color: #64748B;">ভিডিও এডিটর লোড হচ্ছে... / Loading Video Editor...</p>' +
        '</div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    mountApp();
  }

})();
