import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class HashPassword {
  static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
