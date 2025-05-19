import { Router } from 'express';
import { updateUserInfo } from '../controllers/userController';
import { getGroupMessages, createGroupMessage } from '../controllers/messageController';
import { getGroupTopics, createGroupTopic } from '../controllers/topicController';

// 创建路由实例
const router = Router();

// 用户相关路由
router.put('/users', updateUserInfo);

// 群组相关路由（目前只处理单个群组）
router.get('/groups/:groupId/messages', getGroupMessages);
router.post('/groups/:groupId/messages', createGroupMessage);
router.get('/groups/:groupId/topics', getGroupTopics);
router.post('/groups/:groupId/topics', createGroupTopic);

export default router;
