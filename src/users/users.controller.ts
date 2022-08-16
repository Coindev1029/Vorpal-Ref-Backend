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
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Res() res, @Body() user: User) {
    try {
      const newUser = await this.usersService.create(user);
      return res.status(HttpStatus.CREATED).json({
        newUser,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Get()
  async findAll(@Res() res) {
    try {
      const users = await this.usersService.findAll();
      return res.status(HttpStatus.OK).json({
        users,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Get('/:id')
  async findOne(@Res() res, @Param('id') id) {
    try {
      const users = await this.usersService.findOne(id);
      return res.status(HttpStatus.OK).json({
        users,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Patch('/:id')
  async update(@Res() res, @Param('id') id, @Body() user: User) {
    try {
      const updatedUser = await this.usersService.update(id, user);
      return res.status(HttpStatus.OK).json({
        updatedUser,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }

  @Delete('/:id')
  async remove(@Res() res, @Param('id') id) {
    try {
      const deletedUser = await this.usersService.remove(id);
      return res.status(HttpStatus.OK).json({
        deletedUser,
      });
    } catch (error) {
      res.status(500).json({ error });
    }
  }
}
