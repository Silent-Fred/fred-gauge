export const acceleratedMotion = (
  elapsedTimeAsFractionOfDuration: number
): number => {
  const peak = 0.5;
  if (elapsedTimeAsFractionOfDuration <= peak) {
    return (
      (elapsedTimeAsFractionOfDuration * elapsedTimeAsFractionOfDuration) / peak
    );
  }
  return (
    1 -
    ((1 - elapsedTimeAsFractionOfDuration) *
      (1 - elapsedTimeAsFractionOfDuration)) /
      (1 - peak)
  );
};

export class FredGaugeAnimation {
  private animationDurationInSeconds = 0;

  private animationStartTime?: number;
  private startValue = 0;
  private targetValue = 0;

  private ease: (
    elapsedTimeAsFractionOfDuration: number
  ) => number = acceleratedMotion;

  constructor() {}

  animate(
    from: number,
    to: number,
    animationDurationInSeconds?: number,
    redrawCallback?: (timestamp: number) => void,
    terminalCallback?: () => void,
    ease?: (elapsedTimeAsFractionOfDuration: number) => number
  ): void {
    this.animationStartTime = undefined;
    this.startValue = from;
    this.targetValue = to;
    this.ease = ease || this.ease;
    this.animationDurationInSeconds =
      animationDurationInSeconds || this.animationDurationInSeconds;
    this.redrawCallback = redrawCallback || this.redrawCallback;
    this.terminalCallback = terminalCallback || this.terminalCallback;
    window.requestAnimationFrame(this.animateFrame.bind(this));
  }

  private redrawCallback: (timestamp: number) => void = () => {
    throw new Error('I need a callback to redraw the animated component.');
  };
  private terminalCallback: () => void = () => {};

  private animateFrame(timestamp: number): void {
    if (this.afterLastFrame(timestamp)) {
      this.redrawCallback(this.valueAfterLastFrame());
      this.terminalCallback();
    } else {
      this.redrawCallback(this.frameAt(timestamp));
      window.requestAnimationFrame(this.animateFrame.bind(this));
    }
  }

  private valueAfterLastFrame(): number {
    return this.targetValue;
  }

  private afterLastFrame(timestamp: number): boolean {
    if (!this.animationStartTime) {
      return false;
    }
    return (
      timestamp >=
      this.animationStartTime + this.animationDurationInSeconds * 1000
    );
  }

  private frameAt(timestamp: number): number {
    if (!this.animationStartTime) {
      // first frame of the animation defines the start time (in case of a delay)
      this.animationStartTime = timestamp;
    }
    const normalisedSpatium = acceleratedMotion(
      (timestamp - this.animationStartTime) /
        (this.animationDurationInSeconds * 1000)
    );
    const value =
      this.startValue +
      normalisedSpatium * (this.targetValue - this.startValue);
    return value;
  }
}
