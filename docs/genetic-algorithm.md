# 遗传算法切割优化服务

基于 `GuillotineCuttingService` 的物理约束原则，`GeneticCuttingService` 使用遗传算法进一步优化切割件的排列顺序和旋转状态，以提高材料利用率。

## 算法特点

### 1. 物理约束遵循
- **继承 Guillotine 约束**：所有切割都遵循断头台原则（直线切割，从边到边）
- **锯片厚度考虑**：在布局时正确考虑锯片宽度
- **边距处理**：支持材料边距设置
- **旋转约束**：尊重切割件的旋转设置（固定方向、固定旋转、自适应）

### 2. 遗传算法优化
- **染色体表示**：切割件排列顺序 + 旋转状态组合
- **适应度函数**：综合考虑利用率、切割复杂度、碎片化程度、旋转适度性
- **进化操作**：顺序交叉、变异、锦标赛选择
- **收敛控制**：适应度阈值 + 停滞代数控制

### 3. 自适应参数
根据切割件数量自动调整遗传算法参数：
- **小规模（≤20件）**：种群30，代数50，快速收敛
- **中等规模（21-50件）**：种群50，代数100，平衡优化
- **大规模（>50件）**：种群80，代数200，深度优化

## 使用场景

### 推荐使用遗传算法的情况
1. **切割件数量较多**（>10件），优化空间大
2. **对材料利用率要求高**，愿意投入更多计算时间
3. **切割件尺寸差异较大**，需要优化排列顺序
4. **允许旋转的切割件较多**，旋转状态组合复杂

### 建议使用断头台算法的情况
1. **切割件数量较少**（≤10件），遗传算法优势不明显
2. **对计算速度要求高**，需要快速获得结果
3. **切割件尺寸相对统一**，排列顺序影响不大

## 性能特点

### 计算时间
- **小规模问题**：通常 1-3 秒
- **中等规模问题**：通常 5-15 秒
- **大规模问题**：可能需要 30-60 秒

### 优化效果
相比断头台算法，遗传算法通常能：
- **提高利用率**：1-5% 的材料利用率改进
- **减少浪费**：特别是在复杂布局场景中
- **优化切割顺序**：生成更合理的切割序列

## 参数配置

### 基本参数
```typescript
interface GeneticParameters {
  populationSize: number      // 种群大小 (30-100)
  maxGenerations: number      // 最大进化代数 (50-200)
  crossoverRate: number       // 交叉概率 (0.7-0.9)
  mutationRate: number        // 变异概率 (0.05-0.2)
  eliteRatio: number          // 精英保留比例 (0.05-0.2)
  convergenceThreshold: number // 收敛阈值 (0.1-1.0)
  maxStagnantGenerations: number // 最大停滞代数 (10-30)
}
```

### 调优建议
- **提高探索能力**：增大种群大小、提高变异率
- **加快收敛速度**：减少最大代数、提高精英比例
- **平衡质量与速度**：根据具体需求调整收敛阈值

## 适应度函数

遗传算法使用多目标适应度函数：

1. **利用率权重**：1000 × 利用率
2. **切割复杂度惩罚**：-0.5 × 切割步骤数
3. **碎片化惩罚**：-100 × 碎片化比例
4. **旋转适度性**：最优旋转比例30%，偏离则惩罚

## 使用示例

```typescript
import { GeneticCuttingService } from '@/services/cutting/GeneticCuttingService'

// 基本使用
const service = new GeneticCuttingService(settings)
const result = service.calculateLayout(material, items)

// 自定义参数
const geneticParams = {
  populationSize: 60,
  maxGenerations: 150,
  convergenceThreshold: 0.3
}
const serviceCustom = new GeneticCuttingService(settings, geneticParams)
const resultCustom = serviceCustom.calculateLayout(material, items)

// 获取统计信息
const stats = service.getGeneticStatistics()
console.log(`进化了 ${stats.generation} 代，最佳浪费率: ${stats.bestWastePercentage.toFixed(2)}%`)
```

## 技术实现细节

### 染色体编码
- **序列基因**：切割件的排列顺序 `[2, 0, 4, 1, 3, ...]`
- **旋转基因**：对应位置的旋转状态 `[false, true, false, ...]`

### 交叉操作
使用顺序交叉（Order Crossover, OX）：
1. 随机选择两个交叉点
2. 复制父代1的中间段到子代
3. 从父代2依序填充剩余位置

### 变异操作
- **序列变异**：随机交换两个位置的切割件
- **旋转变异**：随机改变某个允许旋转的切割件的旋转状态

### 选择策略
使用锦标赛选择，默认锦标赛大小为3，平衡选择压力和多样性。

## 注意事项

1. **内存使用**：大种群会占用更多内存，建议监控资源使用情况
2. **随机性**：每次运行结果可能略有不同，这是遗传算法的正常特征
3. **参数敏感性**：不合适的参数可能导致收敛过快或收敛过慢
4. **物理约束**：所有解都保证满足 Guillotine 切割约束，但可能不是全局最优

## 后续优化方向

1. **多目标优化**：使用 NSGA-II 等算法处理多目标优化
2. **混合算法**：结合局部搜索提高解质量
3. **并行计算**：利用 Web Workers 实现并行进化
4. **自适应参数**：根据进化过程动态调整参数
5. **问题特定启发式**：针对切割问题设计专门的遗传算子