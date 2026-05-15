import { BadRequestException } from '@nestjs/common';

export type UserGenderInput = 'male' | 'female' | '1' | '2';
export type SquadGender = '1' | '2';

const SQUAD_GENDER_MAP: Record<string, SquadGender> = {
  male: '1',
  '1': '1',
  female: '2',
  '2': '2',
};

export function toSquadGender(gender: string): SquadGender {
  const normalized = gender.trim().toLowerCase();
  const squadGender = SQUAD_GENDER_MAP[normalized];

  if (!squadGender) {
    throw new BadRequestException(`Unrecognised gender value '${gender}'`);
  }

  return squadGender;
}
