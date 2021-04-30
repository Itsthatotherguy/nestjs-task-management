import { Test } from '@nestjs/testing';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { UserRepository } from './user.repository';

const mockCredentialsDto: AuthCredentialsDto = {
    username: 'TestUsername',
    password: 'TestPassword',
};

describe('UserRepository', () => {
    let userRepository: UserRepository;

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

        it('successfully signs up user', async () => {
            save.mockResolvedValue(undefined);
            expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
        });

        it('', () => {});

        it('', () => {});
    });
});
