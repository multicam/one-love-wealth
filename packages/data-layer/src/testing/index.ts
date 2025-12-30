/**
 * Testing infrastructure exports
 */

export {
  testProvider,
  testAllProviders,
  printTestSummary,
  printQualityReportJSON,
} from './provider-tester';

export {
  checkDataFreshness,
  checkDataCompleteness,
  checkDataFormat,
  runQualityChecks,
  getMaxAgeForProvider,
} from './quality-checker';

export {
  getProviderTestConfig,
  getAllProviderNames,
  PROVIDER_TEST_CONFIGS,
} from './provider-configs';

export type {
  TestOptions,
  TestResult,
  TestStatus,
  QualityReport,
  FreshnessResult,
  CompletenessResult,
  FormatResult,
  ProviderTestConfig,
} from './types';
