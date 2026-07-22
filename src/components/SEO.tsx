/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  schema?: Record<string, any>;
}

export default function SEO({
  title,
  description,
  canonical,
  ogType = 'website',
  ogImage = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
  schema,
}: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = `${title} | ۴۰ دروازه - آموزش رویابینی شفاف`;
    document.title = fullTitle;

    // 2. Update Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Update Robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'index, follow');

    // 4. Update Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    const currentUrl = canonical || window.location.href;
    linkCanonical.setAttribute('href', currentUrl);

    // 5. Open Graph Meta Tags
    const ogTags = {
      'og:title': fullTitle,
      'og:description': description,
      'og:type': ogType,
      'og:url': currentUrl,
      'og:image': ogImage,
      'og:site_name': '۴۰ دروازه - رویابینی شفاف',
      'twitter:card': 'summary_large_image',
      'twitter:title': fullTitle,
      'twitter:description': description,
      'twitter:image': ogImage,
    };

    Object.entries(ogTags).forEach(([property, value]) => {
      let tag = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        if (property.startsWith('og:')) {
          tag.setAttribute('property', property);
        } else {
          tag.setAttribute('name', property);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', value);
    });

    // 6. Schema.org JSON-LD Injection
    let schemaScript = document.getElementById('schema-json-ld');
    if (schemaScript) {
      schemaScript.remove();
    }

    const defaultSchema = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': 'https://40gates.ir/#organization',
          'name': '۴۰ دروازه',
          'url': 'https://40gates.ir',
          'logo': ogImage,
          'description': 'مرجع تخصصی آموزش علمی و معنوی رویابینی شفاف، برون‌فکنی اثیری و خودشناسی در ایران.',
          'contactPoint': {
            '@type': 'ContactPoint',
            'telephone': '+989120000000',
            'contactType': 'customer service',
            'email': 'info@40gates.ir',
          },
        },
        schema,
      ].filter(Boolean),
    };

    schemaScript = document.createElement('script');
    schemaScript.setAttribute('id', 'schema-json-ld');
    schemaScript.setAttribute('type', 'application/ld+json');
    schemaScript.textContent = JSON.stringify(defaultSchema);
    document.head.appendChild(schemaScript);

    return () => {
      // Cleanup schemas on unmount
      const script = document.getElementById('schema-json-ld');
      if (script) script.remove();
    };
  }, [title, description, canonical, ogType, ogImage, schema]);

  return null;
}
