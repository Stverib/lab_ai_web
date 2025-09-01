# 新闻API集成使用说明

## 概述

本项目已集成若依后台管理系统的新闻API，实现了新闻数据的动态加载和管理。

## 文件结构

```
web_2/
├── js/
│   ├── config.js          # 配置文件
│   ├── news-api.js        # 新闻API模块
│   └── main.js           # 主要脚本
├── css/
│   └── news-modal.css    # 新闻模态框样式
├── news.html             # 新闻页面
├── debug-news.html       # 新闻API调试页面 (新增)
├── test-news-api.html    # API测试页面
└── README_NEWS_API.md    # 本说明文档
```

## 🚀 快速开始

### 1. 配置API地址

根据您的若依后台地址，修改 `js/config.js` 文件：

```javascript
const AppConfig = {
    api: {
        baseURL: 'http://localhost:1024',  // 您的若依后台地址
        prefix: '/lab_web',                // API前缀
        timeout: 10000,                    // 请求超时时间
        requireAuth: false,                // 是否需要认证
        tokenKey: 'lab_token'              // Token存储键名
    }
};
```

### 2. 测试API连接

打开 `debug-news.html` 页面进行全面的API测试：
- 基础连接测试
- CORS测试
- 新闻API测试
- 实时调试日志

### 3. 查看新闻页面

打开 `news.html` 查看动态加载的新闻内容。

## 配置说明

### 1. API配置 (js/config.js)

```javascript
const AppConfig = {
    api: {
        baseURL: 'http://localhost:1024',  // 若依后台API地址 (已更新)
        prefix: '/lab_web',                // API前缀 (已更新)
        timeout: 10000,                    // 请求超时时间
        requireAuth: false,                // 是否需要认证
        tokenKey: 'lab_token'              // Token存储键名
    }
};
```

**重要：** 配置已根据您的若依后台地址 `http://localhost:1024/lab_web/news` 进行更新。

### 2. 新闻模块配置

```javascript
news: {
    pageSize: 20,              // 每页显示数量
    defaultStatus: '1',        // 默认状态（1: 已发布）
    enableCache: true,         // 是否启用缓存
    cacheTime: 300000,         // 缓存时间（5分钟）
    autoRefreshInterval: 0     // 自动刷新间隔（0表示不自动刷新）
}
```

## API接口说明

### 新闻管理API

基于若依框架的新闻管理API，对应后端文件：`RuoYi-Vue-master/ruoyi-ui/src/api/lab_web_sys/news.js`

**实际API端点：**
- 基础URL: `http://localhost:1024`
- API前缀: `/lab_web`
- 完整地址: `http://localhost:1024/lab_web/news`

#### 1. 查询新闻列表
- **URL:** `GET /lab_web/news/list`
- **参数:**
  - `pageNum`: 页码
  - `pageSize`: 每页数量
  - `status`: 状态（1: 已发布, 0: 草稿）

#### 2. 查询新闻详情
- **URL:** `GET /lab_web/news/{id}`
- **参数:** `id` - 新闻ID

#### 3. 新增新闻
- **URL:** `POST /lab_web/news`
- **参数:** 新闻数据对象

#### 4. 修改新闻
- **URL:** `PUT /lab_web/news`
- **参数:** 新闻数据对象

#### 5. 删除新闻
- **URL:** `DELETE /lab_web/news/{id}`
- **参数:** `id` - 新闻ID

## 🔧 调试工具

### 调试页面 (debug-news.html)

专门的调试页面，提供以下功能：

1. **配置信息显示** - 查看当前API配置
2. **API端点列表** - 显示所有可用的API端点
3. **基础连接测试** - 测试服务器连接
4. **CORS测试** - 检查跨域配置
5. **新闻API测试** - 测试具体的新闻API
6. **实时日志** - 查看详细的调试信息

### 使用调试页面

1. 打开 `debug-news.html`
2. 查看当前配置是否正确
3. 点击"测试所有端点"进行全面测试
4. 根据测试结果进行问题排查

## 功能特性

### 1. 动态加载
- 页面加载时自动从API获取新闻数据
- 支持加载状态显示
- 错误处理和重试机制

### 2. 新闻详情模态框
- 点击"查看详情"打开模态框
- 支持富文本内容显示
- 响应式设计

### 3. 缓存机制
- 本地缓存API响应数据
- 可配置缓存时间
- 减少不必要的API请求

### 4. 自动刷新
- 可配置自动刷新间隔
- 静默刷新，不影响用户体验

### 5. 响应式设计
- 适配移动端和桌面端
- 优雅的加载和错误状态

## 故障排除

### 🔍 常见问题及解决方案

#### 1. 新闻不显示或显示"网络连接失败"

**排查步骤：**
1. 打开 `debug-news.html` 进行诊断
2. 检查若依后台服务是否正常运行
3. 确认API地址配置是否正确
4. 测试基础连接和CORS

**解决方案：**
```javascript
// 确认配置正确
api: {
    baseURL: 'http://localhost:1024',  // 确保端口正确
    prefix: '/lab_web'                 // 确保路径正确
}
```

#### 2. 跨域问题 (CORS Error)

**现象：** 浏览器控制台显示CORS错误

**解决方案：**
在若依后台添加跨域配置：

```java
// 在Controller中添加
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/lab_web/news")
public class NewsController {
    // ...
}
```

或在配置文件中全局配置：

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("*");
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

#### 3. API返回404错误

**可能原因：**
- API路径配置错误
- 若依后台新闻模块未正确部署
- 数据库表不存在

**排查步骤：**
1. 检查若依后台是否有新闻管理菜单
2. 确认数据库中是否有新闻相关表
3. 检查API路径是否与后台一致

#### 4. 数据格式问题

**现象：** API返回数据但页面不显示

**排查步骤：**
1. 在调试页面查看API返回的数据格式
2. 检查数据字段是否与前端代码匹配

**常见字段映射：**
```javascript
// 确保API返回的字段名称正确
{
    "code": 200,           // 状态码
    "rows": [...],         // 新闻列表
    "data": {...}          // 新闻详情
}
```

### 🛠️ 调试技巧

1. **使用浏览器开发者工具**
   - 查看Network标签页的API请求
   - 检查Console中的错误信息

2. **使用调试页面**
   - 实时查看API响应
   - 测试各个功能模块

3. **检查若依后台日志**
   - 查看后台服务器日志
   - 确认API请求是否到达后台

## 部署配置

### 1. 开发环境

```javascript
// 在 js/config.js 中修改
api: {
    baseURL: 'http://localhost:1024'  // 本地开发服务器
}
```

### 2. 生产环境

```javascript
// 在 js/config.js 中修改
api: {
    baseURL: 'https://your-domain.com'  // 生产服务器地址
}
```

## 联系支持

如有问题，请按以下顺序检查：

1. **使用调试页面** (`debug-news.html`) 进行全面诊断
2. **检查浏览器控制台** 错误信息
3. **查看网络请求** 状态和响应
4. **确认若依后台** 服务状态
5. **验证配置文件** 设置

**调试页面地址：** `debug-news.html`
**测试页面地址：** `test-news-api.html` 