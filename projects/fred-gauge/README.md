# FredGauge

This is a library containing a simple gauge component.

## What it does

The FredGauge creates an SVG image visualising the desired
gauge.

## How to use it

Include the component in your project. At the moment, there
is no `npm` package yet. You'll have to include it via its
GitHub repository.

````
npm install git+https://github.com/Silent-Fred/fred-gauge.git
````

### Selector

The selector for the component is `fred-gauge`.

### Parameters

The component can be configures with these parameters:

#### Basic information

- *min*
  - number
  - default: 0
  - The smalles value the gauge is supposed to represent.

- *max*
  - number
  - default: o
  - The biggest value the gauge is supposed to display.

- *value*
  - number
  - default: 0
  - The value to be displayed by the gauge.

- *dialStartAngle*
  - number
  - default: 225
  - Start angle of the dial. Measured as we learned in mathematics in school. Starting with 0 on the x-axis, turning counter-clockwise with positive values.

- *dialDegrees*
  - number
  - default: -270
  - Angle which the dial covers. Positive values are counter-clockwise.

- *radius*
  - number
  - default: 0.9
  - Radius in an interval [0..1]

#### Central digital display

- *showCentralDisplay*
  - boolean
  - default: `true`
  - Show the digital value and label inside the gauge or not.

- *decimalPlaces*
  - number
  - default: 0
  - Decimal places in the central digital display.

- *decimalPoint*
  - string
  - default: .
  - Decimal point. Can be set to , for internationalisation.

- *label*
  - string
  - default: *empty*
  - The label for the central display, usually the unit in which values are measured. (e.g. km/h or %)

#### Size on the screen

- *diameterInPixels*
  - number
  - default: 100
  - Diameter of the unit circle in pixels. This defines the scale for the radius which was given in [0..1]

- *widthInPixels*
  - number
  - default: diameterInPixels
  - Width of the view box of the resulting SVG. This can be useful in case the gauge only covers half a circle or less.

- *heightInPixels*
  - number
  - default: diameterInPixels
  - Height of the view box of the resulting SVG. This can be useful in case the gauge only covers half a circle or less.

#### Eye candy

- *animationDurationInSeconds*
  - number
  - default: 0.5
  - Duration of the animation between two consecutive values displayed by the gauge.

- *dialClass*
  - string
  - default: `'fredDefaultDial'`
  - Style class applied to the dial.

- *gaugeClass*
  - string
  - default: `'fredDefaultGauge'`
  - Style class applied to the gauge. (the arc that represents the value)

- *valueClass*
  - string
  - default: `'fredDefaultValue'`
  - Style class applied to the digital display in the centre of the gauge. Applies to the value and the label (if defined).

### Events emitted by the component

At the end of the animation between two consecutive values, the component emits
an `animationFinished` event.

### Styling

If all gauges in an app should use a consistent style, one possiblity is to provide
the three style classes `fredDefaultDial`, `fredDefaultGauge` and `fredDefaultValue`
as global styles. (cf. `angular.json` where to put those; have a look at
`projects.my-project-name.architect.build.options.styles` if you're unsure)

Styles have to be SVG style attributes because the gauge will be an SVG image.

As an example, the default values could look like this:

```css
fred-gauge .fredDefaultDial {
  stroke:blanchedalmond;
  stroke-width: 3;
}

fred-gauge .fredDefaultGauge {
  stroke:cadetblue;
  stroke-width: 5;
}

fred-gauge .fredDefaultValue {
  fill:cadetblue;
  font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif
}
```


## Examples

```html
<fred-gauge [diameterInPixels]="50"
            [min]="0" [max]="260" [value]="speed" 
            label="km/h"
            [animationDurationInSeconds]="0.25">
</fred-gauge>
```

This example will show a gauge, fifty pixels in screen size.
The dial will represent values ranging from 0 to 260.
A central display will show the digital value without
decimal places, the unit written below the value will be 'km/h'.
Going from one value to the next value will take a quarter of a second,
visualised with an animation.
The gauge starts at a "half past seven" angle (on an imaginative clock) and turns
clockwise up to "half past four".
A full gauge represents the value 260.
Angles are the default values in this case.

```html
<fred-gauge [diameterInPixels]="100"
            [min]="0" [max]="100"
            [dialStartAngle]="90" [dialDegrees]="360"
            [value]="percentage" label="%"
            gaugeClass="speedGauge"
            dialClass="speedDial"
            valueClass="speedValue">
</fred-gauge>
```

A full circle, counting percentages starting at the top,
counting counter-clockwise all the way around the circle.
The class names should be added as global classes (e.g.
in a `styles.css` or `styles.scss` file or others - cf.
the `angular.json` file of your application).
The style classes will be referenced by the resulting SVG.

```html
<fred-gauge [diameterInPixels]="400"
            [widthInPixels]="400" [heightInPixels]="300" 
            [min]="10" [max]="85"
            [dialStartAngle]="180" [dialDegrees]="-180"
            [value]="something" label="WTF/d"
            [animationDurationInSeconds]="2">
</fred-gauge>
```

The above gauge will not take up a square screen region. The given
angles make it a half circle. Together with the digital value and label
in the centre, it requires slightly more than half the width in
height. In the example, the chosen width to height ratio is 4:3
