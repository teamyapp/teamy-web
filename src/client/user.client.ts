import { User } from '@core/entityv2/user';

export interface CreateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export interface UpdateUserInput {
    lastName: string;
    firstName: string;
    profileUrl?: string;
}

export class UserClient {
    getMe(): Promise<User> {
        // TODO: implement me
    }

    createUser(user: CreateUserInput): Promise<User> {
        // TODO: implement me
    }

    updateUser(userId: number, input: UpdateUserInput): Promise<User> {
        // TODO: implement me
    }
}
