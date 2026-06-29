import { addFeature, completeFeature, listFeatures } from '@tael/core';
import { makeTrackerCommands } from './tracker.js';

export const feature = makeTrackerCommands({
  label: 'feature',
  add: addFeature,
  list: listFeatures,
  complete: completeFeature,
});
