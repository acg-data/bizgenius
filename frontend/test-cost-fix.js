import { ConvexHttpClient } from "convex/browser";
import { api } from "./src/convex/_generated/api.js";

async function testCostFix() {
  console.log("🧪 Testing Cost Calculation Fix\n");
  
  const client = new ConvexHttpClient("https://acrobatic-monitor-529.convex.cloud");

  try {
    console.log("🔄 Creating test session...");
    const result = await client.mutation(api.sessions.createSession, {
      idea: "Quick test for cost calculation",
      answers: { test: "value" },
      branding: { name: "Test", colors: ["#FF0000"], tagline: "Test" }
    });
    const sessionId = result.sessionId;
    console.log("✅ Session created:", sessionId, "\n");

    console.log("🤖 Running quick market section generation...");
    const startTime = Date.now();
    await client.action(api.ai.runFullGeneration, { sessionId });
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`✅ Generation completed in ${duration.toFixed(2)} seconds\n`);

    // Check session status
    const session = await client.query(api.sessions.getSessionStatus, { sessionId });
    console.log("📋 Session Status:", session.status);
    console.log("📈 Progress:", session.progress + "%\n");

    // Check cost data
    console.log("💰 Checking cost tracking data...");
    const costData = await client.query(api.admin.getCostsBySession, { sessionId });
    console.log("💵 Total Cost:", `$${costData.totalCost.toFixed(4)}`);
    console.log("🎫 Total Tokens:", costData.totalTokens.toLocaleString());
    console.log("📊 Sections Generated:", costData.sectionCount);
    
    console.log("\n📋 Detailed Cost Breakdown:");
    for (const cost of costData.costs) {
      console.log(`  ${cost.sectionId}: $${cost.cost.toFixed(6)} (${cost.inputTokens} input + ${cost.outputTokens} output tokens)`);
      console.log(`    Provider: ${cost.provider}, Model: ${cost.model}`);
    }

    console.log("\n🎉 COST CALCULATION TEST COMPLETED!");
    
    if (costData.totalCost > 0) {
      console.log("✅ SUCCESS: Cost calculation is working!");
      console.log("💰 Expected cost for 32,822 tokens: ~$0.03-0.05");
    } else {
      console.log("❌ ISSUE: Costs still showing $0.0000");
    }

  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testCostFix();
