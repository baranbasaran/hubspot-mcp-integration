import { Model, Document, UpdateQuery, FilterQuery } from 'mongoose';

export interface IBaseDocument extends Document {
  hubspotId: string;
}

export abstract class BaseRepository<T extends IBaseDocument> {
  constructor(protected model: Model<T>) {}

  async save(data: Partial<T> & { hubspotId: string }): Promise<T> {
    try {
      const { hubspotId, ...updateData } = data;
      const updateQuery: UpdateQuery<T> = { $set: updateData as Partial<T> };
      const result = await this.model.findOneAndUpdate(
        { hubspotId } as FilterQuery<T>,
        updateQuery,
        { upsert: true, new: true, runValidators: true }
      );
      if (!result) {
        throw new Error(`Failed to save/update ${this.model.modelName} with hubspotId: ${hubspotId}`);
      }
      console.log(`💾 ${this.model.modelName} ${hubspotId} saved/updated in DB.`);
      return result;
    } catch (error) {
      console.error(`❌ Error saving/updating in DB:`, error);
      throw error;
    }
  }

  async findByHubspotId(hubspotId: string): Promise<T | null> {
    try {
      return await this.model.findOne({ hubspotId } as FilterQuery<T>);
    } catch (error) {
      console.error(`❌ Error finding by HubSpot ID ${hubspotId}:`, error);
      throw error;
    }
  }

  async delete(hubspotId: string): Promise<T | null> {
    try {
      const result = await this.model.findOneAndDelete({ hubspotId } as FilterQuery<T>);
      if (result) {
        console.log(`🗑️ ${this.model.modelName} ${hubspotId} deleted from DB.`);
      } else {
        console.warn(`⚠️ ${this.model.modelName} with HubSpot ID ${hubspotId} not found for deletion.`);
      }
      return result;
    } catch (error) {
      console.error(`❌ Error deleting ${hubspotId}:`, error);
      throw error;
    }
  }
} 