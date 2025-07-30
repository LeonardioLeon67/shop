import { Document, Model } from 'mongoose';

declare module 'mongoose' {
  interface Model<T extends Document> {
    findByIdAndUpdate(
      id: any,
      update: any,
      options?: any
    ): Query<T | null, T>;
  }
}