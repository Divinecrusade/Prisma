/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Annotorious, 
  ImageAnnotator, 
  ImageAnnotationPopup,
  useAnnotations,
  type ImageAnnotation 
} from '@annotorious/react';
import '@annotorious/react/annotorious-react.css';

interface ReviewPageProps {
  imageHref: string;
  uniqueId: string;
  textContent: string;
}

interface AnnotationData {
  id: string;
  imageHref: string;
  textContent: string;
  annotations: ImageAnnotation[];
}

interface ImageDimensions {
  naturalWidth: number;
  naturalHeight: number;
  scaledHeight: number | null;
  allowOverflow: boolean;
}

// Custom popup component for text input
const CommentPopup = ({ annotation, onCreateBody, onUpdateBody }: any) => {
  const [comment, setComment] = useState('');

  React.useEffect(() => {
    const commentBody = annotation.bodies.find((body: any) => body.purpose === 'commenting');
    setComment(commentBody ? commentBody.value : '');
  }, [annotation.bodies]);

  const onSave = () => {
    const updated = {
      purpose: 'commenting',
      value: comment
    };

    const commentBody = annotation.bodies.find((body: any) => body.purpose === 'commenting');
    if (commentBody) {
      onUpdateBody(commentBody, updated);
    } else {
      onCreateBody(updated);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border max-w-xs" style={{ color: '#000' }}>
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Enter your comment..."
        />
      </div>
      <button
        onClick={onSave}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Save
      </button>
    </div>
  );
};

// Component to handle annotation data and submission
const AnnotationHandler: React.FC<{
  uniqueId: string;
  imageHref: string;
  textContent: string;
}> = ({ uniqueId, imageHref, textContent }) => {
  const annotations = useAnnotations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmitAnnotations = async () => {
    setIsSubmitting(true);
    
    const submissionData: AnnotationData = {
      id: uniqueId,
      imageHref,
      textContent,
      annotations
    };

    try {
      console.log('Sending annotations to server:', JSON.stringify(submissionData, null, 2));
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Failed to submit annotations:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Success Message - positioned in center of header */}
      <div className="flex-1 flex justify-center">
        {showSuccessMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md px-4 py-2">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-green-800">
                You sent answer successfully
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button - positioned on right of header */}
      <button
        onClick={handleSubmitAnnotations}
        disabled={isSubmitting || annotations.length === 0}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white ${
          isSubmitting || annotations.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
        }`}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Annotations'
        )}
      </button>
    </>
  );
};

const ReviewPage: React.FC<ReviewPageProps> = ({
  imageHref,
  uniqueId,
  textContent
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({
    naturalWidth: 0,
    naturalHeight: 0,
    scaledHeight: null,
    allowOverflow: false
  });

  // Calculate scaling on mount and window resize
  useEffect(() => {
    const img = new Image();
    img.src = imageHref;
    
    const calculateDimensions = () => {
      if (img.naturalWidth === 0) return;
      
      const headerHeight = headerRef.current?.offsetHeight || 80;
      const padding = 32; // 16px top + 16px bottom (p-4)
      const availableHeight = window.innerHeight - headerHeight - padding;
      
      const naturalHeight = img.naturalHeight;
      
      // If viewport height <= 3/4 of image height, allow overflow (no scaling)
      if (availableHeight <= (3 / 4) * naturalHeight) {
        setImageDimensions({
          naturalWidth: img.naturalWidth,
          naturalHeight: naturalHeight,
          scaledHeight: null,
          allowOverflow: true
        });
      } else {
        // Scale image to fit available height
        setImageDimensions({
          naturalWidth: img.naturalWidth,
          naturalHeight: naturalHeight,
          scaledHeight: availableHeight,
          allowOverflow: false
        });
      }
    };

    img.onload = calculateDimensions;
    
    // Recalculate on resize
    window.addEventListener('resize', calculateDimensions);
    
    // If image is cached, calculate immediately
    if (img.complete) {
      calculateDimensions();
    }

    return () => window.removeEventListener('resize', calculateDimensions);
  }, [imageHref]);

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${imageDimensions.allowOverflow ? '' : 'h-screen overflow-hidden'}`}>
      <Annotorious>
        {/* Header Row */}
        <div ref={headerRef} className="px-6 py-4 bg-white flex items-center flex-shrink-0">
          {/* Left: Title + Description */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-semibold text-gray-900">
              Image Review - {uniqueId}
            </h1>
            {textContent && (
              <p className="mt-1 text-gray-600">{textContent}</p>
            )}
          </div>

          {/* Center: Success Message | Right: Submit Button */}
          <AnnotationHandler
            uniqueId={uniqueId}
            imageHref={imageHref}
            textContent={textContent}
          />
        </div>

        {/* Image Section */}
        <div className={`flex-1 flex items-center justify-center p-4 ${imageDimensions.allowOverflow ? '' : 'overflow-hidden'}`}>
          <div className="rounded-lg overflow-hidden">
            <ImageAnnotator>
              <img
                src={imageHref}
                alt={`Review image ${uniqueId}`}
                style={{
                  height: imageDimensions.scaledHeight ? `${imageDimensions.scaledHeight}px` : 'auto',
                  width: 'auto',
                  maxWidth: '100%'
                }}
              />
            </ImageAnnotator>
          </div>
        </div>

        <ImageAnnotationPopup
          popup={(props) => <CommentPopup {...props} />}
        />
      </Annotorious>
    </div>
  );
};

export default ReviewPage;
