import { OauthStrategyOptions } from './oauth-strategy-options';
import { Strategy } from '../types';
import { Type } from '../../types';
import { StrategyOptions } from './strategy-options';

export interface StrategySettings {
    options: StrategyOptions | OauthStrategyOptions;
    /**
     * Custom passport-strategy
     */
    strategy: Strategy | Type<Strategy>;
}