import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ReferralLink,
  ReferralLinkSchema,
} from './referral_links/schemas/referral_link.schema';
import { ReferralLinksService } from './referral_links/referral_links.service';
import { User, UserSchema } from './users/schemas/user.schema';
import { UsersService } from './users/users.service';
import { ReferralLinksController } from './referral_links/referral_links.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://av371365:rh9hvyBmAS08omBS@custcollections.y6jpyks.mongodb.net/vorpal?retryWrites=true&w=majority',
    ),
    MongooseModule.forFeature([
      { name: ReferralLink.name, schema: ReferralLinkSchema },
    ]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController, ReferralLinksController, UsersController],
  providers: [AppService, ReferralLinksService, UsersService],
})
export class AppModule {}
