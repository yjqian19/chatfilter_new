#!/bin/bash

echo "Creating users..."
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"id":"google_123","name":"Sarah Chen"}'
echo -e "\n"

curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"id":"google_456","name":"Mike Wilson"}'
echo -e "\n"

curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"id":"google_789","name":"Emily Zhang"}'
echo -e "\n"

echo "Creating topics..."
curl -X POST http://localhost:3001/topics \
  -H "Content-Type: application/json" \
  -d '{"title":"attractions","color":"#FF6B6B","createdAt":"2024-05-19T10:00:00Z"}'
echo -e "\n"

curl -X POST http://localhost:3001/topics \
  -H "Content-Type: application/json" \
  -d '{"title":"stay","color":"#4ECDC4","createdAt":"2024-05-19T10:01:00Z"}'
echo -e "\n"

curl -X POST http://localhost:3001/topics \
  -H "Content-Type: application/json" \
  -d '{"title":"food","color":"#FFD93D","createdAt":"2024-05-19T10:02:00Z"}'
echo -e "\n"

curl -X POST http://localhost:3001/topics \
  -H "Content-Type: application/json" \
  -d '{"title":"leisure","color":"#95E1D3","createdAt":"2024-05-19T10:03:00Z"}'
echo -e "\n"

echo "Creating messages..."
# 初始询问
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Planning a trip to NYC next month! Anyone has recommendations for hotels near Central Park?",
    "userId": "google_123",
    "topicTitles": ["stay"],
    "createdAt": "2024-05-19T10:05:00Z"
  }'
echo -e "\n"

# 第一个回复，提供住宿建议
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The Pod 51 Hotel is great value - close to Central Park and lots of subway lines.",
    "userId": "google_456",
    "topicTitles": ["stay"],
    "createdAt": "2024-05-19T10:10:00Z"
  }'
echo -e "\n"

# 无主题的天气提醒
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Heads up - May can be quite rainy in NYC. Dont forget to pack an umbrella!",
    "userId": "google_789",
    "topicTitles": [],
    "createdAt": "2024-05-19T10:15:00Z"
  }'
echo -e "\n"

# 分享景点信息
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "The Metropolitan Museum has free admission on Friday evenings.",
    "userId": "google_456",
    "topicTitles": ["attractions"],
    "createdAt": "2024-05-19T10:20:00Z"
  }'
echo -e "\n"

# 询问食物
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Thanks for the tips! Any must-try restaurants near Central Park or Midtown?",
    "userId": "google_123",
    "topicTitles": ["food"],
    "createdAt": "2024-05-19T10:25:00Z"
  }'
echo -e "\n"

# 提供综合建议
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Juniors near Times Square has the best cheesecake! You can catch a Broadway show after dinner.",
    "userId": "google_789",
    "topicTitles": ["food", "leisure"],
    "createdAt": "2024-05-19T10:30:00Z"
  }'
echo -e "\n"

# 分享个人经验
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Just spent the afternoon walking the High Line, then had amazing food at Chelsea Market.",
    "userId": "google_456",
    "topicTitles": ["attractions", "food"],
    "createdAt": "2024-05-19T10:35:00Z"
  }'
echo -e "\n"

# 无主题的一般性问题
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "How many days would you recommend for a first-time visitor?",
    "userId": "google_123",
    "topicTitles": [],
    "createdAt": "2024-05-19T10:40:00Z"
  }'
echo -e "\n"

# 综合建议回复
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "For a good mix of attractions, Id say 5 days minimum. Must-sees: Central Park, Met Museum, Brooklyn Bridge, and a Broadway show!",
    "userId": "google_789",
    "topicTitles": ["attractions"],
    "createdAt": "2024-05-19T10:45:00Z"
  }'
echo -e "\n"

# 更多具体建议
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Dont miss the sunset walk across Brooklyn Bridge, then dinner at DUMBO.",
    "userId": "google_456",
    "topicTitles": ["attractions", "leisure"],
    "createdAt": "2024-05-19T10:50:00Z"
  }'
echo -e "\n"

# 确认行程
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Booked Pod 51 for 6 nights! Thanks everyone for the recommendations.",
    "userId": "google_123",
    "topicTitles": ["stay"],
    "createdAt": "2024-05-19T10:55:00Z"
  }'
echo -e "\n"

# 最后的补充建议
curl -X POST http://localhost:3001/messages \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Pro tip: Get the NYC CityPASS if youre planning to visit multiple attractions.",
    "userId": "google_789",
    "topicTitles": ["attractions"],
    "createdAt": "2024-05-19T11:00:00Z"
  }'
echo -e "\n"

echo "Done! Test data has been added."
