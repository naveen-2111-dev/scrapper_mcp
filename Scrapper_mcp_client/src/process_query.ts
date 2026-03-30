import MCPClient from "./mcp_client.js";

const MAX_LINKS_TO_EXTRACT = 3;

class ProcessQuery {
    private readonly client: MCPClient;

    constructor() {
        this.client = new MCPClient();
    }

    async processQuery(query: string): Promise<string> {
        try {
            await this.client.connectToServer();
        } catch (error) {
            throw new Error(`Failed to connect to MCP server: ${error instanceof Error ? error.message : String(error)}`);
        }

        try {
            const searchResult: any = await this.client.mcp.callTool({
                name: "Search_Web",
                arguments: { query, location: "United States" }
            });

            const links: string[] =
                searchResult.structuredContent.organic_results ?? [];

            if (links.length === 0) {
                return "No results found.";
            }

            const selectedLinks = links.slice(0, MAX_LINKS_TO_EXTRACT);

            const contentResult: any = await this.client.mcp.callTool({
                name: "Web_Content_extractor",
                arguments: { links: selectedLinks }
            });

            const extracted =
                contentResult.structuredContent.organic_results ?? {};

            const prompt = `
                You are an intelligent web data assistant.

                Your job is to analyze the USER QUERY and decide the correct mode of operation.

                -----------------------
                INPUT:
                USER QUERY:
                ${query}

                WEB EXTRACTED CONTENT:
                ${JSON.stringify(extracted)}
                -----------------------

                STEP 1: Identify the query type:
                - If the query is about products, prices, comparisons, shopping → MODE = "ECOMMERCE"
                - Otherwise → MODE = "GENERAL"

                -----------------------
                STEP 2: Based on MODE:

                IF MODE = "ECOMMERCE":
                - Extract ONLY relevant products from the content
                - Ignore blogs, articles, and unrelated text
                - Return structured product data

                Fields:
                - product_name
                - price (number only)
                - currency
                - platform/source
                - key_attributes (material, size, etc if available)

                Rules:
                - Discard products without price
                - Discard irrelevant items
                - No explanations

                Output:
                {
                "mode": "ecommerce",
                "products": [
                    {
                    "product_name": "",
                    "price": 0,
                    "currency": "",
                    "platform": "",
                    "key_attributes": {}
                    }
                ]
                }

                -----------------------

                IF MODE = "GENERAL":
                - Summarize the content relevant to the query
                - Keep it concise and informative
                - Avoid unrelated sections

                Output:
                {
                "mode": "general",
                "answer": ""
                }

                -----------------------

                FINAL RULES:
                - Always return valid JSON
                - Do NOT mix modes
                - Do NOT add explanations outside JSON
                - If no useful data found:
                - ecommerce → empty products array
                - general → "No relevant information found"

            `;
            const final = await this.client.askLLM(prompt);

            return final ?? "No response from LLM.";

        } catch (error) {
            return `Error: ${error instanceof Error ? error.message : String(error)}`;
        } finally {
            this.client.mcp.close();
        }
    }
}

export default ProcessQuery;

