import prisma from '../lib/prisma';

export const topicController = {
  // 获取群组的所有话题
  getGroupTopics: async (groupId: string) => {
    return await prisma.topic.findMany({
      where: { groupId }
    });
  },

  // 创建新话题
  createTopic: async ({ name, color, groupId }: {
    name: string;
    color?: string;
    groupId: string;
  }) => {
    return await prisma.topic.create({
      data: {
        name,
        color,
        groupId
      }
    });
  }
};
