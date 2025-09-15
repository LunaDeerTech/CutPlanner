# GitHub Copilot Instructions for CutPlanner

这是一个纯前端工具，用 Vue 3 + Vite + TypeScript 开发，目标是辅助木板切割规划（CutPlanner）。用户输入原料木板尺寸与要切割目标板尺寸与数量，配置锯片厚度等参数，然后生成最优切割排版示意图，标注尺寸，以减少浪费。

## 项目背景与目标

- 用途：帮助木工或家具制作人规划从木板大板到多个目标小板的切割方案，最大化利用率、最小化损耗与切割次数。
- 要求工具完全在前端运行，不依赖后端服务。
- 最终用户流程包括：配置原料信息（尺寸、厚度、材质等） → 下载切割清单模板 → 在模板中填写目标板尺寸与数量 → 上传/导入模板 → 配置切割参数（如锯片厚度等） → 执行排版算法 → 显示切割示意图（含尺寸标注） → 可导出 PNG 图像或报告。

## 使用的工具与库

- Vue 3 + Vite + TypeScript  
- Pinia 作为状态管理  
- Tailwind CSS（或其它你喜欢的 CSS 框架）用于样式布局  
- SheetJS / xlsx 用于 Excel 导出与导入  
- SVG 或 Canvas 用于绘制切割示意图  
- 本地持久化（localStorage）用于保存配置（锯片厚度、旋转允许与否等）  

## UI设计（建议）

UI 围绕“用户一次次完成一个步骤”来组织，让界面简单、直观，同时保留算法和结果的专业感。
界面应简洁、信息分区明确，主体颜色建议以浅灰/白为背景，强调色可用蓝绿色或橙色点缀按钮和高亮区域。
从上到下的典型布局，依次为：
1. 原料配置：包含一个添加按钮，点击后弹出表单输入原料尺寸、厚度、材质等，列表显示已添加的原料。
2. 切割清单：包含一个添加按钮，点击后弹出表单输入目标板尺寸与数量，列表显示已添加的目标板。旁边放一个“下载模板”按钮、一个“上传模板”按钮。
3. 参数配置：锯片厚度、留边距、原料选择、算法选择等选项，使用表单控件（输入框、开关、下拉等）。
4. 生成排版按钮：一个大而显眼的按钮，点击后执行排版算法。
5. 切割示意图：占据页面主要部分，显示原料板与切割结果，支持缩放与拖拽查看细节。
6. 导出按钮：PNG 导出、报告下载等，放在示意图下方或右上角。


## 代码与风格规范（建议）

### General Principles
- 使用 TypeScript 严格模式（strict）  
- 在变量与函数命名中使用 **驼峰式命名**，组件文件名使用 PascalCase  
- Write clean, readable, and maintainable code
- Follow SOLID principles and design patterns where appropriate
- Prioritize code clarity over cleverness
- Use meaningful variable and function names that reflect their purpose
- Add comments for complex algorithms, especially cutting optimization logic
- 样式统一，Tailwind 原子类 + 可定制样式类，不混用大量 inline 样式  
- 在算法部分写单元测试或至少手动测试几组典型数据用于验证正确性与性能  
- UI 简洁、响应式优先（兼容桌面与移动显示）

### Naming Conventions
- Use camelCase for variables and functions: `calculateOptimalCuts()`, `materialWidth`
- Use PascalCase for classes and types: `CuttingPlan`, `MaterialSheet`
- Use UPPER_SNAKE_CASE for constants: `MAX_SHEET_WIDTH`, `DEFAULT_KERF_WIDTH`
- Use descriptive names that reflect the cutting domain: `cutLength`, `wastePercentage`, `bladeKerf`

### File Structure
```
src/
├── app/                 # 应用入口、路由、全局配置
├── components/          # 通用 UI 组件（按钮、弹窗等）
├── pages/               # 业务页面（RawInput、UploadList、ConfigParams、CuttingResult 等）
├── store/               # Pinia 状态管理
│   ├── material.ts      # 原料状态
│   ├── settings.ts      # 配置项状态
│   └── cutting.ts       # 排版结果状态
├── services/            # 业务逻辑
│   ├── excel/           # 模板生成、Excel 解析
│   ├── cutting/         # 排版算法（基础算法、启发式算法）
│   ├── optimization/    # 优化策略（BestFit、Guillotine 等）
│   └── drawing/         # Canvas / SVG 绘制封装
├── models/              # TS 类型定义（Material、CuttingItem、ResultBlock 等）
├── constants/           # 全局常量、默认配置
├── utils/               # 通用工具（格式化、校验、日志）
├── assets/              # 图片、样式、图标
└── tests/               # 单元测试（算法、服务、组件）
public/                  # 静态资源（Excel 模板等）
.github/                 # Copilot instructions、CI 配置
```

### Algorithm Considerations
- Always consider kerf width in cutting calculations
- Implement multiple optimization strategies (first-fit, best-fit, genetic algorithms)
- Account for grain direction constraints when applicable
- Consider cutting tool limitations and safety margins
- Implement validation for physically impossible cuts


## 分阶段实现建议

为了让开发更可控且易于测试和调整，建议将项目拆分为以下几个阶段，每个阶段实现一个完整独立的功能模块：

