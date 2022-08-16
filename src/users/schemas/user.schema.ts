import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReferralLink } from '../../referral_links/schemas/referral_link.schema'

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReferralLink' }] })
  referrers: ReferralLink[];

  @Prop()
  balance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);