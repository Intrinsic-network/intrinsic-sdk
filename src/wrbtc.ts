import { Currency, NativeCurrency, Token } from '@uniswap/sdk-core'
import invariant from 'tiny-invariant'

export const WRBTC = new Token(30, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WRBTC', 'Wrapped RBTC')
export const WtRBTC = new Token(31, '0x09b6ca5e4496238a1f176aea6bb607db96c2286e', 18, 'WtRBTC', 'Wrapped tRBTC')

export class RSK extends NativeCurrency {
  protected constructor(chainId: number) {
    super(chainId, 18, 'RBTC', 'RBTC')
  }

  public get wrapped(): Token {
    const wrbtc = WRBTC
    invariant(!!wrbtc, 'WRAPPED')
    return wrbtc
  }

  private static _rbtcCache: { [chainId: number]: RSK } = {}

  public static onChain(chainId: number): RSK {
    return this._rbtcCache[chainId] ?? (this._rbtcCache[chainId] = new RSK(chainId))
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }
}