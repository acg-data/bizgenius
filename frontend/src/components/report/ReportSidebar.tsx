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
} from '@heroicons/react/24/outline';
import { ReportSectionConfig } from '../../types/report';

interface ReportSidebarProps {
  sections: ReportSectionConfig[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
  ideaTitle: string;
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
  ideaTitle,
  generatedAt,
  onDownload,
  onBack,
}: ReportSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 glass-sidebar flex flex-col z-20">
      {/* Header */}
      <div className="p-6 border-b border-black/5">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-apple-gray hover:text-apple-text mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back to Idea</span>
          </button>
        )}
        <h1 className="text-lg font-semibold text-apple-text truncate">{ideaTitle}</h1>
        <p className="text-xs text-apple-gray mt-1">Generated {generatedAt}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {sections.map((section) => {
          const Icon = iconMap[section.icon];
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-apple-blue/10 text-apple-blue border-r-2 border-apple-blue'
                  : 'text-apple-gray hover:text-apple-text hover:bg-black/5'
              }`}
            >
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              <span className="text-sm font-medium truncate">{section.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Download button */}
      <div className="p-6 border-t border-black/5">
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
