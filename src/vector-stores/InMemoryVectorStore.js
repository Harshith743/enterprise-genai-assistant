

export class InMemoryVectorStore {
    constructor(embeddings) {
        this.embeddings = embeddings;
        this.memoryVectors = [];
    }

    /**
     * Add documents to the store
     * @param {Array<Object>} documents - Array of { pageContent, metadata }
     * @returns {Promise<void>}
     */
    async addDocuments(documents) {
        const texts = documents.map((doc) => doc.pageContent);
        const embeddings = await this.embeddings.embedDocuments(texts);

        for (let i = 0; i < documents.length; i++) {
            this.memoryVectors.push({
                content: documents[i].pageContent,
                embedding: embeddings[i],
                metadata: documents[i].metadata,
            });
        }
    }

    /**
     * Search for the most similar documents
     * @param {Array<number>} queryEmbedding - Embedding of the query
     * @param {number} k - Number of results to return
     * @returns {Promise<Array<Object>>} - Array of { pageContent, metadata, score }
     */
    async similaritySearch(queryEmbedding, k = 4) {
        const results = this.memoryVectors.map((vector) => ({
            ...vector,
            score: this.cosineSimilarity(queryEmbedding, vector.embedding),
        }));

        results.sort((a, b) => b.score - a.score);

        return results.slice(0, k);
    }

    cosineSimilarity(a, b) {
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}