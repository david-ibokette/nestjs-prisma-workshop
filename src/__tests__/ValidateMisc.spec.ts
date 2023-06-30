import {
  validate,
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  Min,
  Max,
} from 'class-validator';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

export class Post {
  @Length(10, 20)
  title: string;

  @Contains('hello')
  text: string;

  @IsInt()
  @Min(0)
  @Max(10)
  rating: number;

  @IsEmail()
  email: string;

  @IsFQDN()
  site: string;
}

describe('PoliciesService', () => {
  const post = new Post();
  post.title = 'Hello World'; // should not pass
  post.text = 'this is a great post about hello world'; // should not pass
  post.rating = 3; // should not pass
  post.email = 'me@google.com'; // should not pass
  post.site = 'google.com'; // should not pass

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();
  });

  it('Just validate', async () => {
    const errors = await validate(post);
    expect(errors?.length).toBeFalsy();
  });
});
