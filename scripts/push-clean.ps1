# 推送代码到远程仓库（压缩所有历史为单个提交）
# 使用方法：.\scripts\push-clean.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  准备推送代码到远程仓库" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前分支
$currentBranch = git branch --show-current
Write-Host "当前分支: $currentBranch" -ForegroundColor Yellow

# 确认操作
$confirm = Read-Host "这将覆盖远程仓库的历史记录，是否继续？(y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "操作已取消" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "步骤 1: 创建临时分支..." -ForegroundColor Green
git checkout --orphan temp-release

Write-Host "步骤 2: 暂存所有文件..." -ForegroundColor Green
git add -A

Write-Host "步骤 3: 创建干净提交..." -ForegroundColor Green
$commitMessage = Read-Host "请输入提交信息 (默认: Release v0.1.0)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Release v0.1.0"
}
git commit -m $commitMessage

Write-Host "步骤 4: 删除旧的 dev 分支..." -ForegroundColor Green
git branch -D dev

Write-Host "步骤 5: 重命名临时分支为 dev..." -ForegroundColor Green
git branch -m dev

Write-Host "步骤 6: 强制推送到远程..." -ForegroundColor Green
git push -f origin dev

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  推送完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "远程仓库现在只有一个干净的提交历史记录" -ForegroundColor Green
