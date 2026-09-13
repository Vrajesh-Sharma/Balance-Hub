export * from './aggregator';
export * from './synthetic';
export * from './dataset';
import { aggregateUserProfile, getDefaultPreferences } from './aggregator';
import { generateSyntheticProfile, generateMultipleProfiles } from './synthetic';
import { loadDatasetFromJSON, loadDatasetFromCSV, saveDatasetToJSON, saveDatasetToCSV, fetchPublicDataset, DatasetEntry } from './dataset';

export { 
  aggregateUserProfile, 
  getDefaultPreferences,
  generateSyntheticProfile,
  generateMultipleProfiles,
  loadDatasetFromJSON,
  loadDatasetFromCSV,
  saveDatasetToJSON,
  saveDatasetToCSV,
  fetchPublicDataset,
};
export type { DatasetEntry };