import { CardProps, Suit } from "@components/Card";

function perl_range(start: number, end: number): number[] {
  const ret: number[] = [];
  for (let i = start; i <= end; ++i) {
    ret.push(i);
  }
  return ret;
}

const MAX_SEED: bigint = (BigInt(1) << BigInt(31 + 2)) - BigInt(1);
const X = BigInt(1) << BigInt(32);

class MSRand {
  private gamenumber: string;
  private _seed: bigint;
  private _seedx: bigint;

  constructor(args: { gamenumber: string }) {
    this.gamenumber = args.gamenumber;
    const _seed = BigInt(this.gamenumber);
    this._seed = _seed;
    this._seedx = _seed < X ? _seed : _seed - X;
  }

  private _rando(): bigint {
    this._seedx = (this._seedx * BigInt(214013) + BigInt(2531011)) & MAX_SEED;
    return (this._seedx >> BigInt(16)) & BigInt(0x7fff);
  }

  private _randp(): bigint {
    this._seedx = (this._seedx * BigInt(214013) + BigInt(2531011)) & MAX_SEED;
    return (this._seedx >> BigInt(16)) & BigInt(0xffff);
  }

  public raw_rand(): bigint {
    if (this._seed < X) {
      const ret = this._rando();
      return this._seed < BigInt(0x8) << BigInt(28)
        ? ret
        : ret | BigInt(0x8000);
    } else {
      return this._randp() + BigInt(1);
    }
  }

  public max_rand(mymax: bigint): bigint {
    return this.raw_rand() % mymax;
  }

  public shuffle<T>(deck: T[]): T[] {
    if (deck.length) {
      let i = deck.length;
      while (--i) {
        const j = Number(this.max_rand(BigInt(i + 1)));
        const tmp = deck[i];
        deck[i] = deck[j];
        deck[j] = tmp;
      }
    }
    return deck;
  }
}

function renderCard(card: number) {
  const id = `card-${card}`;

  const suit = card % 4;
  const rank = Math.floor(card / 4) + 1;
  const suits = [Suit.Clubs, Suit.Diamonds, Suit.Hearts, Suit.Spades];

  return { id, suit: suits[suit], rank };
}

function deal_ms_fc_board(gamenumber: string) {
  const randomizer = new MSRand({ gamenumber });
  const numCols = 8;

  const columns: CardProps[][] = Array.from({ length: numCols }, () => []);
  const deck = perl_range(0, 4 * 13 - 1);

  randomizer.shuffle(deck);

  for (let i = 0; i < 52; ++i) {
    columns[i % numCols].push(renderCard(deck[i]));
  }

  return columns;
}

export { deal_ms_fc_board };
