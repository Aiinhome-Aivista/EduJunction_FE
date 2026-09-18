import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import { LegalPage } from './components/LegalPage.tsx';
import { InfoPage } from './components/InfoPage.tsx';
import { BlogPage } from './components/BlogPage.tsx';
import './index.css';
import AdminLogin from './components/admin/AdminLogin.tsx';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
          <Route path="/about" element={<InfoPage type="about" />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/contact" element={<InfoPage type="contact" />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/disclaimer" element={<LegalPage type="disclaimer" />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminLogin />} />
          <Route path="/admin/users" element={<AdminLogin />} />
          <Route path="/admin/academics" element={<AdminLogin />} />
          <Route path="/admin/assessments" element={<AdminLogin />} />
          <Route path="/admin/ai-rag" element={<AdminLogin />} />
          <Route path="/admin/content" element={<AdminLogin />} />
          <Route path="/admin/gamification" element={<AdminLogin />} />
          <Route path="/admin/analytics" element={<AdminLogin />} />
          <Route path="/admin/settings" element={<AdminLogin />} />
          <Route path="/manage-blogs" element={<AdminLogin />} />
          <Route path="/add-blogs" element={<AdminLogin />} />
          <Route path="/edit-blog/:blogId" element={<AdminLogin />} />
          <Route path="/category" element={<AdminLogin />} />
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>,
);

