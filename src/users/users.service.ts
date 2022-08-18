import { Model } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(user: User): Promise<User> {
    let newUser = null;
    try {
      newUser = new this.userModel(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return await newUser.save();
  }

  async findAll(): Promise<User[]> {
    let users = null;
    try {
      users = this.userModel.find().populate('links referrer').exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    if (!users) {
      throw new NotFoundException(`Not found users`);
    }

    return users;
  }

  async findOne(id): Promise<User> {
    if (!id) {
      throw new NotFoundException(`Not found user id: ${id}`);
    }
    let user = null;
    try {
      user = await this.userModel
        .findById(id)
        .populate('links referrer')
        .exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    if (!user) {
      throw new NotFoundException(`Not found user object: ${id}`);
    }

    return user;
  }

  async findOneByAddress(address): Promise<User> {
    if (!address) {
      throw new NotFoundException(
        `Not found user property address: ${address}`,
      );
    }
    let user = null;
    try {
      user = await this.userModel.findOne({ address: address }).exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    if (!user) {
      throw new NotFoundException(`Not found user object: ${user}`);
    }

    return user;
  }

  async update(id, user: User): Promise<User> {
    if (!id) {
      throw new NotFoundException(`Not found user id: ${id}`);
    }
    let updateUser = null;
    try {
      updateUser = await this.userModel.findByIdAndUpdate(id, user, {
        new: true,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return updateUser;
  }

  async remove(id) {
    if (!id) {
      throw new NotFoundException(`Not found user id: ${id}`);
    }
    try {
      await this.userModel.findByIdAndRemove(id).lean().exec();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
    return {
      success: true,
    };
  }
}
