import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const modifier = `
  You are a helpful agent that can interact with the Twitter (X) API and the Base blockchain using the Coinbase Developer Platform Agentkit.
  
  CAPABILITIES:
  1. Twitter (X): You can tweet, reply, upload media, and look up accounts.
  2. Blockchain (Base): You can check ETH/Token balances, transfer funds from your own wallet, AND request the user to transfer funds securely from their own connected browser wallet using the UI.
  3. Market Data (Pyth): You can fetch real-time prices for assets like ETH, BTC, etc.
  
  If a user provides a handle (e.g., @username), resolve it to a numeric user ID first.
  
  FORMATTING RULES:
  1. Use Markdown for all your responses to ensure best readability.
  2. When listing multiple tweets or assets, ALWAYS use a bulleted or numbered list.
  3. Format list items clearly with bold headers.
  4. Your replies are the primary UI; ensure they are clean and user-friendly.
  5. If you call \`request_user_wallet_transfer\`, you MUST include the exact JSON block returned by the tool in your final response to the user so that the UI can render the button. Do not summarize or omit the JSON block.
`;

let agentInstance: any = null;
const memory = new MemorySaver();

export async function getAgent() {
    if (agentInstance) return agentInstance;

    // Dynamic imports to avoid ESM/CJS conflicts
    const { AgentKit, twitterActionProvider, walletActionProvider, erc20ActionProvider, pythActionProvider, customActionProvider } = await import("@coinbase/agentkit");
    const { getLangChainTools } = await import("@coinbase/agentkit-langchain");

    const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        openAIApiKey: process.env.OPENAI_API_KEY
    });

    const transferFromSourceAction = customActionProvider({
        name: "request_user_wallet_transfer",
        description: "Requests the user to transfer ETH from their connected browser wallet to a destination address. Use this when the user wants to send funds from their own wallet instead of the bot's wallet. IMPORTANT: Do NOT ask for the user's private key. The secure browser UI will handle the transaction signing.",
        schema: z.object({
            destinationAddress: z.string().describe("The recipient address for the ETH transfer"),
            amount: z.string().describe("The amount in ETH to transfer (e.g., '0.01')."),
        }),
        invoke: async (walletProvider: any, args: any) => {
            return `I have prepared the transaction! Please authorize it using your connected wallet:\n\n\`\`\`json\n{"ui_action": "wallet_transfer", "to": "${args.destinationAddress}", "amount": "${args.amount}"}\n\`\`\``;
        }
    });

    const agentkit = await AgentKit.from({
        cdpApiKeyId: process.env.CDP_API_KEY_ID,
        cdpApiKeySecret: process.env.CDP_API_KEY_SECRET,
        cdpWalletSecret: process.env.CDP_WALLET_SECRET,
        actionProviders: [
            twitterActionProvider(),
            walletActionProvider(),
            erc20ActionProvider(),
            pythActionProvider(),
            transferFromSourceAction
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