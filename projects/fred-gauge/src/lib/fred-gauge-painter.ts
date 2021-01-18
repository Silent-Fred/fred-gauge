export interface ArcEssentials {
  radius: number;
  startAngle: number;
  degrees: number;
  slice?: boolean;
  id?: string;
}

export interface SVGStyle {
  [svgStyle: string]: string;
}

interface Coordinates {
  x: number;
  y: number;
}

export class FredGaugePainter {
  private scaleFactorCartesianOneToSvg: number;
  private readonly precisionOfSVGCoordinates = 2;
  private readonly baseFontSizeToScaleFactorRatio = 1 / 3;
  private readonly smallFontSizeToBaseRatio = 3 / 4;

  private arcElements: string[] = [];
  private textElements: string[] = [];

  constructor(
    diameterInPixels: number,
    private widthInPixels?: number,
    private heightInPixels?: number
  ) {
    this.scaleFactorCartesianOneToSvg = diameterInPixels / 2;
    this.widthInPixels = this.widthInPixels || diameterInPixels;
    this.heightInPixels = this.heightInPixels || diameterInPixels;
  }

  private get styleDefaultsArc(): SVGStyle {
    return {
      stroke: '#eeeeee',
      fill: 'none',
      'stroke-linecap': 'round',
      'stroke-width': (this.scaleFactorCartesianOneToSvg / 10 + 1).toFixed(),
    };
  }

  private get styleDefaultsLabel(): SVGStyle {
    return {
      fill: 'cornflowerblue',
      'stroke-width': '0',
      'font-family': '"Helvetica Neue, Cambria, Arial, Roboto, sans-serif"',
    };
  }

  private get svgTagOpen(): string {
    return `<svg xmlns:svg="http://www.w3.org/2000/svg" \
    xmlns="http://www.w3.org/2000/svg" \
    viewBox="0 0 ${this.widthInPixels} ${this.heightInPixels}" \
    width="${this.widthInPixels}" height="${this.heightInPixels}">`;
  }
  private get svgTagClose(): string {
    return '</svg>';
  }

  pushArc(arc: ArcEssentials, style?: SVGStyle): void {
    this.arcElements.push(this.arcToPath(arc, style));
  }

  centralDisplay(
    value: number,
    decimalPlaces?: number,
    decimalPoint?: string,
    label?: string,
    style?: SVGStyle
  ): void {
    this.textElements = [];
    if (value !== undefined && !isNaN(value)) {
      this.textElements.push(
        this.valueAsText(value, decimalPlaces || 0, decimalPoint || '.', style)
      );
      if (label) {
        this.textElements.push(this.labelAsText(label, style));
      }
    }
  }

  toSVG(): string {
    return (
      this.svgTagOpen +
      this.arcElements.join('') +
      this.textElements.join('') +
      this.svgTagClose
    );
  }

  private get baseFontSizeScaled(): number {
    return Math.round(
      this.baseFontSizeToScaleFactorRatio * this.scaleFactorCartesianOneToSvg
    );
  }

  private get smallFontSizeScaled(): number {
    return Math.round(this.smallFontSizeToBaseRatio * this.baseFontSizeScaled);
  }

  private valueAsText(
    value: number,
    decimalPlaces: number,
    decimalPoint: string,
    style?: SVGStyle
  ): string {
    const centre = this.cartesianToSvg({ x: 0, y: 0 });
    const cx = centre.x.toFixed(this.precisionOfSVGCoordinates);
    const baselineValue = centre.y.toFixed(this.precisionOfSVGCoordinates);
    const valueIntegralAndDecimals = value.toFixed(decimalPlaces).split('.');
    const integral = valueIntegralAndDecimals[0];
    const decimal =
      valueIntegralAndDecimals.length > 1 ? valueIntegralAndDecimals[1] : null;
    const styleSettings = this.appliedStyleSettings(
      this.styleDefaultsLabel,
      style
    );
    let text = `<text x="${cx}" y="${baselineValue}" text-anchor="middle" ${styleSettings}>`;
    text += `<tspan style="font-size:${this.baseFontSizeScaled}">${integral}</tspan>`;
    if (decimalPlaces > 0) {
      text += `<tspan style="font-size:${this.smallFontSizeScaled}">${decimalPoint}${decimal}</tspan>`;
    }
    text += `</text>`;
    return text;
  }

  private labelAsText(label?: string, style?: SVGStyle): string {
    if (!label) {
      return '';
    }
    const centre = this.cartesianToSvg({ x: 0, y: 0 });
    const cx = centre.x.toFixed(this.precisionOfSVGCoordinates);
    const baselineLabel = (centre.y + this.smallFontSizeScaled).toFixed(
      this.precisionOfSVGCoordinates
    );
    const styleSettings = this.appliedStyleSettings(
      this.styleDefaultsLabel,
      style
    );
    const text = `<text x="${cx}" y="${baselineLabel}" \
    text-anchor="middle" font-size="${this.smallFontSizeScaled}" ${styleSettings}">${label}</text>`;
    return text;
  }

