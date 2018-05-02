import { OauthStrategyOptions } from './oauth-strategy-options';
import { Strategy } from '../interfaces';
import { Type } from '../../interfaces';

export interface StrategySettings {
    options: OauthStrategyOptions;
    /**
     * Custom passport-strategy
     */
    strategy: Strategy | Type<Strategy>;
}