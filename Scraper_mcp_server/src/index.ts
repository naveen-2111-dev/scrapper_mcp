import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchWeb } from "./tools/search_web";
import { extractContent } from "./tools/extract_content";

const transport = new StdioServerTransport();
const server = new McpServer({
    name: "Scraper MCP",
    description: "A simple MCP server that scrapes data from the web.",
    version: "1.0.0",
    title: "Scraper MCP",
})

server.registerTool(
    "Search_Web",
    {
        title: "Search Web",
        description: "Search the web for information.",
        inputSchema: z.object({
            query: z.string().describe("The search query"),
            location: z.string().describe("The location for localized search results (e.g., 'United States')").optional(),
        }),
        outputSchema: z.object({
            organic_results: z.array(z.string()).describe("The list of organic result links from the search"),
        }),
    },
    async ({ query, location }) => {
        try {
            const result = await searchWeb(query, location!);

            return {
                structuredContent: {
                    organic_results: result.organic_results ?? [],
                },
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result),
                    }
                ]
            };
        } catch (error) {
            return {
                structuredContent: {
                    organic_results: [],
                },
                content: [
                    {
                        type: "text",
                        text: `Error searching web: ${error instanceof Error ? error.message : String(error)}`
                    }
                ]
            };
        }
    }
);

server.registerTool(
    "Web_Content_extractor",
    {
        title: "Web Content Extractor",
        description: "Extract content from web pages.",
        inputSchema: z.object({
            links: z.string().array().describe("The list of links to extract content from"),
        }),
        outputSchema: z.object({
            organic_results: z.record(z.string(), z.string()).describe("Extracted text content keyed by URL"),
        }),
    },
    async ({ links }) => {
        try {
            const result = await extractContent(links);

            return {
                structuredContent: {
                    organic_results: result.organic_results ?? {},
                },
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(result),
                    }
                ]
            };
        } catch (error) {
            return {
                structuredContent: {
                    organic_results: {},
                },
                content: [
                    {
                        type: "text",
                        text: `Error searching web: ${error instanceof Error ? error.message : String(error)}`
                    }
                ]
            };
        }
    }
);

async function main() {
    try {
        await server.connect(transport);
    } catch (error) {
        console.error("Error starting MCP server:", error);
    }
}

main();
