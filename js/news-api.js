// 新闻API管理模块
class NewsAPI {
    constructor() {
        // 从配置文件获取设置
        this.config = window.AppConfig || {};
        this.baseURL = this.config.api?.baseURL || 'http://localhost:8080';
        this.apiPrefix = (this.config.api?.prefix || '') + '/news';
        this.timeout = this.config.api?.timeout || 10000;
        this.requireAuth = this.config.api?.requireAuth || false;
        this.tokenKey = this.config.api?.tokenKey || 'lab_token';
    }

    // 通用请求方法
    async request(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        // 如果需要认证，添加token
        if (this.requireAuth) {
            const token = this.getToken();
            if (token) {
                defaultOptions.headers['Authorization'] = 'Bearer ' + token;
            }
        }

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        // 创建AbortController用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(this.baseURL + url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 调试模式下打印响应
            if (this.config.debug) {
                console.log('API Response:', data);
            }
            
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('请求超时，请检查网络连接');
            }
            
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // 查询新闻管理列表
    async listNews(query = {}) {
        const params = new URLSearchParams(query);
        const url = `${this.apiPrefix}/list${params.toString() ? '?' + params.toString() : ''}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    // 查询新闻管理详细
    async getNews(id) {
        const url = `${this.apiPrefix}/${id}`;
        return await this.request(url, {
            method: 'GET'
        });
    }

    // 新增新闻管理
    async addNews(data) {
        return await this.request(this.apiPrefix, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // 修改新闻管理
    async updateNews(data) {
        return await this.request(this.apiPrefix, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // 删除新闻管理
    async delNews(id) {
        const url = `${this.apiPrefix}/${id}`;
        return await this.request(url, {
            method: 'DELETE'
        });
    }

    // 获取认证token（如果需要）
    getToken() {
        return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
    }

    // 设置认证token（如果需要）
    setToken(token) {
        localStorage.setItem(this.tokenKey, token);
    }
}

// 新闻页面管理类
class NewsManager {
    constructor() {
        this.newsAPI = new NewsAPI();
        this.newsContainer = null;
        this.loading = false;
        this.config = window.AppConfig || {};
        this.newsConfig = this.config.news || {};
        this.cache = new Map();
        this.autoRefreshTimer = null;
    }

    // 初始化新闻页面
    init() {
        this.newsContainer = document.querySelector('.news-wrapper');
        if (this.newsContainer) {
            this.loadNews();
            this.setupAutoRefresh();
        }
    }

    // 设置自动刷新
    setupAutoRefresh() {
        const interval = this.newsConfig.autoRefreshInterval;
        if (interval && interval > 0) {
            this.autoRefreshTimer = setInterval(() => {
                this.loadNews(null, true); // 静默刷新
            }, interval);
        }
    }

    // 清理自动刷新
    cleanup() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
        }
    }

    // 加载新闻列表
    async loadNews(query = {}, silent = false) {
        if (this.loading) return;
        
        this.loading = true;
        
        if (!silent) {
            this.showLoading();
        }

        try {
            // 设置默认查询参数
            const defaultQuery = {
                pageNum: 1,
                pageSize: this.newsConfig.pageSize || 20,
                ...query
            };

            // 检查缓存
            const cacheKey = JSON.stringify(defaultQuery);
            if (this.newsConfig.enableCache && this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                const now = Date.now();
                if (now - cached.timestamp < (this.newsConfig.cacheTime || 300000)) {
                    this.renderNews(cached.data);
                    this.loading = false;
                    if (!silent) {
                        this.hideLoading();
                    }
                    return;
                }
            }

            const response = await this.newsAPI.listNews(defaultQuery);
            
            // 适配若依后端的响应格式
            if (response.code === 200 && response.data) {
                let newsList = [];
                
                // 若依返回的数据格式可能是 {rows: [], total: number} 或直接是数组
                if (response.data.rows) {
                    newsList = response.data.rows;
                } else if (Array.isArray(response.data)) {
                    newsList = response.data;
                } else {
                    newsList = [];
                }
                
                // 缓存数据
                if (this.newsConfig.enableCache) {
                    this.cache.set(cacheKey, {
                        data: newsList,
                        timestamp: Date.now()
                    });
                }
                
                this.renderNews(newsList);
            } else {
                this.showError('获取新闻数据失败: ' + (response.msg || '未知错误'));
            }
        } catch (error) {
            console.error('加载新闻失败:', error);
            this.showError('网络连接失败，请稍后重试');
        } finally {
            this.loading = false;
            if (!silent) {
                this.hideLoading();
            }
        }
    }

    // 渲染新闻列表
    renderNews(newsList) {
        if (!this.newsContainer) return;

        const newsHTML = newsList.map(news => {
            // 适配若依后端的数据格式
            const publishDate = this.formatDate(news.newsTime || news.createTime);
            const newsUrl = news.newsLink || news.link || '#';
            const newsTitle = news.newsTitle || news.title || '无标题';
            
            return `
                <div class="news-item-full" data-news-id="${news.id}">
                    <div class="news-content-full">
                        <h3>${this.escapeHtml(newsTitle)}</h3>
                        ${newsUrl !== '#' ? 
                            `<a href="${newsUrl}" class="news-link" target="_blank">阅读全文</a>` : 
                            `<a href="javascript:void(0)" class="news-link" onclick="newsManager.showNewsDetail(${news.id})">查看详情</a>`
                        }
                    </div>
                    <div class="news-date-full">${publishDate}</div>
                </div>
            `;
        }).join('');

        this.newsContainer.innerHTML = newsHTML;
    }

    // 显示新闻详情
    async showNewsDetail(newsId) {
        try {
            const response = await this.newsAPI.getNews(newsId);
            if (response.code === 200 && response.data) {
                this.openNewsModal(response.data);
            }
        } catch (error) {
            console.error('获取新闻详情失败:', error);
            alert('获取新闻详情失败');
        }
    }

    // 打开新闻详情模态框
    openNewsModal(news) {
        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.innerHTML = `
            <div class="news-modal-content">
                <div class="news-modal-header">
                    <h2>${this.escapeHtml(news.title)}</h2>
                    <span class="news-modal-close">&times;</span>
                </div>
                <div class="news-modal-body">
                    <div class="news-meta">
                        <span class="news-date">${this.formatDate(news.createTime)}</span>
                        ${news.author ? `<span class="news-author">作者：${this.escapeHtml(news.author)}</span>` : ''}
                    </div>
                    <div class="news-content">
                        ${news.content || '暂无内容'}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定关闭事件
        const closeBtn = modal.querySelector('.news-modal-close');
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
        };

        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }

    // 显示加载状态
    showLoading() {
        if (this.newsContainer) {
            this.newsContainer.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>正在加载新闻...</p>
                </div>
            `;
        }
    }

    // 隐藏加载状态
    hideLoading() {
        const loadingContainer = document.querySelector('.loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }
    }

    // 显示错误信息
    showError(message) {
        if (this.newsContainer) {
            this.newsContainer.innerHTML = `
                <div class="error-container">
                    <p class="error-message">${message}</p>
                    <button onclick="newsManager.loadNews()" class="retry-btn">重试</button>
                </div>
            `;
        }
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 创建全局实例
const newsManager = new NewsManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    newsManager.init();
}); 