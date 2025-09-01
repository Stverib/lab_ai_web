// 首页API客户端
class HomepageAPI {
    constructor() {
        this.config = window.apiConfig || {
            baseURL: 'http://localhost:8080',
            prefix: '/api/public',
            requireAuth: false
        };
    }

    // 获取最新新闻（首页显示）
    async getLatestNews(limit = 5) {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/news/list`);
            const result = await response.json();
            
            if (result.code === 200) {
                // 新闻API返回的数据结构是 {data: {rows: [...]}}
                const news = result.data?.rows || [];
                return news.slice(0, limit); // 只返回指定数量的新闻
            } else {
                console.error('获取新闻失败:', result.msg);
                return [];
            }
        } catch (error) {
            console.error('获取新闻API请求失败:', error);
            return [];
        }
    }

    // 获取最新活动（首页显示）
    async getLatestActivities(limit = 4) {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/activities/list`);
            const result = await response.json();
            
            if (result.code === 200) {
                const activities = result.data || [];
                return activities.slice(0, limit); // 只返回指定数量的活动
            } else {
                console.error('获取活动失败:', result.msg);
                return [];
            }
        } catch (error) {
            console.error('获取活动API请求失败:', error);
            return [];
        }
    }

    // 获取最新通知（首页显示）
    async getLatestNotifications(limit = 6) {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/notifications/list`);
            const result = await response.json();
            
            if (result.code === 200) {
                const notifications = result.data || [];
                return notifications.slice(0, limit); // 只返回指定数量的通知
            } else {
                console.error('获取通知失败:', result.msg);
                return [];
            }
        } catch (error) {
            console.error('获取通知API请求失败:', error);
            return [];
        }
    }

    // 渲染新闻列表（首页）
    renderNewsSection(news) {
        const newsContainer = document.querySelector('.news-list');
        if (!newsContainer) {
            console.error('找不到新闻容器');
            return;
        }

        if (!news || news.length === 0) {
            newsContainer.innerHTML = '<div class="news-item"><div class="news-content"><h3>暂无新闻</h3></div></div>';
            return;
        }

        let newsHTML = '';
        
        // 第一条新闻作为特色新闻
        if (news.length > 0) {
            const featuredNews = news[0];
            const featuredDate = this.formatDate(featuredNews.newsTime);
            
            newsHTML += `
                <div class="news-item featured-news">
                    <div class="featured-news-container">
                        <div class="featured-news-image">
                            <img src="${featuredNews.newsImageUrl || 'images/news/default.jpg'}" alt="${featuredNews.newsTitle}" class="news-image" onerror="this.src='images/news/default.jpg'">
                        </div>
                        <div class="featured-news-info">
                            <div class="news-date">${featuredDate}</div>
                            <div class="news-content">
                                <h3>${featuredNews.newsTitle}</h3>
                                <p>${this.truncateText(featuredNews.newsTitle, 60)}...</p>
                                <a href="${featuredNews.newsLink || '#'}" class="news-more" target="_blank">阅读全文</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 其余新闻作为普通新闻项
        for (let i = 1; i < news.length; i++) {
            const newsItem = news[i];
            const date = this.formatDate(newsItem.newsTime);
            
            newsHTML += `
                <div class="news-item">
                    <div class="news-date">${date}</div>
                    <div class="news-content">
                        <h3>${newsItem.newsTitle}</h3>
                        <a href="${newsItem.newsLink || '#'}" class="news-more" target="_blank">阅读全文</a>
                    </div>
                </div>
            `;
        }

        newsContainer.innerHTML = newsHTML;
    }

    // 渲染活动列表（首页）
    renderActivitiesSection(activities) {
        const activitiesContainer = document.querySelector('.activity-list');
        if (!activitiesContainer) {
            console.error('找不到活动容器');
            return;
        }

        if (!activities || activities.length === 0) {
            activitiesContainer.innerHTML = '<div class="activity-item"><div class="activity-content"><h3>暂无活动</h3></div></div>';
            return;
        }

        let activitiesHTML = '';
        
        // 第一个活动作为特色活动
        if (activities.length > 0) {
            const featuredActivity = activities[0];
            const featuredDate = this.formatDate(featuredActivity.activityTime);
            const pageFileName = this.generateActivityPageFileName(featuredActivity);
            
            activitiesHTML += `
                <div class="activity-item featured-activity">
                    <div class="featured-activity-container">
                        <div class="featured-activity-image">
                            <img src="${featuredActivity.activityImageUrl1 || 'images/news/ai-lecture.jpg'}" alt="${featuredActivity.activityTitle}" class="activity-image" onerror="this.src='images/news/ai-lecture.jpg'">
                        </div>
                        <div class="featured-activity-info">
                            <div class="activity-date">${featuredDate}</div>
                            <div class="activity-content">
                                <h3>${featuredActivity.activityTitle}</h3>
                                <p><strong>时间：</strong>${featuredDate}</p>
                                <p><strong>地点：</strong>${featuredActivity.activityLocation || '待定'}</p>
                                <a href="activities_html/${pageFileName}" class="activity-more">了解更多</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // 其余活动作为简单活动项
        for (let i = 1; i < activities.length; i++) {
            const activity = activities[i];
            const date = this.formatDate(activity.activityTime);
            const pageFileName = this.generateActivityPageFileName(activity);
            
            activitiesHTML += `
                <div class="activity-item simple-activity">
                    <a href="activities_html/${pageFileName}" class="activity-link">
                        <div class="activity-date">${date}</div>
                        <div class="activity-content">
                            <h3>${activity.activityTitle}</h3>
                        </div>
                    </a>
                </div>
            `;
        }

        activitiesContainer.innerHTML = activitiesHTML;
    }

    // 渲染通知列表（首页）
    renderNotificationsSection(notifications) {
        const notificationsContainer = document.querySelector('.notice-list');
        if (!notificationsContainer) {
            console.error('找不到通知容器');
            return;
        }

        if (!notifications || notifications.length === 0) {
            notificationsContainer.innerHTML = '<div class="notice-item"><div class="notice-content"><h3>暂无通知</h3></div></div>';
            return;
        }

        const notificationsHTML = notifications.map(notification => {
            const date = this.formatNoticeDate(notification.notificationTime);
            const pageFileName = this.generateNotificationPageFileName(notification);
            
            return `
                <div class="notice-item">
                    <div class="notice-date">${date}</div>
                    <div class="notice-content">
                        <h3><a href="notices_html/${pageFileName}" class="notice-title-link">${notification.notificationTitle}</a></h3>
                    </div>
                </div>
            `;
        }).join('');

        notificationsContainer.innerHTML = notificationsHTML;
    }

    // 生成活动页面文件名
    generateActivityPageFileName(activity) {
        const date = new Date(activity.activityTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}.html`;
    }

    // 生成通知页面文件名
    generateNotificationPageFileName(notification) {
        const date = new Date(notification.notificationTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}_${notification.id}.html`;
    }

    // 格式化日期（用于新闻和活动）
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '.');
    }

    // 格式化通知日期（月.日格式）
    formatNoticeDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${month}.${day}`;
    }

    // 截断文本
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength);
    }

    // 加载所有首页数据
    async loadHomepageData() {
        try {
            console.log('开始加载首页数据...');
            
            // 并行加载所有数据
            const [news, activities, notifications] = await Promise.all([
                this.getLatestNews(5),
                this.getLatestActivities(4),
                this.getLatestNotifications(6)
            ]);

            console.log('获取到的数据:', { news, activities, notifications });

            // 渲染各个部分
            this.renderNewsSection(news);
            this.renderActivitiesSection(activities);
            this.renderNotificationsSection(notifications);

            console.log('首页数据加载完成');
        } catch (error) {
            console.error('加载首页数据失败:', error);
        }
    }
}

// 创建全局实例
const homepageAPI = new HomepageAPI();

// 页面加载完成后自动加载数据
document.addEventListener('DOMContentLoaded', () => {
    // 只在首页执行
    if (document.querySelector('.main-content .content-grid')) {
        homepageAPI.loadHomepageData();
    }
}); 