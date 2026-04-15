// AI-GENERATED
// Before hook: validatePayload — chạy trước khi service xử lý request
// Validate dữ liệu đầu vào theo schema, throw BadRequestException nếu không hợp lệ

import { BadRequestException } from '@nestjs/common';

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

export function validatePayload(
  payload: Record<string, unknown>,
  rules: ValidationRule[],
): void {
  const errors: { field: string; message: string }[] = [];

  for (const rule of rules) {
    const value = payload[rule.field];

    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push({ field: rule.field, message: rule.message ?? `${rule.field} là bắt buộc` });
      continue;
    }

    if (value !== undefined && value !== null) {
      const str = String(value);
      if (rule.minLength && str.length < rule.minLength) {
        errors.push({ field: rule.field, message: rule.message ?? `${rule.field} tối thiểu ${rule.minLength} ký tự` });
      }
      if (rule.maxLength && str.length > rule.maxLength) {
        errors.push({ field: rule.field, message: rule.message ?? `${rule.field} tối đa ${rule.maxLength} ký tự` });
      }
      if (rule.pattern && !rule.pattern.test(str)) {
        errors.push({ field: rule.field, message: rule.message ?? `${rule.field} không đúng định dạng` });
      }
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException({ message: 'Dữ liệu không hợp lệ', errors });
  }
}
