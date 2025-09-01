/**
 * PDF下载功能增强模块
 * 提供文件检查、下载状态管理和用户友好的下载体验
 */

class PDFDownloadManager {
    constructor() {
        this.downloadStatus = null;
        this.downloadBtn = null;
        this.viewBtn = null;
        this.filePath = '';
        this.fileName = '';
        this.fileSize = '';
        this.init();
    }

    init() {
        this.downloadStatus = document.getElementById('download-status');
        this.downloadBtn = document.getElementById('download-pdf');
        this.viewBtn = document.getElementById('view-pdf');
        
        if (this.downloadBtn && this.downloadBtn.href) {
            this.filePath = this.downloadBtn.href;
            this.fileName = this.downloadBtn.download || 'document.pdf';
            
            // 调试信息
            console.log('PDF下载管理器初始化:', {
                filePath: this.filePath,
                fileName: this.fileName,
                href: this.downloadBtn.href,
                download: this.downloadBtn.download
            });
        }
        
        this.bindEvents();
        this.checkFileAvailability();
    }

    bindEvents() {
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', (e) => this.handleDownload(e));
        }
        
        if (this.viewBtn) {
            this.viewBtn.addEventListener('click', (e) => this.handleView(e));
        }
    }

    /**
     * 处理下载按钮点击
     */
    handleDownload(e) {
        e.preventDefault();
        
        if (!this.filePath) {
            this.showStatus('下载路径无效', 'error');
            return;
        }

        this.showStatus('正在准备下载...', 'loading');
        
        // 延迟执行下载，给用户看到状态变化
        setTimeout(() => {
            this.performDownload();
        }, 800);
    }

    /**
     * 执行实际下载
     */
    performDownload() {
        try {
            // 验证文件路径
            if (!this.validateFilePath()) {
                this.showStatus('文件路径无效，请检查文件是否存在', 'error');
                return;
            }

            // 创建隐藏的下载链接
            const link = document.createElement('a');
            link.href = this.filePath;
            link.download = this.fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // 触发下载
            link.click();
            document.body.removeChild(link);
            
            this.showStatus('下载已开始！如果下载没有自动开始，请右键点击链接选择"另存为"', 'success');
            
            // 3秒后清除状态
            setTimeout(() => this.clearStatus(), 3000);
            
        } catch (error) {
            console.error('下载失败:', error);
            this.showStatus('下载失败，请检查网络连接或右键点击链接选择"另存为"', 'error');
            
            // 5秒后清除状态
            setTimeout(() => this.clearStatus(), 5000);
        }
    }

    /**
     * 验证文件路径
     */
    validateFilePath() {
        try {
            // 检查路径是否为空
            if (!this.filePath || this.filePath.trim() === '') {
                console.error('文件路径为空');
                return false;
            }

            // 检查路径格式
            const url = new URL(this.filePath, window.location.href);
            console.log('验证文件路径:', {
                original: this.filePath,
                resolved: url.href,
                pathname: url.pathname
            });

            return true;
        } catch (error) {
            console.error('文件路径验证失败:', error);
            return false;
        }
    }

    /**
     * 处理查看PDF按钮点击
     */
    handleView(e) {
        this.showStatus('正在打开PDF文件...', 'loading');
        
        // 2秒后清除状态
        setTimeout(() => this.clearStatus(), 2000);
    }

    /**
     * 检查文件是否可用
     */
    async checkFileAvailability() {
        if (!this.filePath) {
            console.warn('文件路径未设置，跳过可用性检查');
            return;
        }
        
        try {
            console.log('开始检查文件可用性:', this.filePath);
            
            // 修复路径问题：确保使用正确的相对路径
            let checkPath = this.filePath;
            if (checkPath.startsWith('./')) {
                checkPath = checkPath.substring(2);
            }
            
            const response = await fetch(checkPath, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            
            console.log('文件检查响应:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });
            
            if (response.ok) {
                // 获取文件大小
                const contentLength = response.headers.get('content-length');
                if (contentLength) {
                    this.fileSize = this.formatFileSize(parseInt(contentLength));
                    this.updateFileSizeDisplay();
                }
                
                this.showStatus('文件可用，可以正常下载', 'success');
                setTimeout(() => this.clearStatus(), 3000);
            } else {
                console.error('文件不可用:', response.status, response.statusText);
                this.showStatus(`文件不可用 (${response.status})，请联系管理员`, 'error');
                this.disableDownloadButtons();
            }
        } catch (error) {
            console.error('文件检查失败:', error);
            
            // 根据错误类型显示不同的提示
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.showStatus('网络错误，请检查网络连接', 'error');
            } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                this.showStatus('文件不存在或无法访问，请检查文件路径', 'error');
            } else {
                this.showStatus('文件检查失败，请稍后重试', 'error');
            }
            
            // 不自动禁用按钮，让用户尝试手动下载
        }
    }

    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * 更新文件大小显示
     */
    updateFileSizeDisplay() {
        const fileSizeElement = document.querySelector('.file-size');
        if (fileSizeElement && this.fileSize) {
            fileSizeElement.textContent = `文件大小：${this.fileSize}`;
        }
    }

    /**
     * 显示状态信息
     */
    showStatus(message, type = 'info') {
        if (!this.downloadStatus) {
            console.warn('下载状态元素未找到:', message);
            return;
        }
        
        this.downloadStatus.textContent = message;
        this.downloadStatus.className = `download-status ${type}`;
        
        console.log('显示状态:', { message, type });
    }

    /**
     * 清除状态信息
     */
    clearStatus() {
        if (!this.downloadStatus) return;
        
        this.downloadStatus.textContent = '';
        this.downloadStatus.className = 'download-status';
    }

    /**
     * 禁用下载按钮
     */
    disableDownloadButtons() {
        if (this.downloadBtn) {
            this.downloadBtn.style.opacity = '0.5';
            this.downloadBtn.style.pointerEvents = 'none';
        }
        if (this.viewBtn) {
            this.viewBtn.style.opacity = '0.5';
            this.viewBtn.style.pointerEvents = 'none';
        }
    }

    /**
     * 启用下载按钮
     */
    enableDownloadButtons() {
        if (this.downloadBtn) {
            this.downloadBtn.style.opacity = '1';
            this.downloadBtn.style.pointerEvents = 'auto';
        }
        if (this.viewBtn) {
            this.viewBtn.style.opacity = '1';
            this.viewBtn.style.pointerEvents = 'auto';
        }
    }
}

// 页面加载完成后初始化下载管理器
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否存在下载元素
    if (document.getElementById('download-pdf') || document.getElementById('view-pdf')) {
        console.log('初始化PDF下载管理器...');
        new PDFDownloadManager();
    } else {
        console.log('未找到PDF下载元素，跳过初始化');
    }
});

// 导出类供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFDownloadManager;
}
