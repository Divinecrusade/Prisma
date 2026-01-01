import { BrowserRouter, Routes, Route, useParams } from 'react-router';
import ImageReviewPage from './components/ReviewPage';
import AnnotationReportPage from './components/ReportPage';
import './App.css'


// Wrapper component for the review page to access route parameters
const ReviewPageWrapper: React.FC = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  
  if (!uniqueId) {
    return <div>Error: Missing unique ID</div>;
  }

  return (
    <ImageReviewPage 
      imageHref="/Revy.jpg"
      uniqueId={uniqueId}
      textContent="Review this image and add annotations"
    />
  );
};

// Wrapper component for the standard report page to access route parameters
const ReportPageWrapper: React.FC = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  
  if (!uniqueId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Invalid Report Request</h1>
          <p className="text-gray-600">The report identifier is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return <AnnotationReportPage uniqueId={uniqueId} />;
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/review/:uniqueId" element={<ReviewPageWrapper />} />
      <Route path="/report/:uniqueId" element={<ReportPageWrapper />} />
    </Routes>
  </BrowserRouter>
);

export default App;
