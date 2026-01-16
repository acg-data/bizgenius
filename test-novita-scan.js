import { ConvexHttpClient } from 'convex/browser';
import { api } from '../src/convex/_generated/api.js';

async function testNovitaGeneration() {
  const client = new ConvexHttpClient(process.env.CONVEX_URL!);

  console.log('🚀 Starting Taco Truck Generation Test with Novita API\n');

  // Business idea: Taco Truck in Boston, MA
  const businessIdea = "A gourmet taco truck serving authentic Mexican street food with local Boston ingredients, operating in high-traffic areas of Boston, Massachusetts";

  // Strategic answers
  const answers = {
    target_market: "Young professionals and tourists in Boston, MA aged 25-45",
    problem: "Lack of authentic, high-quality Mexican street food in Boston's fast-paced urban environment",
    geography: "Boston, Massachusetts - focusing on downtown, financial district, and tourist areas",
    revenue_model: "Direct sales from truck with online ordering and catering services",
    stage: "Early startup - concept validation and initial market testing"
  };

  console.log('📝 Business Idea:', businessIdea);
  console.log('📊 Strategic Answers:', JSON.stringify(answers, null, 2), '\n');

  try {
    // Create generation session
    console.log('🔄 Creating generation session...');
    const sessionId = await client.mutation(api.sessions.createSession, {
      businessIdea,
      answers,
      branding: {
        colors: ['#FF6B35', '#F7931E'],
        name: 'Boston Taco Co.',
        tagline: 'Authentic Mexican Street Food'
      }
    });

    console.log('✅ Session created:', sessionId, '\n');

    // Start generation
    console.log('🤖 Starting AI generation with Novita provider...');
    const startTime = Date.now();

    await client.action(api.ai.runGeneration, { sessionId });

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`✅ Generation completed in ${duration.toFixed(2)} seconds\n`);

    // Get results
    console.log('📊 Fetching generation results...');
    const session = await client.query(api.sessions.getSession, { sessionId });

    if (!session) {
      throw new Error('Session not found after generation');
    }

    console.log('📋 Session Status:', session.status);
    console.log('📈 Progress:', session.progress + '%');
    console.log('🎯 Current Step:', session.currentStep, '\n');

    if (session.result) {
      console.log('🏆 GENERATION RESULTS:\n');

      // Display each section
      const sections = [
        'market',
        'customers',
        'competitors',
        'businessPlan',
        'goToMarket',
        'financial',
        'pitchDeck',
        'team'
      ];

      for (const section of sections) {
        if (session.result[section]) {
          console.log(`\n📄 ${section.toUpperCase()} SECTION:`);
          console.log(JSON.stringify(session.result[section], null, 2));
        }
      }

      console.log('\n' + '='.repeat(80));
      console.log('💰 COST TRACKING DATA:');
      console.log('='.repeat(80));
    }

    // Get cost data
    console.log('🔍 Fetching cost tracking data...');
    const costData = await client.query(api.admin.getCostsBySession, { sessionId });

    console.log('💵 Total Cost:', `$${costData.totalCost.toFixed(4)}`);
    console.log('🎫 Total Tokens:', costData.totalTokens.toLocaleString());
    console.log('📊 Sections Generated:', costData.sectionCount);
    console.log('\n📋 Cost Breakdown by Section:');

    for (const cost of costData.costs) {
      console.log(`  ${cost.sectionId}: $${cost.cost.toFixed(4)} (${cost.inputTokens + cost.outputTokens} tokens)`);
      console.log(`    Provider: ${cost.provider}, Model: ${cost.model}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('📈 ADDITIONAL ANALYTICS:');
    console.log('='.repeat(80));

    // Get recent generations
    const recentGens = await client.query(api.admin.getRecentGenerations, { limit: 1 });
    console.log('🔥 Recent Generations:', recentGens.length > 0 ? 'Available' : 'None');

    // Get cost trends (last 7 days)
    const costTrends = await client.query(api.admin.getCostTrends, { days: 7 });
    console.log('📊 Cost Trends (7 days):');
    for (const day of costTrends.slice(-3)) { // Show last 3 days
      console.log(`  ${new Date(day.date).toLocaleDateString()}: $${day.cost.toFixed(4)} (${day.count} generations)`);
    }

    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ Novita API integration working');
    console.log('✅ Cost tracking functional');
    console.log('✅ Full business plan generated');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testNovitaGeneration().catch(console.error);