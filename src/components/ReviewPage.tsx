/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import { 
  Annotorious, 
  ImageAnnotator, 
  ImageAnnotationPopup,
  useAnnotations,
  useAnnotator,
  type ImageAnnotation 
} from '@annotorious/react';
import { Button } from '@untitledui/base/buttons/button';
import { TextAreaBase } from '@untitledui/base/textarea/textarea';
import { CheckCircle, Send01, Save01, Trash01 } from '@untitledui/icons';
import { annotationsApi } from '../api';
import '@annotorious/react/annotorious-react.css';

interface ReviewPageProps {
  imageHref: string;
  uniqueId: string;
  textContent: string;
  imageTitle: string;
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
  const annotator = useAnnotator();

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

  const onDelete = () => {
    annotator?.removeAnnotation(annotation.id);
  };

  return (
    <div className="bg-primary border-primary max-w-xs rounded-lg border p-4 shadow-lg">
      <div className="mb-3">
        <label className="text-secondary mb-1.5 block text-sm font-medium">
          Добавить ответ
        </label>
        <TextAreaBase
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Оставьте свой ответ..."
        />
      </div>
      <div className="flex gap-2">
        <Button
          color="primary"
          size="sm"
          onClick={onSave}
          className="flex-1"
          iconLeading={Save01}
        >
          Сохранить
        </Button>
        {/* ADD DELETE BUTTON */}
        <Button
          color="secondary"
          size="sm"
          onClick={onDelete}
          iconLeading={Trash01}
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

// Component to handle annotation data and submission
const AnnotationHandler: React.FC<{
  uniqueId: string;
  imageHref: string;
  textContent: string;
  imageDimensions: ImageDimensions;
}> = ({ uniqueId, imageHref, textContent, imageDimensions }) => {
  const annotations = useAnnotations();
  const annotator = useAnnotator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitAnnotations = async () => {
    setIsSubmitting(true);
    setError(null);
    
    // Transform annotations: normalize coordinates to percentages (0-1) and rename bodies to body
    // Annotorious stores coordinates relative to NATURAL image dimensions
    const naturalWidth = imageDimensions.naturalWidth || 1;
    const naturalHeight = imageDimensions.naturalHeight || 1;
    
    const transformedAnnotations = annotations.map((ann: any) => {
      const geometry = ann.target?.selector?.geometry;
      const bounds = geometry?.bounds;
      
      // Normalize bounds to percentages (0-1) based on natural image size
      const normalizedBounds = bounds ? {
        minX: bounds.minX / naturalWidth,
        minY: bounds.minY / naturalHeight,
        maxX: bounds.maxX / naturalWidth,
        maxY: bounds.maxY / naturalHeight,
      } : null;
      
      return {
        ...ann,
        // Rename 'bodies' to 'body' for backend compatibility
        body: ann.bodies || ann.body || [],
        target: {
          ...ann.target,
          selector: {
            ...ann.target?.selector,
            geometry: {
              ...geometry,
              bounds: normalizedBounds,
            }
          }
        }
      };
    });
    
    const submissionData = {
      id: uniqueId,
      image_href: imageHref,
      text_content: textContent,
      annotations: transformedAnnotations
    };

    console.log('Image dimensions:', { naturalWidth, naturalHeight });
    console.log('Submission data:', JSON.stringify(submissionData, null, 2));

    try {
      const result = await annotationsApi.submit(submissionData);
      console.log('Annotations submitted:', result);
      
      annotator?.clearAnnotations();

      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error('Failed to submit annotations:', err);
      setError('Не удалось отправить ответы. Пожалуйста, повторите попытку.');
      setTimeout(() => setError(null), 5000);
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
                Ваш(-и) ответ(-ы) успешно отправлен(-ы)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex flex-1 justify-center">
          <div className="rounded-md border border-error-300 bg-error-50 px-4 py-2">
            <p className="text-sm font-medium text-error-700">{error}</p>
          </div>
        </div>
      )}
      
      {!showSuccessMessage && !error && <div className="flex-1" />}

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
        Отправить ответы
      </Button>
    </>
  );
};

const ReviewPage: React.FC<ReviewPageProps> = ({
  imageHref,
  uniqueId,
  textContent,
  imageTitle
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({
    naturalWidth: 0,
    naturalHeight: 0,
    scaledHeight: null,
    scaledWidth: null,
  });

  useEffect(() => {
    const calculateDimensions = () => {
      const img = new Image();
      img.src = imageHref;
      
      img.onload = () => {
        const container = containerRef.current;
        if (!container) return;
        
        const containerHeight = container.clientHeight;
        const headerHeight = 80; // Approximate header height
        const padding = 32; // Top and bottom padding
        const availableHeight = containerHeight - headerHeight - padding;
        
        const containerWidth = container.clientWidth - padding;
        
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        
        let scaledHeight = availableHeight;
        let scaledWidth = scaledHeight * aspectRatio;
        
        if (scaledWidth > containerWidth) {
          scaledWidth = containerWidth;
          scaledHeight = scaledWidth / aspectRatio;
        }
        
        setImageDimensions({
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          scaledHeight,
          scaledWidth,
        });
      };
    };

    calculateDimensions();
    window.addEventListener('resize', calculateDimensions);
    
    return () => window.removeEventListener('resize', calculateDimensions);
  }, [imageHref]);

  const contentWidth = imageDimensions.scaledWidth 
    ? `${imageDimensions.scaledWidth}px` : 'auto';

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
                {imageTitle}
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
              imageDimensions={imageDimensions}
            />
          </div>

          {/* Image Section - aligned left */}
          <div className="flex-1 overflow-hidden">
            <div className="overflow-hidden">
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
