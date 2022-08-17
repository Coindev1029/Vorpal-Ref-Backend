import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ReferralLink } from '../../referral_links/schemas/referral_link.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  address: string;

  @Prop({
    type: [
      { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReferralLink' }] },
    ],
  })
  links: ReferralLink[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReferralLink' }],
  })
  referrer: ReferralLink;

  @Prop()
  balance: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
