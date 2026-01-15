import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '../lib/convex';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { BusinessReport } from '../components/report';
import { mapIdeaToReportData } from '../utils/reportDataMapper';

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const idea = useQuery(api.ideas.getIdea, id ? { id: id as Id<"ideas"> } : "skip");

  const handleBack = () => {
    navigate(`/ideas/${id}`);
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-apple-text mb-2">Invalid Report</h1>
          <p className="text-apple-gray">No idea ID provided.</p>
        </div>
      </div>
    );
  }

  if (idea === undefined) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-apple-gray">Loading your business report...</p>
        </div>
      </div>
    );
  }

  if (idea === null) {
    return (
      <div className="min-h-screen bg-apple-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-apple-text mb-2">Report Not Found</h1>
          <p className="text-apple-gray mb-4">The idea you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/ideas')}
            className="text-apple-blue hover:underline"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  // Map the Convex idea data to the report format
  const reportData = mapIdeaToReportData({
    _id: idea._id,
    title: idea.title,
    description: idea.description,
    industry: idea.industry,
    target_market: idea.target_market,
    userId: '',
    executive_summary: idea.executive_summary,
    market_research: idea.market_research,
    business_plan: idea.business_plan,
    financial_model: idea.financial_model,
    competitor_analysis: idea.competitor_analysis,
    go_to_market: idea.go_to_market,
    team_plan: idea.team_plan,
    risk_assessment: idea.risk_assessment,
    action_plan: idea.action_plan,
    pitch_deck: idea.pitch_deck,
    local_business_data: idea.local_business_data,
    generated_at: idea.generated_at,
    created_at: idea.created_at,
    updated_at: idea.updated_at,
    brandArchetype: idea.brandArchetype,
    brandBook: idea.brandBook,
    gapAnalysis: idea.gapAnalysis,
    legalCompliance: idea.legalCompliance,
  });

  return <BusinessReport data={reportData} onBack={handleBack} />;
}
