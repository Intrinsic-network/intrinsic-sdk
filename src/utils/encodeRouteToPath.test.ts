import { Token } from '@uniswap/sdk-core'
import { FeeAmount } from '../constants'
import { Pool } from '../entities/pool'
import { Route } from '../entities/route'
import { RSK, WRBTC } from '../wrbtc'
import { encodeRouteToPath } from './encodeRouteToPath'
import { encodeSqrtRatioX96 } from './encodeSqrtRatioX96'

describe('#encodeRouteToPath', () => {
  const RBTC = RSK.onChain(30)
  const token0 = new Token(30, '0x0000000000000000000000000000000000000001', 18, 't0', 'token0')
  const token1 = new Token(30, '0x0000000000000000000000000000000000000002', 18, 't1', 'token1')
  const token2 = new Token(30, '0x0000000000000000000000000000000000000003', 18, 't2', 'token2')
  // const token3 = new Token(30, '0x0000000000000000000000000000000000000004', 18, 't3', 'token3')

  const wrbtc = WRBTC

  const pool_0_1_medium = new Pool(token0, token1, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_1_2_low = new Pool(token1, token2, FeeAmount.LOW, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_0_wrbtc = new Pool(token0, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])
  const pool_1_wrbtc = new Pool(token1, wrbtc, FeeAmount.MEDIUM, encodeSqrtRatioX96(1, 1), 0, 0, [])

  const route_0_1 = new Route([pool_0_1_medium], token0, token1)
  const route_0_1_2 = new Route([pool_0_1_medium, pool_1_2_low], token0, token2)

  const route_0_wrbtc = new Route([pool_0_wrbtc], token0, RBTC)
  const route_0_1_wrbtc = new Route([pool_0_1_medium, pool_1_wrbtc], token0, RBTC)
  const route_wrbtc_0 = new Route([pool_0_wrbtc], RBTC, token0)
  const route_wrbtc_0_1 = new Route([pool_0_wrbtc, pool_0_1_medium], RBTC, token1)

  it('packs them for exact input single hop', () => {
    expect(encodeRouteToPath(route_0_1, false)).toEqual(
      '0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002'
    )
  })

  it('packs them correctly for exact output single hop', () => {
    expect(encodeRouteToPath(route_0_1, true)).toEqual(
      '0x0000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001'
    )
  })

  it('packs them correctly for multihop exact input', () => {
    expect(encodeRouteToPath(route_0_1_2, false)).toEqual(
      '0x0000000000000000000000000000000000000001000bb800000000000000000000000000000000000000020001f40000000000000000000000000000000000000003'
    )
  })

  it('packs them correctly for multihop exact output', () => {
    expect(encodeRouteToPath(route_0_1_2, true)).toEqual(
      '0x00000000000000000000000000000000000000030001f40000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001'
    )
  })

  it('wraps ether input for exact input single hop', () => {
    expect(encodeRouteToPath(route_wrbtc_0, false)).toEqual(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb80000000000000000000000000000000000000001'
    )
  })
  it('wraps ether input for exact output single hop', () => {
    expect(encodeRouteToPath(route_wrbtc_0, true)).toEqual(
      '0x0000000000000000000000000000000000000001000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    )
  })
  it('wraps ether input for exact input multihop', () => {
    expect(encodeRouteToPath(route_wrbtc_0_1, false)).toEqual(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb80000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002'
    )
  })
  it('wraps ether input for exact output multihop', () => {
    expect(encodeRouteToPath(route_wrbtc_0_1, true)).toEqual(
      '0x0000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    )
  })

  it('wraps ether output for exact input single hop', () => {
    expect(encodeRouteToPath(route_0_wrbtc, false)).toEqual(
      '0x0000000000000000000000000000000000000001000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    )
  })
  it('wraps ether output for exact output single hop', () => {
    expect(encodeRouteToPath(route_0_wrbtc, true)).toEqual(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb80000000000000000000000000000000000000001'
    )
  })
  it('wraps ether output for exact input multihop', () => {
    expect(encodeRouteToPath(route_0_1_wrbtc, false)).toEqual(
      '0x0000000000000000000000000000000000000001000bb80000000000000000000000000000000000000002000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    )
  })
  it('wraps ether output for exact output multihop', () => {
    expect(encodeRouteToPath(route_0_1_wrbtc, true)).toEqual(
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb80000000000000000000000000000000000000002000bb80000000000000000000000000000000000000001'
    )
  })
})
