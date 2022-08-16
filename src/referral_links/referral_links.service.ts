import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ReferralLink,
  ReferralLinkDocument,
} from './schemas/referral_link.schema';

@Injectable()
export class ReferralLinksService {
  constructor(
    @InjectModel(ReferralLink.name)
    private referralLinkModel: Model<ReferralLinkDocument>,
  ) {}

  async create(referralLink: ReferralLink): Promise<ReferralLink> {
    let newReferralLink = null;
    try {
      newReferralLink = new this.referralLinkModel(referralLink);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return await newReferralLink.save();
  }

  async findAll(): Promise<ReferralLink[]> {
    let refLinks = null;
    try {
      refLinks = this.referralLinkModel
        .find()
        .populate([{ path: 'creatorId' }])
        .exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    if (!refLinks) {
      throw new NotFoundException(`Not found referral links`);
    }

    return refLinks;
  }

  async findOne(id): Promise<ReferralLink> {
    if (!id) {
      throw new NotFoundException(`Not found referral link id: ${id}`);
    }
    let refLink = null;
    try {
      refLink = await this.referralLinkModel
        .findById(id)
        .populate([{ path: 'creatorId' }])
        .exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    if (!refLink) {
      throw new NotFoundException(`Not found referral link object: ${id}`);
    }

    return refLink;
  }

  async update(id, referralLink: ReferralLink): Promise<ReferralLink> {
    if (!id) {
      throw new NotFoundException(`Not found referral link id: ${id}`);
    }
    let refLink = null;
    try {
      refLink = await this.referralLinkModel.findByIdAndUpdate(
        id,
        referralLink,
        {
          new: true,
        },
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return refLink;
  }

  async remove(id) {
    if (!id) {
      throw new NotFoundException(`Not found referral link id: ${id}`);
    }
    try {
      await this.referralLinkModel.findByIdAndRemove(id).lean().exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return {
      success: true,
    };
  }
}
