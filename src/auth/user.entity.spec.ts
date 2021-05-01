import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserEntity', () => {
    describe('validatePassword', () => {
        let user: User;

        beforeEach(() => {
            user = new User();
            user.password = 'testPassword';
            user.salt = 'testSalt';
            (bcrypt as any).hash = jest.fn();
        });

        it('returns true as password is valid', async () => {
            (bcrypt as any).hash.mockResolvedValue('testPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();

            const result = await user.validatePassword('123456');

            expect(bcrypt.hash).toHaveBeenCalledWith('123456', user.salt);
            expect(result).toEqual(true);
        });

        it('returns false as password is invalid', async () => {
            (bcrypt as any).hash.mockResolvedValue('wrongPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();

            const result = await user.validatePassword('wrongPassword');

            expect(bcrypt.hash).toHaveBeenCalledWith(
                'wrongPassword',
                user.salt,
            );
            expect(result).toEqual(false);
        });
    });
});
