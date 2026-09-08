import React from 'react';
import {ArtPho, ArtMoneyShrink, ArtPrinter, ArtZimbabwe} from './scenes1';
import {ArtChips, ArtQualityDown, ArtSalary, ArtBrake} from './scenes2';
import {ArtWinners, ArtShield, ArtOutro} from './scenes3';

export const ART: Record<string, React.FC> = {
  pho: ArtPho,
  'money-shrink': ArtMoneyShrink,
  printer: ArtPrinter,
  zimbabwe: ArtZimbabwe,
  chips: ArtChips,
  'quality-down': ArtQualityDown,
  salary: ArtSalary,
  brake: ArtBrake,
  winners: ArtWinners,
  shield: ArtShield,
  outro: ArtOutro,
};
