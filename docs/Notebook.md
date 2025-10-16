# CipheredMicroloan-Bazaar 手记

CipheredMicroloan-Bazaar 支持发展中国家的小额贷款，保护借款人隐私。

## 流程
- 借款人数据 `euint64`，`MicroloanHub` 合约计算评分。
- `FHE.select` 决定利率区间。
- Gateway attestation 验证社区组织。
- `Obfuscated Reserves` 隐藏资金池。

## 后续
- 集成手机钱包，支持离线提交。
- 编写风控脚本，`FHE.lt` 触发提醒。
