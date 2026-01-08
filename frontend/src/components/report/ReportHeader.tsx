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
} from '@heroicons/react/24/outline';

interface ReportHeaderProps {
  icon: string;
  title: string;
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

export default function ReportHeader({ icon, title }: ReportHeaderProps) {
  const Icon = iconMap[icon] || SparklesIcon;

  return (
    <div className="flex items-center gap-4 pb-6 border-b border-black/5">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-apple-blue to-blue-600 flex items-center justify-center shadow-lg">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-apple-text tracking-tight">{title}</h2>
    </div>
  );
}
