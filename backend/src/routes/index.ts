import { Router } from 'express';
import { updateUserInfo } from '../controllers/userController';
import { getGroupMessages, createGroupMessage } from '../controllers/messageController';
import { getGroupTopics, createGroupTopic } from '../controllers/topicController';
import { requireAuth } from '../middleware/auth';

// 创建路由实例
const router = Router();

// 用户相关路由 - 不需要认证
router.put('/users', updateUserInfo);

// 需要认证的路由
router.get('/groups/:groupId/messages', requireAuth, getGroupMessages);
router.post('/groups/:groupId/messages', requireAuth, createGroupMessage);
router.get('/groups/:groupId/topics', requireAuth, getGroupTopics);
router.post('/groups/:groupId/topics', requireAuth, createGroupTopic);

export default router;
