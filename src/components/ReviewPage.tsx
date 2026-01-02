/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Annotorious, 
  ImageAnnotator, 
  ImageAnnotationPopup,
  useAnnotations,
  type ImageAnnotation 
} from '@annotorious/react';
import { Button } from '@untitledui/base/buttons/button';
import { TextAreaBase } from '@untitledui/base/textarea/textarea';
import { CheckCircle, Send01, Save01 } from '@untitledui/icons';
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
  scaledWidth: number | null;
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
    <div className="bg-primary border-primary max-w-xs rounded-lg border p-4 shadow-lg">
      <div className="mb-3">
        <label className="text-secondary mb-1.5 block text-sm font-medium">
          Add Comment
        </label>
        <TextAreaBase
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Enter your comment..."
        />
      </div>
      <Button
        color="primary"
        size="sm"
        onClick={onSave}
        className="w-full"
        iconLeading={Save01}
      >
        Save
      </Button>
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
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="flex flex-1 justify-center">
          <div className="bg-success-primary border-success rounded-md border px-4 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-fg-success-primary size-5" />
              <p className="text-fg-success-primary text-sm font-medium">
                You sent answer successfully
              </p>
            </div>
          </div>
        </div>
      )}
      
      {!showSuccessMessage && <div className="flex-1" />}

      {/* Submit Button */}
      <Button
        color="primary"
        size="md"
        onClick={handleSubmitAnnotations}
        isDisabled={annotations.length === 0}
        isLoading={isSubmitting}
        showTextWhileLoading
        iconLeading={Send01}
      >
        Submit Annotations
      </Button>
    </>
  );
};

const ReviewPage: React.FC<ReviewPageProps> = ({
  imageHref,
  uniqueId,
  textContent
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({
    naturalWidth: 0,
    naturalHeight: 0,
    scaledHeight: null,
    scaledWidth: null,
  });

  // Calculate scaling on mount and window resize
  useEffect(() => {
    const img = new Image();
    img.src = imageHref;
    
    const calculateDimensions = () => {
      if (img.naturalWidth === 0) return;
      
      const headerHeight = 80;
      const padding = 32;
      const availableHeight = window.innerHeight - headerHeight - padding;
      const availableWidth = window.innerWidth - padding;
      
      const naturalHeight = img.naturalHeight;
      const naturalWidth = img.naturalWidth;
      const aspectRatio = naturalWidth / naturalHeight;
      
      const scaleByHeight = availableHeight;
      const widthIfScaledByHeight = scaleByHeight * aspectRatio;
      
      const scaleByWidth = availableWidth;
      const heightIfScaledByWidth = scaleByWidth / aspectRatio;
      
      let finalWidth: number;
      let finalHeight: number;
      
      if (widthIfScaledByHeight <= availableWidth) {
        finalHeight = scaleByHeight;
        finalWidth = widthIfScaledByHeight;
      } else {
        finalWidth = scaleByWidth;
        finalHeight = heightIfScaledByWidth;
      }
      
      setImageDimensions({
        naturalWidth,
        naturalHeight,
        scaledHeight: finalHeight,
        scaledWidth: finalWidth,
      });
    };

    img.onload = calculateDimensions;
    window.addEventListener('resize', calculateDimensions);
    
    if (img.complete) {
      calculateDimensions();
    }

    return () => window.removeEventListener('resize', calculateDimensions);
  }, [imageHref]);

  const contentWidth = imageDimensions.scaledWidth ? `${imageDimensions.scaledWidth}px` : 'auto';

  return (
    <div className="bg-secondary flex h-screen flex-col overflow-hidden">
      <Annotorious>
        {/* Main content wrapper - aligned left */}
        <div ref={containerRef} className="flex h-full flex-col p-4">
          {/* Header Row - centered content, width matches image */}
          <div 
            className="bg-primary mb-4 flex shrink-0 items-center rounded-lg px-6 py-4 shadow-sm"
            style={{ width: contentWidth }}
          >
            {/* Left: Title + Description */}
            <div className="shrink-0">
              <h1 className="text-primary text-xl font-semibold">
                Image Review - {uniqueId}
              </h1>
              {textContent && (
                <p className="text-tertiary mt-1 text-sm">{textContent}</p>
              )}
            </div>

            {/* Center: Success Message | Right: Submit Button */}
            <AnnotationHandler
              uniqueId={uniqueId}
              imageHref={imageHref}
              textContent={textContent}
            />
          </div>

          {/* Image Section - aligned left */}
          <div className="flex-1 overflow-hidden">
            <div className="overflow-hidden rounded-lg">
              <ImageAnnotator>
                <img
                  src={imageHref}
                  alt={`Review image ${uniqueId}`}
                  style={{
                    height: imageDimensions.scaledHeight ? `${imageDimensions.scaledHeight}px` : 'auto',
                    width: imageDimensions.scaledWidth ? `${imageDimensions.scaledWidth}px` : 'auto'
                  }}
                />
              </ImageAnnotator>
            </div>
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
