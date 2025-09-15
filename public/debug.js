// Debug script to test multi-material functionality
// This can be run in browser console for debugging

window.testMultiMaterial = async function() {
  console.log('=== 测试多材料功能 ===');
  
  // 模拟材料数据
  const materials = [
    {
      id: 'mat1',
      name: '板材1',
      width: 600,
      height: 400,
      thickness: 18
    },
    {
      id: 'mat2', 
      name: '板材2',
      width: 600,
      height: 400,
      thickness: 18
    }
  ];
  
  // 模拟切割项目 - 总量需要超过单板容量
  const items = [
    {
      id: 'item1',
      name: '大面板',
      length: 500,
      width: 300,
      quantity: 2  // 两个大面板
    },
    {
      id: 'item2',
      name: '小隔板', 
      length: 200,
      width: 150,
      quantity: 4  // 四个小隔板
    }
  ];
  
  console.log('材料总面积:', materials.reduce((sum, m) => sum + m.width * m.height, 0));
  console.log('项目总面积:', items.reduce((sum, item) => sum + item.length * item.width * item.quantity, 0));
  
  return { materials, items };
}

console.log('在控制台运行 testMultiMaterial() 来测试多材料功能');