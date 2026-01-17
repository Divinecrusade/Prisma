import { BrowserRouter, Routes, Route, useParams } from 'react-router';
import { useEffect, useState } from 'react';
import ImageReviewPage from './components/ReviewPage';
import AnnotationReportPage from './components/ReportPage';
import LoginPage from './components/LoginPage';
import AdminPage from './components/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { imagesApi } from './api';
import './App.css';


// Wrapper component for the review page to access route parameters and fetch image data
const ReviewPageWrapper: React.FC = () => {
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const [imageData, setImageData] = useState<{
    url: string;
    question: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    document.getElementById('root')?.classList.add('no-center');
    return () => {
      document.getElementById('root')?.classList.remove('no-center');
    };
  }, []);

  useEffect(() => {
    const fetchImageData = async () => {
      if (!uniqueId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await imagesApi.getById(uniqueId);
        setImageData({
          url: data.url,
          question: data.question,
          name: data.name,
        });
      } catch (err) {
        console.error('Failed to fetch image data:', err);
        setError('Неудалось загрузить изображение. Пожалуйста, проверьте путь и повторите попытку');
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageData();
  }, [uniqueId]);

  if (!uniqueId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">Неверный запрос на ревью</h1>
          <p className="text-gray-600">Идентификатор изображения отсутствует или неправильный</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Загрузка изображения...</p>
        </div>
      </div>
    );
  }

  if (error || !imageData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">Error</h1>
          <p className="text-gray-600">{error || 'Image not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <ImageReviewPage 
      imageHref={imageData.url}
      uniqueId={uniqueId}
      textContent={imageData.question}
      imageTitle={imageData.name}
    />
  );
};

// Wrapper component for the report page (protected)
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
    <AuthProvider>
      <Routes>
        {/* Public route: Login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Public route: Review page (respects hidden flag on backend) */}
        <Route path="/review/:uniqueId" element={<ReviewPageWrapper />} />
        
        {/* Protected route: Admin panel */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        
        {/* Protected route: Report page */}
        <Route
          path="/report/:uniqueId"
          element={
            <ProtectedRoute>
              <ReportPageWrapper />
            </ProtectedRoute>
          }
        />
        
        {/* Default redirect to admin (will redirect to login if not authenticated) */}
        <Route path="/" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
