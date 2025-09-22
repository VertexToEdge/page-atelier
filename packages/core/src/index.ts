/**
 * Core package main export
 * Used by: Frontend/Backend - All components requiring core functionality
 * 
 * @tags core, types, export, modules
 */

export * from './types';
export { SettingBuilder } from './settingBuilder';
export { ConsistencyChecker } from './checker';
export { PersonaEvaluator } from './personas';
export { AggregateReportGenerator } from './aggregate';
export * from './prompts';