import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageTabs } from '@/components/PageTabs';
import { CopilotPage } from './CopilotPage';
import { HealthPage } from './HealthPage';
import { NetWorthPage } from './NetWorthPage';
import { SimulatorPage } from './SimulatorPage';
import { AffordabilityPage } from './AffordabilityPage';
import { ExportPage } from './ExportPage';

const TABS = [
  { id: 'copilot', label: 'Copiloto', icon: '✨' },
  { id: 'health', label: 'Salud', icon: '❤️' },
  { id: 'net-worth', label: 'Patrimonio', icon: '📊' },
  { id: 'simulator', label: 'Simulador', icon: '🧪' },
  { id: 'affordability', label: '¿Puedo?', icon: '🤔' },
  { id: 'export', label: 'Exportar', icon: '📥' },
];

export function InsightsPage() {
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();
  const active = tab || 'copilot';

  useEffect(() => {
    if (tab && !TABS.find(t => t.id === tab)) navigate('/insights', { replace: true });
  }, [tab]);

  const handleTab = (id: string) => {
    navigate(id === 'copilot' ? '/insights' : `/insights/${id}`, { replace: true });
  };

  return (
    <div className="page-enter">
      {/* Tabs con scroll horizontal en mobile */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-max sm:min-w-0">
          <PageTabs tabs={TABS} active={active} onChange={handleTab} />
        </div>
      </div>
      {active === 'copilot' && <CopilotPage embedded />}
      {active === 'health' && <HealthPage embedded />}
      {active === 'net-worth' && <NetWorthPage embedded />}
      {active === 'simulator' && <SimulatorPage embedded />}
      {active === 'affordability' && <AffordabilityPage embedded />}
      {active === 'export' && <ExportPage embedded />}
    </div>
  );
}
