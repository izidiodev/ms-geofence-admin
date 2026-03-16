import {
  CreateCampaignDTO,
  CreateCampaignTripletDTO,
  UpdateCampaignDTO,
} from '../models/campaign.js';

export class CampaignValidation {
  private static readonly NAME_MAX_LENGTH = 255;
  private static readonly DESCRIPTION_MAX_LENGTH = 500;
  private static readonly CITY_UF_MAX_LENGTH = 255;
  private static readonly RADIUS_MIN = 1;
  private static readonly RADIUS_MAX = 100000;
  /** Latitude: -90 a 90 (e cabe em decimal 10,7 do banco) */
  private static readonly LAT_MIN = -90;
  private static readonly LAT_MAX = 90;
  /** Longitude: -180 a 180 (e cabe em decimal 10,7 do banco) */
  private static readonly LONG_MIN = -180;
  private static readonly LONG_MAX = 180;

  static validateCreate(data: CreateCampaignDTO): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Nome é obrigatório');
    } else if (data.name.length > this.NAME_MAX_LENGTH) {
      errors.push(`Nome deve ter no máximo ${this.NAME_MAX_LENGTH} caracteres`);
    }

    if (data.description !== undefined && data.description.length > this.DESCRIPTION_MAX_LENGTH) {
      errors.push(`Descrição deve ter no máximo ${this.DESCRIPTION_MAX_LENGTH} caracteres`);
    }

    if (data.exp_date !== undefined && data.exp_date !== null && data.exp_date !== '') {
      const parsed = new Date(data.exp_date);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('exp_date deve ser uma data válida');
      }
    }

    if (data.city_uf !== undefined && data.city_uf.length > this.CITY_UF_MAX_LENGTH) {
      errors.push(`Cidade/UF deve ter no máximo ${this.CITY_UF_MAX_LENGTH} caracteres`);
    }

    if (!data.type_id || data.type_id.trim().length === 0) {
      errors.push('type_id é obrigatório');
    } else if (!this.isValidUUID(data.type_id)) {
      errors.push('type_id deve ser um UUID válido');
    }

    if (data.lat === undefined || data.lat === null) {
      errors.push('lat é obrigatório');
    } else if (Number.isNaN(Number(data.lat))) {
      errors.push('lat deve ser um número');
    } else {
      const lat = Number(data.lat);
      if (lat < this.LAT_MIN || lat > this.LAT_MAX) {
        errors.push(`Latitude deve estar entre ${this.LAT_MIN} e ${this.LAT_MAX}`);
      }
    }

    if (data.long === undefined || data.long === null) {
      errors.push('long é obrigatório');
    } else if (Number.isNaN(Number(data.long))) {
      errors.push('long deve ser um número');
    } else {
      const long = Number(data.long);
      if (long < this.LONG_MIN || long > this.LONG_MAX) {
        errors.push(`Longitude deve estar entre ${this.LONG_MIN} e ${this.LONG_MAX}`);
      }
    }

    if (data.radius === undefined || data.radius === null) {
      errors.push('radius é obrigatório');
    } else {
      const r = Number(data.radius);
      if (!Number.isInteger(r) || r < this.RADIUS_MIN || r > this.RADIUS_MAX) {
        errors.push(`radius deve ser um número inteiro entre ${this.RADIUS_MIN} e ${this.RADIUS_MAX}`);
      }
    }

    return errors;
  }

  static validateCreateTriplet(data: CreateCampaignTripletDTO): string[] {
    const errors: string[] = [];
    const enterErrors = this.validateCreate(data.enter);
    const dwellErrors = this.validateCreate(data.dwell);
    const exitErrors = this.validateCreate(data.exit);
    enterErrors.forEach((e) => errors.push(`Enter: ${e}`));
    dwellErrors.forEach((e) => errors.push(`Permanência: ${e}`));
    exitErrors.forEach((e) => errors.push(`Saída: ${e}`));
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

    if (data.description !== undefined && data.description.length > this.DESCRIPTION_MAX_LENGTH) {
      errors.push(`Descrição deve ter no máximo ${this.DESCRIPTION_MAX_LENGTH} caracteres`);
    }

    if (data.exp_date !== undefined && data.exp_date !== null && data.exp_date !== '') {
      const parsed = new Date(data.exp_date);
      if (Number.isNaN(parsed.getTime())) {
        errors.push('exp_date deve ser uma data válida');
      }
    }

    if (data.city_uf !== undefined && data.city_uf.length > this.CITY_UF_MAX_LENGTH) {
      errors.push(`Cidade/UF deve ter no máximo ${this.CITY_UF_MAX_LENGTH} caracteres`);
    }

    if (data.type_id !== undefined && !this.isValidUUID(data.type_id)) {
      errors.push('type_id deve ser um UUID válido');
    }

    if (data.lat !== undefined) {
      if (Number.isNaN(Number(data.lat))) {
        errors.push('lat deve ser um número');
      } else {
        const lat = Number(data.lat);
        if (lat < this.LAT_MIN || lat > this.LAT_MAX) {
          errors.push(`Latitude deve estar entre ${this.LAT_MIN} e ${this.LAT_MAX}`);
        }
      }
    }

    if (data.long !== undefined) {
      if (Number.isNaN(Number(data.long))) {
        errors.push('long deve ser um número');
      } else {
        const long = Number(data.long);
        if (long < this.LONG_MIN || long > this.LONG_MAX) {
          errors.push(`Longitude deve estar entre ${this.LONG_MIN} e ${this.LONG_MAX}`);
        }
      }
    }

    if (data.radius !== undefined) {
      const r = Number(data.radius);
      if (!Number.isInteger(r) || r < this.RADIUS_MIN || r > this.RADIUS_MAX) {
        errors.push(`radius deve ser um número inteiro entre ${this.RADIUS_MIN} e ${this.RADIUS_MAX}`);
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
}
