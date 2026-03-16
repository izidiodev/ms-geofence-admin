import { UserValidation } from '@user/validations/userValidation.js';

describe('UserValidation', () => {
  describe('validateCreate', () => {
    it('should return errors when name is empty', () => {
      const errors = UserValidation.validateCreate({
        name: '',
        email: 'a@b.com',
        password: '123456',
      });
      expect(errors).toContain('Nome é obrigatório');
    });

    it('should return errors when email is invalid', () => {
      const errors = UserValidation.validateCreate({
        name: 'John',
        email: 'invalid',
        password: '123456',
      });
      expect(errors).toContain('Formato de e-mail inválido');
    });

    it('should return errors when password is too short', () => {
      const errors = UserValidation.validateCreate({
        name: 'John',
        email: 'a@b.com',
        password: '12345',
      });
      expect(errors).toContain('Senha deve ter no mínimo 6 caracteres');
    });

    it('should return empty array when data is valid', () => {
      const errors = UserValidation.validateCreate({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateUUID', () => {
    it('should return null for valid UUID', () => {
      expect(
        UserValidation.validateUUID('a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d')
      ).toBeNull();
    });

    it('should return error for invalid UUID', () => {
      expect(UserValidation.validateUUID('not-a-uuid')).not.toBeNull();
    });
  });
});