  private arcToPath(arc: ArcEssentials, style?: SVGStyle): string {
    return Math.abs(arc.degrees) < 360
      ? this.pathElement(arc, style)
      : this.fullCircle(arc.radius, style);
  }

  private appliedStyleSettings(...styles: (SVGStyle | undefined)[]): string {
    let appliedStyle = {} as SVGStyle;
    styles
      .filter((style) => style)
      .forEach((style) => (appliedStyle = Object.assign(appliedStyle, style)));
    return Object.keys(appliedStyle)
      .filter((key) => key)
      .map((key) => {
        const value = appliedStyle[key as keyof SVGStyle];
        return `${key}="${value}"`;
      })
      .join(' ');
  }

  private fullCircle(radius: number, style?: SVGStyle): string {
    const centre = this.cartesianToSvg({ x: 0, y: 0 });
    const svgRadius = (radius * this.scaleFactorCartesianOneToSvg).toFixed(
      this.precisionOfSVGCoordinates
    );
    const styleSettings = this.appliedStyleSettings(
      this.styleDefaultsArc,
      style
    );
    return `<circle cx="${centre.x}" cy="${centre.y}" r="${svgRadius}" ${styleSettings} />`;
  }

  private pathElement(arc: ArcEssentials, style?: SVGStyle): string {
    const moveTo = this.moveTo(arc);
    const arcTo = this.arcTo(arc);
    const id = arc.id ? `id="${arc.id}"` : '';
    const styleSettings = this.appliedStyleSettings(
      this.styleDefaultsArc,
      style
    );
    if (arc.slice && arc.slice === true) {
      return `<path ${id} d="${moveTo} ${arcTo} ${this.lineToCentre()} z" ${styleSettings} />`;
    }
    return `<path ${id} d="${moveTo} ${arcTo}" ${styleSettings} />`;
  }

  private moveTo(arc: ArcEssentials): string {
    const coordinates = this.cartesianToSvg(
      this.degreesToCoordinates(arc, arc.startAngle)
    );
    const x = coordinates.x.toFixed(this.precisionOfSVGCoordinates);
    const y = coordinates.y.toFixed(this.precisionOfSVGCoordinates);
    return `M ${x} ${y}`;
  }

  private arcTo(arc: ArcEssentials): string {
    const radiusX = (arc.radius * this.scaleFactorCartesianOneToSvg).toFixed(
      this.precisionOfSVGCoordinates
    );
    const radiusY = (arc.radius * this.scaleFactorCartesianOneToSvg).toFixed(
      this.precisionOfSVGCoordinates
    );
    const rotation = 0;
    const longOrShortArc = Math.abs(arc.degrees) <= 180 ? 0 : 1;
    const clockwiseOrCounterClockwise = arc.degrees >= 0 ? 0 : 1;
    const coordinates = this.cartesianToSvg(
      this.degreesToCoordinates(arc, arc.startAngle + arc.degrees)
    );
    const x = coordinates.x.toFixed(this.precisionOfSVGCoordinates);
    const y = coordinates.y.toFixed(this.precisionOfSVGCoordinates);
    return `A ${radiusX} ${radiusY} ${rotation} ${longOrShortArc} ${clockwiseOrCounterClockwise} ${x} ${y}`;
  }

  private lineToCentre(): string {
    const coordinates = this.cartesianToSvg({ x: 0, y: 0 });
    const x = coordinates.x.toFixed(this.precisionOfSVGCoordinates);
    const y = coordinates.y.toFixed(this.precisionOfSVGCoordinates);
    return `L ${x} ${y}`;
  }

  private cartesianToSvg(coordinates: Coordinates): Coordinates {
    return {
      x:
        this.scaleFactorCartesianOneToSvg /* centre */ +
        coordinates.x * this.scaleFactorCartesianOneToSvg,
      y:
        this.scaleFactorCartesianOneToSvg /* centre */ -
        coordinates.y * this.scaleFactorCartesianOneToSvg,
    };
  }

  private degreesToCoordinates(
    arc: ArcEssentials,
    angleInDegrees: number
  ): Coordinates {
    return {
      x: Math.cos(this.degreesToRadian(angleInDegrees)) * arc.radius,
      y: Math.sin(this.degreesToRadian(angleInDegrees)) * arc.radius,
    };
  }

  private degreesToRadian(angleInDegrees: number): number {
    return (Math.PI * angleInDegrees) / 180;
  }
}
