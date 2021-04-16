import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";

import {
  ChartLabel,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";

const generateRandomNumber = (): 0 | 1 => {
  if (Math.random() < 0.5) return 0;
  return 1;
};

const generateSingle = (size = 6): string => {
  return new Array(size)
    .fill(0)
    .map(() => generateRandomNumber())
    .join("");
};

const setCharAt = (str: string, index: number, chr: string): string => {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
};

const countSchemaKey = (populationSchema: string): number =>
  populationSchema
    .split("")
    .reduce((acc, val, index) => acc + parseInt(val, 10) * 3 ** index, 0);

const getSchemas = (populationCase: string): string[] => {
  const cases: string[] = [];
  let word = populationCase;
  // eslint-disable-next-line no-plusplus
  for (let p1 = 0; p1 < 2; p1++) {
    if (p1 === 1) {
      word = setCharAt(word, 0, "2");
    } else {
      word = setCharAt(word, 0, populationCase[0]);
    }
    // eslint-disable-next-line no-plusplus
    for (let p2 = 0; p2 < 2; p2++) {
      if (p2 === 1) {
        word = setCharAt(word, 1, "2");
      } else {
        word = setCharAt(word, 1, populationCase[1]);
      }
      // eslint-disable-next-line no-plusplus
      for (let p3 = 0; p3 < 2; p3++) {
        if (p3 === 1) {
          word = setCharAt(word, 2, "2");
        } else {
          word = setCharAt(word, 2, populationCase[2]);
        }
        // eslint-disable-next-line no-plusplus
        for (let p4 = 0; p4 < 2; p4++) {
          if (p4 === 1) {
            word = setCharAt(word, 3, "2");
          } else {
            word = setCharAt(word, 3, populationCase[3]);
          }
          // eslint-disable-next-line no-plusplus
          for (let p5 = 0; p5 < 2; p5++) {
            if (p5 === 1) {
              word = setCharAt(word, 4, "2");
            } else {
              word = setCharAt(word, 4, populationCase[4]);
            }
            // eslint-disable-next-line no-plusplus
            for (let p6 = 0; p6 < 2; p6++) {
              if (p6 === 1) {
                word = setCharAt(word, 5, "2");
              } else {
                word = setCharAt(word, 5, populationCase[5]);
              }
              cases.push(word);
            }
          }
        }
      }
    }
  }
  return cases;
};

const casesCount = (populationSize: number): number =>
  Array.from(
    new Set(
      new Array(populationSize)
        .fill(0)
        .map(() => generateSingle(6))
        .map((single) => getSchemas(single).map(countSchemaKey))
        .flat()
    ).values()
  ).length;

const App: React.FC = () => {
  const [populationSizes] = useState<number[]>([
    ...new Array(100).fill(0).map((__, index) => index),
    ...new Array(16).fill(0).map((__, index) => 100 + index * 10),
    ...new Array(4).fill(0).map((__, index) => 300 + index * 50),
    ...new Array(6).fill(0).map((__, index) => 500 + index * 100),
  ]);

  const chartData = useMemo(
    () =>
      populationSizes.map((size) => ({
        x: size,
        y: casesCount(size),
      })),
    [populationSizes]
  );

  useEffect(() => {
    console.log("cd", chartData);
  }, [chartData]);

  return (
    <div className="App">
      <div>
        <h2>Ilość ciagów w funkcji wielkości populacji</h2>
        <XYPlot width={500} height={300}>
          <HorizontalGridLines />
          <VerticalGridLines />
          <XAxis />
          <YAxis />
          <ChartLabel
            text="Wielkość populacji"
            className="alt-x-label"
            includeMargin={false}
            xPercent={0.025}
            yPercent={1.01}
          />

          <ChartLabel
            text="Ilość ciągów"
            className="alt-y-label"
            includeMargin={false}
            xPercent={0.06}
            yPercent={0.06}
            style={{
              transform: "rotate(-90)",
              textAnchor: "end",
            }}
          />
          <LineSeries
            data={chartData}
            style={{
              strokeLinejoin: "round",
              strokeWidth: 2,
            }}
          />
        </XYPlot>
      </div>
    </div>
  );
};

export default App;
