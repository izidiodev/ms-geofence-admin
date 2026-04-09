import { CreateCampaignDTO, ItemCampaignInput, UpdateCampaignDTO } from '../models/campaign.js';

export class CampaignValidation {
  private static readonly NAME_MAX_LENGTH = 255;
  private static readonly TITLE_MAX_LENGTH = 255;
  private static readonly DESCRIPTION_MAX_LENGTH = 500;
  private static readonly CITY_MAX_LENGTH = 255;
  private static readonly UF_MAX_LENGTH = 10;
  private static readonly RADIUS_MIN = 1;
  private static readonly RADIUS_MAX = 100000;
  private static readonly LAT_MIN = -90;
  private static readonly LAT_MAX = 90;
  private static readonly LONG_MIN = -180;
  private static readonly LONG_MAX = 180;

  static validateCreateBase(data: {
    name: string;
    exp_date?: string;
    city?: string;
    uf?: string;
    lat?: number;
    long?: number;
    radius?: number;
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
    if (data.city === undefined || data.city === null || data.city.trim().length === 0) {
      errors.push('Cidade é obrigatória');
    } else if (data.city.length > this.CITY_MAX_LENGTH) {
      errors.push(`Cidade deve ter no máximo ${this.CITY_MAX_LENGTH} caracteres`);
    }
    if (data.uf === undefined || data.uf === null || data.uf.trim().length === 0) {
      errors.push('UF é obrigatória');
    } else if (data.uf.trim().length > this.UF_MAX_LENGTH) {
      errors.push(`UF deve ter no máximo ${this.UF_MAX_LENGTH} caracteres`);
    }
    errors.push(...this.validateLatLongPair(data.lat, data.long, ''));
    if (data.radius === undefined || data.radius === null) {
      errors.push('radius é obrigatório');
    } else {
      const r = Number(data.radius);
      if (!Number.isInteger(r) || r < this.RADIUS_MIN || r > this.RADIUS_MAX) {
        errors.push(
          `radius deve ser um número inteiro entre ${this.RADIUS_MIN} e ${this.RADIUS_MAX}`
        );
      }
    }
    return errors;
  }

  /** lat/long do cabeçalho da campanha (obrigatórios no create; prefix vazio = mensagens sem prefixo). */
  private static validateLatLongPair(
    lat: unknown,
    long: unknown,
    prefix: string
  ): string[] {
    const errors: string[] = [];
    const p = prefix ? `${prefix}: ` : '';
    if (lat === undefined || lat === null) {
      errors.push(`${p}lat é obrigatório`);
    } else if (Number.isNaN(Number(lat))) {
      errors.push(`${p}lat deve ser um número`);
    } else {
      const n = Number(lat);
      if (n < this.LAT_MIN || n > this.LAT_MAX) {
        errors.push(`${p}latitude deve estar entre ${this.LAT_MIN} e ${this.LAT_MAX}`);
      }
    }
    if (long === undefined || long === null) {
      errors.push(`${p}long é obrigatório`);
    } else if (Number.isNaN(Number(long))) {
      errors.push(`${p}long deve ser um número`);
    } else {
      const n = Number(long);
      if (n < this.LONG_MIN || n > this.LONG_MAX) {
        errors.push(`${p}longitude deve estar entre ${this.LONG_MIN} e ${this.LONG_MAX}`);
      }
    }
    return errors;
  }

  /** GET /campaigns/available: filtro geográfico exige city e uf juntos na query. */
  static validateAvailableLocationQuery(cityRaw: unknown, ufRaw: unknown): string | null {
    const city = cityRaw === undefined || cityRaw === null ? '' : String(cityRaw).trim();
    const uf = ufRaw === undefined || ufRaw === null ? '' : String(ufRaw).trim();
    const hasCity = city.length > 0;
    const hasUf = uf.length > 0;
    if (hasCity === hasUf) {
      return null;
    }
    return 'Para filtrar por localização, informe os query params city e uf juntos';
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
    if (data.city !== undefined) {
      if (data.city.trim().length === 0) {
        errors.push('Cidade não pode ser vazia');
      } else if (data.city.length > this.CITY_MAX_LENGTH) {
        errors.push(`Cidade deve ter no máximo ${this.CITY_MAX_LENGTH} caracteres`);
      }
    }
    if (data.uf !== undefined) {
      if (data.uf.trim().length === 0) {
        errors.push('UF não pode ser vazia');
      } else if (data.uf.length > this.UF_MAX_LENGTH) {
        errors.push(`UF deve ter no máximo ${this.UF_MAX_LENGTH} caracteres`);
      }
    }
    if (data.lat !== undefined) {
      if (Number.isNaN(Number(data.lat))) {
        errors.push('lat deve ser um número');
      } else {
        const n = Number(data.lat);
        if (n < this.LAT_MIN || n > this.LAT_MAX) {
          errors.push(`latitude deve estar entre ${this.LAT_MIN} e ${this.LAT_MAX}`);
        }
      }
    }
    if (data.long !== undefined) {
      if (Number.isNaN(Number(data.long))) {
        errors.push('long deve ser um número');
      } else {
        const n = Number(data.long);
        if (n < this.LONG_MIN || n > this.LONG_MAX) {
          errors.push(`longitude deve estar entre ${this.LONG_MIN} e ${this.LONG_MAX}`);
        }
      }
    }
    if (data.radius !== undefined) {
      const r = Number(data.radius);
      if (!Number.isInteger(r) || r < this.RADIUS_MIN || r > this.RADIUS_MAX) {
        errors.push(
          `radius deve ser um número inteiro entre ${this.RADIUS_MIN} e ${this.RADIUS_MAX}`
        );
      }
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
