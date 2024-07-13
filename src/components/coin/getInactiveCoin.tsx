import { MutableRefObject } from 'react';
import { Coin } from './types';

export const getInactiveCoin = (coinPoolRef: MutableRefObject<Coin[]>): Coin | undefined => {
  return coinPoolRef.current.find(coin => !coin.active);
};