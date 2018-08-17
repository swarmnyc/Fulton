import { OauthStrategyOptions } from './oauth-strategy-options';
import { Strategy } from '../interfaces';
import { Type } from '../../interfaces';
import { StrategyOptions } from './strategy-options';

export interface StrategySettings {
    options: StrategyOptions | OauthStrategyOptions;
    /**
     * Custom passport-strategy
     */
    strategy: Strategy | Type<Strategy>;
}