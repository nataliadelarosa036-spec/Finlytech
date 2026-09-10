import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTabs } from '@/components/PageTabs';
import { MovementsPage } from './MovementsPage';
import { PlanPage } from './PlanPage';
import { CardsPage } from './CardsPage';

const TABS = [
  { id: 'movements', label: 'Movimientos', icon: '↕️' },
  { id: 'plan', label: 'Plan', icon: '📊' },
  { id: 'cards', label: 'Tarjetas', icon: '💳' },
];

export function MoneyPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const active = tab || 'movements';

  // Redirige a tab válido
  useEffect(() => {
    if (tab && !TABS.find(t => t.id === tab)) navigate('/money', { replace: true });
  }, [tab]);

  const handleTab = (id: string) => {
    navigate(id === 'movements' ? '/money' : `/money/${id}`, { replace: true });
  };

  return (
    <div className="page-enter">
      <PageTabs tabs={TABS} active={active} onChange={handleTab} />
      {active === 'movements' && <MovementsPage embedded />}
      {active === 'plan' && <PlanPage embedded />}
      {active === 'cards' && <CardsPage embedded />}
    </div>
  );
}
