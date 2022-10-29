//INTERFACE
export interface UserInterface {
    fullname: string;
    username: string;
    email: string;
    password: string;
    emailToken: string;
    isVerified: boolean;
    isAdmin: boolean;
    reports: number;
    isBlocked: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
