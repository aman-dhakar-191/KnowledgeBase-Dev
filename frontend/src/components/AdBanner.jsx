import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Replace these with your real AdSense values from adsense.google.com
const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXXX';
const ADSENSE_SLOT = 'XXXXXXXXXX';

const IS_CONFIGURED = !ADSENSE_CLIENT.includes('XXX') && !ADSENSE_SLOT.includes('XXX');

export default function AdBanner() {
  const { isAdmin } = useAuth();
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (isAdmin || pushed.current) return;
    try {
      if (adRef.current && adRef.current.offsetWidth > 0) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch {
      // AdSense not loaded yet (localhost / ad blocker)
    }
  }, [isAdmin]);

  // Only render when properly configured and not admin
  if (isAdmin || !IS_CONFIGURED) return null;

  return (
    <div className="ad-banner">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={ADSENSE_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
