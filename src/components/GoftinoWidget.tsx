import { useEffect } from 'react';

interface GoftinoWidgetProps {
  defaultKey?: string;
}

export default function GoftinoWidget({ defaultKey = '' }: GoftinoWidgetProps) {
  useEffect(() => {
    // Resolve Goftino Widget ID from environment or fallback
    const metaEnv = (import.meta as any).env || {};
    const widgetId = (
      process.env.GOFTINO_WIDGET_ID ||
      process.env.VITE_GOFTINO_WIDGET_ID ||
      metaEnv.VITE_GOFTINO_WIDGET_ID ||
      metaEnv.GOFTINO_WIDGET_ID ||
      metaEnv.VITE_GOFTINO_KEY ||
      localStorage.getItem('goftino_key') ||
      defaultKey ||
      ''
    ).trim();

    if (!widgetId) return;

    const scriptId = 'goftino-script-' + widgetId;

    // Check if script is already injected
    if (document.getElementById(scriptId)) {
      if ((window as any).Goftino) {
        try {
          (window as any).Goftino.Init();
        } catch (e) {
          // ignore error
        }
      }
      return;
    }

    try {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.async = true;
      script.src = `https://www.goftino.com/widget/${widgetId}`;

      script.onload = () => {
        if ((window as any).Goftino) {
          try {
            (window as any).Goftino.Init();
          } catch (e) {
            // ignore error
          }
        }
      };

      document.head.appendChild(script);
    } catch (err) {
      console.warn('Goftino script load error:', err);
    }
  }, [defaultKey]);

  // Completely invisible component - user never sees input forms or keys
  return null;
}
