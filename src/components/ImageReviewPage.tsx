/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
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
    <div className="mt-6">
      {/* Annotations Summary */}
      {annotations.length > 0 && (
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-900 mb-2">
            Current Annotations ({annotations.length})
          </h3>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-gray-600">
              You have created {annotations.length} annotation{annotations.length !== 1 ? 's' : ''} on this image.
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    You sent answer successfully
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleSubmitAnnotations}
          disabled={isSubmitting || annotations.length === 0}
          className={`ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
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
      </div>
    </div>
  );
};

const ImageReviewPage: React.FC<ReviewPageProps> = ({
  imageHref,
  uniqueId,
  textContent
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900">
              Image Review - {uniqueId}
            </h1>
            {textContent && (
              <p className="mt-2 text-gray-600">{textContent}</p>
            )}
          </div>

          {/* Image Annotation Section */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Annotate the Image
              </h2>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <Annotorious>
                  <ImageAnnotator>
                    <img
                      src={imageHref}
                      alt={`Review image ${uniqueId}`}
                      className="max-w-full h-auto"
                      style={{ maxHeight: '600px' }}
                    />
                  </ImageAnnotator>
                  <ImageAnnotationPopup
                    popup={(props) => <CommentPopup {...props} />}
                  />
                  <AnnotationHandler
                    uniqueId={uniqueId}
                    imageHref={imageHref}
                    textContent={textContent}
                  />
                </Annotorious>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageReviewPage;