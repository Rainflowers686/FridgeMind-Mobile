# FridgeMind AI —— 灵犀冰箱 ❄️

**FridgeMind AI** 是一款打通硬件终端、局域网服务器与移动 App 的全栈物联网系统。本项目核心在于解决了封闭金属环境下低功耗视觉传输与食材智能管理的难题。

## 🌟 核心特性
* **硬件协同**：基于 Purple Pi OH (RK3566) 开发板，适配 Ubuntu 20 系统。
* **本地算力**：利用板载 1T 算力 NPU 实现图像畸变校正与轻量化预处理。
* **触发拍摄**：采用“门磁感知状态变化”逻辑，仅在关门瞬间触发拍摄，极致降低功耗。
* **AI 视觉**：后端集成 YOLOv8/v10 引擎，精准识别食材并自动更新库存。
* **科技感 UI**：基于 React Native 构建，落实 40 条美化建议，具备冰蓝科技感玻璃拟物视觉。

## 🏗️ 系统架构
1. **终端层 (Edge Device)**: Purple Pi OH + MIPI-CSI 摄像头 + 温湿度计 + 门磁传感器。
2. **服务层 (Local Server)**: FastAPI (Python) + YOLO 识别引擎 + SQLite 数据库。
3. **应用层 (App/Frontend)**: React Native + Expo + Axios 实时轮询。

## 📸 页面功能
* **监控大屏**: 实时温湿度进度环可视化、舱门状态 Animated Switch。
* **AI 清单**: 食材保鲜期红黄绿状态灯、数量统计与过期自动预警。
* **历史趋势**: 锁死整数刻度的环境波动曲线分析，彻底解决数据偏移。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
# 若遇到版本冲突，请使用以下命令
npm install --legacy-peer-deps
```

### 2. 配置后端地址
修改根目录下的 `config.js`：
```javascript
export const API_BASE_URL = "[http://10.150.162.117:8000](http://10.150.162.117:8000)";
```

### 3. 启动项目
```bash
npx expo start -c --web
```

## 🛠️ 关键技术细节
* **抗屏蔽 Wi-Fi**: 采用外置 IPEX 胶棒天线，引出金属箱体解决信号屏蔽。
* **镜头除雾**: 通过 0.5W 电阻加热片配合防雾涂层，应对冷凝水干扰。
* **功耗优化**: 采用 Ubuntu 系统级 `suspend` 深度休眠，由门磁 GPIO 中断唤醒。

## 🤝 开发团队
* **项目归属**: ITStudio (爱特工作室)
* **Mobile App**: Rainflowers686 (李雨润)