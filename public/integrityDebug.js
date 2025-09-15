// Console debug function for testing data integrity
// Add this to browser console for debugging

window.testDataIntegrity = function() {
  console.log('=== 测试数据完整性（浏览器版本）===');
  
  // 模拟一些测试数据
  const testItems = [
    {
      id: 'test1',
      name: '测试门板',
      length: 600,
      width: 400, 
      quantity: 5
    },
    {
      id: 'test2',
      name: '测试隔板',
      length: 800,
      width: 300,
      quantity: 3
    }
  ];
  
  const testMaterials = [
    {
      id: 'material1',
      name: '标准板材',
      width: 1220,
      height: 2440,
      thickness: 18
    }
  ];
  
  console.log('算法执行前的数据:');
  console.log('Items:', JSON.stringify(testItems, null, 2));
  console.log('Materials:', JSON.stringify(testMaterials, null, 2));
  
  // 保存原始数据的副本用于比较
  const originalItems = JSON.parse(JSON.stringify(testItems));
  const originalMaterials = JSON.parse(JSON.stringify(testMaterials));
  
  console.log('\n模拟算法执行...');
  
  // 模拟数据使用 - 测试是否会被修改
  console.log('传递数据给算法...');
  
  // 检查数据是否被修改
  setTimeout(() => {
    const itemsChanged = JSON.stringify(testItems) !== JSON.stringify(originalItems);
    const materialsChanged = JSON.stringify(testMaterials) !== JSON.stringify(originalMaterials);
    
    console.log('\n=== 数据完整性检查结果 ===');
    console.log('Items changed:', itemsChanged ? '❌ 被修改了' : '✅ 未被修改');
    console.log('Materials changed:', materialsChanged ? '❌ 被修改了' : '✅ 未被修改');
    
    console.log('\n算法执行后的数据:');
    console.log('Items:', JSON.stringify(testItems, null, 2));
    console.log('Materials:', JSON.stringify(testMaterials, null, 2));
    
    // 验证具体的数量是否保持不变
    testItems.forEach((item, index) => {
      const originalQty = originalItems[index].quantity;
      const currentQty = item.quantity;
      console.log(`${item.name}: 原始数量=${originalQty}, 当前数量=${currentQty} ${originalQty === currentQty ? '✅' : '❌'}`);
    });
    
  }, 100);
  
  return { testItems, testMaterials, originalItems, originalMaterials };
};

console.log('在控制台运行 testDataIntegrity() 来测试数据完整性');