// 应用配置文件
const AppConfig = {
    // 若依后台管理系统API配置
    api: {
        // 基础URL - 若依后端地址
        baseURL: 'http://localhost:8080',
        
        // API前缀 - 使用公开API路径
        prefix: '/api/public',
        
        // 超时时间（毫秒）
        timeout: 10000,
        
        // 是否需要认证
        requireAuth: false,
        
        // 认证token存储键名
        tokenKey: 'lab_token'
    },
    
    // 新闻模块配置
    news: {
        // 每页显示数量
        pageSize: 20,
        
        // 默认状态（1: 已发布, 0: 草稿）
        defaultStatus: '1',
        
        // 是否启用缓存
        enableCache: true,
        
        // 缓存时间（毫秒）
        cacheTime: 5 * 60 * 1000, // 5分钟
        
        // 自动刷新间隔（毫秒，0表示不自动刷新）
        autoRefreshInterval: 0
    },
    
    // 开发模式配置
    development: {
        // 是否启用调试模式
        debug: true,
        
        // 是否使用模拟数据
        useMockData: false,
        
        // 模拟数据延迟（毫秒）
        mockDelay: 1000
    },
    
    // 生产模式配置
    production: {
        // 是否启用调试模式
        debug: false,
        
        // 是否使用模拟数据
        useMockData: false
    }
};

// 环境检测
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' && 
                    !window.location.hostname.includes('192.168');

// 合并环境配置
const currentConfig = isProduction ? AppConfig.production : AppConfig.development;
Object.assign(AppConfig, currentConfig);

// 导出配置
window.AppConfig = AppConfig; 