import { LoginDTO } from '../models/auth.js';

export class AuthValidation {
  private static readonly EMAIL_MAX_LENGTH = 255;
  private static readonly PASSWORD_MIN_LENGTH = 6;
  private static readonly PASSWORD_MAX_LENGTH = 255;

  static validateLogin(data: LoginDTO): string[] {
    const errors: string[] = [];

    if (!data.email || data.email.trim().length === 0) {
      errors.push('E-mail é obrigatório');
    } else if (data.email.length > this.EMAIL_MAX_LENGTH) {
      errors.push(`E-mail deve ter no máximo ${this.EMAIL_MAX_LENGTH} caracteres`);
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Formato de e-mail inválido');
    }

    if (!data.password || data.password.length === 0) {
      errors.push('Senha é obrigatória');
    } else if (data.password.length < this.PASSWORD_MIN_LENGTH) {
      errors.push(`Senha deve ter no mínimo ${this.PASSWORD_MIN_LENGTH} caracteres`);
    } else if (data.password.length > this.PASSWORD_MAX_LENGTH) {
      errors.push(`Senha deve ter no máximo ${this.PASSWORD_MAX_LENGTH} caracteres`);
    }

    return errors;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
