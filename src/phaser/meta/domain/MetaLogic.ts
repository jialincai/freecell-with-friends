import { Meta } from "../Meta";

export function withComplete(meta: Meta): Meta {
  return {
    ...meta,
    state: {
      ...meta.state,
      complete: true,
    },
  };
}
