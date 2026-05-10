import type { NextConfig } from "next";
import fs from 'fs';
import path from 'path';

const baseConfig: NextConfig = {
    output: 'export',
    basePath: '',
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
};

// 尝试加载本地私有配置文件
let finalConfig = baseConfig;
try {
    const localConfigPath = path.join(process.cwd(), 'next.config.local.ts');
    if (fs.existsSync(localConfigPath)) {
        // 动态导入本地配置
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const localModule = require(localConfigPath);
        const localConfig = localModule.default || localModule;

        // 合并配置（本地配置优先）
        finalConfig = {
            ...baseConfig,
            ...localConfig,
            // 特殊处理 webpack 配置，如果本地有则使用本地的
            webpack: localConfig.webpack || baseConfig.webpack,
        };
    }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (error) {
    // 如果加载失败，忽略错误，使用默认配置
}

export default finalConfig;