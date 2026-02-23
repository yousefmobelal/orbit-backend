import { getUserNarratives, getLatestNarrative } from '@/services/narrative.service';
import { asyncHandler } from '@/utils/async-handler';
import { ResponseStatus } from '@/types/response';
import { NarrativeResponse } from '@/types/narrative';
import type { Request, Response } from 'express';

/**
 * Get all narratives for the authenticated user (Cosmic Log)
 * @route GET /api/narratives
 * @access Private
 */
export const getNarratives = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

  const narratives: NarrativeResponse[] = await getUserNarratives(userId, limit);

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    results: narratives.length,
    data: narratives,
  });
});

/**
 * Get latest narrative for the authenticated user
 * @route GET /api/narratives/latest
 * @access Private
 */
export const getLatest = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const narrative: NarrativeResponse | null = await getLatestNarrative(userId);

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: narrative,
  });
});
