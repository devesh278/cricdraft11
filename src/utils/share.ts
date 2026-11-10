/**
 * Canvas Shareable Image Generator for CricDraft 11
 */

import { DraftedPick, MatchMinimalResult, TournamentUserMVP, DifficultyLevel } from '../types/game';

interface ShareCardData {
  picks: DraftedPick[];
  matchesWon: number;
  totalMatches: number;
  isChampion: boolean;
  mvp: TournamentUserMVP;
  difficulty: DifficultyLevel;
  mode: string;
}

export async function generateShareCardCanvas(data: ShareCardData): Promise<string> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  if (data.isChampion) {
    bgGrad.addColorStop(0, '#062d1f');
    bgGrad.addColorStop(0.5, '#0a192f');
    bgGrad.addColorStop(1, '#020617');
  } else {
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Border frame
  ctx.strokeStyle = data.isChampion ? 'rgba(52, 211, 153, 0.4)' : 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Brand Header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Space Grotesk", sans-serif';
  ctx.fillText('CRICDRAFT 11', 60, 85);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.fillText('WORLD CUP CRICKET DRAFT RUN', 60, 115);

  // Result Badge
  const resultText = data.isChampion ? 'WORLD CUP CHAMPIONS' : `${data.matchesWon} / 7 WINS`;
  ctx.fillStyle = data.isChampion ? '#10b981' : '#f59e0b';
  ctx.font = '900 48px "Space Grotesk", sans-serif';
  ctx.fillText(resultText, 60, 190);

  // Difficulty & Mode tags
  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Difficulty: ${data.difficulty.toUpperCase()}  |  Mode: ${data.mode.toUpperCase()}`, 60, 225);

  // Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(60, 250);
  ctx.lineTo(width - 60, 250);
  ctx.stroke();

  // LEFT COLUMN: User's XI Players List
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 22px "Space Grotesk", sans-serif';
  ctx.fillText('YOUR DRAFTED XI', 60, 290);

  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  data.picks.forEach((pick, i) => {
    const col = i < 6 ? 60 : 360;
    const row = 325 + (i % 6) * 44;

    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`${i + 1}.`, col, row);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(pick.player.name, col + 30, row);

    ctx.fillStyle = '#6ee7b7';
    ctx.font = '600 14px "Space Grotesk", monospace';
    const oop = pick.isOutOfPosition ? '~' : '';
    ctx.fillText(`${oop}${pick.effectiveRating} (${pick.country} '${String(pick.year).slice(2)})`, col + 180, row);
  });

  // RIGHT COLUMN: Tournament MVPs
  const rightX = 700;

  // MVP Box Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(rightX, 280, 440, 270);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.strokeRect(rightX, 280, 440, 270);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 20px "Space Grotesk", sans-serif';
  ctx.fillText('TOURNAMENT XI MVPs', rightX + 30, 320);

  // Top Batter
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TOP RUN SCORER', rightX + 30, 360);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Space Grotesk", sans-serif';
  ctx.fillText(data.mvp.topBatter.name, rightX + 30, 395);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 22px "Space Grotesk", monospace';
  ctx.fillText(`${data.mvp.topBatter.runs} RUNS (${data.mvp.topBatter.year})`, rightX + 30, 425);

  // Top Bowler
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TOP WICKET TAKER', rightX + 30, 475);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Space Grotesk", sans-serif';
  ctx.fillText(data.mvp.topBowler.name, rightX + 30, 510);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 22px "Space Grotesk", monospace';
  ctx.fillText(`${data.mvp.topBowler.wickets} WICKETS (${data.mvp.topBowler.year})`, rightX + 30, 540);

  // Footer URL
  ctx.fillStyle = '#64748b';
  ctx.font = '14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Play at: CricDraft 11', 60, 595);

  return canvas.toDataURL('image/png');
}
