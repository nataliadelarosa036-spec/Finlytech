import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTabs } from '@/components/PageTabs';
import { GoalsPage } from './GoalsPage';
import { DebtsPage } from './DebtsPage';
import { InvestmentsPage } from './InvestmentsPage';
import { SubscriptionsPage } from './SubscriptionsPage';

const TABS = [
  { id: 'goals', label: 'Metas', icon: '🎯' },
  { id: 'debts', label: 'Deudas', icon: '💳' },
  { id: 'investments', label: 'Inversiones', icon: '📈' },
  { id: 'subscriptions', label: 'Suscripciones', icon: '🔄' },
];

export function WealthPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const active = tab || 'goals';

  useEffect(() => {
    if (tab && !TABS.find(t => t.id === tab)) navigate('/wealth', { replace: true });
  }, [tab]);

  const handleTab = (id: string) => {
    navigate(id === 'goals' ? '/wealth' : `/wealth/${id}`, { replace: true });
  };

  return (
    <div className="page-enter">
      <PageTabs tabs={TABS} active={active} onChange={handleTab} />
      {active === 'goals' && <GoalsPage embedded />}
      {active === 'debts' && <DebtsPage embedded />}
      {active === 'investments' && <InvestmentsPage embedded />}
      {active === 'subscriptions' && <SubscriptionsPage embedded />}
    </div>
  );
}
