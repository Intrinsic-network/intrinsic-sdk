import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '../constants'
import { encodeSqrtRatioX96 } from '../utils/encodeSqrtRatioX96'
import { TickMath } from '../utils/tickMath'
import { RSK, WRBTC } from '../wrbtc'
import { Pool } from './pool'
import { Route } from './route'

describe('Route', () => {
  const RBTC = RSK.onChain(30)
  const token0 = new Token(30, '0x0000000000000000000000000000000000000001', 18, 't0')
  const token1 = new Token(30, '0x0000000000000000000000000000000000000002', 18, 't1')
  const token2 = new Token(30, '0x0000000000000000000000000000000000000003', 18, 't2')
  const wrbtc = WRBTC

  const pool_0_1 = new Pool(token0, token1, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_0_wrbtc = new Pool(token0, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_1_wrbtc = new Pool(token1, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])

  describe('path', () => {
    it('constructs a path from the tokens', () => {
      const route = new Route([pool_0_1], token0, token1)
      expect(route.pools).toEqual([pool_0_1])
      expect(route.tokenPath).toEqual([token0, token1])
      expect(route.input).toEqual(token0)
      expect(route.output).toEqual(token1)
      expect(route.chainId).toEqual(30)
    })
    it('should fail if the input is not in the first pool', () => {
      expect(() => new Route([pool_0_1], wrbtc, token1)).toThrow()
    })
    it('should fail if output is not in the last pool', () => {
      expect(() => new Route([pool_0_1], token0, wrbtc)).toThrow()
    })
  })

  it('can have a token as both input and output', () => {
    const route = new Route([pool_0_wrbtc, pool_0_1, pool_1_wrbtc], wrbtc, wrbtc)
    expect(route.pools).toEqual([pool_0_wrbtc, pool_0_1, pool_1_wrbtc])
    expect(route.input).toEqual(wrbtc)
    expect(route.output).toEqual(wrbtc)
  })

  it('supports ether input', () => {
    const route = new Route([pool_0_wrbtc], RBTC, token0)
    expect(route.pools).toEqual([pool_0_wrbtc])
    expect(route.input).toEqual(RBTC)
    expect(route.output).toEqual(token0)
  })

  it('supports ether output', () => {
    const route = new Route([pool_0_wrbtc], token0, RBTC)
    expect(route.pools).toEqual([pool_0_wrbtc])
    expect(route.input).toEqual(token0)
    expect(route.output).toEqual(RBTC)
  })

  describe('#midPrice', () => {
    const pool_0_1 = new Pool(
      token0,
      token1,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(1, 5),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 5)),
      []
    )
    const pool_1_2 = new Pool(
      token1,
      token2,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(15, 30),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(15, 30)),
      []
    )
    const pool_0_wrbtc = new Pool(
      token0,
      wrbtc,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(3, 1),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(3, 1)),
      []
    )
    const pool_1_wrbtc = new Pool(
      token1,
      wrbtc,
      FeeAmount.MEDIUM,
      encodeSqrtRatioX96(1, 7),
      0,
      TickMath.getTickAtSqrtRatio(encodeSqrtRatioX96(1, 7)),
      []
    )

    it('correct for 0 -> 1', () => {
      const price = new Route([pool_0_1], token0, token1).midPrice
      expect(price.toFixed(4)).toEqual('0.2000')
      expect(price.baseCurrency.equals(token0)).toEqual(true)
      expect(price.quoteCurrency.equals(token1)).toEqual(true)
    })

    it('is cached', () => {
      const route = new Route([pool_0_1], token0, token1)
      expect(route.midPrice).toStrictEqual(route.midPrice)
    })

    it('correct for 1 -> 0', () => {
      const price = new Route([pool_0_1], token1, token0).midPrice
      expect(price.toFixed(4)).toEqual('5.0000')
      expect(price.baseCurrency.equals(token1)).toEqual(true)
      expect(price.quoteCurrency.equals(token0)).toEqual(true)
    })

    it('correct for 0 -> 1 -> 2', () => {
      const price = new Route([pool_0_1, pool_1_2], token0, token2).midPrice
      expect(price.toFixed(4)).toEqual('0.1000')
      expect(price.baseCurrency.equals(token0)).toEqual(true)
      expect(price.quoteCurrency.equals(token2)).toEqual(true)
    })

    it('correct for 2 -> 1 -> 0', () => {
      const price = new Route([pool_1_2, pool_0_1], token2, token0).midPrice
      expect(price.toFixed(4)).toEqual('10.0000')
      expect(price.baseCurrency.equals(token2)).toEqual(true)
      expect(price.quoteCurrency.equals(token0)).toEqual(true)
    })

    it('correct for ether -> 0', () => {
      const price = new Route([pool_0_wrbtc], RBTC, token0).midPrice
      expect(price.toFixed(4)).toEqual('0.3333')
      expect(price.baseCurrency.equals(RBTC)).toEqual(true)
      expect(price.quoteCurrency.equals(token0)).toEqual(true)
    })

    it('correct for 1 -> wrbtc', () => {
      const price = new Route([pool_1_wrbtc], token1, wrbtc).midPrice
      expect(price.toFixed(4)).toEqual('0.1429')
      expect(price.baseCurrency.equals(token1)).toEqual(true)
      expect(price.quoteCurrency.equals(wrbtc)).toEqual(true)
    })

    it('correct for ether -> 0 -> 1 -> wrbtc', () => {
      const price = new Route([pool_0_wrbtc, pool_0_1, pool_1_wrbtc], RBTC, wrbtc).midPrice
      expect(price.toSignificant(4)).toEqual('0.009524')
      expect(price.baseCurrency.equals(RBTC)).toEqual(true)
      expect(price.quoteCurrency.equals(wrbtc)).toEqual(true)
    })

    it('correct for wrbtc -> 0 -> 1 -> ether', () => {
      const price = new Route([pool_0_wrbtc, pool_0_1, pool_1_wrbtc], wrbtc, RBTC).midPrice
      expect(price.toSignificant(4)).toEqual('0.009524')
      expect(price.baseCurrency.equals(wrbtc)).toEqual(true)
      expect(price.quoteCurrency.equals(RBTC)).toEqual(true)
    })
  })
})
