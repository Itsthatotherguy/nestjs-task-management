import {
    ConflictException,
    InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcryptjs';

const mockCredentialsDto: AuthCredentialsDto = {
    username: 'TestUsername',
    password: 'TestPassword',
};

describe('UserRepository', () => {
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [UserRepository],
        }).compile();

        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('signup', () => {
        let save;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({ save });
        });

        it('Successfully signs up the user', async () => {
            save = jest.fn().mockResolvedValue(undefined);
            userRepository.create = jest.fn().mockReturnValue({ save });

            await expect(
                userRepository.signUp(mockCredentialsDto),
            ).resolves.not.toThrow();
        });

        it('throws a conflict exception as username already exists', async () => {
            save.mockRejectedValue({ code: '23505' });
            await expect(
                userRepository.signUp(mockCredentialsDto),
            ).rejects.toThrow(ConflictException);
        });

        it('throws a conflict exception as username already exists', async () => {
            save.mockRejectedValue({ code: '23505' });
            await expect(
                userRepository.signUp(mockCredentialsDto),
            ).rejects.toThrow(ConflictException);
        });

        it('throws an internal server exception for other rejected promise', async () => {
            save.mockRejectedValue(false);
            await expect(
                userRepository.signUp(mockCredentialsDto),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('validateUserPassword', () => {
        let user;

        beforeEach(() => {
            userRepository.findOne = jest.fn();

            user = new User();
            user.username = 'TestUser';
            user.validatePassword = jest.fn();
        });

        it('returns the username as validation is successful', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(true);

            const result = await userRepository.validateUserPassword(
                mockCredentialsDto,
            );

            expect(result).toEqual('TestUser');
        });

        it('returns null as user cannot be found', async () => {
            userRepository.findOne.mockResolvedValue(null);

            const result = await userRepository.validateUserPassword(
                mockCredentialsDto,
            );

            expect(user.validatePassword).not.toHaveBeenCalled();

            expect(result).toBeNull();
        });

        it('returns null as password is invalid', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(false);

            const result = await userRepository.validateUserPassword(
                mockCredentialsDto,
            );

            expect(result).toBeNull();
        });
    });

    describe('hashPassword', () => {
        it('call bcrypt.hash to generate a hash', async () => {
            // @ts-ignore
            bcrypt.hash = jest.fn().mockResolvedValue('testHash');
            expect(bcrypt.hash).not.toHaveBeenCalled();

            const result = await userRepository.hashPassword(
                'testPassword',
                'testSalt',
            );

            expect(bcrypt.hash).toHaveBeenCalledWith(
                'testPassword',
                'testSalt',
            );
            expect(result).toEqual('testHash');
        });
    });
});