1. **项目搭建**  
   - 初始化 Vue + Vite + TypeScript + Tailwind CSS + Pinia  
   - 创建一个干净首页，只显示项目名，比如 “CutPlanner”

2. **原料尺寸输入**  
   - 表单字段：长、宽、厚度、材质 等内容
   - 校验输入是否为正数，单位 mm、inch 可选
   - 保存到状态管理中

3. **目标板列表手动输入**  
   - 表格形式，列头：长、宽、数量  
   - 支持增删行，数量默认 1  
   - 校验输入，保存到状态管理

4. **标板列表模板下载**  
   - 提供按钮下载 Excel 模板  
   - 模板包括列头（长、宽、数量）和几行空示例

5. **导入标板列表清单**  
   - 文件上传，只接受 `.xlsx`  
   - 用 SheetJS 解析，校验格式  
   - 在界面显示表格内容

6. **参数配置**  
   - 输入锯片厚度、是否需留边距等配置项  
   - 保存这些配置至状态管理，并持久化（localStorage）

7. **初步排版算法实现（基础版）**  
   - 数据预处理：标准化单位、排序等  
   - 简单算法：按顺序放置目标板，只要剩余空间能放下就放  
   - 输出每块板材在原料上的位置与尺寸

8. **考虑锯片宽度**  
   - 在排版时考虑切割中锯片会占用的厚度  
   - 调整算法，确保切割后各块尺寸正确

9. **优化排版算法**  
   - 引入启发式或切割树型算法（比如 Guillotine / Best Fit / Bottom‐Left 等）  
   - 比较各算法的利用率与损耗

10. **绘制切割示意图**  
   - 用 SVG 或 Canvas 显示原料板，按算法输出绘制目标板  
   - 在图中标注尺寸与编号  
   - 支持缩放 / 拖拽视图

11. **导出功能与整体集成**  
    - 添加导出 PNG 或图像文件按钮  
    - 添加报告下载（可选）  
    - 打包项目（Vite build），确保可以部署为纯静态站点  
    - 撰写 README，说明如何使用与部署  

## Testing Guidelines

### Unit Tests
- Test cutting algorithms with various input scenarios
- Verify optimization results meet expected waste thresholds
- Test edge cases: zero dimensions, extremely large cuts, invalid inputs
- Mock external dependencies (file I/O, database operations)

### Integration Tests
- Test complete cutting workflows from input to output
- Verify material inventory updates correctly
- Test export functionality for cutting instructions

### Test Data
- Use realistic material dimensions and cutting requirements
- Include common use cases: cabinet making, sheet metal work, fabric cutting
- Test with both metric and imperial units

## Performance Considerations
- Optimize cutting algorithms for large datasets (1000+ cuts)
- Implement caching for frequently used cutting patterns
- Consider memory usage when dealing with complex nesting algorithms
- Profile and benchmark optimization routines

## Error Handling
- Provide clear error messages for invalid cutting dimensions
- Handle cases where no optimal solution exists
- Gracefully handle material shortage scenarios
- Validate user inputs thoroughly before processing

## Documentation Standards
- Document all cutting algorithms with mathematical formulas where applicable
- Include examples of cutting patterns and layouts
- Explain optimization trade-offs and algorithm choices
- Provide clear API documentation for cutting services

## Security and Validation
- Validate all numeric inputs (dimensions, quantities, costs)
- Sanitize file uploads for cutting plans
- Implement reasonable limits on cutting complexity
- Protect against division by zero in optimization calculations

## UI/UX Considerations
- Design interfaces that are intuitive for craftspeople and manufacturers
- Support both visual and numeric input methods
- Provide clear visualizations of cutting layouts
- 提供简洁的页面布局（卡片、表单、表格、绘图区域等），保持一致的配色和留白。
- 所有输入控件加标签、占位符和最基本校验（如必须填写、输入数字）。
- 重要操作按钮（下载模板、生成排版等）需用主色强调，并放在容易点击的位置。
- 绘图页面应首先加载静态示例图，确认 UI 框架后再绑定真实算法输出。
- 支持响应式设计，桌面端显示左右分栏，移动端使用上下堆叠。

## External Integrations
- Support standard file formats for cutting plans (DXF, SVG, CSV)
- Consider integration with CAD software
- Support material supplier catalogs and pricing
- Implement export to CNC/cutting machine formats

## Accessibility
- Support keyboard navigation for all cutting plan features
- Provide alternative text for cutting diagrams
- Support high contrast modes for detailed cutting layouts

## Localization
- Support both metric and imperial measurement systems
- Localize material names and cutting terminology
- Consider regional cutting standards and practices

## Development Workflow
- Use feature branches for new cutting algorithms
- Require code reviews for optimization logic changes
- Run performance benchmarks on cutting algorithm changes
- Maintain backwards compatibility for saved cutting plans

## Copilot 使用期望

当我用 Copilot 生成代码／建议／重构时，希望你能够：

- 自动意识到上述阶段与结构，并建议代码能分阶段集成  
- 在给出代码时，附上简要解释或注释：为什么这样写，设计选择是什么  
- 在算法部分，优先给出清晰简单可扩展的版本，再提供优化建议  
- 在绘图或视图部分，先做基本可见、准确标注的版本，再考虑交互（缩放、拖拽等）  