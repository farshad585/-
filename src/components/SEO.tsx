/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  ogType?: string;
  canonicalUrl?: string;
}

export default function SEO({ title, description, ogType = 'website', canonicalUrl }: SEOProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | آکادمی ۴۰ دروازه`;
    }
    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}
