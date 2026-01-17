export interface Point {
  x: number;
  y: number;
}

export interface Area {
  id: string;
  points: Point[];
}

export interface map_ICR17 {
  areas: Area[];
}

export interface PerformanceValue {
  [assetId: string]: number;
}

export interface pr_ICR17Structure {
  [date: string]: PerformanceValue;
}

export interface pr_ICR17 {
  pr_data: pr_ICR17Structure;
}

export interface AssetPerformance {
  id: string;
  pr: number;
  date: string;
}

export interface VisualizationData {
  map: map_ICR17;
  performance: pr_ICR17;
}
