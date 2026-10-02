import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/Site';
import Home from './pages/Home';
import { Darshan, AartiPage, NavratriPage, MandalPage, Sadasya, Vargani, Photos, Videos, Suchana, Karyakram, Sampark, NotFound } from './pages/Pages';
import './styles/app.css';

const Admin = lazy(() => import('./admin/Admin'));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="darshan" element={<Darshan />} />
          <Route path="aarti" element={<AartiPage />} />
          <Route path="navratri" element={<NavratriPage />} />
          <Route path="mandal" element={<MandalPage />} />
          <Route path="sadasya" element={<Sadasya />} />
          <Route path="vargani" element={<Vargani />} />
          <Route path="photos" element={<Photos />} />
          <Route path="videos" element={<Videos />} />
          <Route path="suchana" element={<Suchana />} />
          <Route path="karyakram" element={<Karyakram />} />
          <Route path="sampark" element={<Sampark />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/admin/*" element={<Suspense fallback={<div className="empty">लोड होत आहे...</div>}><Admin /></Suspense>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
