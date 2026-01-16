interface ReportHeaderProps {
interface ReportHeaderProps {
  title: string;
}

export default function ReportHeader({ title }: ReportHeaderProps) {
  return (
    <div className="monitor-header">
      <div>
        <h1>{title}</h1>
        <p>AI-generated insights tailored to your business plan.</p>
      </div>
      <div className="monitor-badge">
        <span className="monitor-badge-dot" />
        Live Report
      </div>
    </div>
  );
}
