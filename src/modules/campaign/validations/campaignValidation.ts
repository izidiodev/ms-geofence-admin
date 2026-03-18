import { CreateCampaignDTO, ItemCampaignInput, UpdateCampaignDTO } from '../models/campaign.js';

export class CampaignValidation {
  private static readonly NAME_MAX_LENGTH = 255;
  private static readonly TITLE_MAX_LENGTH = 255;
  private static readonly DESCRIPTION_MAX_LENGTH = 500;
  private static readonly CITY_UF_MAX_LENGTH = 255;
  private static readonly RADIUS_MIN = 1;
  private static readonly RADIUS_MAX = 100000;
  private static readonly LAT_MIN = -90;
  private static readonly LAT_MAX = 90;
  private static readonly LONG_MIN = -180;
  private static readonly LONG_MAX = 180;

  static validateCreateBase(data: {
    name: string;
    exp_date?: string;
    city_uf?: string;
  }): string[] {
    const errors: string[] = [];
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome é obrigatório');
    } else if (data.name.length > this.NAME_MAX_LENGTH) {
      errors.push(`Nome deve ter no máximo ${this.NAME_MAX_LENGTH} caracteres`);
    }
    if (data.exp_date === undefined || data.exp_date === null || String(data.exp_date).trim() === '') {
      errors.push('Data de expiração é obrigatória');
    } else {
      const parsed = new Date(data.exp_date);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('Data de expiração deve ser uma data válida');
      }
    }
    if (data.city_uf === undefined || data.city_uf === null || data.city_uf.trim().length === 0) {
      errors.push('Cidade/UF é obrigatório');
    } else if (data.city_uf.length > this.CITY_UF_MAX_LENGTH) {
      errors.push(`Cidade/UF deve ter no máximo ${this.CITY_UF_MAX_LENGTH} caracteres`);
    }
    return errors;
  }

  static validateItemInput(
    data: ItemCampaignInput,
    prefix: 'Enter' | 'Permanência' | 'Saída' | 'Item'
  ): string[] {
    const errors: string[] = [];
    if (!data.title || data.title.trim().length === 0) {
      errors.push(`${prefix}: título é obrigatório`);
    } else if (data.title.length > this.TITLE_MAX_LENGTH) {
      errors.push(`${prefix}: título deve ter no máximo ${this.TITLE_MAX_LENGTH} caracteres`);
    }
    if (data.description !== undefined && data.description.length > this.DESCRIPTION_MAX_LENGTH) {
      errors.push(`${prefix}: descrição deve ter no máximo ${this.DESCRIPTION_MAX_LENGTH} caracteres`);
    }
    if (!data.type_id || data.type_id.trim().length === 0) {
      errors.push(`${prefix}: type_id é obrigatório`);
    } else if (!this.isValidUUID(data.type_id)) {
      errors.push(`${prefix}: type_id deve ser um UUID válido`);
    }
    if (data.lat === undefined || data.lat === null) {
      errors.push(`${prefix}: lat é obrigatório`);
    } else if (Number.isNaN(Number(data.lat))) {
      errors.push(`${prefix}: lat deve ser um número`);
    } else {
      const lat = Number(data.lat);
      if (lat < this.LAT_MIN || lat > this.LAT_MAX) {
        errors.push(`${prefix}: latitude deve estar entre ${this.LAT_MIN} e ${this.LAT_MAX}`);
      }
    }
    if (data.long === undefined || data.long === null) {
      errors.push(`${prefix}: long é obrigatório`);
    } else if (Number.isNaN(Number(data.long))) {
      errors.push(`${prefix}: long deve ser um número`);
    } else {
      const long = Number(data.long);
      if (long < this.LONG_MIN || long > this.LONG_MAX) {
        errors.push(`${prefix}: longitude deve estar entre ${this.LONG_MIN} e ${this.LONG_MAX}`);
      }
    }
    if (data.radius === undefined || data.radius === null) {
      errors.push(`${prefix}: radius é obrigatório`);
    } else {
      const r = Number(data.radius);
      if (!Number.isInteger(r) || r < this.RADIUS_MIN || r > this.RADIUS_MAX) {
        errors.push(
          `${prefix}: radius deve ser um número inteiro entre ${this.RADIUS_MIN} e ${this.RADIUS_MAX}`
        );
      }
    }
    return errors;
  }

  static validateCreateCampaign(data: CreateCampaignDTO): string[] {
    const errors = [...this.validateCreateBase(data)];
    if (data.enabled !== undefined && typeof data.enabled !== 'boolean') {
      errors.push('enabled deve ser booleano');
    }
    return errors;
  }

  /** Body POST /campaigns/:id/items — um item (enter, dwell ou exit via type_id) */
  static validateCampaignItemBody(data: ItemCampaignInput): string[] {
    return this.validateItemInput(data, 'Item');
  }

  static validateUpdateItemPartial(
    data: Partial<ItemCampaignInput>,
    prefix: 'Enter' | 'Permanência' | 'Saída' | 'Item'
  ): string[] {
    const errors: string[] = [];
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        errors.push(`${prefix}: título não pode ser vazio`);
      } else if (data.title.length > this.TITLE_MAX_LENGTH) {
        errors.push(`${prefix}: título deve ter no máximo ${this.TITLE_MAX_LENGTH} caracteres`);
      }
    }
    if (data.description !== undefined && data.description.length > this.DESCRIPTION_MAX_LENGTH) {
      errors.push(`${prefix}: descrição deve ter no máximo ${this.DESCRIPTION_MAX_LENGTH} caracteres`);
    }
    if (data.type_id !== undefined && !this.isValidUUID(data.type_id)) {
      errors.push(`${prefix}: type_id deve ser um UUID válido`);
    }
    if (data.lat !== undefined) {
      if (Number.isNaN(Number(data.lat))) {
        errors.push(`${prefix}: lat deve ser um número`);
      } else {
        const lat = Number(data.lat);
        if (lat < this.LAT_MIN || lat > this.LAT_MAX) {
          errors.push(`${prefix}: latitude deve estar entre ${this.LAT_MIN} e ${this.LAT_MAX}`);
        }
      }
    }
    if (data.long !== undefined) {
      if (Number.isNaN(Number(data.long))) {
        errors.push(`${prefix}: long deve ser um número`);
      } else {
        const long = Number(data.long);
        if (long < this.LONG_MIN || long > this.LONG_MAX) {
          errors.push(`${prefix}: longitude deve estar entre ${this.LONG_MIN} e ${this.LONG_MAX}`);
        }
      }
    }
    if (data.radius !== undefined) {
      const r = Number(data.radius);
      if (!Number.isInteger(r) || r < this.RADIUS_MIN || r > this.RADIUS_MAX) {
        errors.push(
          `${prefix}: radius deve ser um número inteiro entre ${this.RADIUS_MIN} e ${this.RADIUS_MAX}`
        );
      }
    }
    return errors;
  }

  static validateUpdate(data: UpdateCampaignDTO): string[] {
    const errors: string[] = [];
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        errors.push('Nome não pode ser vazio');
      } else if (data.name.length > this.NAME_MAX_LENGTH) {
        errors.push(`Nome deve ter no máximo ${this.NAME_MAX_LENGTH} caracteres`);
      }
    }
    if (data.exp_date !== undefined && data.exp_date !== null && data.exp_date !== '') {
      const parsed = new Date(data.exp_date);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('Data de expiração deve ser uma data válida');
      }
    }
    if (data.city_uf !== undefined && data.city_uf.length > this.CITY_UF_MAX_LENGTH) {
      errors.push(`Cidade/UF deve ter no máximo ${this.CITY_UF_MAX_LENGTH} caracteres`);
    }
    if (data.enter) {
      errors.push(...this.validateUpdateItemPartial(data.enter, 'Enter'));
    }
    if (data.dwell) {
      errors.push(...this.validateUpdateItemPartial(data.dwell, 'Permanência'));
    }
    if (data.exit) {
      errors.push(...this.validateUpdateItemPartial(data.exit, 'Saída'));
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

  private static isValidUUID(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }
}
