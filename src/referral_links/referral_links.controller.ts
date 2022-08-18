import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ReferralLinksService } from './referral_links.service';
import { ReferralLink } from './schemas/referral_link.schema';

@Controller('referral-links')
export class ReferralLinksController {
  constructor(private readonly referralLinkService: ReferralLinksService) {}

  @Post()
  async create(@Res() res, @Body() refLink: ReferralLink) {
    try {
      const newRefLink = await this.referralLinkService.create(refLink);
      return res.status(HttpStatus.CREATED).json({
        newRefLink,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Get()
  async findAll(@Res() res) {
    try {
      const refLinks = await this.referralLinkService.findAll();
      return res.status(HttpStatus.OK).json({
        refLinks,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Get('/:id')
  async findOne(@Res() res, @Param('id') id) {
    try {
      const refLinks = await this.referralLinkService.findOne(id);
      return res.status(HttpStatus.OK).json({
        refLinks,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Get('/find-by-address/:address')
  async findOneByAddress(@Res() res, @Param('address') address) {
    try {
      const refLinks = await this.referralLinkService.findOneByAddress(address);
      return res.status(HttpStatus.OK).json({
        refLinks,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Patch('/:id')
  async update(@Res() res, @Param('id') id, @Body() refLink: ReferralLink) {
    try {
      const updatedRefLink = await this.referralLinkService.update(id, refLink);
      return res.status(HttpStatus.OK).json({
        updatedRefLink,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Delete('/:id')
  async remove(@Res() res, @Param('id') id) {
    try {
      const deletedRefLink = await this.referralLinkService.remove(id);
      return res.status(HttpStatus.OK).json({
        deletedRefLink,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
