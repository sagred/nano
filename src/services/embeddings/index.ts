import * as tf from '@tensorflow/tfjs';
import { load } from '@tensorflow-models/universal-sentence-encoder';

export class EmbeddingService {
  private model: any = null;
  
  async initialize() {
    if (!this.model) {
      this.model = await load();
    }
  }

  async generateEmbedding(text: string): Promise<Float32Array> {
    await this.initialize();
    const embeddings = await this.model.embed([text]);
    const embedding = await embeddings.array();
    return new Float32Array(embedding[0]);
  }

  calculateSimilarity(embedding1: Float32Array, embedding2: Float32Array): number {
    const tensor1 = tf.tensor1d(embedding1);
    const tensor2 = tf.tensor1d(embedding2);
    
    // Compute cosine similarity
    const dotProduct = tf.sum(tf.mul(tensor1, tensor2));
    const norm1 = tf.sqrt(tf.sum(tf.square(tensor1)));
    const norm2 = tf.sqrt(tf.sum(tf.square(tensor2)));
    
    const similarity = tf.div(dotProduct, tf.mul(norm1, norm2));
    const score = similarity.dataSync()[0];
    
    // Cleanup tensors
    tensor1.dispose();
    tensor2.dispose();
    
    return score;
  }
}

export const embeddingService = new EmbeddingService(); 