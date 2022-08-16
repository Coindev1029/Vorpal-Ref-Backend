import { PartialType } from '@nestjs/mapped-types';
import { CreateReferralLinkDto } from './create-referral_link.dto';

export class UpdateReferralLinkDto extends PartialType(CreateReferralLinkDto) {}
