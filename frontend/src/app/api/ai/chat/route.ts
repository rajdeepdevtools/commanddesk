import { NextResponse } from "next/server";
import { getUserSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { prompt } = await request.json();
    
    // Simulate LLM processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowerPrompt = prompt.toLowerCase();
    let responseText = "";

    // Mock Context-Aware Responses
    if (lowerPrompt.includes("hr") || lowerPrompt.includes("employee")) {
      responseText = "Based on the HR database, we currently have 243 active employees. There are 12 open requisitions. 4 employees are on leave today.";
    } 
    else if (lowerPrompt.includes("finance") || lowerPrompt.includes("revenue")) {
      responseText = "In Q3, the total revenue generated was ₹45,200,000 against expenses of ₹12,450,000, resulting in a net profit margin of 72.4%.";
    }
    else if (lowerPrompt.includes("payroll") || lowerPrompt.includes("salary")) {
      responseText = "Last month's payroll processed ₹3,240,000 for 243 employees. All payouts were successfully processed via Bank Transfer.";
    }
    else if (lowerPrompt.includes("ticket") || lowerPrompt.includes("support")) {
      responseText = "There are currently 14 Open Support Tickets. 3 are marked as URGENT in the IT category. Would you like me to summarize them?";
    }
    else if (lowerPrompt.includes("project") || lowerPrompt.includes("task")) {
      responseText = "You have 3 active projects. The 'Website Redesign' project is currently 85% complete and on track for next week's milestone.";
    }
    else {
      responseText = "I'm CommandDesk AI, your enterprise copilot. I can help you analyze HR data, summarize finances, check project statuses, or generate reports. How can I assist you today?";
    }

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process AI request" }, { status: 500 });
  }
}
