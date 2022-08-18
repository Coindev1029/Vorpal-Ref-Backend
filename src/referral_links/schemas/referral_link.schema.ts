import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ReferralLinkDocument = ReferralLink & Document;

@Schema()
export class ReferralLink {
  @Prop({ required: true })
  creatorAddress: string;

  @Prop({ required: true })
  creatorPercent: number;

  @Prop({ required: true })
  referralPercent: number;
}

export const ReferralLinkSchema = SchemaFactory.createForClass(ReferralLink);
