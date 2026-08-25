import { useEffect } from 'react';

export const useSEO = (title, description, options = {}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    const setMetaTag = (attrName, attrVal, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLinkTag = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    if (description) {
      setMetaTag('name', 'description', description);
      setMetaTag('property', 'og:description', description);
      setMetaTag('name', 'twitter:description', description);
    }

    if (title) {
      setMetaTag('property', 'og:title', title);
      setMetaTag('name', 'twitter:title', title);
    }

    const canonicalUrl =
      options.canonical ||
      (typeof window !== 'undefined'
        ? window.location.origin + window.location.pathname
        : '');

    if (canonicalUrl) {
      setLinkTag('canonical', canonicalUrl);
      setMetaTag('property', 'og:url', canonicalUrl);
      setMetaTag('name', 'twitter:url', canonicalUrl);
    }

    const defaultImage = `${typeof window !== 'undefined' ? window.location.origin : 'https://assuredrewards.in'}/light theme incentify logo.png`;
    const image = options.image || defaultImage;
    setMetaTag('property', 'og:image', image);
    setMetaTag('name', 'twitter:image', image);

    setMetaTag('property', 'og:type', options.type || 'website');
    setMetaTag('property', 'og:site_name', 'Assured Rewards');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
  }, [title, description, options.canonical, options.image, options.type]);
};

