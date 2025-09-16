import type { 
  Material, 
  CuttingItem, 
  CuttingResult, 
  CuttingSettings
} from '@/models/types'
import { GuillotineCuttingService } from './GuillotineCuttingService'

/**
 * 遗传算法个体（染色体）- 表示切割件的排列顺序和旋转状态
 */
interface Chromosome {
  id: string
  sequence: number[] // 切割件的排列顺序索引
  rotations: boolean[] // 对应位置是否旋转
  fitness: number // 适应度得分
  wastePercentage: number // 浪费率
  layout?: CuttingResult | undefined // 实际布局结果（缓存）
}

/**
 * 遗传算法参数配置
 */
interface GeneticParameters {
  populationSize: number // 种群大小
  maxGenerations: number // 最大进化代数
  crossoverRate: number // 交叉概率
  mutationRate: number // 变异概率
  eliteRatio: number // 精英保留比例
  convergenceThreshold: number // 收敛阈值
  maxStagnantGenerations: number // 最大停滞代数
}

/**
 * 遗传算法优化的切割服务
 * 基于 GuillotineCuttingService 的物理约束原则，通过遗传算法优化切割件的排列顺序和旋转状态
 */
export class GeneticCuttingService extends GuillotineCuttingService {
  private geneticParams: GeneticParameters
  private population: Chromosome[] = []
  private generation: number = 0
  private bestChromosome: Chromosome | null = null
  private stagnantGenerations: number = 0
  protected override settings: CuttingSettings // 重新声明为 protected 以便子类访问

  constructor(settings: CuttingSettings, geneticParams?: Partial<GeneticParameters>) {
    super(settings)
    this.settings = settings
    
    // 默认遗传算法参数
    this.geneticParams = {
      populationSize: 50,
      maxGenerations: 100,
      crossoverRate: 0.8,
      mutationRate: 0.1,
      eliteRatio: 0.1,
      convergenceThreshold: 0.01,
      maxStagnantGenerations: 20,
      ...geneticParams
    }
  }

  /**
   * 计算单个材料的切割布局 - 使用遗传算法优化
   */
  override calculateLayout(material: Material, items: CuttingItem[]): CuttingResult {
    // 如果切割件数量较少，直接使用 Guillotine 算法
    if (items.length <= 10) {
      return super.calculateLayout(material, items)
    }

    console.log(`开始遗传算法优化，切割件数量: ${items.length}`)
    const startTime = Date.now()

    // 初始化遗传算法
    this.initializePopulation(items)
    
    // 进化循环
    for (this.generation = 1; this.generation <= this.geneticParams.maxGenerations; this.generation++) {
      // 评估当前种群
      this.evaluatePopulation(material, items)
      
      // 检查收敛条件
      if (this.checkConvergence()) {
        console.log(`遗传算法在第 ${this.generation} 代收敛`)
        break
      }
      
      // 选择、交叉、变异生成新种群
      this.evolvePopulation(items)
      
      // 每10代输出进度
      if (this.generation % 10 === 0) {
        const bestFitness = this.bestChromosome?.fitness || 0
        const bestWaste = this.bestChromosome?.wastePercentage || 100
        console.log(`第 ${this.generation} 代，最佳适应度: ${bestFitness.toFixed(4)}, 浪费率: ${bestWaste.toFixed(2)}%`)
      }
    }

    const endTime = Date.now()
    console.log(`遗传算法优化完成，耗时: ${endTime - startTime}ms，最终浪费率: ${this.bestChromosome?.wastePercentage.toFixed(2)}%`)

    // 返回最佳解的布局结果
    return this.bestChromosome?.layout || super.calculateLayout(material, items)
  }

  /**
   * 初始化种群
   */
  private initializePopulation(items: CuttingItem[]): void {
    this.population = []
    this.generation = 0
    this.bestChromosome = null
    this.stagnantGenerations = 0

    // 展开数量，每个数量作为单独的item处理
    const expandedItems = this.expandItemsByQuantity(items)
    const itemCount = expandedItems.length

    // 生成初始种群
    for (let i = 0; i < this.geneticParams.populationSize; i++) {
      const chromosome: Chromosome = {
        id: `gen0_chr${i}`,
        sequence: this.generateRandomSequence(itemCount),
        rotations: this.generateRandomRotations(expandedItems),
        fitness: 0,
        wastePercentage: 100
      }
      
      this.population.push(chromosome)
    }

    // 第一个个体使用启发式初始化（面积降序）
    if (this.population.length > 0) {
      const sortedIndices = expandedItems
        .map((item, index) => ({ item, index, area: item.length * item.width }))
        .sort((a, b) => b.area - a.area)
        .map(item => item.index)
      
      this.population[0].sequence = sortedIndices
    }
  }

  /**
   * 评估种群中所有个体的适应度
   */
  private evaluatePopulation(material: Material, items: CuttingItem[]): void {
    const expandedItems = this.expandItemsByQuantity(items)

    for (const chromosome of this.population) {
      if (chromosome.layout) {
        // 已经评估过，跳过
        continue
      }

      // 根据染色体的排列顺序重新排列切割件，并转换为单个数量的切割件
      const orderedItems: Array<CuttingItem & { originalIndex: number }> = chromosome.sequence.map(index => {
        const item = { ...expandedItems[index] }
        
        // 根据旋转状态调整切割件方向
        if (chromosome.rotations[index]) {
          // 交换长宽实现旋转
          const temp = item.length
          item.length = item.width
          item.width = temp
        }
        
        // 保持展开后的ID格式和originalIndex
        return item
      })

      // 使用父类的核心布局算法，避免重复展开
      const result = this.calculateLayoutFromExpandedItems(material, orderedItems)
      
      // 计算适应度
      chromosome.layout = result
      chromosome.wastePercentage = result.wastePercentage
      chromosome.fitness = this.calculateFitness(result)

      // 更新最佳个体
      if (!this.bestChromosome || chromosome.fitness > this.bestChromosome.fitness) {
        this.bestChromosome = { ...chromosome }
        this.stagnantGenerations = 0
      }
    }
  }

