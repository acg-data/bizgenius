import { useState, useRef } from 'react';
import { ReportData, REPORT_SECTIONS } from '../../types/report';
import ReportSidebar from './ReportSidebar';
import ReportHeader from './ReportHeader';
import ExecutiveSummary from './sections/ExecutiveSummary';
import MarketResearch from './sections/MarketResearch';
import CustomerProfiles from './sections/CustomerProfiles';
import CompetitorLandscape from './sections/CompetitorLandscape';
import BusinessPlan from './sections/BusinessPlan';
import NinetyDayPlan from './sections/NinetyDayPlan';
import GoToMarket from './sections/GoToMarket';
import FinancialModel from './sections/FinancialModel';
import RiskAssessment from './sections/RiskAssessment';
import PitchDeck from './sections/PitchDeck';
import TeamOps from './sections/TeamOps';
import BrandArchetype from './sections/BrandArchetype';
import BrandBook from './sections/BrandBook';
import GapAnalysis from './sections/GapAnalysis';
import LegalCompliance from './sections/LegalCompliance';

interface BusinessReportProps {
  data: ReportData;
  onBack?: () => void;
}

export default function BusinessReport({ data, onBack }: BusinessReportProps) {
  const [activeSection, setActiveSection] = useState(REPORT_SECTIONS[0].id);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0.5,
        filename: `${data.ideaTitle.replace(/\s+/g, '-')}-report.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const },
      };

      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'executive-summary':
        return <ExecutiveSummary data={data.executiveSummary} />;
      case 'market':
        return <MarketResearch data={data.marketResearch} />;
      case 'customer':
        return <CustomerProfiles data={data.customerProfiles} />;
      case 'competitor':
        return <CompetitorLandscape data={data.competitorLandscape} />;
      case 'plan':
        return <BusinessPlan data={data.businessPlan} />;
      case '90day-plan':
        return <NinetyDayPlan data={data.ninetyDayPlan} />;
      case 'gtm':
        return <GoToMarket data={data.goToMarket} />;
      case 'finance':
        return <FinancialModel data={data.financialModel} />;
      case 'risk-assessment':
        return <RiskAssessment data={data.riskAssessment} />;
      case 'pitch':
        return <PitchDeck data={data.pitchDeck} />;
      case 'brand-archetype':
        return <BrandArchetype data={data.brandArchetype} />;
      case 'brand-book':
        return <BrandBook data={data.brandBook} />;
      case 'gap-analysis':
        return <GapAnalysis data={data.gapAnalysis} />;
      case 'legal-compliance':
        return <LegalCompliance data={data.legalCompliance} />;
      case 'team':
        return <TeamOps data={data.teamOps} />;
      default:
        return <ExecutiveSummary data={data.executiveSummary}  />;
    }
  };

  const currentSection = REPORT_SECTIONS.find(s => s.id === activeSection) || REPORT_SECTIONS[0];

  return (
    <div className="min-h-screen bg-apple-bg">
      <div className="monitor-shell">
        <div className="monitor-frame">
          <ReportSidebar
            sections={REPORT_SECTIONS}
            activeSection={activeSection}
            onSectionChange={setActiveSection}

            generatedAt={data.generatedAt}
            onDownload={handleDownloadPDF}
            onBack={onBack}
          />

          <main className="monitor-main" ref={reportRef}>
            <ReportHeader
              title={currentSection.title}
            />

            <div className="mt-8 animate-fade-in">
              {renderSection()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
