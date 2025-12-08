import { NextResponse } from "next/server";
import { client } from "@/lib/ai/client";

export async function POST(req: Request) {
    try {
        const { contextType, data } = await req.json();

        let prompt = "";
        const basePrompt = `You are a proactive AI assistant. Analyze the data and return a JSON object with:
    1. "insight": A sharp, concise insight (max 20 words).
    2. "actions": An array of 1-3 relevant actions. Each action has:
       - "label": Short button text (e.g., "Draft Follow-up", "Save Note", "Open Link").
       - "type": One of "copy" (text), "save" (note), "task" (todo), "open_url" (link).
       - "payload": The content to copy/save, task details, or the URL to open.

    Return ONLY valid JSON.`;

        switch (contextType) {
            case "revenue":
                prompt = `${basePrompt}
        Context: Revenue Data: ${JSON.stringify(data)}.
        Role: Business Analyst.
        Insight Example: "Revenue is up 20% this month, driven by new subscriptions."
        Action Ideas: "Draft Weekly Report" (copy), "Set Revenue Goal" (task).`;
                break;
            case "github_pr":
                prompt = `${basePrompt}
        Context: GitHub Pull Request: ${JSON.stringify(data)}.
        Role: Senior Engineer.
        Insight Example: "This PR is large and touches critical auth paths."
        Action Ideas: "View on GitHub" (open_url: html_url), "Draft Review Checklist" (copy).`;
                break;
            case "github_issue":
                prompt = `${basePrompt}
        Context: GitHub Issue: ${JSON.stringify(data)}.
        Role: Product Manager.
        Insight Example: "This issue blocks the Q3 release."
        Action Ideas: "View Issue" (open_url: html_url), "Prioritize in Roadmap" (task).`;
                break;
            case "slack":
                prompt = `${basePrompt}
        Context: Slack Message: ${JSON.stringify(data)}.
        Role: Communications Manager.
        Insight Example: "This thread requires a decision on the Q3 roadmap."
        Action Ideas: "Draft Reply" (copy), "Create Linear Ticket" (task), "Open in Slack" (open_url: permalink).`;
                break;
            case "gmail":
                prompt = `${basePrompt}
        Context: Email: ${JSON.stringify(data)}.
        Role: Executive Assistant.
        Insight Example: "Urgent request from client regarding contract renewal."
        Action Ideas: "Draft Reply" (copy), "Schedule Meeting" (task).`;
                break;
            case "notion":
                prompt = `${basePrompt}
        Context: Notion Page: ${JSON.stringify(data)}.
        Role: Knowledge Manager.
        Insight Example: "This spec is missing the mobile responsive requirements."
        Action Ideas: "Summarize Key Points" (copy), "Open in Notion" (open_url: url).`;
                break;
            case "bromcom":
                prompt = `${basePrompt}
        Context: Student Grade/Behavior: ${JSON.stringify(data)}.
        Role: Academic Tutor.
        Insight Example: "Math grades have dropped 15% this term."
        Action Ideas: "Create Study Plan" (task), "Draft Email to Teacher" (copy).`;
                break;
            default:
                prompt = `${basePrompt}
        Context: ${contextType} with data: ${JSON.stringify(data)}.`;
        }

        const response = await client.chat.completions.create({
            model: "google/gemini-2.5-flash",
            messages: [
                { role: "user", content: prompt },
            ],
            stream: false,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error("No content received");

        const jsonStr = content.replace(/```json/g, "").replace(/```/g, "").trim();
        const result = JSON.parse(jsonStr);

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to analyze context" },
            { status: 500 }
        );
    }
}
