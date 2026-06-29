import { addBug, completeBug, listBugs } from '@tael/core';
import { makeTrackerCommands } from './tracker.js';

export const bug = makeTrackerCommands({
  label: 'bug',
  add: addBug,
  list: listBugs,
  complete: completeBug,
});
