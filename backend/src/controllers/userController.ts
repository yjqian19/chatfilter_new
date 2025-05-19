import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const updateUserInfo = async (req: Request, res: Response) => {
  try {
    const { id, name, pronouns, bio } = req.body;

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name,
        pronouns,
        bio,
      },
      create: {
        id,
        name,
        pronouns,
        bio,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user information' });
  }
};
