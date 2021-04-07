import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import "../node_modules/react-vis/dist/style.css";

import _ from "lodash";

import {
  ChartLabel,
  DiscreteColorLegend,
  HorizontalGridLines,
  LineSeries,
  VerticalGridLines,
  XAxis,
  XYPlot,
  YAxis,
} from "react-vis";

enum PopulationDisproportion {
  AllEqual = 0,
  DominantA = 1,
  DominantB = 2,
}

interface PopulationDensity {
  A: number;
  B: number;
  C: number;
  dead: number;
}

const App: React.FC = () => {
  const [
    populationDisproportion,
    setPopulationDisproportion,
  ] = useState<PopulationDisproportion>(PopulationDisproportion.AllEqual);
  const [populationSize, setPopulationSize] = useState<number>(1002);
  const [numberOfGenerations, setNumberOfGenerations] = useState<number>(100);
  const [isLethal, setIsLethal] = useState<boolean>(false);

  const [finalPopulationSize, setFinalPopulationSize] = useState<
    PopulationDensity[]
  >([]);
  const [finalPopulationDensity, setFinalPopulationDensity] = useState<
    PopulationDensity[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!numberOfGenerations) return;

    setIsLoading(true);
    const population = (() => {
      const arr = new Array(populationSize).fill(0);
      if (populationDisproportion === PopulationDisproportion.AllEqual) {
        // Punkt A
        const lengthDivided = populationSize / 3;

        return {
          arr: arr.map((__, index) => {
            if (index <= lengthDivided) return 1;
            if (index > lengthDivided && index <= lengthDivided * 2) return 2;
            return 3;
          }),
          density: {
            A: 1 / 3,
            B: 1 / 3,
            C: 1 / 3,
            dead: 0,
          },
          number: {
            A: populationSize / 3,
            B: populationSize / 3,
            C: populationSize / 3,
            dead: 0,
          },
        };
      }

      if (populationDisproportion === PopulationDisproportion.DominantA) {
        // Punkt B
        return {
          arr: arr.fill(1),
          density: {
            A: 1,
            B: 0,
            C: 0,
            dead: 0,
          },
          number: {
            A: populationSize,
            B: 0,
            C: 0,
            dead: 0,
          },
        };
      }

      // Punkt C
      return {
        arr: arr.fill(2),
        density: {
          A: 0,
          B: 1,
          C: 0,
          dead: 0,
        },
        number: {
          A: 0,
          B: populationSize,
          C: 0,
          dead: 0,
        },
      };
    })();

    setFinalPopulationDensity([population.density]);
    setFinalPopulationSize([population.number]);

    new Array(numberOfGenerations).fill(0).forEach(() => {
      population.arr = [...population.arr].map((cell) => {
        const randomNumber = Math.random();

        if (!isLethal) {
          if (cell === 1) {
            // A
            if (randomNumber <= 0.5) return 1; // A -> A
            return 2; // A -> B
          }
          if (cell === 2) {
            // B
            if (randomNumber <= 1 / 3) return 1; // B -> A
            if (randomNumber <= 2 / 3) return 2; // B -> B
            return 3; // B -> C
          }
          if (cell === 3) {
            // C
            if (randomNumber <= 0.5) return 2; // C -> B
            return 3; // C -> C
          }
          return 0;
        }
        // It is lethal
        if (cell === 1) {
          // A
          if (randomNumber <= 1 / 3) return 1; // A -> A
          if (randomNumber <= 2 / 3) return 2; // A -> B
          return 0; // A -> dead
        }
        if (cell === 2) {
          // B
          if (randomNumber <= 1 / 3) return 1; // B -> A
          if (randomNumber <= 2 / 3) return 2; // B -> B
          return 3; // B -> C
        }
        if (cell === 3) {
          // C
          if (randomNumber <= 1 / 3) return 2; // C -> B
          if (randomNumber <= 2 / 3) return 3; // C -> C
          return 0; // C -> dead
        }
        return 0;
      });

      const newPopulationNumber = _.chain(population.arr)
        .reduce(
          (acc, val) => {
            if (val === 1) {
              return {
                ...acc,
                A: acc.A + 1,
              };
            }
            if (val === 2) {
              return {
                ...acc,
                B: acc.B + 1,
              };
            }
            if (val === 3) {
              return {
                ...acc,
                C: acc.C + 1,
              };
            }
            return {
              ...acc,
              dead: acc.dead + 1,
            };
          },
          {
            A: 0,
            B: 0,
            C: 0,
            dead: 0,
          }
        )
        .value();

      const newPopulationDensity = _.mapValues(
        newPopulationNumber,
        (v) => v / populationSize
      );

      setFinalPopulationSize((prevState) => [
        ...prevState,
        newPopulationNumber,
      ]);
      setFinalPopulationDensity((prevState) => [
        ...prevState,
        newPopulationDensity,
      ]);
    });
    setIsLoading(false);
  }, [populationDisproportion, populationSize, isLethal, numberOfGenerations]);

  const seriesToItems = (
    series: PopulationDensity[]
  ): { title: string; values: number[] }[] =>
    Object.entries<number[]>(
      series.reduce<{
        A: number[];
        B: number[];
        C: number[];
        dead: number[];
      }>(
        (acc, val) => ({
          A: [...acc.A, val.A],
          B: [...acc.B, val.B],
          C: [...acc.C, val.C],
          dead: [...acc.dead, val.dead],
        }),
        {
          A: [],
          B: [],
          C: [],
          dead: [],
        }
      )
    ).map(([geneName, populationSizes]) => ({
      title: geneName,
      values: populationSizes,
    }));

  const finalPopulationSizeItems = useMemo(
    () => seriesToItems(finalPopulationSize),
    [finalPopulationSize]
  );

  const finalPopulationDensityItems = useMemo(
    () => seriesToItems(finalPopulationDensity),
    [finalPopulationDensity]
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}>
        <div>
          <h1>Ustawienia</h1>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <label htmlFor="numberOfGenerations">Ilość generacji</label>
              <input
                style={{ marginLeft: 20 }}
                id="numberOfGeneration"
                type="number"
                value={numberOfGenerations}
                onChange={(e) =>
                  setNumberOfGenerations(parseInt(e.target.value, 10))
                }
              />
            </div>
            <div>
              <label htmlFor="numberOfCells">Wielkość populacji</label>
              <input
                style={{ marginLeft: 20 }}
                id="numberOfCells"
                type="number"
                value={populationSize}
                onChange={(e) =>
                  setPopulationSize(parseInt(e.target.value, 10))
                }
              />
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="isLethal"
                  onChange={() => setIsLethal(true)}
                  checked={isLethal}
                />{" "}
                Letalny
              </label>
              <label>
                <input
                  type="radio"
                  name="isLethal"
                  onChange={() => setIsLethal(false)}
                  checked={!isLethal}
                />{" "}
                Brak letalności
              </label>
            </div>
            <div>
              <label htmlFor="populationDistribution">
                Startowa dystrybucja populacji
              </label>
              <select
                id="populationDistribution"
                onChange={(e) =>
                  setPopulationDisproportion(
                    (parseInt(
                      e.target.value,
                      10
                    ) as unknown) as PopulationDisproportion
                  )
                }>
                {Object.entries(PopulationDisproportion)
                  .filter(([__, value]) => typeof value === "number")
                  .map(([key, value]) => (
                    <option value={value}>{key}</option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flexGrow: 1,
            justifyContent: "space-around",
          }}>
          <div>
            <h2>Stosunek liczebności populacji</h2>
            <XYPlot width={500} height={300}>
              <HorizontalGridLines />
              <VerticalGridLines />
              <XAxis />
              <YAxis />
              <ChartLabel
                text="Pokolenie"
                className="alt-x-label"
                includeMargin={false}
                xPercent={0.025}
                yPercent={1.01}
              />

              <ChartLabel
                text="Stosunek"
                className="alt-y-label"
                includeMargin={false}
                xPercent={0.06}
                yPercent={0.06}
                style={{
                  transform: "rotate(-90)",
                  textAnchor: "end",
                }}
              />
              {finalPopulationSizeItems.map(({ title, values }) => (
                <LineSeries
                  key={`serie_size_${title}`}
                  data={values.map((generationValue, generationNumber) => ({
                    x: generationNumber,
                    y: generationValue / (values[0] || 1),
                  }))}
                  style={{
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                  }}
                />
              ))}
            </XYPlot>
            <DiscreteColorLegend
              orientation="horizontal"
              width={500}
              items={finalPopulationSizeItems}
            />
          </div>
          <div>
            <h2>Gęstość populacji</h2>
            <XYPlot width={500} height={300}>
              <HorizontalGridLines />
              <VerticalGridLines />
              <XAxis />
              <YAxis />
              <ChartLabel
                text="Pokolenie"
                className="alt-x-label"
                includeMargin={false}
                xPercent={0.025}
                yPercent={1.01}
              />

              <ChartLabel
                text="Gęstość"
                className="alt-y-label"
                includeMargin={false}
                xPercent={0.06}
                yPercent={0.06}
                style={{
                  transform: "rotate(-90)",
                  textAnchor: "end",
                }}
              />
              {finalPopulationDensityItems.map(({ title, values }) => (
                <LineSeries
                  key={`serie_size_${title}`}
                  data={values.map((generationValue, generationNumber) => ({
                    x: generationNumber,
                    y: generationValue,
                  }))}
                  style={{
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                  }}
                />
              ))}
            </XYPlot>
            <DiscreteColorLegend
              orientation="horizontal"
              width={500}
              items={finalPopulationDensityItems}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
