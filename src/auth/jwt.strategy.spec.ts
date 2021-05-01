import { JwtStrategy } from './jwt.strategy';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { JwtPayload } from './jwt-payload.interface';
import { UnauthorizedException } from '@nestjs/common';
import { User } from './user.entity';

const mockUserRepository = () => ({
    findOne: jest.fn(),
});

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: UserRepository, useFactory: mockUserRepository },
            ],
        }).compile();

        jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('validate', () => {
        it('returns user as the correct payload is provided', async () => {
            const user = new User();
            user.username = 'testUsername';

            userRepository.findOne.mockResolvedValue(user);
            expect(userRepository.findOne).not.toHaveBeenCalled();

            const payload: JwtPayload = { username: user.username };

            const result = await jwtStrategy.validate(payload);

            expect(userRepository.findOne).toHaveBeenCalledWith(payload);
            expect(result).toEqual(user);
        });

        it('throws unauthorized exception as user cannot be found from payload', async () => {
            userRepository.findOne.mockResolvedValue(null);
            expect(userRepository.findOne).not.toHaveBeenCalled();

            const payload: JwtPayload = { username: 'testUsername' };

            await expect(jwtStrategy.validate(payload)).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });
});
