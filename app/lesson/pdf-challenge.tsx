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
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen } from 'lucide-react';

interface PdfChallengeProps {
  pdfUrl: string;
  onComplete: () => void;
}

export const PdfChallenge = ({ pdfUrl, onComplete }: PdfChallengeProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center w-full max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-xl"
    >
      <div className="w-full mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">PDF Challenge</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-48 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              style={{
                width: `${(currentPage + 1) / numPages * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {Math.round((currentPage + 1) / numPages * 100)}%
          </span>
        </div>
      </div>

      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <motion.div 
          className="w-full h-[700px] mb-6 relative rounded-lg overflow-hidden border border-gray-200 shadow-sm"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}
          {error ? (
            <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">
              <p className="font-medium">Error loading PDF</p>
              <p className="text-sm mt-1">{error}</p>
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
                  <div className="p-6 text-center text-red-500 bg-red-50 rounded-lg">
                    <p className="font-medium">Error loading PDF</p>
                    <p className="text-sm mt-1">{error.message || 'Please try again later.'}</p>
                  </div>
                );
              }}
            />
          )}
        </motion.div>
      </Worker>

      <div className="w-full flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={() => handlePageChange({ currentPage: currentPage - 1 } as PageChangeEvent)}
            disabled={currentPage === 0}
            className="flex items-center gap-1 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <div className="text-sm font-medium text-gray-700">
            Page {currentPage + 1} of {numPages}
          </div>
          <Button
            variant="secondaryOutline"
            size="sm"
            onClick={() => handlePageChange({ currentPage: currentPage + 1 } as PageChangeEvent)}
            disabled={currentPage === numPages - 1}
            className="flex items-center gap-1 transition-all"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {currentPage === numPages - 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              onClick={onComplete}
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 transition-all"
            >
              <CheckCircle className="w-5 h-5" />
              Complete Challenge
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
