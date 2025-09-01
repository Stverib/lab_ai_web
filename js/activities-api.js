// 活动API客户端
class ActivitiesAPI {
    constructor() {
        this.config = window.apiConfig || {
            baseURL: 'http://localhost:8080',
            prefix: '/api/public',
            requireAuth: false
        };
    }

    // 获取活动列表
    async getActivities() {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/activities/list`);
            const result = await response.json();
            
            if (result.code === 200) {
                return result.data || [];
            } else {
                console.error('获取活动列表失败:', result.msg);
                return [];
            }
        } catch (error) {
            console.error('API请求失败:', error);
            return [];
        }
    }

    // 获取活动详情
    async getActivityById(id) {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/activities/${id}`);
            const result = await response.json();
            
            if (result.code === 200) {
                return result.data;
            } else {
                console.error('获取活动详情失败:', result.msg);
                return null;
            }
        } catch (error) {
            console.error('API请求失败:', error);
            return null;
        }
    }

    // 获取最新活动
    async getLatestActivity() {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/activities/latest`);
            const result = await response.json();
            
            if (result.code === 200) {
                return result.data;
            } else {
                console.error('获取最新活动失败:', result.msg);
                return null;
            }
        } catch (error) {
            console.error('API请求失败:', error);
            return null;
        }
    }

    // 渲染活动列表
    renderActivities(activities, containerId = 'activities-list') {
        const container = document.querySelector('.activities-list');
        if (!container) {
            console.error('找不到活动容器');
            return;
        }

        if (!activities || activities.length === 0) {
            container.innerHTML = '<div class="activity-item"><h3 class="activity-title">暂无活动</h3><div class="activity-right"><div class="activity-date">--</div></div></div>';
            return;
        }

        const activitiesHTML = activities.map(activity => {
            const date = this.formatDate(activity.activityTime);
            const title = activity.activityTitle || '无标题';
            
            // 生成HTML页面文件名
            const pageFileName = this.generatePageFileName(activity);
            
            return `
                <div class="activity-item">
                    <h3 class="activity-title">${title}</h3>
                    <div class="activity-right">
                        <div class="activity-date">${date}</div>
                        <a href="activities_html/${pageFileName}" class="view-detail">查看详情</a>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = activitiesHTML;
    }

    // 生成页面文件名
    generatePageFileName(activity) {
        const date = new Date(activity.activityTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}.html`;
    }

    // 显示活动详情
    async showActivityDetail(id) {
        const activity = await this.getActivityById(id);
        if (!activity) {
            alert('无法获取活动详情');
            return;
        }

        // 创建模态框显示详情
        const modal = document.createElement('div');
        modal.className = 'activity-modal';
        modal.innerHTML = `
            <div class="activity-modal-content">
                <div class="activity-modal-header">
                    <h2>${activity.activityTitle}</h2>
                    <span class="activity-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="activity-modal-body">
                    <div class="activity-meta">
                        <p><strong>时间:</strong> ${this.formatDate(activity.activityTime)}</p>
                        <p><strong>地点:</strong> ${activity.activityLocation || '未指定'}</p>
                        <p><strong>主持人:</strong> ${activity.activityHost || '未指定'}</p>
                        <p><strong>记录人:</strong> ${activity.activityRecorder || '未指定'}</p>
                    </div>
                    ${activity.activityAttendees ? `<p><strong>参会人员:</strong> ${activity.activityAttendees}</p>` : ''}
                    <div class="activity-content">${activity.activityContent || '无内容'}</div>
                </div>
            </div>
        `;

        // 添加模态框样式
        if (!document.getElementById('activity-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'activity-modal-styles';
            styles.textContent = `
                .activity-modal {
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .activity-modal-content {
                    background-color: white;
                    padding: 0;
                    border-radius: 10px;
                    width: 80%;
                    max-width: 600px;
                    max-height: 80%;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                .activity-modal-header {
                    background-color: var(--primary-color, #2c5aa0);
                    color: white;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .activity-modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                .activity-modal-close {
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    line-height: 1;
                }
                .activity-modal-close:hover {
                    opacity: 0.7;
                }
                .activity-modal-body {
                    padding: 20px;
                }
                .activity-meta {
                    margin-bottom: 15px;
                    padding: 15px;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                }
                .activity-meta p {
                    margin: 5px 0;
                }
                .activity-content {
                    line-height: 1.6;
                    margin-top: 15px;
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(modal);

        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
    }

    // 加载活动列表
    async loadActivities() {
        try {
            const activities = await this.getActivities();
            this.renderActivities(activities);
        } catch (error) {
            console.error('加载活动失败:', error);
        }
    }
}

// 创建全局实例
const activitiesAPI = new ActivitiesAPI();

// 页面加载完成后自动加载活动
document.addEventListener('DOMContentLoaded', () => {
    activitiesAPI.loadActivities();
}); 