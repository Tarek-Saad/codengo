"use client";

import { useState } from "react";
import { DocumentLoadEvent, PageChangeEvent, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { Button } from "@/components/ui/button";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';
import { Worker } from '@react-pdf-viewer/core';

interface PdfChallengeProps {
  pdfUrl: string;
  onComplete: () => void;
}

export const PdfChallenge = ({ pdfUrl, onComplete }: PdfChallengeProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Initialize plugins
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Format the PDF URL correctly
  const formattedPdfUrl = pdfUrl.startsWith("http") 
    ? pdfUrl 
    : `${window.location.origin}${pdfUrl.startsWith("/") ? pdfUrl : `/${pdfUrl}`}`;

  console.log('Original PDF URL:', pdfUrl);
  console.log('Formatted PDF URL:', formattedPdfUrl);

  const handlePageChange = (e: PageChangeEvent) => {
    setCurrentPage(e.currentPage);
  };

  const handleDocumentLoad = (e: DocumentLoadEvent) => {
    setNumPages(e.doc.numPages);
    setError(null);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <div className="w-full h-[600px] mb-4 relative">
        {error ? (
          <div className="p-4 text-center text-red-500">
            {error}
          </div>
        ) : (
          <Viewer
            fileUrl={formattedPdfUrl}
            plugins={[
              pageNavigationPluginInstance,
              defaultLayoutPluginInstance,
            ]}
            onPageChange={handlePageChange}
            onDocumentLoad={handleDocumentLoad}
            renderError={(error: Error) => {
              console.error('PDF Error:', error);
              return (
                <div className="text-red-500">
                  Error loading PDF: {error.message || 'Please try again later.'}
                </div>
              );
            }}
          />
        )}
      </div>
      </Worker>
      <div className="w-full flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {numPages}
        </div>
        {currentPage === numPages - 1 && (
          <Button
            onClick={onComplete}
            variant="primary"
            size="lg"
          >
            Complete Challenge
          </Button>
        )}
      </div>
    </div>
  );
};