  /**
   * 计算适应度得分 - 简化版本
   */
  private calculateFitness(result: CuttingResult): number {
    const utilizationRate = (100 - result.wastePercentage) / 100
    return utilizationRate * 1000
  }

  // 其他遗传算法方法保持不变...
  private generateRandomSequence(length: number): number[] {
    const sequence = Array.from({ length }, (_, i) => i)
    for (let i = sequence.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[sequence[i], sequence[j]] = [sequence[j], sequence[i]]
    }
    return sequence
  }

  private generateRandomRotations(items: Array<CuttingItem & { originalIndex: number }>): boolean[] {
    return items.map(item => {
      switch (item.rotatation) {
        case 'fixed-default': return false
        case 'fixed-rotate': return true
        case 'auto':
        default:
          return this.settings.allowRotation && item.width !== item.length && Math.random() < 0.5
      }
    })
  }

  private checkConvergence(): boolean {
    if (!this.bestChromosome) return false
    if (this.bestChromosome.wastePercentage < this.geneticParams.convergenceThreshold) return true
    this.stagnantGenerations++
    return this.stagnantGenerations >= this.geneticParams.maxStagnantGenerations
  }

  private evolvePopulation(items: CuttingItem[]): void {
    const eliteCount = Math.max(1, Math.floor(this.population.length * this.geneticParams.eliteRatio))
    this.population.sort((a, b) => b.fitness - a.fitness)
    
    const newPopulation: Chromosome[] = this.population.slice(0, eliteCount).map(chr => ({
      ...chr,
      id: `gen${this.generation}_elite${chr.id}`
    }))

    while (newPopulation.length < this.geneticParams.populationSize) {
      const parent1 = this.tournamentSelection()
      const parent2 = this.tournamentSelection()
      const offspring = this.crossover(parent1, parent2)
      this.mutate(offspring, items)
      
      offspring.id = `gen${this.generation}_chr${newPopulation.length}`
      offspring.layout = undefined
      newPopulation.push(offspring)
    }
    
    this.population = newPopulation
  }

  private tournamentSelection(tournamentSize: number = 3): Chromosome {
    const tournament = []
    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length)
      tournament.push(this.population[randomIndex])
    }
    return tournament.reduce((best, current) => 
      current.fitness > best.fitness ? current : best
    )
  }

  private crossover(parent1: Chromosome, parent2: Chromosome): Chromosome {
    if (Math.random() > this.geneticParams.crossoverRate) {
      return Math.random() < 0.5 ? { ...parent1 } : { ...parent2 }
    }

    const length = parent1.sequence.length
    const start = Math.floor(Math.random() * length)
    const end = Math.floor(Math.random() * (length - start)) + start
    
    const childSequence = new Array(length).fill(-1)
    const childRotations = new Array(length)
    
    for (let i = start; i <= end; i++) {
      childSequence[i] = parent1.sequence[i]
      childRotations[i] = parent1.rotations[i]
    }
    
    let parent2Index = 0
    for (let i = 0; i < length; i++) {
      if (childSequence[i] === -1) {
        while (childSequence.includes(parent2.sequence[parent2Index])) {
          parent2Index++
        }
        childSequence[i] = parent2.sequence[parent2Index]
        childRotations[i] = parent2.rotations[parent2Index]
        parent2Index++
      }
    }
    
    return {
      id: '',
      sequence: childSequence,
      rotations: childRotations,
      fitness: 0,
      wastePercentage: 100
    }
  }

  private mutate(chromosome: Chromosome, items: CuttingItem[]): void {
    if (Math.random() < this.geneticParams.mutationRate) {
      const length = chromosome.sequence.length
      const pos1 = Math.floor(Math.random() * length)
      const pos2 = Math.floor(Math.random() * length)
      
      ;[chromosome.sequence[pos1], chromosome.sequence[pos2]] = 
       [chromosome.sequence[pos2], chromosome.sequence[pos1]]
      
      ;[chromosome.rotations[pos1], chromosome.rotations[pos2]] = 
       [chromosome.rotations[pos2], chromosome.rotations[pos1]]
    }
    
    if (Math.random() < this.geneticParams.mutationRate) {
      const expandedItems = this.expandItemsByQuantity(items)
      const length = chromosome.rotations.length
      const pos = Math.floor(Math.random() * length)
      const item = expandedItems[chromosome.sequence[pos]]
      
      if (item.rotatation === 'auto' && this.settings.allowRotation && item.width !== item.length) {
        chromosome.rotations[pos] = !chromosome.rotations[pos]
      }
    }
  }

  getGeneticStatistics() {
    return {
      generation: this.generation,
      populationSize: this.population.length,
      bestFitness: this.bestChromosome?.fitness || 0,
      bestWastePercentage: this.bestChromosome?.wastePercentage || 100,
      convergenceThreshold: this.geneticParams.convergenceThreshold,
      stagnantGenerations: this.stagnantGenerations,
      maxStagnantGenerations: this.geneticParams.maxStagnantGenerations
    }
  }

  setGeneticParameters(params: Partial<GeneticParameters>): void {
    this.geneticParams = { ...this.geneticParams, ...params }
  }
}