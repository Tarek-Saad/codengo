"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import type { PageChangeEvent } from '@react-pdf-viewer/core';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFProps {
  content: string;
  onComplete: () => void;
}

export const PDFChallenge = ({ content, onComplete }: PDFProps) => {
  const [pdfRead, setPdfRead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create the plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();





  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-6 bg-slate-50">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">PDF Lesson</h2>
            <p className="text-sm text-muted-foreground">
              Read through the PDF to continue with your lesson
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <div
              className={cn(
                "flex items-center gap-x-2 px-3 py-1 rounded-full text-sm",
                pdfRead
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-700"
              )}
            >
              {pdfRead ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>In Progress</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full h-[600px] rounded-xl overflow-hidden bg-white shadow-lg ring-1 ring-black/10">
            {error ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                <div className="text-sm text-red-500">{error}</div>
              </div>
            ) : (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer
                  fileUrl={content}
                  defaultScale={SpecialZoomLevel.PageFit}
                  onDocumentLoad={() => {
                    setError(null);
                  }}
                  onPageChange={(e: PageChangeEvent) => {
                    if (e.currentPage === e.doc.numPages - 1) {
                      setPdfRead(true);
                    }
                  }}
                  plugins={[defaultLayoutPluginInstance]}
                />
              </Worker>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={onComplete}
            disabled={!pdfRead}
            size="lg"
            variant={pdfRead ? "primary" : "default"}
            className={cn(
              "min-w-[200px] transition-all duration-200",
              pdfRead && "animate-pulse"
            )}
          >
            {pdfRead ? "Continue" : "Read to Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};
