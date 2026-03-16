import { CreateUserDTO, UpdateUserDTO } from '../models/user.js';

export class UserValidation {
  private static readonly NAME_MAX_LENGTH = 255;
  private static readonly EMAIL_MAX_LENGTH = 255;
  private static readonly PASSWORD_MIN_LENGTH = 6;
  private static readonly PASSWORD_MAX_LENGTH = 255;

  static validateCreate(data: CreateUserDTO): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome é obrigatório');
    } else if (data.name.length > this.NAME_MAX_LENGTH) {
      errors.push(`Nome deve ter no máximo ${this.NAME_MAX_LENGTH} caracteres`);
    }

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

  static validateUpdate(data: UpdateUserDTO): string[] {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        errors.push('Nome não pode ser vazio');
      } else if (data.name.length > this.NAME_MAX_LENGTH) {
        errors.push(`Nome deve ter no máximo ${this.NAME_MAX_LENGTH} caracteres`);
      }
    }

    if (data.email !== undefined) {
      if (data.email.length > this.EMAIL_MAX_LENGTH) {
        errors.push(`E-mail deve ter no máximo ${this.EMAIL_MAX_LENGTH} caracteres`);
      } else if (!this.isValidEmail(data.email)) {
        errors.push('Formato de e-mail inválido');
      }
    }

    if (data.password !== undefined) {
      if (data.password.length < this.PASSWORD_MIN_LENGTH) {
        errors.push(`Senha deve ter no mínimo ${this.PASSWORD_MIN_LENGTH} caracteres`);
      } else if (data.password.length > this.PASSWORD_MAX_LENGTH) {
        errors.push(`Senha deve ter no máximo ${this.PASSWORD_MAX_LENGTH} caracteres`);
      }
    }

    return errors;
  }

  static validateUUID(id: string): string | null {
    if (!id || id.trim().length === 0) {
      return 'ID é obrigatório';
    }
    if (!this.isValidUUID(id)) {
      return 'ID deve ser um UUID válido';
    }
    return null;
  }

  /**
   * Valida se o valor é um UUID conforme RFC 4122:
   * tipo string e formato 8-4-4-4-12 hex, com versão (1-5) e variante (8,9,a,b).
   */
  private static isValidUUID(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
