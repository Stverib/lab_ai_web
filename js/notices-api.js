// 通知公告API客户端
class NoticesAPI {
    constructor() {
        this.config = window.apiConfig || {
            baseURL: 'http://localhost:8080',
            prefix: '/api/public',
            requireAuth: false
        };
    }

    // 获取通知公告列表
    async getNotices() {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/notifications/list`);
            const result = await response.json();
            
            if (result.code === 200) {
                return result.data || [];
            } else {
                console.error('获取通知公告失败:', result.msg);
                return [];
            }
        } catch (error) {
            console.error('API请求失败:', error);
            return [];
        }
    }

    // 获取通知公告详情
    async getNoticeById(id) {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/notifications/${id}`);
            const result = await response.json();
            
            if (result.code === 200) {
                return result.data;
            } else {
                console.error('获取通知详情失败:', result.msg);
                return null;
            }
        } catch (error) {
            console.error('API请求失败:', error);
            return null;
        }
    }

    // 获取最新通知
    async getLatestNotice() {
        try {
            const response = await fetch(`${this.config.baseURL}${this.config.prefix}/notifications/latest`);
            const result = await response.json();
            
            if (result.code === 200) {
                return result.data;
            } else {
                console.error('获取最新通知失败:', result.msg);
                return null;
            }
        } catch (error) {
            console.error('API请求失败:', error);
            return null;
        }
    }

    // 渲染通知列表
    renderNotices(notices, containerId = 'notice-list-full') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('找不到通知容器:', containerId);
            return;
        }

        if (!notices || notices.length === 0) {
            container.innerHTML = '<div class="notice-item-full"><div class="notice-content-full"><h3>暂无通知公告</h3></div></div>';
            return;
        }

        const noticesHTML = notices.map(notice => {
            const date = this.formatDate(notice.notificationTime);
            const title = notice.notificationTitle || '无标题';
            const hasFile = notice.notificationFileUrl && notice.notificationFileUrl !== 'null';
            
            // 生成HTML页面文件名
            const pageFileName = this.generatePageFileName(notice);
            
            return `
                <div class="notice-item-full">
                    <div class="notice-content-full">
                        <h3>${title}</h3>
                        <a href="notices_html/${pageFileName}" class="notice-link">查看详情</a>
                        ${hasFile ? `<a href="${notice.notificationFileUrl}" class="notice-link" style="margin-left: 10px;" target="_blank">下载附件</a>` : ''}
                    </div>
                    <div class="notice-date-full">${date}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = noticesHTML;
    }

    // 生成页面文件名
    generatePageFileName(notice) {
        const date = new Date(notice.notificationTime);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}_${notice.id}.html`;
    }

    // 显示通知详情
    async showNoticeDetail(id) {
        const notice = await this.getNoticeById(id);
        if (!notice) {
            alert('无法获取通知详情');
            return;
        }

        // 创建模态框显示详情
        const modal = document.createElement('div');
        modal.className = 'notice-modal';
        modal.innerHTML = `
            <div class="notice-modal-content">
                <div class="notice-modal-header">
                    <h2>${notice.notificationTitle}</h2>
                    <span class="notice-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
                <div class="notice-modal-body">
                    <p class="notice-date">发布时间: ${this.formatDate(notice.notificationTime)}</p>
                    <div class="notice-content">${notice.notificationContent || '无内容'}</div>
                    ${notice.notificationFileUrl && notice.notificationFileUrl !== 'null' ? 
                        `<p><a href="${notice.notificationFileUrl}" target="_blank" class="notice-file-link">下载附件</a></p>` : ''}
                </div>
            </div>
        `;

        // 添加模态框样式
        if (!document.getElementById('notice-modal-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notice-modal-styles';
            styles.textContent = `
                .notice-modal {
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
                .notice-modal-content {
                    background-color: white;
                    padding: 0;
                    border-radius: 10px;
                    width: 80%;
                    max-width: 600px;
                    max-height: 80%;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                .notice-modal-header {
                    background-color: var(--primary-color, #2c5aa0);
                    color: white;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .notice-modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                .notice-modal-close {
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    line-height: 1;
                }
                .notice-modal-close:hover {
                    opacity: 0.7;
                }
                .notice-modal-body {
                    padding: 20px;
                }
                .notice-date {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 15px;
                }
                .notice-content {
                    line-height: 1.6;
                    margin-bottom: 15px;
                }
                .notice-file-link {
                    color: var(--primary-color, #2c5aa0);
                    text-decoration: none;
                    font-weight: bold;
                }
                .notice-file-link:hover {
                    text-decoration: underline;
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
        }).replace(/\//g, '.');
    }

    // 加载通知列表
    async loadNotices() {
        try {
            const notices = await this.getNotices();
            this.renderNotices(notices);
        } catch (error) {
            console.error('加载通知失败:', error);
        }
    }
}

// 创建全局实例
const noticesAPI = new NoticesAPI();

// 页面加载完成后自动加载通知
document.addEventListener('DOMContentLoaded', () => {
    noticesAPI.loadNotices();
}); 