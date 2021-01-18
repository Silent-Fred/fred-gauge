import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FredGaugeAnimation } from './fred-gauge-animation';
import {
  ArcEssentials,
  FredGaugePainter,
  SVGStyle,
} from './fred-gauge-painter';

@Component({
  selector: 'fred-gauge',
  template: '',
})
export class FredGaugeComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() min: number;
  @Input() max: number;
  @Input() value: number;

  @Input() dialStartAngle: number;
  @Input() dialDegrees: number;
  @Input() radius: number;

  @Input() showCentralDisplay: boolean;
  @Input() decimalPlaces: number;
  @Input() decimalPoint: string;
  @Input() label: string;

  @Input() diameterInPixels: number;
  @Input() widthInPixels?: number;
  @Input() heightInPixels?: number;

  @Input() animationDurationInSeconds: number;
  @Input() dialClass: string;
  @Input() gaugeClass: string;
  @Input() valueClass: string;

  @Output() animationFinished: EventEmitter<number> = new EventEmitter();

  private readonly defaultDialStyle: SVGStyle = {
    stroke: 'lightgrey',
  };
  private readonly defaultGaugeStyle: SVGStyle = {
    stroke: 'cornflowerblue',
  };
  private readonly defaultValueStyle: SVGStyle = {
    fill: 'cornflowerblue',
    stroke: '0',
  };

  private templateElement?: HTMLTemplateElement;

  constructor(private elementReference: ElementRef) {
    this.min = 0;
    this.max = 100;
    this.value = 0;
    this.dialStartAngle = 225;
    this.dialDegrees = -270;
    this.radius = 0.9;
    this.showCentralDisplay = true;
    this.decimalPlaces = 0;
    this.decimalPoint = '.';
    this.label = '';
    this.diameterInPixels = 100;
    this.animationDurationInSeconds = 0.5;
    this.dialClass = 'fredDefaultDial';
    this.gaugeClass = 'fredDefaultGauge';
    this.valueClass = 'fredDefaultValue';
  }

  ngOnInit(): void {
    this.templateElement = document.createElement('template');
    this.elementReference.nativeElement.appendChild(this.templateElement);
  }

  ngAfterViewInit(): void {
    this.updateValue(this.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value) {
      this.animate(
        changes.value?.previousValue || this.min,
        changes.value.currentValue
      );
    }
  }

  private updateValue(newValue: number): void {
    this.value = newValue;
    this.replaceElementWith(this.svg(newValue));
  }

  private svg(value: number): string {
    const painter = new FredGaugePainter(
      this.diameterInPixels,
      this.widthInPixels || this.diameterInPixels,
      this.heightInPixels || this.diameterInPixels
    );
    painter.pushArc(
      this.dial(),
      this.styleClassOrDefault(this.dialClass, this.defaultDialStyle)
    );
    if (value !== undefined && !isNaN(value)) {
      painter.pushArc(
        this.gauge(value),
        this.styleClassOrDefault(this.gaugeClass, this.defaultGaugeStyle)
      );
      if (this.showCentralDisplay === true) {
        painter.centralDisplay(
          value,
          this.decimalPlaces,
          this.decimalPoint,
          this.label,
          this.styleClassOrDefault(this.valueClass, this.defaultValueStyle)
        );
      }
    }
    return painter.toSVG();
  }

  private styleClassOrDefault(
    styleClass: string | undefined,
    defaultStyle: SVGStyle
  ): SVGStyle {
    const style = Object.assign({}, defaultStyle);
    if (styleClass) {
      style.class = styleClass;
    }
    return style;
  }

  private replaceElementWith(svg: string): void {
    if (this.templateElement) {
      this.templateElement.innerHTML = svg;
      this.elementReference.nativeElement.replaceChild(
        this.templateElement.content.childNodes.item(0),
        this.elementReference.nativeElement.childNodes.item(0)
      );
    }
  }

  private dial(): ArcEssentials {
    const arc: ArcEssentials = {
      radius: this.radius,
      startAngle: this.dialStartAngle,
      degrees: this.dialDegrees,
    };
    return arc;
  }

  private gauge(value: number): ArcEssentials {
    const trimmedValue = Math.max(this.min, Math.min(value, this.max));
    const portion = (trimmedValue - this.min) / (this.max - this.min);
    const arc: ArcEssentials = {
      radius: this.radius,
      startAngle: this.dialStartAngle,
      degrees: this.dialDegrees * portion,
    };
    return arc;
  }

  private animate(oldValue: number, newValue: number): void {
    const animation = new FredGaugeAnimation();
    const targetValue = Math.max(this.min, Math.min(newValue, this.max));
    animation.animate(
      oldValue,
      targetValue,
      this.animationDurationInSeconds,
      this.updateValue.bind(this),
      () => this.animationFinished.emit(targetValue)
    );
  }
}
