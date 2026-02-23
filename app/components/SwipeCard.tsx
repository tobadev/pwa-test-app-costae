"use client";

import { useRef, useState, useCallback } from "react";

interface CardData {
  id: number;
  url: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
}

const CARDS: CardData[] = [
  { id: 1, url: "https://github.com", title: "GitHub", description: "Where the world builds software", likes: 45200, comments: 1230 },
  { id: 2, url: "https://stackoverflow.com", title: "Stack Overflow", description: "Where developers learn & share", likes: 38100, comments: 982 },
  { id: 3, url: "https://reddit.com", title: "Reddit", description: "The front page of the internet", likes: 52300, comments: 2100 },
  { id: 4, url: "https://wikipedia.org", title: "Wikipedia", description: "The free encyclopedia", likes: 61000, comments: 1540 },
  { id: 5, url: "https://dribbble.com", title: "Dribbble", description: "Discover the world's top designers", likes: 19800, comments: 567 },
  { id: 6, url: "https://codepen.io", title: "CodePen", description: "Social development environment", likes: 14300, comments: 432 },
  { id: 7, url: "https://medium.com", title: "Medium", description: "Where good ideas find you", likes: 27600, comments: 891 },
  { id: 8, url: "https://spotify.com", title: "Spotify", description: "Music for everyone", likes: 67400, comments: 3200 },
  { id: 9, url: "https://twitch.tv", title: "Twitch", description: "Live streaming platform", likes: 41200, comments: 1870 },
  { id: 10, url: "https://figma.com", title: "Figma", description: "Collaborative design tool", likes: 22100, comments: 645 },
  { id: 11, url: "https://notion.so", title: "Notion", description: "All-in-one workspace", likes: 31500, comments: 920 },
  { id: 12, url: "https://vercel.com", title: "Vercel", description: "Develop. Preview. Ship.", likes: 18700, comments: 413 },
  { id: 13, url: "https://netflix.com", title: "Netflix", description: "Watch anywhere. Cancel anytime.", likes: 72100, comments: 4100 },
  { id: 14, url: "https://producthunt.com", title: "Product Hunt", description: "The best new products in tech", likes: 15400, comments: 378 },
  { id: 15, url: "https://discord.com", title: "Discord", description: "Your place to talk and hang out", likes: 48900, comments: 2340 },
  { id: 16, url: "https://airbnb.com", title: "Airbnb", description: "Belong anywhere", likes: 35600, comments: 1120 },
  { id: 17, url: "https://behance.net", title: "Behance", description: "Creative portfolios showcase", likes: 12800, comments: 298 },
  { id: 18, url: "https://unsplash.com", title: "Unsplash", description: "Beautiful free images & pictures", likes: 29300, comments: 756 },
  { id: 19, url: "https://dev.to", title: "DEV Community", description: "Community of software developers", likes: 16200, comments: 501 },
  { id: 20, url: "https://linear.app", title: "Linear", description: "The issue tracking tool you'll enjoy using", likes: 11400, comments: 267 },
  { id: 21, url: "https://stripe.com", title: "Stripe", description: "Payments infrastructure for the internet", likes: 24800, comments: 612 },
  { id: 22, url: "https://openai.com", title: "OpenAI", description: "Creating safe artificial general intelligence", likes: 58700, comments: 3400 },
  { id: 23, url: "https://tailwindcss.com", title: "Tailwind CSS", description: "Rapidly build modern websites", likes: 20100, comments: 489 },
  { id: 24, url: "https://nextjs.org", title: "Next.js", description: "The React framework for the web", likes: 26500, comments: 710 },
  { id: 25, url: "https://youtube.com", title: "YouTube", description: "Broadcast yourself", likes: 89100, comments: 5600 },
];

function getScreenshotUrl(url: string): string {
  return `https://image.thum.io/get/width/375/crop/800/viewportWidth/375/${url}`;
}

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
  const swipeHint = dragX > 50 ? "LIKE" : dragX < -50 ? "NOPE" : null;

  return (
    <div className="swipe-feed-container">
      <div className="card-stack">
        {/* Background (next) card */}
        <div className="card-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getScreenshotUrl(nextCard.url)}
            alt={nextCard.title}
            className="card-screenshot"
            draggable={false}
          />
          <div className="card-overlay" />
          <div className="card-content-inner">
            <p className="card-site-title">{nextCard.title}</p>
          </div>
        </div>

        {/* Active card */}
        <div
          className="card-active"
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
          {/* Screenshot image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getScreenshotUrl(card.url)}
            alt={card.title}
            className="card-screenshot"
            draggable={false}
          />
          <div className="card-overlay" />

          {/* Swipe hint overlays */}
          {swipeHint === "LIKE" && (
            <div className="swipe-label swipe-like">LIKE</div>
          )}
          {swipeHint === "NOPE" && (
            <div className="swipe-label swipe-nope">NOPE</div>
          )}

          {/* Card content */}
          <div className="card-content-inner">
            <p className="card-site-title">{card.title}</p>
            <p className="card-caption">{card.description}</p>
            <p className="card-url">{card.url.replace("https://", "")}</p>
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

            <a
              className="action-btn"
              href={card.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="action-icon">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="action-count">Visit</span>
            </a>
          </div>
        </div>
      </div>

      {/* Card counter */}
      <div className="card-counter">
        {(currentIndex % CARDS.length) + 1} / {CARDS.length}
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

      <div className="swipe-hint-text">
        Swipe right to like, left to skip
      </div>
    </div>
  );
}
