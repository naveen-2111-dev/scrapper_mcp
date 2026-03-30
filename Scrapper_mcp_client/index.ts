import express from 'express';
import ProcessQuery from './src/process_query.js';

const app = express();
const PORT = 3000;
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000;
const processQueryService = new ProcessQuery();

app.use(express.json());

app.get('/', (_, res: express.Response) => {
    res.send('Hello, World!');
});

app.post("/chat", async (req: express.Request, res: express.Response) => {
    const query = req.body?.query;
    if (!query) {
        res.status(400).send("Query is required.");
        return;
    }

    const result = await processQueryService.processQuery(query);
    res.status(200).json({ result });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

server.requestTimeout = REQUEST_TIMEOUT_MS;
server.headersTimeout = REQUEST_TIMEOUT_MS + 5000;