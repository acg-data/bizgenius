import { ConvexHttpClient } from "convex/browser";
import { api } from "./src/convex/_generated/api.js";

async function testSingleSection() {
  console.log("🧪 Testing single section generation with Novita API\n");
  
  const client = new ConvexHttpClient("https://acrobatic-monitor-529.convex.cloud");

  // Business idea: Taco Truck in Boston, MA
  const businessIdea = "A gourmet taco truck serving authentic Mexican street food with local Boston ingredients, operating in high-traffic areas of Boston, Massachusetts";

  const answers = {
    target_market: "Young professionals and tourists in Boston, MA aged 25-45",
    problem: "Lack of authentic, high-quality Mexican street food in Boston's fast-paced urban environment"
  };

  try {
    console.log("🔄 Creating generation session...");
    const result = await client.mutation(api.sessions.createSession, {
      idea: businessIdea,
      answers,
      branding: {
        colors: ["#FF6B35"],
        name: "Boston Taco Co.",
        tagline: "Authentic Mexican Street Food"
      }
    });
    const sessionId = result.sessionId;
    console.log("✅ Session created:", sessionId, "\n");

    // Test just the market section
    console.log("🧪 Testing market section generation only...");
    
    // Create a test action that generates just one section
    const marketResult = await client.action(api.ai.generateInsight, {
      businessIdea: businessIdea + " Generate a market analysis section with TAM/SAM/SOM analysis, trends, and demographics for this taco truck business.",
      currentQuestion: "What is the market opportunity for this taco truck?",
      partialAnswers: answers
    });
    
    console.log("✅ Market section test result:");
    console.log("Insight:", marketResult.insight || "No insight generated");
    
    console.log("\n🎉 SINGLE SECTION TEST COMPLETED!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Full error:", error);
  }
}

testSingleSection();
