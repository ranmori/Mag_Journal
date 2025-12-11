import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Search,
  Shuffle,
} from "lucide-react";

export default function RetroAudioPlayer({
  initialTrack = null,
  onTrackChange = null,
  autoPlay = false,
  forceCompact = false,
  darkMode: darkModeProp = undefined,
}) {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(initialTrack);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [query, setQuery] = useState("lofi");
  const [liked, setLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef(null);
  // Determine dark mode: prefer prop if provided, otherwise use media query
  const [prefersDark, setPrefersDark] = useState(
    typeof darkModeProp === "boolean"
      ? darkModeProp
      : window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    if (typeof darkModeProp === "boolean") {
      setPrefersDark(darkModeProp);
    }
  }, [darkModeProp]);

  useEffect(() => {
    const mq =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (!mq) return;
    const handler = (e) => {
      if (typeof darkModeProp !== "boolean") {
        setPrefersDark(e.matches);
      }
    };
    mq.addEventListener
      ? mq.addEventListener("change", handler)
      : mq.addListener(handler);
    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", handler)
        : mq.removeListener(handler);
    };
  }, [darkModeProp]);

  useEffect(() => {
    fetch(
      `http://localhost:5000/api/music/search?q=${encodeURIComponent(query)}`
    )
      .then((res) => res.json())
      .then((data) => {
        const results = data.data || [];
        setTracks(results);
        if (results.length > 0 && !currentTrack) {
          const firstTrack = results[0];
          setCurrentTrack(firstTrack);
          if (onTrackChange) onTrackChange(firstTrack);
        }
      })
      .catch(console.error);
  }, [query, currentTrack, onTrackChange]);

  // Auto-play when initialTrack changes
  useEffect(() => {
    if (initialTrack && autoPlay) {
      setCurrentTrack(initialTrack);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }, 500);
    }
  }, [initialTrack, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", updateProgress);
    };
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    const i = tracks.findIndex((t) => t.id === currentTrack?.id);
    const next = tracks[(i + 1) % tracks.length];
    setCurrentTrack(next);
    if (onTrackChange) onTrackChange(next);
    setIsPlaying(false);
    setProgress(0);
  };

  const prevTrack = () => {
    const i = tracks.findIndex((t) => t.id === currentTrack?.id);
    const prev = tracks[i - 1] || tracks[tracks.length - 1];
    setCurrentTrack(prev);
    if (onTrackChange) onTrackChange(prev);
    setIsPlaying(false);
    setProgress(0);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin 3s linear infinite;
          }
        `}
      </style>

      {/* Audio element - ALWAYS rendered so music continues playing */}
      <audio ref={audioRef} src={currentTrack?.preview} onEnded={nextTrack} />

      {/* Compact mini player view */}
      {!isExpanded || forceCompact ? (
        <div
          className={`p-3 ${
            prefersDark
              ? "bg-neutral-900 text-white border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.06)]"
              : "bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Mini cassette visual */}
            <div className="flex-shrink-0">
              <div
                className={`p-2 w-16 h-16 flex items-center justify-center border-2 ${
                  prefersDark
                    ? "bg-gray-800 border-white"
                    : "bg-gray-300 border-black"
                }`}
              >
                <div className="flex gap-2">
                  <div
                    className={`w-4 h-4 border-2 rounded-full ${
                      prefersDark
                        ? "border-white bg-gray-700"
                        : "border-black bg-gray-800"
                    } ${isPlaying ? "animate-spin-slow" : ""}`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full m-auto mt-1.5 ${
                        prefersDark ? "bg-white" : "bg-white"
                      }`}
                    ></div>
                  </div>
                  <div
                    className={`w-4 h-4 border-2 rounded-full ${
                      prefersDark
                        ? "border-white bg-gray-700"
                        : "border-black bg-gray-800"
                    } ${isPlaying ? "animate-spin-slow" : ""}`}
                  >
                    <div
                      className={`w-1 h-1 rounded-full m-auto mt-1.5 ${
                        prefersDark ? "bg-white" : "bg-white"
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs truncate">
                {currentTrack?.title || "No Track"}
              </div>
              <div
                className={`${
                  prefersDark ? "text-gray-400" : "text-gray-600"
                } text-xs truncate`}
              >
                {currentTrack?.artist?.name || "Unknown"}
              </div>
            </div>

            {/* controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevTrack}
                className={`w-7 h-7 border-2 flex items-center justify-center ${
                  prefersDark
                    ? "border-white bg-gray-800 text-white hover:bg-gray-700"
                    : "border-black bg-white text-black hover:bg-gray-100"
                }`}
              >
                ◀◀
                <SkipBack size={14} className="text-current" />
              </button>

              <button
                onClick={togglePlay}
                className={`w-9 h-9 border-2 rounded-full flex items-center justify-center ${
                  prefersDark
                    ? "border-white bg-white text-black hover:bg-gray-100"
                    : "border-black bg-black text-white hover:bg-gray-700"
                }`}
              >
                {isPlaying ? "⏸" : "▶"}
              </button>

              <button
                onClick={nextTrack}
                className={`w-7 h-7 border-2 flex items-center justify-center ${
                  prefersDark
                    ? "border-white bg-gray-800 text-white hover:bg-gray-700"
                    : "border-black bg-white text-black hover:bg-gray-100"
                }`}
              >
                ▶▶
                <SkipForward size={14} className="text-current" />
              </button>
              {/* forced compact in viewer mode */}

              {!forceCompact && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className={`ml-2 text-xs ${
                    prefersDark
                      ? "hover:underline text-white"
                      : "hover:underline text-black"
                  }`}
                >
                  ▼
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Expanded full player view
        <div className={`border-4 max-w-md w-full ${
          prefersDark
            ? "bg-neutral-900 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
            : "bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        }`}>
          {/* Header */}
          <div className={`border-b-4 p-4 ${
            prefersDark
              ? "border-white bg-neutral-900 text-white"
              : "border-black bg-white text-black"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold tracking-tight">MUSIC2D</h1>
              <button
                onClick={() => setIsExpanded(false)}
                className={`p-1 ${
                  prefersDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                }`}
              >
                <div className="text-xl">▲</div>
              </button>
            </div>

            <div className={`flex items-center border-2 ${
              prefersDark ? "border-white" : "border-black"
            }`}>
              <Search size={18} className="ml-2" />
              <input
                type="text"
                placeholder="search for songs, artists..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`w-full px-2 py-2 outline-none bg-transparent font-mono text-sm ${
                  prefersDark ? "text-white placeholder-gray-400" : "text-black"
                }`}
              />
            </div>
          </div>

          {/* Cassette Tape */}
          <div className={`p-8 ${
            prefersDark
              ? "bg-gradient-to-b from-gray-800 to-gray-900"
              : "bg-gradient-to-b from-gray-100 to-gray-200"
          }`}>
            <div className={`border-4 p-6 relative ${
              prefersDark
                ? "bg-gray-800 border-white"
                : "bg-gray-300 border-black"
            }`}>
              {/* Cassette top label */}
              <div className={`border-2 p-3 mb-4 ${
                prefersDark
                  ? "bg-gray-900 border-white text-white"
                  : "bg-white border-black text-black"
              }`}>
                <div className="text-center font-mono text-xs mb-1">SIDE A</div>
                <div className={`h-8 border-2 flex items-center justify-center ${
                  prefersDark
                    ? "border-white bg-gray-800"
                    : "border-black bg-gray-50"
                }`}>
                  <div className="text-xs font-bold truncate px-2">
                    {currentTrack?.title?.toUpperCase() || "NO TRACK"}
                  </div>
                </div>
              </div>

              {/* Cassette reels */}
              <div className="flex justify-between items-center mb-4 px-4">
                <div className="relative">
                  <div
                    className={`w-16 h-16 border-4 rounded-full flex items-center justify-center ${
                      prefersDark
                        ? "border-white bg-gray-900"
                        : "border-black bg-gray-800"
                    } ${isPlaying ? "animate-spin-slow" : ""}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute w-full h-0.5 bg-white"></div>
                    <div className="absolute w-0.5 h-full bg-white"></div>
                  </div>
                </div>

                <div className="flex-1 mx-4 flex items-center justify-center">
                  <div className={`h-8 w-full border-2 ${
                    prefersDark
                      ? "bg-gray-900 border-white"
                      : "bg-gray-700 border-black"
                  }`}></div>
                </div>

                <div className="relative">
                  <div
                    className={`w-16 h-16 border-4 rounded-full flex items-center justify-center ${
                      prefersDark
                        ? "border-white bg-gray-900"
                        : "border-black bg-gray-800"
                    } ${isPlaying ? "animate-spin-slow" : ""}`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                    <div className="absolute w-full h-0.5 bg-white"></div>
                    <div className="absolute w-0.5 h-full bg-white"></div>
                  </div>
                </div>
              </div>

              {/* Cassette holes */}
              <div className="flex justify-between px-8">
                <div className={`w-4 h-4 rounded-sm ${
                  prefersDark ? "bg-gray-900" : "bg-gray-800"
                }`}></div>
                <div className={`w-4 h-4 rounded-sm ${
                  prefersDark ? "bg-gray-900" : "bg-gray-800"
                }`}></div>
              </div>
            </div>
          </div>

          {/* Track Info */}
          <div className={`border-t-4 p-6 ${
            prefersDark
              ? "border-white bg-neutral-900 text-white"
              : "border-black bg-white text-black"
          }`}>
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-1 truncate">
                {currentTrack?.title || "Loading..."}
              </h2>
              <p className={`font-mono text-sm ${
                prefersDark ? "text-gray-400" : "text-gray-600"
              }`}>
                {currentTrack?.artist?.name || "Unknown Artist"}
              </p>
            </div>

            {/* Waveform visualization */}
            <div className="flex items-center justify-between gap-1 h-12 mb-2">
              <span className="text-xs font-mono">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 flex items-end justify-center gap-0.5 h-full px-2">
                {[...Array(40)].map((_, i) => {
                  const height = Math.random() * 60 + 40;
                  const isPast = (i / 40) * 100 < progress;
                  return (
                    <div
                      key={i}
                      className={`flex-1 transition-colors ${
                        isPast
                          ? prefersDark ? "bg-white" : "bg-black"
                          : prefersDark ? "bg-gray-700" : "bg-gray-300"
                      }`}
                      style={{ height: `${height}%` }}
                    ></div>
                  );
                })}
              </div>
              <span className="text-xs font-mono">{formatTime(duration)}</span>
            </div>

            {/* Progress bar */}
            <div className={`w-full h-1 border mb-6 ${
              prefersDark
                ? "bg-gray-700 border-white"
                : "bg-gray-300 border-black"
            }`}>
              <div
                className={`h-full transition-all ${
                  prefersDark ? "bg-white" : "bg-black"
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={prevTrack}
                className={`w-10 h-10 border-2 flex items-center justify-center active:translate-y-0.5 ${
                  prefersDark
                    ? "border-white hover:bg-gray-800"
                    : "border-black hover:bg-gray-100"
                }`}
              >
                ◀◀
                <SkipBack size={20} />
              </button>

              <button
                onClick={togglePlay}
                className={`w-14 h-14 border-4 rounded-full flex items-center justify-center active:translate-y-0.5 ${
                  prefersDark
                    ? "border-white bg-white text-black hover:bg-gray-100"
                    : "border-black bg-white text-black hover:bg-gray-100"
                }`}
              >
                 {isPlaying ? "⏸" : "▶"}
              </button>

              <button
                onClick={nextTrack}
                className={`w-10 h-10 border-2 flex items-center justify-center active:translate-y-0.5 ${
                  prefersDark
                    ? "border-white hover:bg-gray-800"
                    : "border-black hover:bg-gray-100"
                }`}
              >
                ▶▶
                <SkipForward size={20} />
              </button>
            </div>

            {/* Secondary controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => setLiked(!liked)}
                className="flex items-center gap-2 hover:scale-110 transition-transform"
              >
                ♥
                <Heart size={20} fill={liked ? (prefersDark ? "white" : "black") : "none"} stroke={prefersDark ? "white" : "black"} />
                <span className="text-sm font-mono">392</span>
              </button>

              <button className="hover:scale-110 transition-transform">
                🔀
                <Shuffle size={20} stroke={prefersDark ? "white" : "black"} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}