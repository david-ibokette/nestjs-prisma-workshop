import {
  validate,
  IsDate,
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { faker } from '@faker-js/faker';

export function BetweenMonths(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
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
  return function (object: any, propertyName: string) {
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

class Dates {
  constructor(eff: Date, exp: Date) {
    this.effectiveDate = eff;
    this.expirationDate = exp;
  }
  @IsDate()
  @BetweenMonths(-12, 12, { message: 'Date must be within a year of today' })
  effectiveDate: Date;
  @IsDate()
  @BetweenMonths(-12, 12, { message: 'Date must be within a year of today' })
  expirationDate: Date;
}

class SmartDates {
  constructor(eff: Date, exp: Date) {
    this.effectiveDate = eff;
    this.expirationDate = exp;
  }
  @IsDate()
  @BetweenMonthsAndOtherIsAfter(-12, 12, 'expirationDate', {
    message: 'Date must be within a year of today and exp is after',
  })
  effectiveDate: Date;
  @IsDate()
  expirationDate: Date;
}

describe('Validate Dates', () => {
  describe('Just Months', () => {
    it('In nine months is good', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() + 9);
      const exp = new Date(eff);

      const dates = new Dates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeFalsy();
    });

    it('In nineteen months is bad', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() + 19);
      const exp = new Date(eff);

      const dates = new Dates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeTruthy();
    });

    it('nine months ago is good', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() - 9);
      const exp = new Date(eff);

      const dates = new Dates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeFalsy();
    });

    it('nineteen months ago is bad', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() - 19);
      const exp = new Date(eff);

      const dates = new Dates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeTruthy();
    });

    it('remove', async () => {
      const x = faker.string.uuid();
      console.log(x);
      const inFiveYears = new Date();
      inFiveYears.setFullYear(inFiveYears.getFullYear() + 5);
      const d = faker.date.future({ refDate: inFiveYears });
      console.log(d);
    });
  });

  describe('Smarter Validate', () => {
    it('In nine months is good', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() + 9);
      const exp = new Date(eff);
      exp.setMonth(eff.getMonth() + 6);

      const dates = new SmartDates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeFalsy();
    });

    it('In nineteen months is bad', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() + 19);
      const exp = new Date(eff);
      exp.setMonth(eff.getMonth() + 6);

      const dates = new SmartDates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeTruthy();
    });

    it('nine months ago is good', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() - 9);
      const exp = new Date(eff);
      exp.setMonth(eff.getMonth() + 6);

      const dates = new SmartDates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeFalsy();
    });

    it('nineteen months ago is bad', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() - 19);
      const exp = new Date(eff);
      exp.setMonth(eff.getMonth() + 6);

      const dates = new SmartDates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeTruthy();
    });

    it('exp b4 eff is bad', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() + 9);
      const exp = new Date(eff);
      exp.setMonth(eff.getMonth() - 6);

      const dates = new SmartDates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeTruthy();
    });

    it('far future exp is bad', async () => {
      const eff = new Date();
      eff.setMonth(eff.getMonth() + 9);
      const exp = new Date(eff);
      exp.setFullYear(exp.getFullYear() + 1000);
      exp.setMonth(eff.getMonth() + 6);

      const dates = new SmartDates(eff, exp);

      const errors = await validate(dates);
      expect(errors?.length).toBeTruthy();
    });
  });
});
