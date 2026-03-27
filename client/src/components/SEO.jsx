import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, schemaMarkup, slug, type = 'website' }) => {
  const siteName = 'Mimi Crunch';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  // Function to safely parse and stringify JSON-LD
  const renderSchema = () => {
    if (!schemaMarkup) return null;
    
    // Trim if it's a string
    const raw = typeof schemaMarkup === 'string' ? schemaMarkup.trim() : JSON.stringify(schemaMarkup);
    if (!raw) return null;

    try {
      // Validate JSON if string
      const parsed = typeof schemaMarkup === 'string' ? JSON.parse(raw) : schemaMarkup;
      return (
        <script type="application/ld+json">
          {JSON.stringify(parsed)}
        </script>
      );
    } catch (error) {
      console.warn('Invalid JSON-LD schema provided for SEO component:', error);
      return null;
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}

      {/* Schema Markup */}
      {renderSchema()}
    </Helmet>
  );
};

export default SEO;
