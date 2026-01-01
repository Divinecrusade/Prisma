import { BrowserRouter, Routes, Route, useParams } from 'react-router';
import ImageReviewPage from './components/ImageReviewPage';
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


const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/review/:uniqueId" element={<ReviewPageWrapper />} />
    </Routes>
  </BrowserRouter>
);

export default App;
