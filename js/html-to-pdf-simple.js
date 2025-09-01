/**
 * HTML转PDF工具模块 - 简化版本
 * 使用html2canvas和jspdf插件实现HTML内容转PDF功能
 * 适用于传统script标签加载方式
 */

class HTMLToPDFConverter {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    /**
     * 初始化转换器
     */
    async init() {
        try {
            // 检查依赖是否可用
            if (typeof html2canvas === 'undefined' || typeof jsPDF === 'undefined') {
                console.error('html2canvas或jsPDF未正确加载，请检查依赖包');
                return;
            }
            
            this.isInitialized = true;
            console.log('HTML转PDF转换器初始化成功');
        } catch (error) {
            console.error('HTML转PDF转换器初始化失败:', error);
        }
    }

    /**
     * 将HTML元素转换为PDF
     * @param {string|HTMLElement} element - 要转换的HTML元素或选择器
     * @param {Object} options - 转换选项
     * @returns {Promise<boolean>} 转换是否成功
     */
    async convertToPDF(element, options = {}) {
        if (!this.isInitialized) {
            console.error('转换器未初始化');
            return false;
        }

        try {
            // 获取要转换的DOM元素
            const targetElement = typeof element === 'string' 
                ? document.querySelector(element) 
                : element;

            if (!targetElement) {
                throw new Error('未找到目标元素');
            }

            // 默认配置
            const defaultOptions = {
                filename: 'document.pdf',
                title: '页面导出PDF',
                pageSize: 'a4',
                orientation: 'portrait',
                margin: 10,
                quality: 1.0,
                allowTaint: true,
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff'
            };

            const config = { ...defaultOptions, ...options };

            this.showStatus('正在生成PDF，请稍候...', 'loading');

            // 使用html2canvas将HTML转换为canvas
            const canvas = await html2canvas(targetElement, {
                allowTaint: config.allowTaint,
                useCORS: config.useCORS,
                scale: config.scale,
                backgroundColor: config.backgroundColor,
                logging: false,
                width: targetElement.scrollWidth,
                height: targetElement.scrollHeight
            });

            this.showStatus('正在处理PDF内容...', 'loading');

            // 计算PDF尺寸和分页
            const contentWidth = canvas.width;
            const contentHeight = canvas.height;
            
            // A4纸张尺寸（点）
            const pageWidth = 595.28;
            const pageHeight = 841.89;
            
            // 计算图片在PDF中的尺寸
            const imgWidth = pageWidth - (config.margin * 2);
            const imgHeight = (imgWidth / contentWidth) * contentHeight;
            
            // 计算需要多少页
            const pageCount = Math.ceil(imgHeight / (pageHeight - (config.margin * 2)));
            
            // 创建PDF文档
            const pdf = new jsPDF(config.orientation, 'pt', config.pageSize);
            
            // 设置文档属性
            pdf.setProperties({
                title: config.title,
                subject: config.title,
                author: '人工智能与算力技术实验室',
                creator: 'HTML to PDF Converter'
            });

            // 添加页面内容
            let position = 0;
            let remainingHeight = imgHeight;

            for (let i = 0; i < pageCount; i++) {
                if (i > 0) {
                    pdf.addPage();
                }

                // 计算当前页显示的内容
                const currentPageHeight = Math.min(remainingHeight, pageHeight - (config.margin * 2));
                
                // 将canvas转换为图片数据
                const imgData = canvas.toDataURL('image/jpeg', config.quality);
                
                // 添加图片到PDF
                pdf.addImage(
                    imgData, 
                    'JPEG', 
                    config.margin, 
                    config.margin, 
                    imgWidth, 
                    imgHeight,
                    '',
                    'FAST'
                );

                remainingHeight -= currentPageHeight;
                position += currentPageHeight;
            }

            this.showStatus('PDF生成完成，正在下载...', 'success');

            // 保存PDF文件
            pdf.save(config.filename);

            this.showStatus('PDF下载完成！', 'success');
            
            // 3秒后清除状态
            setTimeout(() => this.clearStatus(), 3000);

            return true;

        } catch (error) {
            console.error('PDF转换失败:', error);
            this.showStatus(`PDF生成失败: ${error.message}`, 'error');
            
            // 5秒后清除状态
            setTimeout(() => this.clearStatus(), 5000);
            return false;
        }
    }

