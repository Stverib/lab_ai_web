// const http = require('http');
// const fs = require('fs');
// const path = require('path');

// const PORT = 3000;

// const server = http.createServer((req, res) => {
//   // 获取请求的文件路径
//   let filePath = '.' + req.url;
//   if (filePath === './') {
//     filePath = './index.html';
//   }

//   // 获取文件扩展名
//   const extname = path.extname(filePath);
  
//   // 设置内容类型
//   let contentType = 'text/html';
//   switch (extname) {
//     case '.js':
//       contentType = 'text/javascript';
//       break;
//     case '.css':
//       contentType = 'text/css';
//       break;
//     case '.json':
//       contentType = 'application/json';
//       break;
//     case '.png':
//       contentType = 'image/png';
//       break;
//     case '.jpg':
//     case '.jpeg':
//       contentType = 'image/jpeg';
//       break;
//     case '.gif':
//       contentType = 'image/gif';
//       break;
//     case '.pdf':
//       contentType = 'application/pdf';
//       break;
//   }

//   // 读取文件
//   fs.readFile(filePath, (err, content) => {
//     if (err) {
//       if (err.code === 'ENOENT') {
//         // 文件不存在
//         console.log(`文件不存在: ${filePath}`);
//         fs.readFile('./index.html', (err, content) => {
//           if (err) {
//             res.writeHead(500);
//             res.end('服务器错误');
//             return;
//           }
//           res.writeHead(200, { 'Content-Type': 'text/html' });
//           res.end(content, 'utf8');
//         });
//       } else {
//         // 服务器错误
//         res.writeHead(500);
//         res.end(`服务器错误: ${err.code}`);
//       }
//     } else {
//       // 成功
//       res.writeHead(200, { 'Content-Type': contentType });
//       res.end(content, 'utf8');
//     }
//   });
// });

// // 在所有网络接口上监听
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`服务器运行在 http://localhost:${PORT}`);
// });



const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  // 解决中文路径：先 decode
  let filePath = '.' + decodeURIComponent(req.url);
  if (filePath === './') {
    filePath = './index.html';
  }

  // 获取文件扩展名
  const extname = path.extname(filePath);

  // 设置内容类型
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.gif':
      contentType = 'image/gif';
      break;
    case '.pdf':
      contentType = 'application/pdf';
      break;
  }

  // 读取文件（保持二进制，不要强制 utf8）
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log(`文件不存在: ${filePath}`);
        fs.readFile('./index.html', 'utf8', (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('服务器错误');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
      } else {
        res.writeHead(500);
        res.end(`服务器错误: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content); // 🚀 不要传 'utf8'，直接输出 Buffer
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
