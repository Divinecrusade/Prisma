import '../styles/globals.css'
import React, { useState, useRef, useEffect } from 'react';

interface AnnotationData {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  timestamp: string;
}

interface ReportData {
  uniqueId: string;
  imageHref: string;
  textContent: string;
  annotations: AnnotationData[];
  submittedAt: string;
}

interface AnnotationReportProps {
  uniqueId: string;
}

const AnnotationReportPage: React.FC<AnnotationReportProps> = ({ uniqueId }) => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [, setImageDimensions] = useState({ width: 0, height: 0 });
  const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mockData: ReportData = {
      uniqueId: uniqueId,
      imageHref: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop",
      textContent: "Review the architectural plans and identify structural concerns or compliance issues that require attention.",
      annotations: [
        {
          id: "ann-1",
          left: 50,
          top: 30,
          width: 120,
          height: 80,
          text: "Foundation reinforcement does not meet current building code standards for this soil type",
          timestamp: "2025-01-15T10:30:00Z"
        },
        {
          id: "ann-2", 
          left: 200,
          top: 120,
          width: 100,
          height: 60,
          text: "HVAC ductwork placement creates conflict with electrical conduit routing",
          timestamp: "2025-01-15T10:32:00Z"
        },
        {
          id: "ann-3",
          left: 350,
          top: 80,
          width: 140,
          height: 90,
          text: "Emergency egress pathway width falls below minimum code requirements",
          timestamp: "2025-01-15T10:35:00Z"
        },
        {
          id: "ann-4",
          left: 80,
          top: 220,
          width: 110,
          height: 70,
          text: "Load-bearing beam placement requires structural engineering verification",
          timestamp: "2025-01-15T10:38:00Z"
        }
      ],
      submittedAt: "2025-01-15T10:45:00Z"
    };

    setTimeout(() => {
      setReportData(mockData);
    }, 300);
  }, [uniqueId]);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const img = imageRef.current;
      const displayedWidth = img.clientWidth;
      const displayedHeight = img.clientHeight;
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      setImageDimensions({ width: displayedWidth, height: displayedHeight });
      setScaleFactor({
        x: displayedWidth / naturalWidth,
        y: displayedHeight / naturalHeight
      });
      setImageLoaded(true);
    }
  };

  const handleAnnotationInteraction = (annotationId: string | null) => {
    setSelectedAnnotation(annotationId);
  };

  const getAnnotationStyle = (annotationId: string) => {
    const isHighlighted = selectedAnnotation === annotationId;
    return {
      backgroundColor: isHighlighted ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.3)',
      borderColor: isHighlighted ? '#3b82f6' : '#ef4444'
    };
  };

  const getScaledAnnotation = (annotation: AnnotationData) => {
    return {
      left: annotation.left * scaleFactor.x,
      top: annotation.top * scaleFactor.y,
      width: annotation.width * scaleFactor.x,
      height: annotation.height * scaleFactor.y
    };
  };

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Annotation Report - {reportData.uniqueId}
              </h1>
              <p className="mt-2 text-gray-600">{reportData.textContent}</p>
              <div className="mt-4 flex space-x-6 text-sm text-gray-500">
                <span>Submitted: {new Date(reportData.submittedAt).toLocaleString()}</span>
                <span>Total Annotations: {reportData.annotations.length}</span>
              </div>
            </div>
          </div>

          <div className="full py-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Annotated Image
                </h2>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <div className="relative inline-block w-full">
                    <img
                      ref={imageRef}
                      src={reportData.imageHref}
                      alt={`Report image ${reportData.uniqueId}`}
                      className="w-full h-auto block"
                      onLoad={handleImageLoad}
                    />
                    
                    {imageLoaded && reportData.annotations.map((annotation, index) => {
                      const style = getAnnotationStyle(annotation.id);
                      const scaledAnnotation = getScaledAnnotation(annotation);
                      
                      return (
                        <div
                          key={annotation.id}
                          className="absolute cursor-pointer transition-all duration-200"
                          style={{
                            left: `${scaledAnnotation.left}px`,
                            top: `${scaledAnnotation.top}px`,
                            width: `${scaledAnnotation.width}px`,
                            height: `${scaledAnnotation.height}px`,
                            backgroundColor: style.backgroundColor,
                            border: `2px solid ${style.borderColor}`,
                            boxSizing: 'border-box'
                          }}
                          onMouseEnter={() => handleAnnotationInteraction(annotation.id)}
                          onMouseLeave={() => handleAnnotationInteraction(null)}
                        >
                          <div 
                            className="absolute -top-3 -left-3 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center z-10"
                            style={{ backgroundColor: style.borderColor }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-1">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Annotation Details
                </h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {reportData.annotations.map((annotation, index) => (
                    <div
                      key={annotation.id}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        selectedAnnotation === annotation.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      onMouseEnter={() => handleAnnotationInteraction(annotation.id)}
                      onMouseLeave={() => handleAnnotationInteraction(null)}
                    >
                      <div className="flex items-start space-x-3">
                        <div 
                          className={`shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                            selectedAnnotation === annotation.id ? 'bg-blue-500' : 'bg-red-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-2">
                            {annotation.text}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>Position: ({annotation.left}, {annotation.top})</div>
                            <div>Dimensions: {annotation.width} × {annotation.height}</div>
                            <div>Created: {new Date(annotation.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {reportData.annotations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No annotations available for this report.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Report Reference: {reportData.uniqueId}</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationReportPage;