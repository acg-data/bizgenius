import { ConvexHttpClient } from "convex/browser";
import { api } from "./src/convex/_generated/api.js";

async function showResults() {
  const client = new ConvexHttpClient("https://acrobatic-monitor-529.convex.cloud");
  const session = await client.query(api.sessions.getSessionStatus, { sessionId: "sess_1768249628017_77hjdnrvmyf" });
  
  console.log("🏆 COMPLETE TACO TRUCK BUSINESS PLAN\n");
  console.log("📊 Generation Status: " + session.status + " (" + session.progress + "%)\n");
  
  const sections = ["market", "customers", "competitors", "businessPlan", "goToMarket", "financial", "pitchDeck", "team"];
  
  for (const section of sections) {
    if (session.result && session.result[section]) {
      console.log("📄 " + section.toUpperCase() + " SECTION:");
      console.log(JSON.stringify(session.result[section], null, 2));
      console.log("\n" + "─".repeat(80) + "\n");
    }
  }
  
  const costData = await client.query(api.admin.getCostsBySession, { sessionId: "sess_1768249628017_77hjdnrvmyf" });
  console.log("💰 COST ANALYSIS:");
  console.log("Total Cost: $" + costData.totalCost.toFixed(4));
  console.log("Total Tokens: " + costData.totalTokens.toLocaleString());
  console.log("Sections: " + costData.sectionCount);
  
  console.log("\n📋 Section Costs:");
  for (const cost of costData.costs) {
    console.log("  " + cost.sectionId + ": " + cost.inputTokens + "/" + cost.outputTokens + " tokens");
  }
}

showResults();
