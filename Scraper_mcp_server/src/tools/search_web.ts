import { config, getJson } from "serpapi";

config.api_key = "YOUR_SERPAPI_API_KEY";

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