export class VectorStoreRetriever {
    constructor(vectorStore, embeddings) {
        this.vectorStore = vectorStore;
        this.embeddings = embeddings;
        this.k = 4;
    }

    /**
     * Get relevant documents for a query
     * @param {string} query - The query text
     * @returns {Promise<Array<Object>>} - Array of relevant documents
     */
    async getRelevantDocuments(query) {
        const queryEmbedding = await this.embeddings.embedQuery(query);
        const results = await this.vectorStore.similaritySearch(queryEmbedding, this.k);
        return results;
    }
}