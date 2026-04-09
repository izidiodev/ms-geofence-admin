import { CampaignValidation } from '@campaign/validations/campaignValidation.js';

const validTypeId = 'a1b2c3d4-e5f6-4a0b-8c1d-2e3f4a5b6c7d';

const validItem = {
  title: 'Título',
  type_id: validTypeId,
};

describe('CampaignValidation', () => {
  describe('validateCreateCampaign', () => {
    it('should return error when campaign name is empty', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: '',
        exp_date: '2026-12-31',
        city: 'São Paulo',
        uf: 'SP',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('Nome é obrigatório');
    });

    it('should return error when exp_date is missing', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: 'Campanha',
        city: 'São Paulo',
        uf: 'SP',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('Data de expiração é obrigatória');
    });

    it('should return error when exp_date is invalid', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: 'Campanha',
        exp_date: 'not-a-date',
        city: 'São Paulo',
        uf: 'SP',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('Data de expiração deve ser uma data válida');
    });

    it('should return error when city is missing', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: 'Campanha',
        exp_date: '2026-12-31',
        uf: 'SP',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('Cidade é obrigatória');
    });

    it('should return error when uf is missing', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: 'Campanha',
        exp_date: '2026-12-31',
        city: 'São Paulo',
        lat: -23.55,
        long: -46.63,
        radius: 500,
      });
      expect(errors).toContain('UF é obrigatória');
    });

    it('should return error when radius is missing', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: 'Campanha',
        exp_date: '2026-12-31',
        city: 'São Paulo',
        uf: 'SP',
        lat: -23.55,
        long: -46.63,
      });
      expect(errors).toContain('radius é obrigatório');
    });

    it('should return error when enabled is not boolean', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: 'Campanha',
        exp_date: '2026-12-31',
        city: 'São Paulo',
        uf: 'SP',
        lat: -23.55,
        long: -46.63,
        radius: 500,
        enabled: 'sim' as unknown as boolean,
      });
      expect(errors).toContain('enabled deve ser booleano');
    });

    it('should return empty array when data is valid', () => {
      const errors = CampaignValidation.validateCreateCampaign({
        name: 'Summer Campaign',
        exp_date: '2026-12-31',
        city: 'São Paulo',
        uf: 'SP',
        lat: -23.55,
        long: -46.63,
        radius: 500,
        enabled: true,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateCampaignItemBody', () => {
    it('should return error when title is empty', () => {
      const errors = CampaignValidation.validateCampaignItemBody({
        ...validItem,
        title: '',
      });
      expect(errors.some((e) => e.includes('Item') && e.includes('título'))).toBe(true);
    });

    it('should return empty array when item is valid', () => {
      const errors = CampaignValidation.validateCampaignItemBody(validItem);
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateUpdate', () => {
    it('should return error when name is empty', () => {
      const errors = CampaignValidation.validateUpdate({ name: '   ' });
      expect(errors).toContain('Nome não pode ser vazio');
    });

    it('should return error when enter has invalid type_id', () => {
      const errors = CampaignValidation.validateUpdate({
        enter: { type_id: 'invalid' },
      });
      expect(errors.some((e) => e.includes('Enter') && e.includes('type_id'))).toBe(true);
    });

    it('should return empty array when data is valid', () => {
      const errors = CampaignValidation.validateUpdate({
        name: 'Updated Name',
        enabled: false,
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateAvailableLocationQuery', () => {
    it('should return null when both city and uf are absent or empty', () => {
      expect(CampaignValidation.validateAvailableLocationQuery(undefined, undefined)).toBeNull();
      expect(CampaignValidation.validateAvailableLocationQuery('', '')).toBeNull();
    });

    it('should return null when both city and uf are provided', () => {
      expect(CampaignValidation.validateAvailableLocationQuery('Barreiras', 'BA')).toBeNull();
    });

    it('should return error when only one of city or uf is provided', () => {
      expect(CampaignValidation.validateAvailableLocationQuery('Barreiras', undefined)).not.toBeNull();
      expect(CampaignValidation.validateAvailableLocationQuery(undefined, 'BA')).not.toBeNull();
    });
  });

  describe('validateUUID', () => {
    it('should return null for valid UUID', () => {
      expect(CampaignValidation.validateUUID(validTypeId)).toBeNull();
    });

    it('should return message for invalid UUID', () => {
      expect(CampaignValidation.validateUUID('x')).not.toBeNull();
    });
  });
});
