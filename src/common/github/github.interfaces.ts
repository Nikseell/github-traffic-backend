export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
  };
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepositoryView {
  timestamp: string;
  count: number;
  uniques: number;
}

export interface RepositoryViewsData {
  count: number;
  uniques: number;
  views: RepositoryView[];
}

export interface RepositoryClone {
  timestamp: string;
  count: number;
  uniques: number;
}

export interface RepositoryClonesData {
  count: number;
  uniques: number;
  clones: RepositoryClone[];
}

export interface RepositoryReferrer {
  referrer: string;
  count: number;
  uniques: number;
}

export interface RepositoryPath {
  path: string;
  title: string;
  count: number;
  uniques: number;
}

export interface RepositoryTrafficData {
  views: RepositoryViewsData;
  clones: RepositoryClonesData;
  referrers: RepositoryReferrer[];
  paths: RepositoryPath[];
}

export interface RepositoryTrafficResult {
  repository: string;
  traffic?: RepositoryTrafficData;
  error?: string;
}

export interface TrafficDataPoint {
  timestamp: Date;
  date: string;
  views: RepositoryViewsData;
  clones: RepositoryClonesData;
  referrers: RepositoryReferrer[];
  paths: RepositoryPath[];
}

export interface RepositoryTrafficDocument {
  _id: string;
  repository: string;
  dataPoints: TrafficDataPoint[];
  lastUpdated: Date;
}