    /**
     * 转换通知页面为PDF
     * @param {string} filename - 文件名
     * @returns {Promise<boolean>} 转换是否成功
     */
    async convertNoticeToPDF(filename = '通知文件.pdf') {
        const noticeContent = document.querySelector('.notice-detail-content');
        if (!noticeContent) {
            this.showStatus('未找到通知内容区域', 'error');
            return false;
        }

        return await this.convertToPDF(noticeContent, {
            filename: filename,
            title: '通知文件',
            pageSize: 'a4',
            orientation: 'portrait',
            margin: 20,
            quality: 0.95
        });
    }

    /**
     * 转换招生页面为PDF
     * @param {string} filename - 文件名
     * @returns {Promise<boolean>} 转换是否成功
     */
    async convertAdmissionToPDF(filename = '招生信息.pdf') {
        const admissionContent = document.querySelector('.notice-detail-content');
        if (!admissionContent) {
            this.showStatus('未找到招生内容区域', 'error');
            return false;
        }

        return await this.convertToPDF(admissionContent, {
            filename: filename,
            title: '招生信息',
            pageSize: 'a4',
            orientation: 'portrait',
            margin: 20,
            quality: 0.95
        });
    }

    /**
     * 显示状态信息
     */
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('download-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `download-status ${type}`;
        }
        
        // 同时在控制台显示
        console.log(`[PDF转换] ${message}`);
    }

    /**
     * 清除状态信息
     */
    clearStatus() {
        const statusElement = document.getElementById('download-status');
        if (statusElement) {
            statusElement.textContent = '';
            statusElement.className = 'download-status';
        }
    }

    /**
     * 检查浏览器兼容性
     */
    checkCompatibility() {
        const canvas = document.createElement('canvas');
        const isCanvasSupported = !!canvas.getContext && !!canvas.getContext('2d');
        
        if (!isCanvasSupported) {
            console.warn('浏览器不支持Canvas，PDF转换功能可能不可用');
            return false;
        }
        
        return true;
    }
}

// 创建全局实例
let pdfConverter = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 等待依赖包加载完成
    setTimeout(() => {
        try {
            pdfConverter = new HTMLToPDFConverter();
        } catch (error) {
            console.error('PDF转换器初始化失败:', error);
            // 回退到传统下载方式
            initFallbackDownload();
        }
    }, 1000); // 延迟1秒等待依赖包加载
});

/**
 * 初始化回退下载方式
 */
function initFallbackDownload() {
    console.log('使用传统PDF下载方式');
    
    // 这里可以初始化原来的PDF下载功能
    if (typeof PDFDownloadManager !== 'undefined') {
        new PDFDownloadManager();
    }
}

/**
 * 全局PDF转换方法
 */
window.convertHTMLToPDF = function(element, options) {
    if (pdfConverter) {
        return pdfConverter.convertToPDF(element, options);
    } else {
        console.error('PDF转换器未初始化');
        return Promise.resolve(false);
    }
};

/**
 * 转换通知页面为PDF
 */
window.convertNoticeToPDF = function(filename) {
    if (pdfConverter) {
        return pdfConverter.convertNoticeToPDF(filename);
    } else {
        console.error('PDF转换器未初始化');
        return Promise.resolve(false);
    }
};

/**
 * 转换招生页面为PDF
 */
window.convertAdmissionToPDF = function(filename) {
    if (pdfConverter) {
        return pdfConverter.convertAdmissionToPDF(filename);
    } else {
        console.error('PDF转换器未初始化');
        return Promise.resolve(false);
    }
};

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HTMLToPDFConverter;
}
