import { ConvexHttpClient } from "convex/browser";
import { api } from "./src/convex/_generated/api.js";

async function checkStatus() {
  const client = new ConvexHttpClient("https://acrobatic-monitor-529.convex.cloud");
  const session = await client.query(api.sessions.getSessionStatus, { sessionId: "sess_1768249628017_77hjdnrvmyf" });
  console.log("Session Status:", session.status);
  console.log("Progress:", session.progress + "%");
  console.log("Current Step:", session.currentStep);
  
  if (session.result && Object.keys(session.result).length > 0) {
    console.log("Sections completed:", Object.keys(session.result).length);
    console.log("Has team section:", !!session.result.team);
  }
  
  const costData = await client.query(api.admin.getCostsBySession, { sessionId: "sess_1768249628017_77hjdnrvmyf" });
  console.log("Total Cost:", "$" + costData.totalCost.toFixed(4));
  console.log("Total Tokens:", costData.totalTokens.toLocaleString());
}

checkStatus();
