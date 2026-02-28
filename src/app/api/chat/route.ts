import { NextResponse } from "next/server";
import { getAgent } from "@/lib/agent";
import { HumanMessage } from "@langchain/core/messages";

export async function POST(req: Request) {
    try {
        const { message, threadId = "web-chat-thread" } = await req.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const agent = await getAgent();

        // We wrap this in an array for LangGraph
        const config = { configurable: { thread_id: threadId } };
        const stream = await agent.stream(
            { messages: [new HumanMessage(message)] },
            config
        );

        let finalResponse = "";

        // Process the stream to get the final message
        for await (const chunk of stream) {
            if ("agent" in chunk) {
                finalResponse = chunk.agent.messages[0].content;
            } else if ("tools" in chunk) {
                // You could theoretically return tool tool updates too, 
                // but for a simple web app let's stick to agent messages.
                console.log("Tool execution completed");
            }
        }

        return NextResponse.json({ response: finalResponse });
    } catch (error: any) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to process chat message" },
            { status: 500 }
        );
    }
}
