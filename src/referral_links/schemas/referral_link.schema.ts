import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type ReferralLinkDocument = ReferralLink & Document;

@Schema()
export class ReferralLink {
  @Prop()
  creatorId: string;

  @Prop()
  creatorPercent: number;

  @Prop()
  referralPercent: number;
}

export const ReferralLinkSchema = SchemaFactory.createForClass(ReferralLink);
