import React, { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  jsonLd?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title = 'EduJunction – AI-Powered Adaptive Learning & Board Model Papers',
  description = 'Prepare for CBSE, ICSE, ISC Board Exams with authentic 2027 Model Question Papers and instant AI evaluation.',
  keywords = 'EduJunction, CBSE model papers, ICSE model question papers, ISC board exams, class 10 mock test',
  ogImage = 'https://www.edujunction.co.in/og-banner.png',
  ogType = 'website',
  canonicalUrl,
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Set document title
    if (title) {
      document.title = title;
    }

    // Helper to set meta tags
    const setMetaTag = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // 2. Standard Meta Tags
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);
    }

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);

    const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (currentUrl) {
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', currentUrl);
      setMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', currentUrl);
    }

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);

    // 5. Canonical Link
    if (currentUrl) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute('href', currentUrl);
    }

    // 6. JSON-LD Structured Data
    if (jsonLd) {
      let scriptTag = document.getElementById('seo-json-ld');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'seo-json-ld';
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(jsonLd);
    }
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, jsonLd]);

  return null;
};
