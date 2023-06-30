import {
  validate,
  validateOrReject,
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min,
  Max,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

export function BetweenMonths(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'betweenMonths',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max],
      options: {
        message: `${propertyName} must be within ${min} and ${max} months from today`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const maxDate = new Date();
          const minDate = new Date();
          const [min, max] = args.constraints;
          maxDate.setMonth(maxDate.getMonth() + max);
          minDate.setMonth(minDate.getMonth() + min);
          if (value > maxDate || value < minDate) {
            return false;
          }
          return true;
        },
      },
    });
  };
}

export function BetweenMonthsAndOtherIsAfter(
  min: number,
  max: number,
  relatedPropertyName: string,
  validationOptions?: ValidationOptions,
) {
  // eslint-disable-next-line @typescript-eslint/ban-types
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'betweenMonths',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [min, max, relatedPropertyName],
      options: {
        message: `${propertyName} must be within ${min} and ${max} months from today and ${relatedPropertyName} must be after it`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const SANITY_EXPIRATION_MAX_YEARS = 100;
          const [min, max, relatedPropertyName] = args.constraints;

          const maxDate = new Date();
          maxDate.setMonth(maxDate.getMonth() + max);

          const minDate = new Date();
          minDate.setMonth(minDate.getMonth() + min);

          if (value > maxDate || value < minDate) {
            return false;
          }

          const relatedValue = (args.object as any)[relatedPropertyName];
          const maxExpirationDate = new Date();
          maxExpirationDate.setMonth(
            maxExpirationDate.getMonth() + SANITY_EXPIRATION_MAX_YEARS * 12,
          );

          if (relatedValue > maxExpirationDate || relatedValue < value) {
            return false;
          }

          return true;
        },
      },
    });
  };
}

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

  @IsDate()
  @BetweenMonths(-12, 12, { message: 'Date must be within a year of today' })
  // @BetweenMonths(-12, 12)
  effectiveDate: Date;

  @IsDate()
  @BetweenMonths(-12, 12, { message: 'Date must be within a year of today' })
  // @BetweenMonths(-12, 12)
  expirationDate: Date;
}

describe('PoliciesService', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService],
    }).compile();
  });

  it('should be defined', async () => {
    const post = new Post();
    post.title = 'Hello World'; // should not pass
    post.text = 'this is a great post about hello world'; // should not pass
    post.rating = 3; // should not pass
    post.email = 'me@google.com'; // should not pass
    post.site = 'google.com'; // should not pass

    const mydate = new Date();
    mydate.setMonth(mydate.getMonth() + 19);

    post.effectiveDate = mydate;

    expect.hasAssertions();

    let error = false;
    const errors = await validate(post);
    if (errors.length > 0) {
      error = true;
      console.log('validation failed. errors: ', errors);
    } else {
      console.log('validation succeed');
    }
    expect(error).toBeFalsy();

    // validateOrReject(post).catch(errors => {
    //   console.log('Promise rejected (validation failed). Errors: ', errors);
    // });

    // validate(post).then(errors => {
    //   // errors is an array of validation errors
    //   if (errors.length > 0) {
    //     error = true;
    //     console.log('validation failed. errors: ', errors);
    //   } else {
    //     console.log('validation succeed');
    //   }
    //   console.log(`expecting ${error}`);
    //   expect(error).toBeFalsy();
    //   expect(error).toEqual(false);
    //   console.log(`how expecting ${error}`);
    // });

    // async function validateOrRejectExample(input) {
    //   try {
    //     await validateOrReject(input);
    //   } catch (errors) {
    //     console.log('Caught promise rejection (validation failed). Errors: ', errors);
    //   }
    // }
  });
});
