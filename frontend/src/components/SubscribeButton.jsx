import { useState, useEffect } from 'react';
import { FiBell, FiBellOff } from 'react-icons/fi';
import { getSubscriptions, subscribe, deleteSubscription } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function SubscribeButton({ type, targetId, targetName }) {
  const { user } = useAuth();
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user || !targetId) return;
    setReady(false);
    getSubscriptions()
      .then((res) => {
        const existing = (res.data || []).find(
          (s) => s.type === type && s.targetId === targetId
        );
        setSubscriptionId(existing?.id ?? null);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [user, type, targetId]);

  const handleToggle = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      if (subscriptionId) {
        await deleteSubscription(subscriptionId);
        setSubscriptionId(null);
      } else {
        const res = await subscribe({ type, targetId, targetName });
        setSubscriptionId(res.data?.id ?? null);
      }
    } catch (err) {
      console.error('Subscribe toggle error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !ready) return null;

  const isSubscribed = Boolean(subscriptionId);
  return (
    <button
      className={`btn btn--sm subscribe-btn ${isSubscribed ? 'subscribe-btn--active' : ''}`}
      onClick={handleToggle}
      disabled={loading}
      title={isSubscribed ? 'Unsubscribe' : `Subscribe to ${targetName || type}`}
    >
      {isSubscribed ? <FiBellOff /> : <FiBell />}
      {isSubscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  );
}
