import { CampaignValidation } from '@campaign/validations/campaignValidation.js';

const validTypeId = 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d';

describe('CampaignValidation', () => {
  describe('validateCreate', () => {
    it('should return error when name is empty', () => {
      const errors = CampaignValidation.validateCreate({
        name: '',
        type_id: validTypeId,
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('Nome é obrigatório');
    });

    it('should return error when type_id is missing', () => {
      const errors = CampaignValidation.validateCreate({
        name: 'Campaign',
        type_id: '',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('type_id é obrigatório');
    });

    it('should return error when type_id is invalid UUID', () => {
      const errors = CampaignValidation.validateCreate({
        name: 'Campaign',
        type_id: 'not-a-uuid',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('type_id deve ser um UUID válido');
    });

    it('should return error when lat is not a number', () => {
      const errors = CampaignValidation.validateCreate({
        name: 'Campaign',
        type_id: validTypeId,
        lat: 'invalid' as unknown as number,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('lat deve ser um número');
    });

    it('should return error when radius is out of range', () => {
      const errors = CampaignValidation.validateCreate({
        name: 'Campaign',
        type_id: validTypeId,
        lat: -23.55,
        long: -46.63,
        radius: 0,
      });
      expect(errors).toContain('radius deve ser um número inteiro entre 1 e 100000');
    });

    it('should return error when exp_date is invalid', () => {
      const errors = CampaignValidation.validateCreate({
        name: 'Campaign',
        type_id: validTypeId,
        lat: -23.55,
        long: -46.63,
        radius: 500,
        exp_date: 'not-a-date',
      });
      expect(errors).toContain('exp_date deve ser uma data válida');
    });

    it('should return empty array when data is valid', () => {
      const errors = CampaignValidation.validateCreate({
        name: 'Summer Campaign',
        type_id: validTypeId,
        lat: -23.5505,
        long: -46.6333,
        radius: 1000,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateUpdate', () => {
    it('should return error when name is empty', () => {
      const errors = CampaignValidation.validateUpdate({ name: '   ' });
      expect(errors).toContain('Nome não pode ser vazio');
    });

    it('should return error when type_id is invalid', () => {
      const errors = CampaignValidation.validateUpdate({
        type_id: 'invalid',
      });
      expect(errors).toContain('type_id deve ser um UUID válido');
    });

    it('should return empty array when data is valid', () => {
      const errors = CampaignValidation.validateUpdate({
        name: 'Updated Name',
        enabled: false,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateUUID', () => {
    it('should return null for valid UUID', () => {
      expect(CampaignValidation.validateUUID(validTypeId)).toBeNull();
    });

    it('should return error for invalid UUID', () => {
      expect(CampaignValidation.validateUUID('not-a-uuid')).toBe(
        'ID deve ser um UUID válido'
      );
    });

    it('should return error for empty id', () => {
      expect(CampaignValidation.validateUUID('')).toBe('ID é obrigatório');
    });
  });
});
