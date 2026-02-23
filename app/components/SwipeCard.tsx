"use client";

import { useRef, useState, useCallback } from "react";

interface CardData {
  id: number;
  username: string;
  caption: string;
  gradient: string;
  avatar: string;
  likes: number;
  comments: number;
}

const CARDS: CardData[] = [
  {
    id: 1,
    username: "alex_creative",
    caption: "Just vibing with this sunset view! The colors are unreal today.",
    gradient: "from-pink-500 via-red-500 to-yellow-500",
    avatar: "AC",
    likes: 12400,
    comments: 342,
  },
  {
    id: 2,
    username: "travel_junkie",
    caption: "Lost in Tokyo streets. Every corner is a new adventure.",
    gradient: "from-cyan-500 via-blue-500 to-purple-500",
    avatar: "TJ",
    likes: 8700,
    comments: 198,
  },
  {
    id: 3,
    username: "foodie_life",
    caption: "This ramen changed my life. No cap. 10/10 would slurp again.",
    gradient: "from-orange-400 via-red-500 to-pink-500",
    avatar: "FL",
    likes: 23100,
    comments: 891,
  },
  {
    id: 4,
    username: "code_wizard",
    caption: "Shipped a new feature at 3am. Coffee is my co-pilot.",
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    avatar: "CW",
    likes: 5600,
    comments: 127,
  },
  {
    id: 5,
    username: "fitness_queen",
    caption: "New PR today! Consistency beats motivation every single time.",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    avatar: "FQ",
    likes: 18300,
    comments: 567,
  },
  {
    id: 6,
    username: "music_vibes",
    caption: "Dropped a new beat. Headphones on, world off.",
    gradient: "from-amber-500 via-orange-600 to-red-600",
    avatar: "MV",
    likes: 31200,
    comments: 1043,
  },
  {
    id: 7,
    username: "nature_lover",
    caption: "Found this hidden waterfall on a random hike. Nature wins again.",
    gradient: "from-teal-400 via-cyan-500 to-blue-600",
    avatar: "NL",
    likes: 9800,
    comments: 234,
  },
  {
    id: 8,
    username: "art_studio",
    caption: "Painting emotions you can't put into words. New piece coming soon.",
    gradient: "from-rose-400 via-pink-500 to-purple-600",
    avatar: "AS",
    likes: 15600,
    comments: 412,
  },
];

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

export default function SwipeFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null);
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const startX = useRef(0);
  const startY = useRef(0);
  const isHorizontal = useRef<boolean | null>(null);

  const card = CARDS[currentIndex % CARDS.length];
  const nextCard = CARDS[(currentIndex + 1) % CARDS.length];

  const handleStart = useCallback((clientX: number, clientY: number) => {
    startX.current = clientX;
    startY.current = clientY;
    isHorizontal.current = null;
    setIsDragging(true);
    setDragX(0);
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const dx = clientX - startX.current;
      const dy = clientY - startY.current;

      // Lock direction after 10px of movement
      if (isHorizontal.current === null && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
        isHorizontal.current = Math.abs(dx) > Math.abs(dy);
      }

      if (isHorizontal.current) {
        setDragX(dx);
      }
    },
    [isDragging]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;

    if (Math.abs(dragX) > threshold) {
      const direction = dragX > 0 ? "right" : "left";
      setExitDirection(direction);

      if (direction === "right") {
        setLiked((prev) => new Set(prev).add(card.id));
      }

      setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setExitDirection(null);
        setDragX(0);
      }, 300);
    } else {
      setDragX(0);
    }
  }, [isDragging, dragX, card.id]);

  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
    if (isHorizontal.current) e.preventDefault();
  };
  const onTouchEnd = () => handleEnd();

  const onMouseDown = (e: React.MouseEvent) => {
    handleStart(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Calculate card transform
  let cardTransform = "";
  let cardOpacity = 1;

  if (exitDirection === "left") {
    cardTransform = "translateX(-120%) rotate(-20deg)";
    cardOpacity = 0;
  } else if (exitDirection === "right") {
    cardTransform = "translateX(120%) rotate(20deg)";
    cardOpacity = 0;
  } else {
    const rotation = dragX * 0.08;
    cardTransform = `translateX(${dragX}px) rotate(${rotation}deg)`;
  }

  const isLiked = liked.has(card.id);
  const swipeHint =
    dragX > 50 ? "LIKE" : dragX < -50 ? "NOPE" : null;

  return (
    <div className="swipe-feed-container">
      {/* Background / next card preview */}
      <div className="card-stack">
        <div className={`card-bg bg-gradient-to-br ${nextCard.gradient}`}>
          <div className="card-content-inner">
            <div className="card-avatar">{nextCard.avatar}</div>
            <p className="card-username">@{nextCard.username}</p>
          </div>
        </div>

        {/* Active card */}
        <div
          className={`card-active bg-gradient-to-br ${card.gradient}`}
          style={{
            transform: cardTransform,
            opacity: cardOpacity,
            transition: isDragging ? "none" : "transform 0.3s ease, opacity 0.3s ease",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {/* Swipe hint overlays */}
          {swipeHint === "LIKE" && (
            <div className="swipe-label swipe-like">LIKE</div>
          )}
          {swipeHint === "NOPE" && (
            <div className="swipe-label swipe-nope">NOPE</div>
          )}

          {/* Card content */}
          <div className="card-content-inner">
            <div className="card-avatar-large">{card.avatar}</div>
            <p className="card-username-large">@{card.username}</p>
            <p className="card-caption">{card.caption}</p>
          </div>

          {/* Side action bar */}
          <div className="card-actions">
            <button
              className={`action-btn ${isLiked ? "liked" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setLiked((prev) => {
                  const s = new Set(prev);
                  if (s.has(card.id)) s.delete(card.id);
                  else s.add(card.id);
                  return s;
                });
              }}
            >
              <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="action-icon">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span className="action-count">{formatCount(card.likes + (isLiked ? 1 : 0))}</span>
            </button>

            <button className="action-btn" onClick={(e) => e.stopPropagation()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="action-count">{formatCount(card.comments)}</span>
            </button>

            <button className="action-btn" onClick={(e) => e.stopPropagation()}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-icon">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
              <span className="action-count">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        <button className="nav-btn nav-active">
          <svg viewBox="0 0 24 24" fill="currentColor" className="nav-icon">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
          <span>Home</span>
        </button>
        <button className="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Discover</span>
        </button>
        <button className="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>Likes</span>
        </button>
        <button className="nav-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </button>
      </nav>

      {/* Swipe instruction */}
      <div className="swipe-hint-text">
        Swipe right to like, left to skip
      </div>
    </div>
  );
}
