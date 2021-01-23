import { patchLifeCycleFunctions, patchTestFunctions, rxjsHook } from './';

patchLifeCycleFunctions(rxjsHook);
patchTestFunctions(rxjsHook);
