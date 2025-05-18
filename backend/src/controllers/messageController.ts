import prisma from '../lib/prisma';

export const messageController = {
  // 获取群组的消息
  getGroupMessages: async (groupId: string) => {
    return await prisma.message.findMany({
      where: { groupId },
      include: {
        user: true,
        topicLinks: {
          include: {
            topic: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
  },

  // 发送消息
  createMessage: async ({ content, userId, groupId, topicIds }: {
    content: string;
    userId: string;
    groupId: string;
    topicIds?: string[];
  }) => {
    return await prisma.message.create({
      data: {
        content,
        userId,
        groupId,
        topicLinks: topicIds ? {
          create: topicIds.map(topicId => ({
            topic: { connect: { id: topicId } }
          }))
        } : undefined
      },
      include: {
        user: true,
        topicLinks: {
          include: {
            topic: true
          }
        }
      }
    });
  }
};
