/**
 * @file Global teardown tests - Semaine 4 MVP
 * @description Nettoyage global après tous les tests
 */

module.exports = async () => {
  const testDuration = Date.now() - global.__TEST_START_TIME__
  
  console.log(`\n📊 Test suite completed in ${testDuration}ms`)
  console.log('🧹 Cleaning up global test environment...')
  
  // Cleanup global mocks
  delete global.ResizeObserver
  delete global.IntersectionObserver
  delete global.__TEST_START_TIME__
  
  console.log('✅ Global test teardown complete')
}