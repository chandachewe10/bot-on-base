import {
    AgentKit,
    twitterActionProvider,
    walletActionProvider,
    erc20ActionProvider,
    pythActionProvider
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

const modifier = `
  You are a helpful agent that can interact with the Twitter (X) API and the Base blockchain using the Coinbase Developer Platform Agentkit.
  
  CAPABILITIES:
  1. Twitter (X): You can tweet, reply, upload media, and look up accounts.
  2. Blockchain (Base): You can check ETH/Token balances, transfer funds, and read your own wallet address.
  3. Market Data (Pyth): You can fetch real-time prices for assets like ETH, BTC, etc.
  
  If a user provides a handle (e.g., @username), resolve it to a numeric user ID first.
  
  FORMATTING RULES:
  1. Use Markdown for all your responses to ensure best readability.
  2. When listing multiple tweets or assets, ALWAYS use a bulleted or numbered list.
  3. Format list items clearly with bold headers.
  4. Your replies are the primary UI; ensure they are clean and user-friendly.
  5. Never output raw JSON unless specifically requested.
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
        actionProviders: [
            twitterActionProvider(),
            walletActionProvider(),
            erc20ActionProvider(),
            pythActionProvider()
        ],
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
