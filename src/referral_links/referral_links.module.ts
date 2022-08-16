import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralLinksService } from './referral_links.service';
import { ReferralLinksController } from './referral_links.controller';
import {
  ReferralLink,
  ReferralLinkSchema,
} from './schemas/referral_link.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReferralLink.name, schema: ReferralLinkSchema },
    ]),
  ],
  controllers: [ReferralLinksController],
  providers: [ReferralLinksService],
})
export class ReferralLinksModule {}
