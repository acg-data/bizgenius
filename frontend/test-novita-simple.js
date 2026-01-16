import { ConvexHttpClient } from "convex/browser";
import { api } from "./src/convex/_generated/api.js";

async function testSimpleGeneration() {
  console.log("🧪 Testing simple Novita API call\n");
  
  const client = new ConvexHttpClient("https://acrobatic-monitor-529.convex.cloud");

  try {
    // Test just the question generation (uses fast model)
    console.log("Testing question generation...");
    const result = await client.action(api.ai.generateSmartQuestions, {
      businessIdea: "A taco truck in Boston",
      existingCategories: [],
      count: 1
    });
    
    console.log("✅ Question generation successful!");
    console.log("Questions:", result.questions?.length || 0);
    
    if (result.questions && result.questions.length > 0) {
      console.log("Sample question:", result.questions[0].question);
    }
    
  } catch (error) {
    console.error("❌ Simple test failed:", error.message);
    console.error("Full error:", error);
  }
}

testSimpleGeneration();
