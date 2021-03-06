import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import BN from 'bn.js';

@ValidatorConstraint()
export class PositiveBNStringValidator implements ValidatorConstraintInterface {
    validate(text: string) {
        try {
            const bn = new BN(text);
            return bn.gt(new BN(0));
        } catch (e) {
            return false;
        }
    }
}
