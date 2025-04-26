"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface WebViewProps {
  content: string;
  onComplete: () => void;
}

const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

export const WebView = ({ content, onComplete }: WebViewProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-enable continue button after 10 seconds for external content
    if (isValidUrl(content)) {
      const timer = setTimeout(() => {
        setHasRead(true);
        setIsLoading(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [content]);

  // Function to handle scroll events for text content
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isValidUrl(content)) {
      const element = e.currentTarget;
      const isAtBottom = Math.abs(
        element.scrollHeight - element.scrollTop - element.clientHeight
      ) < 50; // Within 50px of bottom

      if (isAtBottom && !hasRead) {
        setHasRead(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {isValidUrl(content) ? (
        <div className="flex-1 relative w-full h-full min-h-[500px]">
          <iframe
            src={content}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div 
          className="flex-1 overflow-y-auto p-6 prose prose-emerald max-w-none"
          onScroll={handleScroll}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
      <div className="p-4 border-t flex justify-end">
        <Button
          onClick={onComplete}
          disabled={!hasRead}
          size="lg"
          variant={hasRead ? "default" : "secondary"}
        >
          {hasRead ? "Continue" : "Please read to continue"}
        </Button>
      </div>
    </div>
  );
};
