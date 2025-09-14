# GitHub Copilot Instructions for CutPlanner

## Project Overview
CutPlanner is a cutting optimization and planning application designed to help users efficiently plan cuts for materials such as wood, metal, fabric, or other sheet goods. The application aims to minimize waste and optimize material usage through intelligent cutting algorithms.

## Project Goals
- Minimize material waste through optimal cutting patterns
- Provide intuitive interfaces for inputting cutting requirements
- Support various material types and constraints
- Generate efficient cutting layouts and instructions
- Track material inventory and usage

## Code Style and Conventions

### General Principles
- Write clean, readable, and maintainable code
- Follow SOLID principles and design patterns where appropriate
- Prioritize code clarity over cleverness
- Use meaningful variable and function names that reflect their purpose
- Add comments for complex algorithms, especially cutting optimization logic

### Naming Conventions
- Use camelCase for variables and functions: `calculateOptimalCuts()`, `materialWidth`
- Use PascalCase for classes and types: `CuttingPlan`, `MaterialSheet`
- Use UPPER_SNAKE_CASE for constants: `MAX_SHEET_WIDTH`, `DEFAULT_KERF_WIDTH`
- Use descriptive names that reflect the cutting domain: `cutLength`, `wastePercentage`, `bladeKerf`

### File Structure
```
src/
├── components/          # UI components
├── services/           # Business logic services
│   ├── cutting/        # Cutting algorithm implementations
│   ├── optimization/   # Optimization engines
│   └── material/       # Material management
├── models/             # Data models and types
├── utils/              # Utility functions
├── constants/          # Application constants
└── tests/              # Test files
```

## Domain-Specific Guidelines

### Cutting and Material Terminology
- Use industry-standard terminology:
  - `kerf` - the width of material removed by cutting process
  - `grain direction` - direction of wood grain or material orientation  
  - `yield` - percentage of material successfully used
  - `offcut` - remaining material after cuts are made
  - `nest` - arrangement of cuts to maximize material usage

### Key Data Structures
When working with cutting plans, consider these essential data structures:

```typescript
interface CutRequest {
  length: number;
  width: number;
  quantity: number;
  material: MaterialType;
  priority?: number;
}

interface MaterialSheet {
  id: string;
  length: number;
  width: number;
  thickness: number;
  materialType: MaterialType;
  cost: number;
}

interface CuttingPlan {
  sheets: MaterialSheet[];
  cuts: PlannedCut[];
  wastePercentage: number;
  totalCost: number;
}
```

### Algorithm Considerations
- Always consider kerf width in cutting calculations
- Implement multiple optimization strategies (first-fit, best-fit, genetic algorithms)
- Account for grain direction constraints when applicable
- Consider cutting tool limitations and safety margins
- Implement validation for physically impossible cuts

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
- Include measurement tools and conversion utilities
- Support undo/redo for cutting plan modifications

## External Integrations
- Support standard file formats for cutting plans (DXF, SVG, CSV)
- Consider integration with CAD software
- Support material supplier catalogs and pricing
- Implement export to CNC/cutting machine formats

## Accessibility
- Ensure cutting layouts are accessible to visually impaired users
- Support keyboard navigation for all cutting plan features
- Provide alternative text for cutting diagrams
- Support high contrast modes for detailed cutting layouts

## Localization
- Support both metric and imperial measurement systems
- Localize material names and cutting terminology
- Consider regional cutting standards and practices
- Support right-to-left languages for international use

## Development Workflow
- Use feature branches for new cutting algorithms
- Require code reviews for optimization logic changes
- Run performance benchmarks on cutting algorithm changes
- Maintain backwards compatibility for saved cutting plans