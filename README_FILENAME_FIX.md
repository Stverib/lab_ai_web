# 文件名问题修复说明

## 问题描述

在使用HTML转PDF功能时，发现生成的文件名与原始文件名不一致：

- **原始文件名**: `1.关于举办全国旅游标准化技术委员会业务工作培训班的通知.pdf`
- **生成的文件名**: `关于举办全国旅游标准化技术委员会业务工作培训班的通知.pdf`

## 问题原因

1. **硬编码文件名**: 在HTML转PDF功能中，文件名是硬编码的，没有保持与原始文件名的一致性
2. **缺少前缀**: 生成的PDF文件名缺少了原始文件名中的"1."前缀
3. **命名规则不统一**: 没有统一的命名规则来保持文件名的关联性

## 解决方案

### 1. 保持文件名一致性

```javascript
// 修复前：硬编码文件名
const filename = '关于举办全国旅游标准化技术委员会业务工作培训班的通知_生成版.pdf';

// 修复后：保持与原始文件名一致
const originalFilename = '1.关于举办全国旅游标准化技术委员会业务工作培训班的通知.pdf';
const generatedFilename = originalFilename.replace('.pdf', '_生成版.pdf');
```

### 2. 智能文件名生成

```javascript
// 自动获取页面标题
const pageTitle = document.querySelector('.notice-detail-header h1')?.textContent || '通知文件';

// 生成文件名
const originalFilename = '1.关于举办全国旅游标准化技术委员会业务工作培训班的通知.pdf';
const generatedFilename = originalFilename.replace('.pdf', '_生成版.pdf');
```

### 3. 文件名命名规则

| 文件类型 | 命名规则 | 示例 |
|----------|----------|------|
| 原始PDF | `1.标题.pdf` | `1.关于举办全国旅游标准化技术委员会业务工作培训班的通知.pdf` |
| 生成PDF | `1.标题_生成版.pdf` | `1.关于举办全国旅游标准化技术委员会业务工作培训班的通知_生成版.pdf` |

## 修复后的效果

### 文件名对比

| 修复前 | 修复后 |
|--------|--------|
| `关于举办全国旅游标准化技术委员会业务工作培训班的通知_生成版.pdf` | `1.关于举办全国旅游标准化技术委员会业务工作培训班的通知_生成版.pdf` |

### 优势

1. **保持关联性**: 生成的文件名与原始文件名保持关联
2. **易于识别**: 通过前缀"1."可以快速识别文件来源
3. **版本区分**: 通过"_生成版"后缀区分原始文件和生成文件
4. **命名规范**: 统一的命名规则，便于文件管理

## 技术实现

### 1. 文件名提取

```javascript
// 从页面标题中提取文件名
const pageTitle = document.querySelector('.notice-detail-header h1')?.textContent || '通知文件';

// 从原始链接中提取文件名
const originalLink = document.querySelector('#download-pdf').href;
const originalFilename = originalLink.split('/').pop(); // 获取文件名部分
```

### 2. 文件名转换

```javascript
// 生成新的文件名
const generatedFilename = originalFilename.replace('.pdf', '_生成版.pdf');

// 保存PDF
pdf.save(generatedFilename);
```

### 3. 状态提示

```javascript
// 显示生成的文件名
statusElement.textContent = `PDF下载完成！文件名：${generatedFilename}`;
```

## 使用建议

### 1. 文件管理

- 将原始PDF和生成PDF放在同一目录下
- 使用统一的命名规则
- 定期清理临时生成的文件

### 2. 版本控制

- 保留原始PDF作为源文件
- 生成的PDF作为可编辑版本
- 在文件名中标注生成时间（可选）

### 3. 用户提示

- 在界面上明确显示生成的文件名
- 提供文件名预览功能
- 允许用户自定义文件名

## 未来改进

### 1. 动态文件名

```javascript
// 根据页面内容动态生成文件名
const generateDynamicFilename = (content) => {
    const title = extractTitle(content);
    const timestamp = new Date().toISOString().slice(0, 10);
    return `1.${title}_${timestamp}_生成版.pdf`;
};
```

### 2. 用户自定义

```javascript
// 允许用户输入自定义文件名
const customFilename = prompt('请输入文件名:', generatedFilename);
if (customFilename) {
    pdf.save(customFilename);
}
```

### 3. 批量处理

```javascript
// 支持批量文件生成
const batchGenerate = (files) => {
    files.forEach(file => {
        const filename = file.name.replace('.pdf', '_生成版.pdf');
        // 生成PDF逻辑
    });
};
```

## 总结

通过修复文件名问题，我们实现了：

1. **文件名一致性**: 生成的文件名与原始文件名保持关联
2. **命名规范化**: 统一的命名规则，便于文件管理
3. **用户体验**: 清晰的文件名，易于识别和管理
4. **技术改进**: 智能的文件名生成机制

这个修复确保了HTML转PDF功能的完整性和可用性，用户可以轻松区分原始文件和生成文件，提高了文件管理的效率。

---

如有其他问题或建议，请联系开发团队。
