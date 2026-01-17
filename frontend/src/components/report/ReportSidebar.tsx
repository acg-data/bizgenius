import {
  SparklesIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ViewfinderCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  MegaphoneIcon,
  ArrowTrendingUpIcon,
  ShieldExclamationIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { ReportSectionConfig } from '../../types/report';

interface ReportSidebarProps {
  sections: ReportSectionConfig[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;

  generatedAt: string;
  onDownload: () => void;
  onBack?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  SparklesIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ViewfinderCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  MegaphoneIcon,
  ArrowTrendingUpIcon,
  ShieldExclamationIcon,
  PresentationChartBarIcon,
  UserGroupIcon,
};

export default function ReportSidebar({
  sections,
  activeSection,
  onSectionChange,

  generatedAt,
  onDownload,
  onBack,
}: ReportSidebarProps) {
  return (
    <aside className="monitor-sidebar">
      <div className="monitor-dots">
        <span className="monitor-dot red" />
        <span className="monitor-dot yellow" />
        <span className="monitor-dot green" />
      </div>

      <div className="monitor-company">
        <div className="monitor-avatar">B</div>
        <div className="monitor-info">
          <span className="text-sm font-medium text-apple-text truncate">BizGenius Report</span>
          <span className="text-xs text-apple-gray">Generated {generatedAt}</span>
        </div>
        <ChevronDownIcon className="w-4 h-4 text-apple-gray ml-auto" />
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-apple-gray hover:text-apple-text px-6 mb-3 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span className="text-sm">Back to Idea</span>
        </button>
      )}

      <nav className="monitor-nav flex-1 overflow-y-auto no-scrollbar">
        {sections.map((section) => {
          const Icon = iconMap[section.icon];
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`monitor-nav-item w-full text-left ${isActive ? 'active' : ''}`}
            >
              {Icon && <Icon className="w-5 h-5" />}
              <span className="truncate">{section.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-200">
        <button
          onClick={onDownload}
          className="w-full flex items-center justify-center gap-2 bg-apple-text text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Download PDF
        </button>
      </div>
    </aside>
  );
}
