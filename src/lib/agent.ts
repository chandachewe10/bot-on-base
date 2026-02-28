import { AgentKit, twitterActionProvider } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

const modifier = `
  You are a helpful agent that can interact with the Twitter (X) API using the Coinbase Developer Platform Twitter (X) Agentkit.
  You can tweet, reply, upload media, and look up account details or mentions.
  If a user provides a handle (e.g., @username), use your tools to resolve it to a numeric user ID first.
  Be concise and helpful and give out a reply in human readable format whether its a json or not make it user friendly you are the UI.
`;

// In-memory agent instance (per process)
let agentInstance: any = null;
const memory = new MemorySaver();

export async function getAgent() {
    if (agentInstance) return agentInstance;

    // Initialize LLM
    const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        openAIApiKey: process.env.OPENAI_API_KEY
    });

    const agentkit = await AgentKit.from({
        cdpApiKeyId: process.env.CDP_API_KEY_ID,
        cdpApiKeySecret: process.env.CDP_API_KEY_SECRET,
        cdpWalletSecret: process.env.CDP_WALLET_SECRET,
        actionProviders: [twitterActionProvider()],
    });

    const tools = await getLangChainTools(agentkit);

    agentInstance = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: modifier,
    });

    return agentInstance;
}
