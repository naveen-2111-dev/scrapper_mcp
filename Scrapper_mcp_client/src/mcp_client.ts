import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
}

class MCPClient {
    public readonly mcp: Client;
    private readonly groq: Groq;
    private transport: StdioClientTransport | null = null;
    private tools: any[] = [];

    constructor() {
        this.groq = new Groq({
            apiKey: GROQ_API_KEY,
        });

        this.mcp = new Client({
            name: "mcp-client-cli",
            version: "1.0.0",
        });
    }

    async connectToServer() {
        this.transport = new StdioClientTransport({
            command: "node",
            args: ["../Scraper_mcp_server/dist/index.js"],
        });

        await this.mcp.connect(this.transport);

        const tools = await this.mcp.listTools();
        this.tools = tools.tools;
    }

    async askLLM(prompt: string) {
        const response = await this.groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        return response.choices[0]?.message?.content;
    }
}

export default MCPClient;