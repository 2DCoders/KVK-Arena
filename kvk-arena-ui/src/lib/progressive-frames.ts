// Fetch only the frames near the current scroll position.
export function createFrameLoader(
  sources: string[],
  images: HTMLImageElement[],
  onLoad: () => void,
) {
  let stopped = false;
  let active = 0;
  let firstSettled = false;
  let pending: number[] = [];
  const requested = new Set<number>();
  const pump = () => {
    if (stopped) return;
    const limit = firstSettled ? 4 : 1;
    while (active < limit && pending.length) {
      const index = pending.shift()!;
      if (requested.has(index)) continue;
      requested.add(index);
      active += 1;
      const image = new Image();
      images[index] = image;
      image.decoding = "async";
      image.fetchPriority = index === 0 ? "high" : "low";
      const finish = () => {
        if (stopped) return;
        active -= 1;
        if (index === 0) firstSettled = true;
        onLoad();
        pump();
      };
      image.onload = finish;
      image.onerror = finish;
      image.src = sources[index];
    }
  };
  return {
    request(frame: number) {
      if (stopped) return;
      pending = sources.map((_, index) => index)
        .filter(index => Math.abs(index - frame) <= 8 && !requested.has(index))
        .sort((a, b) => Math.abs(a - frame) - Math.abs(b - frame));
      if (!firstSettled) pending = [0, ...pending.filter(index => index !== 0)];
      pump();
    },
    stop() {
      stopped = true;
      pending = [];
      images.forEach(image => {
        image.onload = null;
        image.onerror = null;
        if (!image.complete) image.removeAttribute("src");
      });
    },
  };
}

export function nearestLoadedFrame(images: HTMLImageElement[], target: number) {
  let nearest = -1;
  images.forEach((image, index) => {
    if (image?.complete && image.naturalWidth > 0 &&
        (nearest === -1 || Math.abs(index - target) < Math.abs(nearest - target))) {
      nearest = index;
    }
  });
  return nearest;
}
