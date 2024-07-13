import { MutableRefObject } from 'react';
import { Coin } from './types';
import { createCoin } from './createCoin';

export const initCoinPool = (
  coinPoolRef: MutableRefObject<Coin[]>,
  COIN_POOL_SIZE: number
) => {
  for (let i = 0; i < COIN_POOL_SIZE; i++) {
    coinPoolRef.current.push(createCoin());
  }
};