import { config, getJson } from "serpapi";

config.api_key = "a98d2ae1619f539c84a57328d63eb63873f5f4a9d3427a005e45fb3adacb827c";

export async function searchWeb(query: string, location: string) {
    return new Promise<{ organic_results: string[] }>((resolve, reject) => {
        getJson({
            engine: "google",
            q: query,
            location: location
        }, (json) => {
            resolve({
                organic_results: json["organic_results"]?.map((r: any) => r.link) || []
            });
        });
    });
};